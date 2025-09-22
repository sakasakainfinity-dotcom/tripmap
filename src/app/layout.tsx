import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { SpaceProvider } from "@/components/providers/space-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { getAccessibleSpaces, getCurrentUser } from "@/lib/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveSpaceIdFromCookie } from "@/app/actions/space-actions";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Travel Memories Map",
  description: "旅人・恋人のための思い出地図アプリ",
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0f172a" }, { color: "#0ea5e9" }],
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const [spaces, activeSpaceFromCookie] = await Promise.all([
    getAccessibleSpaces(),
    Promise.resolve(getActiveSpaceIdFromCookie()),
  ]);

  const activeSpaceId = activeSpaceFromCookie ?? spaces[0]?.id ?? null;
  const user = await getCurrentUser();

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}>
        <SupabaseProvider initialSession={session}>
          <SpaceProvider spaces={spaces} initialSpaceId={activeSpaceId}>
            <AppShell user={user}>{children}</AppShell>
          </SpaceProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
};

export default RootLayout;
