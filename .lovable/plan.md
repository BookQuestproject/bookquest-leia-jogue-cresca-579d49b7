
# Literary Kingdom Background System — COMPLETED

All changes implemented. The galactic/starry background has been replaced with a sophisticated Literary Kingdom environment using inline SVG symbols as subtle watermarks.

## Changes Made

- **`src/index.css`**: Removed all star/nebula/twinkle backgrounds. Added literary symbol watermarks (book, crown, shield, sword, flame, heraldic crest) for both light and dark themes. Added section-contextual emblem CSS classes. Added `--kingdom-symbol-opacity` and `--kingdom-emblem-opacity` custom properties for future progression.
- **`src/pages/Missoes.tsx`**: Added `section-bg-missions` class
- **`src/pages/Ranking.tsx`**: Added `section-bg-ranking` class
- **`src/pages/Quiz.tsx`**: Added `section-bg-quiz` class
- **`src/pages/Trilhas.tsx`**: Added `section-bg-challenges` class
- **`src/components/layout/Layout.tsx`**: Removed `bg-card` from main content wrapper to allow background to show through
