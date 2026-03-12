# Pixel Art Editor

Route: `/pixel-art`
Purpose: A 32×32 grid pixel art editor with drawing tools, palette, undo/redo, and PNG export.

Layout:
- Dark background (neutral-900)
- Top bar: ← Home, title "Pixel Art", Export PNG button
- 32×32 grid of 16px cells with faint grid lines
- Toolbar: Pencil, Eraser, Fill tools + Undo, Redo, Clear buttons
- Color palette: 20 preset colors + custom color input

Behavior:
- Pencil: click or drag to paint cells with current color
- Eraser: click or drag to set cells to white
- Fill: flood-fill from clicked cell with current color
- Undo/Redo: step through history of committed strokes
- Clear: reset entire grid to white
- Export PNG: downloads the 32×32 art as pixel-art.png
- Selecting a palette color switches tool to pencil
