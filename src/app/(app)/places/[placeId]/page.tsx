import Image from "next/image";
import { notFound } from "next/navigation";

import { MemoryForm } from "@/components/forms/memory-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlaceDetail } from "@/lib/queries";
import { formatVisitedDate } from "@/lib/utils";

interface PlacePageProps {
  params: {
    placeId: string;
  };
}

const PlacePage = async ({ params }: PlacePageProps) => {
  const place = await getPlaceDetail(params.placeId);

  if (!place) {
    notFound();
  }

  const memories = place.memories ?? [];

  return (
    <div className="container grid gap-10 py-10 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{place.title}</CardTitle>
            {place.address && <CardDescription>{place.address}</CardDescription>}
          </CardHeader>
        </Card>
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">思い出</h2>
          {memories.length === 0 && <p className="text-muted-foreground">まだ思い出がありません。</p>}
          <div className="space-y-6">
            {memories.map((memory) => (
              <Card key={memory.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{formatVisitedDate(memory.visited_at)}</CardTitle>
                  {memory.note && <CardDescription>{memory.note}</CardDescription>}
                </CardHeader>
                {memory.photos && memory.photos.length > 0 && (
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {memory.photos.map((photo) => (
                        <div key={photo.id} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src={photo.file_url}
                            alt={place.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>
      </div>
      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>思い出を追加</CardTitle>
            <CardDescription>写真とメモを添えて訪れた日の記録を残しましょう。</CardDescription>
          </CardHeader>
          <CardContent>
            <MemoryForm placeId={params.placeId} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
};

export default PlacePage;
