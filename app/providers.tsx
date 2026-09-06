"use client";

import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { QueryClientProvider } from "./providers/QueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <QueryClientProvider>
        {children}
      </QueryClientProvider>
    </HeroUIProvider>
  );
}
