# Animated swans

The hero contains two independent swans swimming slowly toward each other on a painted lake, with a small buoyancy motion, ripples, subtle reflections and moving water highlights. The style is inspired by the user-provided Pinterest reference; the artwork was newly generated using the built-in ImageGen tool. No Pinterest video was downloaded or embedded.

Files:

- `swans-pair.webp`: transparent two-cell sprite atlas, 1536 × 1024. Each half is displayed independently using CSS clipping.
- `swan-lake.webp`: empty painted lake backdrop, 1024 × 1536.
- `swans.css`: 16-second seamless swimming cycle. The background and both swans remain still when the device requests reduced motion. Animation pauses when the page is hidden or the existing reduced-motion preference is active.
- `index.html`: scene layers and accessible description; the decorative sprite images have empty alt text.

The two new images total approximately 520 KB. There is no animation button, no audio and no external animation library. Original static artwork remains available in the repository.

## ImageGen prompt: transparent swans

Create a high-end painterly transparent PNG sprite atlas for an animated wedding invitation. Landscape 3:2 canvas. Exactly TWO separate full-body white swans, arranged side by side in TWO EQUAL WIDTH invisible cells; no visible divider. The LEFT half contains one white swan in graceful three-quarter SIDE profile facing RIGHT toward the center. The RIGHT half contains its matching white swan facing LEFT toward the center. Each swan must be wholly contained inside its own half, with generous transparent margins at center; NO overlap between halves. Their broad bodies and raised layered feather wings rest at the SAME baseline at 80% canvas height. Long elegant arched necks lean inward, black face masks, natural muted orange beaks. They are separate swimming cutout elements with no water, no scenery, no shadows under them. Feather details in soft ivory/champagne highlights, very subtle warm gray shadows, refined fine art watercolor and oil illustration, romantic wedding stationery style, natural bird anatomy, no people, NO text, no border, no watermark. Real alpha transparency everywhere outside the two birds. This image will be displayed as two independently moving sprites in a web animation. Keep silhouettes crisp and beautiful, no cropping any wings or necks.

## ImageGen prompt: lake

A romantic fine-art watercolor and oil painted lake backdrop for an animated Vietnamese wedding invitation, portrait 2:3 aspect ratio. Empty calm pale sage-blue lake with subtle warm champagne light, distant misty trees and luminous ivory clouds. View straight across the water. Distant horizon at upper 32 percent, most lower area is open calm lake water with delicate horizontal ripples and soft reflections. Middle of lake from 45 to 80 percent height must be OPEN and UNOBSTRUCTED to place two swimming swan sprites later. Delicate white garden roses and tiny olive leaves only at very bottom corners occupying at most bottom 10 percent, subdued and airy. Sophisticated ivory, champagne, soft muted blue sage palette, painterly texture consistent with luxury wedding stationery. Gentle morning light from upper left. Absolutely NO swans, NO birds, NO animals, NO people, NO buildings, NO bridge, NO text, no logos, no borders, no watermark. Just the empty beautiful lake scene. Not a UI or mockup.
