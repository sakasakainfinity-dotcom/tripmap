import { getActiveSpaceIdFromCookie } from "@/app/actions/space-actions";
import { MapView } from "@/components/map/map-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlacesForSpace } from "@/lib/queries";

const HomePage = async () => {
  const activeSpaceId = getActiveSpaceIdFromCookie();

  if (!activeSpaceId) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Travel Memories Map へようこそ</CardTitle>
            <CardDescription>まずはスペースを作成し、画面上部のメニューから選択してください。</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              スペースはソロ（個人用）とペア（共有用）を切り替えながら、旅の思い出を地図に残せます。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const places = await getPlacesForSpace(activeSpaceId);

  return (
    <div className="container py-6">
      <MapView
        places={places.map((place) => ({
          id: place.id,
          title: place.title,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          memoryCount: place.memoryCount,
        }))}
      />
    </div>
  );
};

export default HomePage;
