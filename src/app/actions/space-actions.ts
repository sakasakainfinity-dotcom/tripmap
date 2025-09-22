"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const ACTIVE_SPACE_COOKIE = "tm_active_space";

export const getActiveSpaceIdFromCookie = () => {
  const cookieStore = cookies();
  return cookieStore.get(ACTIVE_SPACE_COOKIE)?.value ?? null;
};

export const setActiveSpace = async (spaceId: string) => {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("space_members")
    .select("space_id")
    .eq("space_id", spaceId)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const cookieStore = cookies();

  cookieStore.set({
    name: ACTIVE_SPACE_COOKIE,
    value: spaceId,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
};
