# Changelog

All notable changes to NovaFinance will be documented in this file.

## [Unreleased]

## [0.4.1] - 2026-09-20

### Fixed & Enhanced
- **System Menu Persistence & Query Merging (`Sidebar.tsx`)**:
  - Fixed bug where newly introduced system menus (Reporting Suite, Content Management) rendered initially but disappeared when database menus finished fetching.
  - Implemented safe menu merging: `DEFAULT_MENU_GROUPS` are pre-populated and merged with dynamic DB menus, guaranteeing that built-in system routes are permanently retained.
- **Interactive Corporate Brand Preview Suite (`brand/page.tsx`)**:
  - Completely overhauled Section 3 into a comprehensive, multi-mode simulator:
    - **Sidebar Lengkap (240px)**: Exact replica of the live sidebar header with true side-cropping visualizers, active Dashboard indicator, and Core Engine footer.
    - **Bilah Ramping (Rail 64px)**: Demonstrates compact icon behavior.
    - **Joint Navbar & Sidebar**: Shows seamless intersection between top navbar and sidebar header.
    - **Komparasi Mode**: Side-by-side comparison between Kotak 1:1 and Melebar (Wide / Banner) with use-case guidance.
  - Added interactive in-place adjustment toolbar directly above preview canvas (instant Aspect Ratio toggle, Format selector, Alignment controls, and Width range slider with presets).
  - Added theme simulator toggle (☀️ Light vs 🌙 Dark) and toggleable dashed crop guide calipers (`showCropGuides`).
  - Added 3 technical telemetry panels explaining true symmetrical side-cropping, dimensions, and enterprise white-label compliance.
- **Instant Aspect Ratio & Width Synchronization (`brand/page.tsx`, `Sidebar.tsx`)**:
  - Fixed issue where switching Kotak/Wide or adjusting px width did not immediately reflect in the sidebar.
  - Handlers now immediately update both workspace-scoped and global storage, dispatching `novajournal_brand_config_changed` events without waiting for debounced network requests.

## [0.4.0] - 2026-09-20

### Added
- **Reporting & Finance Suite (`/reports/*`, `Sidebar.tsx`, `Navbar.tsx`)**:
  - Integrated dedicated `Reporting & Finance` navigation group with 3 corporate financial modules:
    - **Laporan Keuangan (`/reports/financial-statement`)**: Comprehensive financial statements covering Income Statement (Laba Rugi), Balance Sheet (Neraca), and Cash Flow (Arus Kas), with export to CSV/PDF, time range filters, and KPIs.
    - **Kepatuhan Pajak (`/reports/tax-compliance`)**: Tax compliance dashboard featuring fiscal reconciliation, PPh 21/23/Final, VAT (PPN), e-Bupot status tracking, and SPT filing reminders.
    - **Varian Realisasi Anggaran (`/reports/budget-variance`)**: Budget vs Actual performance reporting with real-time variance percentage, department breakdown, and visual threshold alerts.
  - Registered in Navbar Quick Search and backend menu seeds with role access policies (Staff+ and Admin).

- **Content & Dynamic Menu Management (`/content-management`)**:
  - Introduced unified menu and content configuration page styled with section fold cards, auto-saving badges, and quick-jump navigation.
  - **Menu Visibility & Alias System**: Toggle visibility of any navigation item and assign custom display aliases saved directly to `localStorage` (`novajournal_hidden_menus`, `novajournal_menu_labels`).
  - **Navigation Display Modes**: Switch between Accordion, Flat, and Compact sidebar navigation styles with counter badge toggles.
  - **Workspace Announcement Banner**: Configurable top banner with severity themes (info, warning, promo, success), dismiss controls, and real-time preview.
  - **RBAC Matrix Preview**: Interactive visual matrix detailing permissions for Owner, Admin, Staff, and Viewer roles.
  - Real-time synchronization with `Sidebar.tsx` via `novajournal_menu_config_changed` events.

### Enhanced & Fixed
- **Enterprise Brand Gating & Sidebar Polish (`Sidebar.tsx`)**:
  - Gated custom workspace branding exclusively to Enterprise workspaces or workspaces with active enterprise trials.
  - Non-enterprise workspaces seamlessly fallback to modern `NovaFinance` branding with `ProFinancial` subtext and vibrant multi-stop gradient styling.
  - Streamlined sidebar footer: cleanly hides the bottom "NovaFinance Core Engine" box when the top bar already displays the default NovaFinance brand.
  - Implemented true side-cropping for wide brand logos (`overflow: hidden` absolute centering) to clip horizontal edges precisely without stretching or zooming.
  - Removed all rounded corners on sidebar logos (`rounded-none`) to preserve crisp corporate branding.
- **Global Dark Mode Button Styling (`globals.css`)**:
  - Resolved theme contrast bug where secondary buttons and buttons with `bg-white` retained stark white backgrounds in dark mode.
  - Injected global `.dark button.bg-white` and `.dark button[data-variant="secondary"]` overrides and updated UI components to use zinc dark backgrounds.

## [0.3.9] - 2026-09-20

### Fixed & Enhanced
- **Profile Photo Loading & Navbar Avatar Scaler Polish (`profile/page.tsx`, `Navbar.tsx`)**:
  - Fixed empty profile photo bug on `/profile` reload by checking local storage and user object fallbacks alongside `api.getUserProfile()`.
  - Replaced high-contrast dark preview background with theme-matching navbar container styling (`bg-default-100/80 dark:bg-default-800/60`).
  - Implemented proportional dynamic scaling for the green online status indicator dot in both `Navbar.tsx` and the live preview.
  - Added dedicated "Reset Default (28px)" button to quickly revert avatar dimensions to standard size.
- **Workspace-Scoped Brand Identity & Immediate Switching Sync (`Sidebar.tsx`, `brand/page.tsx`)**:
  - Scoped custom brand logo, name, width, and placement to the active workspace ID (`novajournal_custom_brand_logo_${wsId}`, `novajournal_brand_logo_width_${wsId}`, `novajournal_brand_logo_placement_${wsId}`).
  - Fixed sidebar brand logo persistence bug where switching workspaces previously retained stale global overrides.
  - Sidebar now immediately updates brand logo, custom width, and alignment to reflect each individual workspace's corporate identity upon switching.
- **Theme Transition Visual Refinements (`ThemeTransitionOverlay.tsx`)**:
  - Expanded falling meteor waves in Night transition (Waves 4 and 5) to continuously streak across the viewport smoothly until fade-out.
  - Refactored Day transition: removed face from the sun disk for a clean modern flat graphic, cleansed the sky gradient into pure sky-blue to soft cyan-white (no yellow cast), and recolored horizon rolling hills to elegant silver slate.

## [0.3.8] - 2026-09-20

### Added & Enhanced
- **Company Brand Logo Width & Placement Customization (`brand/page.tsx`, `Sidebar.tsx`)**:
  - Added dedicated interactive popup modal to configure custom banner logo width (100px to 260px) and placement options (`left`, `center`, `right`).
  - Provided quick dimension presets (120px, 140px, 180px, 220px, 250px) with live simulated sidebar header preview.
  - Fixed logo image update bug by maintaining `localStorage` fallbacks, forcing dynamic key re-renders, and dispatching real-time synchronization events (`novajournal_brand_config_changed`).
- **Profile Page Navbar Avatar Scaler (`profile/page.tsx`, `Navbar.tsx`)**:
  - Introduced granular avatar size slider (22px to 48px) in Section 1 of `/profile` with quick presets (24px, 28px, 34px, 40px, 46px).
  - Integrated live navbar preview card and reactive custom events (`novajournal_navbar_config_changed`) dynamically resizing the top navbar avatar.
- **Flat Cartoon Theme Transition Animation & Audio Overhaul (`ThemeTransitionOverlay.tsx`)**:
  - Overhauled theme toggle transition overlay with multi-tone Web Audio API feedback (`playNovaThemeSound`).
  - Implemented 3 staggered waves (11 total meteors) falling smoothly from top-right to bottom-left with radiant heads and custom vector trails.
  - Designed a 2D flat cartoon daytime animation featuring a cheerful sun disk, rounded revolving rays, cyan-white breeze clouds, and emerald hills.
- **Modern Reusable Nova Toast Notification System (`NovaToast.tsx`)**:
  - Built unified toast container with colored status indicators (emerald, red, amber, blue), bold titles, descriptions, auto-dismiss, and slide-in animations.
  - Integrated across all modular configuration pages (`/brand`, `/appearance`, `/ai-hub`, `/security`, `/regional`, `/profile`, `/settings`).

### Added
- **Authentication System**
  - Custom in-memory authentication with dummy accounts
  - Session management via cookies
  - AuthContext for global auth state management
  - Login page with email/password form
  - Registration page with form validation
  - Forgot password page (simulated)
  
- **Route Protection**
  - Next.js 16 Route Groups with `(protected)` folder
  - Protected layout with auth check
  - Automatic redirect to `/login` for unauthenticated users
  - Protected routes: `/dashboard`, `/transactions`, `/portfolio`, `/analytics`, `/settings`

- **Sidebar Navigation**
  - Fixed sidebar with navigation menu
  - Active state highlighting with gradient
  - User profile section with avatar
  - Logout functionality
  - Consistent across all protected pages

- **Dashboard Page**
  - Financial overview with stats cards
  - Total balance, monthly income, expenses, savings rate
  - Income vs Expense area chart
  - Portfolio distribution pie chart
  - Recent transactions table
  - Spending by category progress bars
  - Quick action buttons

- **Transactions Page**
  - Transaction list with filtering
  - Search functionality
  - Category filtering
  - Income/expense indicators
  - Transaction details display

- **Portfolio Page**
  - Investment portfolio tracking
  - Asset allocation charts
  - Performance metrics
  - Portfolio value tracking

- **Analytics Page**
  - Detailed financial insights
  - Income breakdown charts
  - Expense analysis
  - Savings trend visualization
  - Monthly comparisons

- **Settings Page**
  - Profile settings
  - Notification preferences
  - Theme toggle
  - Two-factor authentication toggle
  - Account management

- **Home Page**
  - Landing page with hero section
  - Feature highlights
  - Call-to-action sections
  - Footer with navigation

### Changed
- **Login Page**
  - Simplified UI with consistent theme
  - Removed over-styling (gradients, shadows)
  - Aligned with home page theme (blue-purple gradient)
  - Clean form layout
  - Dummy account quick login buttons

- **Import Paths**
  - Updated all AuthContext imports to use `@/` alias
  - Fixed module resolution after moving to `(protected)` folder

### Removed
- **Middleware.ts**
  - Removed Next.js middleware (not compatible with Next.js 16)
  - Replaced with route group-based protection

### Fixed
- **Build Errors**
  - Fixed "Module not found: Can't resolve '../../contexts/AuthContext'" errors
  - Corrected relative import paths in all protected pages
  - Used path alias `@/` for cleaner imports

- **Component Props**
  - Removed unsupported props from @heroui/react components
  - Fixed `startContent`, `classNames`, `endContent` prop errors

## [0.1.0] - Initial Release

### Features
- Basic project structure with Next.js 16
- HeroUI component library integration
- Tailwind CSS styling
- TypeScript configuration
- Basic page layouts
