"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

interface CreateMemoryInput {
  spaceId: string;
  placeId: string;
  note: string | null;
  visitedAt: string | null;
}

export const createMemory = async ({ spaceId, placeId, note, visitedAt }: CreateMemoryInput) => {
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

  const id = randomUUID();
  const { error } = await supabase.from("memories").insert({
    id,
    space_id: spaceId,
    place_id: placeId,
    note,
    visited_at: visitedAt,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/");
  revalidatePath(`/places/${placeId}`);
  revalidatePath("/timeline");

  return id;
};

interface SavePhotoMetadataInput {
  spaceId: string;
  placeId: string;
  memoryId: string;
  fileUrl: string;
  width: number | null;
  height: number | null;
}

export const savePhotoMetadata = async ({ spaceId, placeId, memoryId, fileUrl, width, height }: SavePhotoMetadataInput) => {
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

  const { error } = await supabase.from("photos").insert({
    id: randomUUID(),
    space_id: spaceId,
    memory_id: memoryId,
    file_url: fileUrl,
    width,
    height,
  });

  if (error) {
    throw error;
  }

  revalidatePath(`/places/${placeId}`);
  revalidatePath("/timeline");
};
