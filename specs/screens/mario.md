# Mario

Route: `/mario`
Purpose: A single-level side-scrolling platformer in the style of Mario. Accessible only when logged in.

Layout:
- Black full-screen background
- Canvas (512×448, 16×14 tiles at 32px each)
- Controls legend + Home link below canvas

## Gameplay

One level, 155 tiles wide. Camera scrolls horizontally following the player.

**Player:**
- Move left/right, jump
- Dies from touching an enemy (side/below) or falling into a pit
- Stomps enemies by landing on top (bounces up after stomp)
- Collects coins by walking through them (+200 score each)
- Hits question blocks from below to collect coins (+100 score, block becomes used)

**Enemies (Goombas):**
- Walk back and forth, reverse on wall collision
- Fall into pits
- Stomped = squish animation then disappear (+100 score)

**Tiles:**
- Ground (solid, orange/brown)
- Bricks (breakable-looking, solid)
- Question blocks (solid; hit from below → coin + used block)
- Pipes (solid, green, decorative)
- Coins (collectible, yellow)
- Flag pole (end of level)

**Win:** Reach the flag pole at the end of the level (+1000 score)
**Lose:** Touch an enemy or fall into a pit → death animation → Game Over screen

## Controls
- ← → or A D: move
- ↑ or Space or Z: jump (press to jump, hold doesn't repeat)
- R: restart

## HUD
- Score (top left)
- Coin count (top right)

## Screens
- **Game Over:** dark overlay, "GAME OVER", score, "Press R to play again"
- **Win:** dark overlay, "YOU WIN!", score, "Press R to play again"

## Home
- "Home" link below the canvas navigates back to /
