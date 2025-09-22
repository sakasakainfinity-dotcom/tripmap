"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createMemory, savePhotoMetadata } from "@/app/actions/memory-actions";
import { useSpaceContext } from "@/components/providers/space-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MEMORIES_BUCKET, buildPhotoPath } from "@/lib/storage";

interface MemoryFormProps {
  placeId: string;
  onSuccess?: () => void;
}

export const MemoryForm: React.FC<MemoryFormProps> = ({ placeId, onSuccess }) => {
  const { activeSpaceId } = useSpaceContext();
  const { supabase } = useSupabase();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [visitedAt, setVisitedAt] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filePreviews = useMemo(() => {
    if (!files) return [] as string[];
    return Array.from(files).map((file) => file.name);
  }, [files]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeSpaceId) {
      setError("スペースを選択してください");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const memoryId = await createMemory({
        spaceId: activeSpaceId,
        placeId,
        note: note || null,
        visitedAt: visitedAt || null,
      });

      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          const path = buildPhotoPath(activeSpaceId, placeId, memoryId, file.name);
          const upload = await supabase.storage
            .from(MEMORIES_BUCKET)
            .upload(path, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (upload.error) {
            throw upload.error;
          }

          const { data: publicUrl } = supabase.storage.from(MEMORIES_BUCKET).getPublicUrl(path);

          const dimensions = await getImageDimensions(file);

          await savePhotoMetadata({
            spaceId: activeSpaceId,
            placeId,
            memoryId,
            fileUrl: publicUrl.publicUrl,
            width: dimensions?.width ?? null,
            height: dimensions?.height ?? null,
          });
        }
      }

      setNote("");
      setVisitedAt("");
      setFiles(null);
      onSuccess?.();
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("思い出の保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="memory-visited">訪問日</Label>
        <Input
          id="memory-visited"
          type="date"
          value={visitedAt}
          onChange={(event) => setVisitedAt(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="memory-note">メモ</Label>
        <Textarea
          id="memory-note"
          placeholder="その時の気持ちやストーリーを記録"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="memory-photos">写真アップロード</Label>
        <Input
          id="memory-photos"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => setFiles(event.target.files)}
        />
        {filePreviews.length > 0 && (
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            {filePreviews.map((file) => (
              <li key={file}>{file}</li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "保存中..." : "思い出を保存"}
      </Button>
    </form>
  );
};

const getImageDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
  return new Promise((resolve) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      resolve({ width: image.width, height: image.height });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
};
