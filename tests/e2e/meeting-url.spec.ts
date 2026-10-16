import { expect, test, type Page } from '@playwright/test';
import {
  DOCTOR_DISPLAY_NAME,
  DOCTOR_SPECIALITY,
  MockMeetingSocket,
  PATIENT_NAME,
  consultationFixture,
  installMeetingMedia,
  mediaRequests,
  mockConsultationApi,
  openMeeting,
  participantTiles,
  roomPayload,
  waitForLocalMedia,
  type ConsultationKind,
  type MeetingRole,
} from './helpers/meeting-room';

/**
 * End-to-end coverage for the telehealth meeting pages
 * `/meeting/patient/[meetingId]` and `/meeting/doctor/[meetingId]`.
 *
 * Everything the room talks to is mocked per page (see `helpers/meeting-room.ts`),
 * so the suite asserts real client-side behaviour - which media the room asks
 * for, what it renders, which socket events it emits - without touching the
 * production API/socket server or the database.
 */

const MEETING_ID = 'e2e-meeting-0001';

/** Device/browser of the running project (device descriptors only set `defaultBrowserType`). */
function projectBrowserName(): string {
  const { use } = test.info().project as unknown as {
    use: { browserName?: string; defaultBrowserType?: string };
  };
  return use.browserName ?? use.defaultBrowserType ?? 'chromium';
}

/** "video:false|audio:true" for every getUserMedia() call - browser agnostic. */
async function mediaPattern(page: Page): Promise<string[]> {
  const calls = await mediaRequests(page);
  return calls.map((call) => `video:${call.video}|audio:${call.audio}`);
}

/** Local (self) participant badge - the second tile's badge. */
function localBadge(page: Page) {
  return page.locator('[class*="participantBadge"]').nth(1);
}

/** Mic-muted overlay that only renders on the local tile. */
function micOffIndicator(page: Page) {
  return page.locator('[class*="participantMicOff"]');
}

/** Mocks API + socket, opens the URL and waits for the room to be interactive. */
async function openRoom(
  page: Page,
  role: MeetingRole,
  kind: ConsultationKind,
  socket: MockMeetingSocket = new MockMeetingSocket()
) {
  await installMeetingMedia(page, projectBrowserName());
  await mockConsultationApi(page, consultationFixture(kind, MEETING_ID));
  await socket.attach(page);
  await openMeeting(page, role, MEETING_ID);
  return socket;
}

/* -------------------------------------------------------------------------- */
/* Audio-only consultation                                                    */
/* -------------------------------------------------------------------------- */

test.describe('audio-only consultation', () => {
  test('patient: only asks for the microphone and renders the audio-only room', async ({ page }) => {
    await openRoom(page, 'patient', 'Audio');

    // The camera track must never be requested for an audio-only consultation.
    await expect.poll(() => mediaPattern(page)).toEqual(['video:false|audio:true']);
    await waitForLocalMedia(page);

    await expect(page.getByText('🎧 Audio Consultation')).toBeVisible();
    await expect(page.getByText(`ID: ${MEETING_ID}`)).toBeVisible();
    await expect(page.getByText('🟢 Connected')).toBeVisible();
    await expect(page.getByText('🟡 Waiting...')).toHaveCount(0);

    // Two participant tiles, and no <video> element anywhere.
    const tiles = participantTiles(page);
    await expect(tiles).toHaveCount(2);
    await expect(page.locator('video')).toHaveCount(0);
    await expect(page.locator('audio')).toHaveCount(1); // hidden remote-mic sink

    // Remote tile = the doctor, local tile = yourself. The room prints the name
    // through doctorDisplayName(), so the fixture's "Dr E2E Rao" renders as "Dr. E2E Rao".
    const names = page.locator('[class*="videoPlaceholderName"]');
    await expect(names).toHaveCount(2);
    await expect(names.nth(0)).toHaveText(DOCTOR_DISPLAY_NAME);
    await expect(names.nth(1)).toHaveText('You');
    await expect(tiles.nth(0).getByText(`Doctor - ${DOCTOR_SPECIALITY}`)).toBeVisible();
    await expect(tiles.nth(1).getByText('Patient', { exact: true })).toBeVisible();

    // Mic is live, the camera control is disabled for this consultation type.
    await expect(localBadge(page)).toContainText('🔊');
    await expect(micOffIndicator(page)).toHaveCount(0);
    await expect(page.getByTitle('Mute')).toBeVisible();
    await expect(page.getByTitle('Camera unavailable in audio consultation')).toBeDisabled();
  });

  test('doctor: joins as doctor, sees the patient tile and reports its role', async ({ page }) => {
    const socket = await openRoom(page, 'doctor', 'Audio');

    // join-room must carry the meeting + the doctor's identity (normalised title).
    const [join] = await socket.waitForEvent('join-room');
    expect(join).toMatchObject({
      meetingId: MEETING_ID,
      role: 'doctor',
      userData: { name: DOCTOR_DISPLAY_NAME, role: 'doctor' },
    });

    await expect.poll(() => mediaPattern(page)).toEqual(['video:false|audio:true']);
    await waitForLocalMedia(page);

    const tiles = participantTiles(page);
    await expect(tiles).toHaveCount(2);
    await expect(tiles.nth(0).locator('[class*="videoPlaceholderName"]')).toHaveText(PATIENT_NAME);
    await expect(tiles.nth(0).getByText('Patient', { exact: true })).toBeVisible();
    await expect(tiles.nth(1).locator('[class*="videoPlaceholderName"]')).toHaveText('You');
    await expect(tiles.nth(1).getByText('Doctor', { exact: true })).toBeVisible();
    await expect(page.getByTitle('Camera unavailable in audio consultation')).toBeDisabled();
  });

  test('patient: the mic control mutes and unmutes the local track', async ({ page }) => {
    const socket = await openRoom(page, 'patient', 'Audio');
    await waitForLocalMedia(page);

    await page.getByTitle('Mute').click();
    await expect(page.getByTitle('Unmute')).toBeVisible();
    await expect(micOffIndicator(page)).toHaveCount(1);
    await expect(localBadge(page)).toContainText('🔇');
    const [muteEvent] = await socket.waitForEvent('media-state-change');
    expect(muteEvent).toEqual({ meetingId: MEETING_ID, type: 'audio', value: false });

    await page.getByTitle('Unmute').click();
    await expect(page.getByTitle('Mute')).toBeVisible();
    await expect(micOffIndicator(page)).toHaveCount(0);
    await expect(localBadge(page)).toContainText('🔊');
    await socket.waitForEvent('media-state-change', 2);
    expect(socket.eventsOf('media-state-change')[1]).toEqual({
      meetingId: MEETING_ID,
      type: 'audio',
      value: true,
    });
  });

  test('patient: waits for the doctor, activates when they join and falls back when they leave', async ({
    page,
  }) => {
    // First participant only: the room must stay in the waiting state.
    const socket = await openRoom(page, 'patient', 'Audio', new MockMeetingSocket({ participants: 1 }));

    await expect(page.getByText('🟡 Waiting...')).toBeVisible();
    await expect(page.getByText('⏳ Waiting for the other participant to join...')).toBeVisible();
    await expect(page.getByText('🟢 Connected')).toHaveCount(0);

    socket.emitFromServer('participant-joined', roomPayload(2));
    await expect(page.getByText('🟢 Connected')).toBeVisible();
    await expect(page.getByText('⏳ Waiting for the other participant to join...')).toHaveCount(0);

    socket.emitFromServer('participant-left', roomPayload(1));
    await expect(page.getByText('🟡 Waiting...')).toBeVisible();
  });
});

/* -------------------------------------------------------------------------- */
/* Video consultation                                                         */
/* -------------------------------------------------------------------------- */

test.describe('video consultation', () => {
  test('patient: asks for camera + mic and attaches the local video feed', async ({ page }) => {
    await openRoom(page, 'patient', 'Video');

    await expect.poll(() => mediaPattern(page)).toEqual(['video:true|audio:true']);
    await waitForLocalMedia(page);

    await expect(page.getByText('Telemedicine Consultation')).toBeVisible();
    await expect(page.getByText('🎧 Audio Consultation')).toHaveCount(0);

    // The local preview is a real <video> carrying the camera track.
    const videos = page.locator('video');
    await expect(videos).toHaveCount(1);
    await expect(videos.first()).toHaveAttribute('autoplay', '');
    await expect
      .poll(
        () =>
          videos.first().evaluate((el) => {
            const stream = (el as HTMLVideoElement).srcObject as MediaStream | null;
            return stream ? stream.getVideoTracks().length : -1;
          }),
        { message: 'local preview must be bound to the camera track' }
      )
      .toBe(1);

    await expect(localBadge(page)).toContainText('🔊');
    await expect(page.getByTitle('Camera Off')).toBeVisible(); // camera is ON
    await expect(page.getByTitle('Camera unavailable in audio consultation')).toHaveCount(0);

    // The remote tile falls back to a placeholder until the peer connects.
    const tiles = participantTiles(page);
    await expect(tiles).toHaveCount(2);
    await expect(tiles.nth(0).locator('[class*="videoPlaceholderName"]')).toHaveText(DOCTOR_DISPLAY_NAME);
    await expect(tiles.nth(1).getByText('You', { exact: true })).toHaveCount(1);
  });

  test('doctor: toggling the camera stops the feed and re-acquires it', async ({ page }) => {
    const socket = await openRoom(page, 'doctor', 'Video');
    await waitForLocalMedia(page);

    const tiles = participantTiles(page);
    await expect(tiles.nth(0).locator('[class*="videoPlaceholderName"]')).toHaveText(PATIENT_NAME);
    await expect(tiles.nth(0).getByText('Patient', { exact: true })).toBeVisible();
    await expect(page.locator('video')).toHaveCount(1);

    // ---- Camera off ----
    await page.getByTitle('Camera Off').click();

    await expect(page.getByTitle('Camera On')).toBeVisible();
    await expect(page.locator('video')).toHaveCount(0); // local feed removed
    await expect(tiles.nth(1).locator('[class*="videoPlaceholderName"]')).toHaveText('You');
    await expect(tiles.nth(1).getByText('Doctor', { exact: true })).toBeVisible();

    await socket.waitForEvent('camera-toggle');
    expect(socket.eventsOf('camera-toggle')[0]).toEqual({
      meetingId: MEETING_ID,
      isVideoOn: false,
      userId: 'doctor',
    });
    expect(socket.eventsOf('media-state-change')[0]).toEqual({
      meetingId: MEETING_ID,
      type: 'video',
      value: false,
    });

    // ---- Camera on again: the camera track is re-acquired ----
    await page.getByTitle('Camera On').click();

    await expect(page.getByTitle('Camera Off')).toBeVisible();
    await expect(page.locator('video')).toHaveCount(1);
    await expect.poll(() => mediaPattern(page)).toEqual(['video:true|audio:true', 'video:true|audio:false']);
    await socket.waitForEvent('camera-toggle', 2);
    expect(socket.eventsOf('camera-toggle')[1]).toEqual({
      meetingId: MEETING_ID,
      isVideoOn: true,
      userId: 'doctor',
    });
  });

  test('doctor: remote camera changes raise a notification and ending closes the room', async ({ page }) => {
    const socket = await openRoom(page, 'doctor', 'Video');

    socket.emitFromServer('participant-camera-toggle', { isVideoOn: false, role: 'patient' });
    await expect(page.getByText(`${PATIENT_NAME} turned off camera`)).toBeVisible();

    socket.emitFromServer('participant-camera-toggle', { isVideoOn: true, role: 'patient' });
    await expect(page.getByText(`${PATIENT_NAME} turned on camera`)).toBeVisible();

    await page.getByTitle('End Call').click();

    await expect(page.getByText('Consultation Ended')).toBeVisible();
    await expect(page.getByText(/^Duration: \d{2}:\d{2}$/)).toBeVisible();
    await expect(page.getByTitle('End Call')).toHaveCount(0);
    await expect(page.locator('video')).toHaveCount(0);
  });
});

/* -------------------------------------------------------------------------- */
/* Shared room controls                                                       */
/* -------------------------------------------------------------------------- */

test.describe('meeting controls', () => {
  test('patient: exposes the full toolset and a closable side panel', async ({ page }) => {
    await openRoom(page, 'patient', 'Video');

    // Recording is doctor-only (`useConsultationRecorder`'s `enabled` flag), so
    // the patient's control bar ends at End Call.
    for (const title of ['Mute', 'Camera Off', 'Screen Share', 'Raise Hand', 'Chat', 'Files', 'End Call']) {
      await expect(page.getByTitle(title, { exact: true })).toBeVisible();
    }
    await expect(page.getByTitle('Record', { exact: true })).toHaveCount(0);
    await expect(page.getByTitle('Stop Recording')).toHaveCount(0);

    // The panel starts closed: only the control-bar "Chat"/"Files" buttons open
    // it, so on load there is a single "Chat" button and no panel tabs.
    const infoTab = page.getByRole('button', { name: 'Info' });
    await expect(infoTab).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Chat' })).toHaveCount(1);

    // Clicking the control-bar button opens the panel: "Chat" is control + tab.
    await page.getByTitle('Chat').click();
    await expect(infoTab).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chat' })).toHaveCount(2);

    // Closing the panel removes the tabs; the control-bar button reopens it.
    await page.getByRole('button', { name: '✕' }).click();
    await expect(infoTab).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Chat' })).toHaveCount(1);

    // The control-bar button reopens the panel.
    await page.getByTitle('Chat').click();
    await expect(infoTab).toBeVisible();
  });

  test('doctor: the record control mirrors the automatic consultation recording', async ({ page }) => {
    // The recorder POSTs the finished WebM blob when it stops; stub the upload so
    // the test never sends a recording to the API.
    await page.route('**/api/recording**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, recordingURL: 'https://example.test/recording.webm' }),
      })
    );

    await openRoom(page, 'doctor', 'Video');
    await waitForLocalMedia(page);

    // `useConsultationRecorder` starts by itself once the room is recordable
    // (doctor + active + local media), so the control offers Stop, not Record.
    await expect(page.getByTitle('Record', { exact: true })).toHaveCount(0);
    await expect(page.getByTitle('Stop Recording')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Recording')).toBeVisible();

    // The recorder is timesliced (`TIMESLICE_MS` = 1s) and WebKit only fires
    // `onstop` once it has buffered data: stopping before the first timeslice
    // leaves the control stuck on "Stop Rec".
    await page.waitForTimeout(1500);
    await page.getByTitle('Stop Recording').click();

    // Stopping hands the file to the (stubbed) upload and idles the control.
    await expect(page.getByTitle('Record', { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTitle('End Call')).toBeVisible();
  });
});

