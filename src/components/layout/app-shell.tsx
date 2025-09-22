"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { SpaceSwitcher } from "@/components/spaces/space-switcher";
import { useSupabase } from "@/components/providers/supabase-provider";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  user: User | null;
}

const navItems = [
  { href: "/", label: "マップ" },
  { href: "/timeline", label: "タイムライン" },
];

export const AppShell: React.FC<AppShellProps> = ({ children, user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { supabase } = useSupabase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const isAuthRoute = pathname?.startsWith("/login");

  if (isAuthRoute) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-background/70 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold">
            Travel Memories Map
          </Link>
          <div className="flex items-center gap-3">
            <SpaceSwitcher />
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {user.email ?? "ゲスト"}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  ログアウト
                </Button>
              </div>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">ログイン</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <nav className="border-t bg-background/80 backdrop-blur">
        <div className="container flex items-center justify-around py-3 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 transition",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};
