
# Literary Kingdom Background System

## Overview
Replace the current galactic/starry background with a sophisticated "Literary Kingdom" environment using SVG-based symbols (book, crown, sword, shield, torch, heraldic emblem) as subtle watermarks, while preserving the clean, modern aesthetic.

## What Changes

### 1. Light Theme Background
- Keep base `#F8FAFC`
- Add a faint parchment-like grain texture via CSS noise pattern
- Overlay minimalist literary symbols (open book, crown, sword, shield, torch, heraldic crest) as inline SVG background images
- Symbols rendered in `#E2E8F0` tones at 3-5% opacity
- Asymmetric, organic distribution -- no visible repetition grid

### 2. Dark Theme Background
- Keep base `#0F172A` with a subtle radial gradient (lighter center, darker edges)
- Replace stars/nebulas with engraved-style literary symbols in `#1E293B` / `#334155` tones at 4-6% opacity
- Symbols appear carved/embedded, not floating
- Maintain strong contrast for cards and text

### 3. Section-Contextual Emblems
- Add CSS classes for section-specific background emblems:
  - `.section-bg-challenges` -- sword/shield watermark
  - `.section-bg-ranking` -- crown/crest watermark
  - `.section-bg-quiz` -- open book watermark
  - `.section-bg-missions` -- flame/torch watermark
- Apply these classes to the relevant page layouts (Missoes, Ranking, Quiz, Trilhas)
- Emblems are large, centered, very low opacity decorative elements

### 4. Progression-Ready Architecture
- Structure CSS with custom properties (`--kingdom-symbol-opacity`) so future dynamic progression can increase symbol visibility for advanced users

---

## Technical Details

### Files Modified

**`src/index.css`**
- Remove the galactic stars `body::before`, `body::after`, and twinkle animation
- Replace with literary kingdom layers:
  - Light mode: CSS `background-image` using inline SVG data URIs for symbols + subtle noise texture
  - Dark mode: radial gradient base + inline SVG symbols with "engraved" styling (darker fill, lower contrast)
- Add section-specific emblem utility classes
- Add `--kingdom-symbol-opacity` custom property for future progression

**`src/pages/Missoes.tsx`**
- Add `section-bg-missions` class to the main wrapper

**`src/pages/Ranking.tsx`**
- Add `section-bg-ranking` class to the main wrapper

**`src/pages/Quiz.tsx`**
- Add `section-bg-quiz` class to the main wrapper

**`src/pages/Trilhas.tsx`**
- Add `section-bg-challenges` class to the main wrapper

**`src/components/layout/Layout.tsx`**
- Ensure the `<main>` area allows section background classes to show through

### Symbol Implementation
All symbols will be implemented as lightweight inline SVG data URIs within CSS `background-image` properties -- no external assets needed. Each symbol is a simple path (under 500 bytes) ensuring zero performance impact.

### Performance
- No additional HTTP requests (inline SVGs)
- `pointer-events: none` on all decorative layers
- `position: fixed` with `background-attachment: fixed` for smooth scrolling
- Total CSS addition is minimal (~200 lines replacing existing ~120 lines of star backgrounds)
