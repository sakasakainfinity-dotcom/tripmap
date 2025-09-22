"use client";

import { useState, useTransition } from "react";

import { createPlace } from "@/app/actions/place-actions";
import { useSpaceContext } from "@/components/providers/space-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PlaceFormProps {
  onSuccess?: () => void;
}

export const PlaceForm: React.FC<PlaceFormProps> = ({ onSuccess }) => {
  const { activeSpaceId } = useSpaceContext();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeSpaceId) {
      setError("スペースを選択してください");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("緯度・経度を正しく入力してください");
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await createPlace({
          spaceId: activeSpaceId,
          title,
          address: address || null,
          latitude: lat,
          longitude: lng,
        });
        setTitle("");
        setAddress("");
        setLatitude("");
        setLongitude("");
        onSuccess?.();
      } catch (err) {
        console.error(err);
        setError("場所の登録に失敗しました");
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="place-title">タイトル</Label>
        <Input
          id="place-title"
          placeholder="例：初めての旅行先"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="place-address">住所</Label>
        <Textarea
          id="place-address"
          placeholder="思い出の場所の住所や目印"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="place-lat">緯度</Label>
          <Input
            id="place-lat"
            type="number"
            placeholder="35.6804"
            value={latitude}
            step="0.000001"
            onChange={(event) => setLatitude(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="place-lng">経度</Label>
          <Input
            id="place-lng"
            type="number"
            placeholder="139.7690"
            value={longitude}
            step="0.000001"
            onChange={(event) => setLongitude(event.target.value)}
            required
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "登録中..." : "場所を登録"}
      </Button>
    </form>
  );
};
