# Tetris

Route: `/tetris`
Purpose: Playable Tetris game, accessible only when logged in.

Layout:
- Dark full-screen background
- Game board (10×20) on the left
- Sidebar on the right: Score, Lines, Level, Next piece preview, Quit button, controls legend

Gameplay:
- 7 standard tetrominoes, each a distinct color
- Ghost piece shows where the current piece will land
- Speed increases with level (every 10 lines = +1 level)
- Scoring: 1 line = 100 × level, 2 = 300 × level, 3 = 500 × level, 4 = 800 × level

Controls:
- ← → arrow keys: move left/right
- ↑ arrow key: rotate
- ↓ arrow key: soft drop
- Space: hard drop

Game over:
- "Game over" message appears in sidebar
- "Play again" button resets the game

Quit:
- "Quit" button navigates back to /
