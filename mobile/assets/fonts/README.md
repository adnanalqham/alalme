# Mobile Font Assets (Thmanyah Sans)

Per Section 5 of ALA Typography Architecture:
React Native native engines (iOS CoreText & Android FreeType/Typeface) require native `.ttf` or `.otf` font binaries.
Web `.woff2` files are not supported natively by iOS/Android renderers.

When the `.ttf` or `.otf` font files are provided, place them in this folder:

- `ThmanyahSans-Light.ttf` (Weight: 300)
- `ThmanyahSans-Regular.ttf` (Weight: 400)
- `ThmanyahSans-Medium.ttf` (Weight: 500)
- `ThmanyahSans-Bold.ttf` (Weight: 700)
- `ThmanyahSans-Black.ttf` (Weight: 900)

Once present, uncomment the font mapping in `mobile/src/theme/fontLoader.ts` to activate them immediately via `expo-font`.
