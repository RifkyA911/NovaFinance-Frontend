"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession, signOut } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  
  const user = session?.user as User | null;
  const loading = isPending;

  const login = (userData: User, tokenData: string) => {
    // Login is handled by BetterAuth signIn
    localStorage.setItem("token", tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    // Use BetterAuth signOut
    await signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Force redirect to login
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null, // BetterAuth handles session via HttpOnly cookie
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
