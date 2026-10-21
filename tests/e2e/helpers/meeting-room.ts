import { expect, type Page, type WebSocketRoute } from '@playwright/test';

/**
 * Helpers for the telehealth meeting-room suite (`/meeting/patient|doctor/:id`).
 *
 * The room talks to two external systems:
 *   1. `GET /api/getAppointmentId/:meetingId` - the consultation record
 *      (its `consultationType` decides audio-only vs video).
 *   2. A socket.io server - room membership, participant events, WebRTC signalling.
 *
 * Both are mocked here so the suite is hermetic: it never hits the database and
 * never opens a socket to the real server (`NEXT_PUBLIC_SOCKET_URL` points at
 * production, see `.env`).
 */

/* -------------------------------------------------------------------------- */
/* Consultation fixtures                                                       */
/* -------------------------------------------------------------------------- */

/** `Audio` = audio-only consultation (legacy label `Call`), anything else = video. */
export type ConsultationKind = 'Audio' | 'Video';

export interface ConsultationFixture {
  consultationType: ConsultationKind;
  name: string;
  meetingId: string;
  status: string;
  patientMobNo: string;
  consultationprice: number;
  appointmentTime: string;
  symptoms: string;
  doctorDetails: { name: string; speciality: string };
}

export const PATIENT_NAME = 'E2E Patient';
/**
 * The doctor name *as stored* on the consultation (`doctorDetails.name`). Kept
 * without the "Dr." dot on purpose: the room prints and broadcasts the title
 * through `doctorDisplayName()` (src/utils/doctorName.js), which normalises it.
 * Assertions must therefore expect `DOCTOR_DISPLAY_NAME`, not this raw value.
 */
export const DOCTOR_NAME = 'Dr E2E Rao';
/** What the meeting room renders / emits after `doctorDisplayName(DOCTOR_NAME)`. */
export const DOCTOR_DISPLAY_NAME = 'Dr. E2E Rao';
export const DOCTOR_SPECIALITY = 'General Medicine';

export function consultationFixture(kind: ConsultationKind, meetingId: string): ConsultationFixture {
  return {
    consultationType: kind,
    name: PATIENT_NAME,
    meetingId,
    status: 'OPEN',
    patientMobNo: '9876543210',
    consultationprice: 199,
    appointmentTime: '2026-01-05T10:30:00.000Z',
    symptoms: 'Fever and headache',
    doctorDetails: { name: DOCTOR_NAME, speciality: DOCTOR_SPECIALITY },
  };
}

/** Intercepts the consultation lookup (never touches MongoDB). */
export async function mockConsultationApi(page: Page, consultation: ConsultationFixture) {
  await page.route('**/api/getAppointmentId/**', (route) => {
    const meetingId = new URL(route.request().url()).pathname.split('/').pop();
    return route.fulfill({ json: { ...consultation, meetingId } });
  });
}

/* -------------------------------------------------------------------------- */
/* Media devices                                                               */
/* -------------------------------------------------------------------------- */

export interface MediaRequest {
  video: boolean;
  audio: boolean;
  source: 'native' | 'synthetic';
  /** `true` once the returned promise has settled (i.e. the stream is usable). */
  resolved: boolean;
}

/**
 * `true` when the browser cannot provide Playwright's fake camera/microphone, so
 * the helper has to build a synthetic MediaStream in the page instead:
 *  - Firefox: `getUserMedia` never settles with Playwright's build;
 *  - WebKit on Linux: the fake-device flags abort the launch on the CI runner.
 * `E2E_SYNTHETIC_MEDIA=1` forces the synthetic path locally (lets the WebKit
 * projects be validated on macOS with exactly the CI code path).
 */
export function needsSyntheticMedia(browserName: string): boolean {
  return (
    process.env.E2E_SYNTHETIC_MEDIA === '1' ||
    browserName === 'firefox' ||
    (browserName === 'webkit' && process.platform === 'linux')
  );
}

/**
 * Instruments `navigator.mediaDevices.getUserMedia` before the app boots:
 *
 *  - every call is recorded in `window.__mediaRequests`, which lets a test prove
 *    that an audio-only consultation asks for `{ video: false, audio: true }`
 *    (i.e. the camera track is never requested) and a video consultation asks
 *    for `{ video: true, audio: true }`;
 *  - Chromium/WebKit delegate to Playwright's fake devices
 *    (`--use-fake-device-for-media-stream`, configured in `playwright.config.ts`);
 *  - Firefox gets a synthetic MediaStream instead, because Playwright's Firefox
 *    build never settles `getUserMedia` (verified: it hangs with every
 *    `firefoxUserPrefs` combination, both headless and headed);
 *  - WebKit on Linux gets a synthetic MediaStream too, because Playwright's Linux
 *    WebKit shell rejects `--use-fake-device-for-media-stream` and would abort the
 *    launch (see `WEBKIT_FAKE_MEDIA` in `playwright.config.ts`) - so no fake
 *    devices are available there;
 *  - WebKit re-installs its own mock `getUserMedia` *after* document-start
 *    scripts, which would silently drop the patch (verified with
 *    `window.__mediaInstrumented` + `String(getUserMedia)`), hence the short
 *    re-apply guard below.
 */
export async function installMeetingMedia(page: Page, browserName: string) {
  await page.addInitScript(
    ({ synthetic }: { synthetic: boolean }) => {
      const w = window as any;

      const syntheticStream = (constraints: any) => {
        const tracks: MediaStreamTrack[] = [];

        if (constraints?.video) {
          const canvas = document.createElement('canvas');
          canvas.width = 320;
          canvas.height = 240;
          const ctx = canvas.getContext('2d');
          let frame = 0;
          if (ctx) {
            setInterval(() => {
              ctx.fillStyle = frame++ % 2 === 0 ? '#70b340' : '#3b5f1d';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }, 100);
          }
          if (typeof (canvas as any).captureStream === 'function') {
            tracks.push(...canvas.captureStream(10).getVideoTracks());
          }
        }

        if (constraints?.audio) {
          const AudioCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (AudioCtor) {
            const ctx = new AudioCtor();
            const oscillator = ctx.createOscillator();
            const destination = ctx.createMediaStreamDestination();
            oscillator.connect(destination);
            oscillator.start();
            tracks.push(...destination.stream.getAudioTracks());
          }
        }

        return new MediaStream(tracks);
      };

      /**
       * WebKit (Playwright build) installs its mock-media `getUserMedia` as a
       * document-start script that runs *after* `addInitScript`, so the first
       * patch is silently replaced and the app would call the native mock
       * without us ever seeing it. `install()` therefore only caches the
       * original binding once and is re-run by a short-lived guard until the
       * document settles.
       */
      const install = () => {
        const mediaDevices = navigator.mediaDevices;
        if (!mediaDevices) return undefined;

        const calls: MediaRequest[] = (w.__mediaRequests ||= []);
        const original: (constraints: unknown) => Promise<MediaStream> = (w.__mediaOriginalGetUserMedia ||=
          mediaDevices.getUserMedia?.bind(mediaDevices));

        const wrapper = async (constraints: any) => {
          const entry: MediaRequest = {
            video: !!constraints?.video,
            audio: !!constraints?.audio,
            source: synthetic ? 'synthetic' : 'native',
            resolved: false,
          };
          calls.push(entry);
          const stream = synthetic ? syntheticStream(constraints) : await original(constraints);
          entry.resolved = true;
          return stream;
        };

        // `mediaDevices.getUserMedia = wrapper` alone is not enough: WebKit
        // resolves the method through a prototype accessor, so the property is
        // defined on both the instance and its prototype.
        for (const target of [mediaDevices, Object.getPrototypeOf(mediaDevices)]) {
          if (!target) continue;
          try {
            Object.defineProperty(target, 'getUserMedia', {
              value: wrapper,
              writable: true,
              configurable: true,
            });
          } catch {
            /* keep the previous definition */
          }
        }

        // Debug hook: proves the instrumentation is live in the page world.
        w.__mediaInstrumented = navigator.mediaDevices.getUserMedia === wrapper;
        return wrapper;
      };

      let current: unknown = install();
      let ticks = 0;
      const guard = setInterval(() => {
        if (navigator.mediaDevices?.getUserMedia !== current) current = install();
        if (++ticks >= 150) clearInterval(guard);
      }, 100);
    },
    { synthetic: needsSyntheticMedia(browserName) }
  );
}

/** Every `getUserMedia()` the page performed, in order. */
export function mediaRequests(page: Page): Promise<MediaRequest[]> {
  return page.evaluate(() => ((window as any).__mediaRequests ?? []) as MediaRequest[]);
}

/**
 * Waits until the local media promise has settled. The room assigns
 * `localStreamRef` right after the await, so toggling the mic/camera before
 * this would hit the "no stream yet" fallback path.
 */
export async function waitForLocalMedia(page: Page) {
  await expect
    .poll(
      async () => {
        const calls = await mediaRequests(page);
        return calls.length > 0 && calls.every((call) => call.resolved);
      },
      { message: 'waiting for the local getUserMedia() promise to settle', timeout: 30_000 }
    )
    .toBe(true);
}

/* -------------------------------------------------------------------------- */
/* Recording capability                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Codecs the recorder prefers, most wanted first - kept in sync with
 * `pickMimeType()` in src/components/MeetingRoom/useConsultationRecorder.js.
 */
const RECORDING_TYPES = {
  video: ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'],
  audio: ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg'],
};

export interface RecordingCapabilities {
  /** `window.MediaRecorder` exists - without it `start()` errors out immediately. */
  mediaRecorder: boolean;
  /** `canvas.captureStream()` exists - it supplies the composited video track. */
  captureStream: boolean;
  /** Web Audio is available - it mixes both participants' audio. */
  audioContext: boolean;
  /** Which of the recorder's preferred containers this browser can encode. */
  mimeTypes: string[];
}

/**
 * Everything `useConsultationRecorder` needs, read straight from the browser.
 * Kept as data (not just a boolean) so a CI report can say *why* a browser
 * cannot record instead of leaving an opaque `toHaveCount(0)` failure.
 */
export async function recordingCapabilities(page: Page, hasVideo = true): Promise<RecordingCapabilities> {
  return page.evaluate((candidates: string[]) => {
    const w = window as any;
    const mediaRecorder = typeof w.MediaRecorder === 'function';
    let mimeTypes: string[] = [];
    if (mediaRecorder) {
      try {
        mimeTypes = candidates.filter((type: string) => w.MediaRecorder.isTypeSupported(type));
      } catch {
        mimeTypes = [];
      }
    }
    return {
      mediaRecorder,
      captureStream: typeof (HTMLCanvasElement.prototype as any).captureStream === 'function',
      audioContext: !!(w.AudioContext || w.webkitAudioContext),
      mimeTypes,
    };
  }, hasVideo ? RECORDING_TYPES.video : RECORDING_TYPES.audio);
}

/**
 * `true` when this browser can actually run the consultation recorder: it needs
 * `MediaRecorder`, `canvas.captureStream()` (the composited video track), Web
 * Audio and at least one encodable container - the same requirements
 * `pickMimeType()` / `start()` in src/components/MeetingRoom/useConsultationRecorder.js
 * rely on.
 *
 * Playwright's WebKit build on Linux has no usable MediaRecorder /
 * captureStream, which is why the doctor's auto-recording assertions failed all
 * four WebKit projects on GitHub Actions while Chromium, Firefox (same synthetic
 * media path) and macOS WebKit passed - see docs/cline-project-notes.md.
 */
export async function supportsRecording(page: Page, hasVideo = true): Promise<boolean> {
  const caps = await recordingCapabilities(page, hasVideo);
  return caps.mediaRecorder && caps.captureStream && caps.audioContext && caps.mimeTypes.length > 0;
}



/* -------------------------------------------------------------------------- */
/* Socket.io mock                                                              */
/* -------------------------------------------------------------------------- */

/** Id the mocked server hands to the page (`socket.id` after the CONNECT ack). */
export const CLIENT_SOCKET_ID = 'e2e-client-socket';
/** Id of the (never rendered) other participant. */
export const REMOTE_SOCKET_ID = 'a-remote-socket';

export interface ClientEvent {
  event: string;
  payload: any;
}

export interface MockMeetingSocketOptions {
  /** How many participants the room reports when the page joins (default 2). */
  participants?: number;
  /**
   * `true` (default) answers `join-room` with `room-participants` right away.
   * `false` leaves the room on the "Connecting to consultation..." screen so a
   * test can drive the lifecycle event by event.
   */
  respondToJoin?: boolean;
}

/** Payload shape the real server sends in `room-participants` / `participant-joined`. */
export function roomPayload(count: number, remoteRole = 'doctor') {
  const participants = [{ socketId: CLIENT_SOCKET_ID, role: 'patient' }];
  for (let i = 1; i < count; i += 1) {
    participants.push({ socketId: REMOTE_SOCKET_ID, role: remoteRole });
  }
  return { participants, yourSocketId: CLIENT_SOCKET_ID };
}

/**
 * Minimal engine.io v4 + socket.io v4 server delivered through
 * `page.routeWebSocket`, so no process - and above all no production socket
 * server - is involved.
 *
 * Note the deliberately chosen ids: the app only creates the WebRTC offer when
 * `String(mySocketId) < String(peerSocketId)` ("deterministic initiator"). With
 * `e2e-client-socket` > `a-remote-socket` the page waits for the peer, which
 * keeps the suite hermetic (no RTCPeerConnection, no STUN traffic).
 */
export class MockMeetingSocket {
  readonly sent: ClientEvent[] = [];
  private ws: WebSocketRoute | null = null;
  private participantCount: number;
  private readonly respondToJoin: boolean;

  constructor(options: MockMeetingSocketOptions = {}) {
    this.participantCount = options.participants ?? 2;
    this.respondToJoin = options.respondToJoin ?? true;
  }

  async attach(page: Page) {
    await page.routeWebSocket(/socket\.io/, (ws) => {
      this.ws = ws;
      ws.onMessage((raw: string | Buffer) => {
        const data = raw.toString();
        // Socket.IO CONNECT -> acknowledge with our fake socket id.
        if (data === '40') {
          ws.send(`40${JSON.stringify({ sid: CLIENT_SOCKET_ID })}`);
          return;
        }
        // Only MESSAGE packets carry events; '2'/'3' are engine.io ping/pong.
        if (!data.startsWith('42')) return;
        const [event, payload] = JSON.parse(data.slice(2));
        this.sent.push({ event, payload });
        if (event === 'join-room' && this.respondToJoin) {
          this.emitFromServer('room-participants', roomPayload(this.participantCount));
        }
      });
      // engine.io v4: the server speaks first.
      ws.send(
        `0${JSON.stringify({
          sid: CLIENT_SOCKET_ID,
          upgrades: [],
          pingInterval: 25_000,
          pingTimeout: 20_000,
          maxPayload: 1_000_000,
        })}`
      );
    });

    // The engine.io polling transport must not escape to the real server either
    // (socket.io-client falls back to it if the websocket transport fails).
    await page.route(/\/socket\.io\//, (route) =>
      route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' })
    );
  }

  /** Push a server event to the page (participant-joined, webrtc-answer, ...). */
  emitFromServer(event: string, payload: unknown) {
    if (!this.ws) throw new Error('MockMeetingSocket.attach(page) must run before the page opens the socket');
    this.ws.send(`42${JSON.stringify([event, payload])}`);
  }

  /** Change how many participants a later `join-room` reports. */
  setParticipants(count: number) {
    this.participantCount = count;
  }

  eventsOf(name: string): any[] {
    return this.sent.filter((entry) => entry.event === name).map((entry) => entry.payload);
  }

  /** Waits until the page has emitted `name` at least `count` times. */
  async waitForEvent(name: string, count = 1): Promise<any[]> {
    await expect
      .poll(() => this.eventsOf(name).length, {
        timeout: 15_000,
        message: `expected the room to emit "${name}" ${count}x`,
      })
      .toBeGreaterThanOrEqual(count);
    return this.eventsOf(name);
  }
}

/* -------------------------------------------------------------------------- */
/* Navigation helpers                                                          */
/* -------------------------------------------------------------------------- */

export type MeetingRole = 'patient' | 'doctor';

/**
 * Opens a meeting URL and waits until the room is interactive: the global
 * `_app` preloader is gone and the control bar is on screen.
 */
export async function openMeeting(page: Page, role: MeetingRole, meetingId: string) {
  await page.goto(`/meeting/${role}/${meetingId}`);
  await expect(page.locator('img[alt="Loading..."]')).toHaveCount(0, { timeout: 30_000 });
  await expect(page.getByTitle('End Call')).toBeVisible({ timeout: 30_000 });
}

/** The two participant tiles (remote + local) of the meeting grid. */
export function participantTiles(page: Page) {
  return page.locator('[class*="videoWrapper"]');
}