# CSS Dependency Map

This map is stabilization-oriented and shows primary CSS files used by each main page/component after modular split.

## Main Pages
- **HomePage**
  - Component(s): pages/HomePage.jsx
  - Primary CSS: variables.css, reset.css, layout.css, navbar.css, buttons.css, forms.css, home.css, footer.css, home-enhanced.css, responsive.css
- **VendorsPage**
  - Component(s): pages/VendorsPage.jsx
  - Primary CSS: variables.css, reset.css, layout.css, navbar.css, buttons.css, forms.css, vendors.css, vendors-marketplace.css, footer.css, responsive.css
- **VendorDetailPage**
  - Component(s): pages/VendorDetailPage.jsx
  - Primary CSS: variables.css, reset.css, layout.css, navbar.css, buttons.css, forms.css, vendor-detail.css, modals.css, notifications.css, responsive.css
- **AdminDashboard**
  - Component(s): pages/AdminDashboard.jsx
  - Primary CSS: variables.css, reset.css, layout.css, navbar.css, buttons.css, forms.css, admin.css, admin-extensions.css, modals.css, notifications.css, responsive.css
- **ContactPage**
  - Component(s): pages/ContactPage.jsx
  - Primary CSS: variables.css, reset.css, layout.css, navbar.css, buttons.css, forms.css, modals.css, footer.css, responsive.css
- **Login/Register**
  - Component(s): pages/LoginPage.jsx + pages/RegisterPage.jsx
  - Primary CSS: variables.css, reset.css, layout.css, navbar.css, buttons.css, forms.css, forms-extra.css, responsive.css

## Shared Global Layers
- Base tokens and reset: `variables.css`, `reset.css`
- Core structure: `layout.css`, `navbar.css`, `buttons.css`, `forms.css`
- Cross-cutting behavior: `responsive.css`, `overrides.css`

## Notes
- Some selectors are intentionally shared across pages (e.g., buttons, alerts, accordions).
- `responsive-legal.css` and `legal.css` are mainly for legal pages.
