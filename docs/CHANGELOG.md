# Changelog

All notable changes to NovaFinance will be documented in this file.

## [Unreleased]

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
