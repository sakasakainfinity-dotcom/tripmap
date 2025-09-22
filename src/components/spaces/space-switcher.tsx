"use client";

import { Loader2, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSpaceContext } from "@/components/providers/space-provider";

export const SpaceSwitcher = () => {
  const { spaces, activeSpaceId, setActiveSpaceId, isUpdating } = useSpaceContext();

  if (!spaces.length) {
    return (
      <Button variant="outline" size="sm" disabled>
        スペース未登録
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-primary" />
      <Select value={activeSpaceId ?? undefined} onValueChange={setActiveSpaceId}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="スペースを選択" />
        </SelectTrigger>
        <SelectContent>
          {spaces.map((space) => (
            <SelectItem key={space.id} value={space.id}>
              {space.name}（{space.type === "pair" ? "ペア" : "ソロ"}）
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
};
