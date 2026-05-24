# Component Performance Audit

This document outlines the performance checks, issues identified, and optimizations applied across the React components in `frontend/src/components`.

## Key Findings

### 1. Route Component Loading (Fixed)
**Issue**: `App.jsx` was statically importing all heavy page components (`Workspace.jsx`, `BoardView.jsx`, `Superadmin.jsx`, etc.). This forced the browser to download, parse, and compile the entire application bundle before rendering the first frame.
**Resolution**: Implemented `React.lazy()` for all route components combined with a `<Suspense>` boundary. This enables aggressive code-splitting. 

### 2. Image Optimization and LCP
**Issue**: Several images across the application lacked proper loading attributes and dimensions, potentially causing layout shifts (CLS) and competing with critical assets for network bandwidth.
**Resolution**:
- **Avatars (`Profile.jsx`, `Superadmin.jsx`)**: Added `loading="lazy"`, `width`, and `height` attributes to prevent CLS and defer off-screen loads.
- **Attachments (`CardModal.jsx`)**: Added `loading="lazy"` to defer loading of card attachment thumbnails until they are visible.
- **Hero Image (`Home.jsx`)**: Note that the home page uses inline SVG icons (Feather) rather than an image tag, which naturally avoids LCP resource load delays.

### 3. Font Loading Strategy (Fixed)
**Issue**: Fonts (`Inter`) were being loaded via `@import` in `index.css`. This caused a sequential render-blocking waterfall: `index.html` -> `index.css` -> `@import Google Fonts` -> `Download Fonts`.
**Resolution**: 
- Moved the font request to `index.html` using `<link rel="preload">` to initiate the download immediately at parse time.
- Added `display=swap` to ensure text remains visible while fonts are loading, improving the perceived performance and FCP.

### General Component Best Practices (Checklist for Future Dev)
- **Do not** use `useEffect` for heavy data transformation; rely on `useMemo`.
- **Always** apply explicit dimensions (`width`, `height`) to `<img>` tags.
- **Never** lazy load above-the-fold content (LCP candidates).
- **Defer** rendering of complex UI elements hidden inside Modals or Dialogs until the user opens them.
