"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import NovaAICopilot from "./components/NovaAICopilot";
import NovaCosmicLoader from "@/components/transitions/NovaCosmicLoader";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <NovaCosmicLoader title="NovaJournal Financial Engine" subtitle="Memuat workspace & memverifikasi sesi..." />;
  }

  if (!isAuthenticated) {
    return <NovaCosmicLoader title="NovaJournal Authentication" subtitle="Mengarahkan ke halaman login..." playSound={false} />;
  }


  return (
    <WorkspaceProvider>
      <div className="flex h-screen bg-background text-foreground text-xs sm:text-sm antialiased overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        <NovaAICopilot />
      </div>
    </WorkspaceProvider>
  );
}
