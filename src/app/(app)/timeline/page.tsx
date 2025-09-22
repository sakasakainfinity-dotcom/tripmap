import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveSpaceIdFromCookie } from "@/app/actions/space-actions";
import { getTimelineMemories } from "@/lib/queries";
import { formatVisitedDate } from "@/lib/utils";

const TimelinePage = async () => {
  const activeSpaceId = getActiveSpaceIdFromCookie();

  if (!activeSpaceId) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>スペースを選択してください</CardTitle>
            <CardDescription>タイムラインを表示するには、画面上部のドロップダウンからスペースを選んでください。</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const memories = await getTimelineMemories(activeSpaceId);

  return (
    <div className="container space-y-6 py-10">
      <h1 className="text-2xl font-bold">タイムライン</h1>
      {memories.length === 0 && <p className="text-muted-foreground">まだ思い出がありません。</p>}
      <div className="space-y-4">
        {memories.map((memory) => (
          <Card key={memory.id}>
            <CardHeader>
              <CardTitle className="text-lg">{formatVisitedDate(memory.visited_at)}</CardTitle>
              {memory.place && (
                <CardDescription>
                  <Link href={`/places/${memory.place.id}`} className="underline">
                    {memory.place.title}
                  </Link>
                </CardDescription>
              )}
            </CardHeader>
            {memory.note && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{memory.note}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TimelinePage;
