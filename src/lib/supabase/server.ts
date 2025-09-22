import { cookies } from "next/headers";
import { type CookieOptions, createServerClient } from "@supabase/ssr";

import { serverEnv } from "@/env";

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          const mutableCookies = cookieStore as unknown as {
            set?: (options: CookieOptions & { name: string; value: string }) => void;
          };

          mutableCookies.set?.({ name, value, ...options });
        },
        remove(name: string, options?: CookieOptions) {
          const mutableCookies = cookieStore as unknown as {
            delete?: (options: CookieOptions & { name: string }) => void;
          };

          mutableCookies.delete?.({ name, ...options });
        },
      },
    }
  );
};
