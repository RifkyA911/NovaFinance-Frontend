# Changelog

All notable changes to NovaJournal will be documented in this file.

## [Unreleased]

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
