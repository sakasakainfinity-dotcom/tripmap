"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import { getActiveSpaceIdFromCookie } from "@/app/actions/space-actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface CreatePlaceInput {
  spaceId: string;
  title: string;
  address: string | null;
  latitude: number;
  longitude: number;
}

export const createPlace = async ({ spaceId, title, address, latitude, longitude }: CreatePlaceInput) => {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("認証が必要です");
  }

  const membership = await supabase
    .from("space_members")
    .select("space_id")
    .eq("space_id", spaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership.error) {
    throw membership.error;
  }

  const { error } = await supabase.from("places").insert({
    id: randomUUID(),
    space_id: spaceId,
    title,
    address,
    lat: latitude,
    lng: longitude,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/");
  const activeSpace = getActiveSpaceIdFromCookie();
  if (activeSpace === spaceId) {
    revalidatePath("/timeline");
  }
};
