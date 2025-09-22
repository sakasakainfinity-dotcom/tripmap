import { cache } from "react";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SpaceSummary } from "@/components/providers/space-provider";
import type { Database } from "@/types/database";

export const getCurrentUser = cache(async () => {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getAccessibleSpaces = cache(async (): Promise<SpaceSummary[]> => {
  const supabase = createServerSupabaseClient();
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("space_members")
    .select("spaces(id, name, type)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const spaces: SpaceSummary[] = [];

  data?.forEach((entry) => {
    const space = entry.spaces as Database["public"]["Tables"]["spaces"]["Row"] | null;
    if (space && !spaces.some((existing) => existing.id === space.id)) {
      spaces.push({ id: space.id, name: space.name, type: space.type });
    }
  });

  return spaces;
});

export const getPlacesForSpace = cache(async (spaceId: string) => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("places")
    .select("id, title, address, lat, lng, memories(id)")
    .eq("space_id", spaceId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (
    data?.map((place) => ({
      id: place.id,
      title: place.title,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      memoryCount: place.memories?.length ?? 0,
    })) ?? []
  );
});

export const getPlaceDetail = cache(async (placeId: string) => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("places")
    .select(
      `id, title, address, lat, lng, created_at, updated_at,
       memories(id, note, visited_at, created_at, updated_at, photos(id, file_url, width, height, created_at))`
    )
    .eq("id", placeId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
});

export const getTimelineMemories = cache(async (spaceId: string) => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("memories")
    .select("id, note, visited_at, created_at, updated_at, place:places(id, title, address)")
    .eq("space_id", spaceId)
    .order("visited_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
});
