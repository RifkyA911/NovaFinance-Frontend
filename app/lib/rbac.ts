export type UserRole = "owner" | "admin" | "staff" | "viewer";

export interface RoleConfig {
  id: UserRole;
  label: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const ROLES: Record<UserRole, RoleConfig> = {
  owner: {
    id: "owner",
    label: "Owner",
    description: "Full administrative access, workspace billing, and ownership transfer.",
    color: "amber",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-600 dark:text-amber-400",
  },
  admin: {
    id: "admin",
    label: "Admin",
    description: "Can manage team members, all accounts, categories, and settings.",
    color: "purple",
    badgeBg: "bg-purple-500/10",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-600 dark:text-purple-400",
  },
  staff: {
    id: "staff",
    label: "Staff / Accountant",
    description: "Can create and edit transactions, run AI receipts, view ledgers and financial health.",
    color: "blue",
    badgeBg: "bg-blue-500/10",
    badgeBorder: "border-blue-500/30",
    badgeText: "text-blue-600 dark:text-blue-400",
  },
  viewer: {
    id: "viewer",
    label: "Viewer",
    description: "Read-only access to transactions, portfolios, and reports without modification rights.",
    color: "default",
    badgeBg: "bg-default-100",
    badgeBorder: "border-default-200 dark:border-default-700",
    badgeText: "text-default-600 dark:text-default-400",
  },
};

/**
 * Check if the active role satisfies any of the required roles.
 * If requiredRoles is empty or undefined, access is granted to all roles.
 */
export function hasAccess(userRole: UserRole | string, requiredRoles?: UserRole[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const normalized = (userRole || "owner").toLowerCase() as UserRole;
  // Owner always has access to everything
  if (normalized === "owner") return true;
  return requiredRoles.includes(normalized);
}

/**
 * Helper to get active role (supports simulation from localStorage for testing)
 */
export function getEffectiveRole(defaultRole?: string): UserRole {
  if (typeof window !== "undefined") {
    const sim = localStorage.getItem("novafinance_simulated_role") || localStorage.getItem("novajournal_simulated_role");
    if (sim && (sim === "owner" || sim === "admin" || sim === "staff" || sim === "viewer")) {
      return sim;
    }
  }
  const r = (defaultRole || "owner").toLowerCase();
  if (r === "admin") return "admin";
  if (r === "staff" || r === "accountant" || r === "member") return "staff";
  if (r === "viewer") return "viewer";
  return "owner";
}

/**
 * Helper to set simulated role for developer testing
 */
export function setSimulatedRole(role: UserRole | null) {
  if (typeof window === "undefined") return;
  if (!role) {
    localStorage.removeItem("novafinance_simulated_role");
    localStorage.removeItem("novajournal_simulated_role");
  } else {
    localStorage.setItem("novafinance_simulated_role", role);
    localStorage.setItem("novajournal_simulated_role", role);
  }
  window.dispatchEvent(new Event("novafinance_role_change"));
  window.dispatchEvent(new Event("novajournal_role_change"));
}
