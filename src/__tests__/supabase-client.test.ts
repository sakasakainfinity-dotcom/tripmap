import { describe, expect, it } from "vitest";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

describe("Supabase client", () => {
  it("creates a client instance with auth helpers", () => {
    const client = createBrowserSupabaseClient();
    expect(client).toHaveProperty("auth");
  });
});
