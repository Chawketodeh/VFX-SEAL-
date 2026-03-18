# Visual Regression Checklist (Post CSS Refactor)

Use this checklist to confirm no UI regressions after modularizing CSS.

## Environment
- Frontend dev server: `npm run dev`
- Current local URL seen during validation: `http://localhost:5176/`
- Ensure browser cache is hard-refreshed (Ctrl+F5)

## Core Pages

### 1. Homepage
- URL: `/`
- Navbar spacing, hover states, active link style
- Hero frame, glow, title/subtitle alignment
- Vendor showcase cards and logos
- Discover carousel arrows and card spacing
- Footer alignment and legal links

### 2. Vendors Page
- URL: `/vendors`
- Sidebar filter spacing and toggle states
- Search icon alignment in input
- Featured band card styles and overlays
- Vendor logo rendering: full logo visible, centered, no clipping
- Pagination controls and active page state

### 3. Vendor Detail Page
- URL: `/vendors/:slug` (example existing vendor)
- Header info layout and score ring
- Stars visible under score
- Reviews accordion open/close behavior
- Leave Review form spacing and focus states
- Textarea caret visibility when typing

### 4. Admin Dashboard
- URL: `/admin`
- Tabs, badge counters, table headers alignment
- Search and pagination controls per section
- Status badge colors and action button spacing
- Footer placement at page bottom

### 5. Contact Page
- URL: `/contact`
- Form labels, input spacing, textarea sizing
- Submit button hover/focus states
- Footer spacing and legal links

### 6. Auth Pages
- URLs: `/login`, `/register`
- Card alignment and logo display
- Password toggle icon position
- Input focus border/glow consistency
- Error/success alert colors and spacing

## Quick Pass Criteria
- No clipped logos where full mark should be visible
- No missing section backgrounds, shadows, or borders
- No overlapping text/buttons at common desktop widths
- No obvious mobile breakpoint breakage at 768px and 480px

## If Regression Is Found
- Capture page URL + screenshot
- Note selector/class involved from DevTools
- Check likely source file in `src/styles/` based on dependency map
