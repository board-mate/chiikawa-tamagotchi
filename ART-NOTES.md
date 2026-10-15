# Visual update v4

## v5: Pajama Parties, dirt, and food scenes

`dist/assets/sprites/chiikawa-party-v5.png` was generated with the built-in image generation tool, using the original Chiikawa PNG as the identity reference. Prompt: transparent 2D four-cell horizontal sprite sheet; identical front-facing Chiikawa wearing plain hooded all-in-one Pajama Parties style sleep suits in pink, lavender, mint, and warm white. Floppy sleeping hood and white pompom, visible round ears and open white face, tiny white paws in front, round buttons and collar tie, matching feet. Consistent scale and baseline; flat black linework, generous padding, no text, borders, shadows, or background.

Native fitted SVG versions are used on the other characters. Mud SVGs place irregular brown marks directly on the face, body, paws, and clothing. The mud layer follows the character's movement, grows stronger as cleanliness drops, and disappears after bathing. Room snapshots retain cleanliness; old snapshots default to clean.

Food scene reference: https://www.youtube.com/watch?v=DBA99It6Q_w (user-provided). Verified player frames at 5 seconds (giant pancake), 15 seconds (oden), 20 seconds (radish), and 25 seconds (Rakko parfait). The five foods open short matching segments through the YouTube embedded player; replay does not award food stats. Video availability and autoplay depend on YouTube and browser settings. Closing the scene unloads the player.

Generated using the built-in image generation tool with the existing Chiikawa PNG as identity reference. Original transparent PNGs are retained and displayed using CSS sprite-sheet viewports (four columns).

## Hunting sheet

`dist/assets/sprites/chiikawa-hunt-v4.png`

Prompt: Transparent 2D game sprite sheet of Chiikawa matching the supplied black-line reference. Four separated equal cells in one horizontal row, aligned feet and consistent scale: ready, anticipation pulling pole back, forward thrust, recovery. Hold a pale pink sasumata with U-shaped head in both hands, hands overlapping shaft correctly. Distinct drawn arm, leg and body poses, white round body, pink cheeks, no costume, no labels or background.

Used for Chiikawa's basic appearance during hunting. Dressed Chiikawa and the other characters use the shared articulated pole animation; their bespoke action drawings are not yet available.

## Clothing sheet

`dist/assets/sprites/chiikawa-outfits-v4.png`

Prompt: Four equal cells in one horizontal row, transparent full-body Chiikawa front views matching reference. Identical position, scale and proportions: green buttoned vest, pastel blue cloud pajamas, short tan explorer cape with green tie, coral dress with pink ribbon. Clothes tailored below face, paws in front and feet visible, natural collars and seams, all drawn together. Flat 2D art, no hats, text, borders or background.

Used in Chiikawa's home, wardrobe previews, meals and room sharing. Other characters use individually sized native SVG outfits with foreground paws. Existing save data, outfit ownership and shared-room encoding are retained.
