# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run preview  # Serve production build locally
npm run lint     # TypeScript type-check (no emit)
```

## Environment

Requires a `.env` file in the project root:
```
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...   # takes priority over GEMINI_API_KEY when both present
```

`vite.config.ts` injects `GEMINI_API_KEY` via `process.env.GEMINI_API_KEY` at build time. `OPENROUTER_API_KEY` is consumed client-side via `import.meta.env` or directly from the env injection.

## Architecture

**All source files live flat in the project root** — there is no `src/` directory, despite what the README describes. The README's `src/pages/`, `src/lib/`, etc. paths do not exist; every `.tsx`/`.ts` file is at the top level.

**Routing** (`App.tsx` → `Layout.tsx` shell):
- `/` → `Home.tsx` — search hero + offline cache list + AI generate modal
- `/search?q=` → `Search.tsx` — AI-powered song search
- `/song/:artist/:title` → `Song.tsx` — chord/tab viewer with 3 modes
- `/tuner` → `Turner.tsx` — chromatic tuner (file is `Turner.tsx`, exports `Tuner`)

**Song page modes** (toggled in `Song.tsx`):
- `chords` — ChordPro format rendered inline via `chordPro.ts`
- `tabs` — ASCII tab rendered via `StaticTabViewer.tsx` + `tabParser.ts`
- `pro` — Interactive player via `ProTabPlayer.tsx` + `tabParser.ts`

**AI/data layer** (`gemini.ts`):
- `fetchSongChords(song, artist, format)` — generates ChordPro or ASCII tab via Gemini API, caches result to `localStorage`
- `searchSongs(query)` — returns structured JSON `{title, artist}[]`, falls back to offline cache on failure
- OpenRouter is prioritized when its key is present; the model string is `gemini-3-flash-preview` in the Gemini branch

**Offline cache**: `localStorage` keys follow `song-{artist}-{song}-{format}`. A separate `offline-songs` key stores an array of `{title, artist, timestamp}` shown on the home page.

**Tab parsing** (`tabParser.ts`):
- Detects tab lines by regex `/^([a-gA-G1-6][b#]?\s*\||\|)/`
- Assembles exactly-6-line blocks into `TabBlockData` with columns and note positions
- Multi-fret numbers (e.g. `12`) are parsed as a single fret at the column of the first digit

**ProTabPlayer** (`ProTabPlayer.tsx`):
- Loads `acoustic_guitar_steel` soundfont via `soundfont-player`; falls back to a Web Audio oscillator synth if loading fails
- Signal chain: source → lowpass → instrumentBus → delay/feedback loop → masterGain → destination
- Playhead advances every `150ms / speed` ms via `setInterval`; plays notes at each column that has fret data
- MIDI note calculation: `getBaseMidiNote(prefix, stringIdx, totalStrings)` maps string prefixes to standard MIDI base notes

**Tuner** (`Turner.tsx`):
- Uses YIN pitch detection algorithm on a 4096-sample `AnalyserNode` with `fftSize = 4096`
- Low-pass filter at 1kHz applied before analysis to remove harmonics
- Median filter (last 5 pitches) rejects octave jumps; EMA smoothing on cents
- Supports 7 tuning standards and adjustable reference pitch (415–460 Hz)
- Canvas renders both a spectrum analyzer (FFT bars) and zero-crossing-locked waveform overlay

**ChordPro parser** (`chordPro.ts`):
- `parseChordPro(text, transposeSteps)` — returns typed `ParsedLine[]` (lyric, chord, directive, tab, empty)
- `transposeChord` handles slash chords (C/E) and preserves flat/sharp preference
- `extractOriginalCapo` reads `[capo: N]` directives from generated content

**Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js`). `cn()` in `utils.ts` = `clsx` + `tailwind-merge`. Dark theme with `zinc-950` base; `yellow-500` accent throughout.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Ultimate-Chords-2** (250 symbols, 261 relationships, 3 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Ultimate-Chords-2/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Ultimate-Chords-2/clusters` | All functional areas |
| `gitnexus://repo/Ultimate-Chords-2/processes` | All execution flows |
| `gitnexus://repo/Ultimate-Chords-2/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->