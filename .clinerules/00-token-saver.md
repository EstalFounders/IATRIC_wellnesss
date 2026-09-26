# Token budget
- Minimum tokens: no preamble, no restating the request; show only changed ranges/diffs, never whole files; end with max 3-5 bullets.
- grep with line numbers first, then read only the needed ranges; batch independent reads/searches/commands; never re-read what is already in context.
- No new dependencies; reuse existing patterns. No web fetches unless the answer depends on an external API.
- Verify with `npx next lint` only. Run build / Playwright / dev server only when asked or for risky changes (routing, redux/store wiring, next.config, auth).
- At each milestone, or when context is ~70% full, suggest /smol or /newtask instead of continuing.
- Occasionally-needed project facts live in docs/cline-project-notes.md (read on demand, not always).
