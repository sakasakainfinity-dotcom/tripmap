import MapView from "@/components/map/map-view";

export default function Page() {
  return (
    <main className="w-full h-screen">
      <MapView places={[]} />
    </main>
  );
}
