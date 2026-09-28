import { EventEmitter } from "events";

/**
 * Tiny in-process bus shared by the PM2 log watcher (producer)
 * and the /api/logs/stream SSE endpoint (consumers).
 * A singleton avoids memory growth from duplicate hubs on HMR.
 */
const logBus = new EventEmitter();
logBus.setMaxListeners(1000);

export default logBus;
