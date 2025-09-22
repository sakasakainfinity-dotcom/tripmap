"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import Supercluster from "supercluster";

import { clientEnv } from "@/env-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { PlaceForm } from "@/components/forms/place-form";

export interface MapPlace {
  id: string;
  title: string;
  address: string | null;
  lat: number;
  lng: number;
  memoryCount: number;
}

interface MapViewProps {
  places: MapPlace[];
}

const CLUSTER_SOURCE_ID = "places";
const CLUSTER_LAYER_ID = "clusters";
const CLUSTER_COUNT_LAYER_ID = "cluster-count";
const UNCLUSTERED_LAYER_ID = "unclustered-point";

export const MapView: React.FC<MapViewProps> = ({ places }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const points = useMemo(
    () =>
      places.map((place) => ({
        type: "Feature" as const,
        properties: {
          cluster: false,
          placeId: place.id,
          title: place.title,
          memoryCount: place.memoryCount,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [place.lng, place.lat] as [number, number],
        },
      })),
    [places]
  );

  const index = useMemo(() => {
    const supercluster = new Supercluster<{ placeId: string; title: string; memoryCount: number }>({
      radius: 60,
      maxZoom: 16,
    });
    supercluster.load(points as any);
    return supercluster;
  }, [points]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      if (mapRef.current && mapRef.current.isStyleLoaded()) {
        updateSource(mapRef.current, index);
      }
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${clientEnv.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: [139.767052, 35.681167],
      zoom: 4,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("load", () => {
      map.addSource(CLUSTER_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });

      map.addLayer({
        id: CLUSTER_LAYER_ID,
        type: "circle",
        source: CLUSTER_SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#38bdf8",
            5,
            "#0ea5e9",
            10,
            "#0369a1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            5,
            26,
            10,
            32,
          ],
        },
      });

      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: "symbol",
        source: CLUSTER_SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Regular"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#fff",
        },
      });

      map.addLayer({
        id: UNCLUSTERED_LAYER_ID,
        type: "circle",
        source: CLUSTER_SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#0ea5e9",
          "circle-radius": 10,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      map.on("moveend", () => updateSource(map, index));

      map.on("click", CLUSTER_LAYER_ID, (event) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: [CLUSTER_LAYER_ID],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId && typeof clusterId === "number") {
          index.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({
              center: (features[0].geometry as any).coordinates as [number, number],
              zoom,
            });
          });
        }
      });

      map.on("click", UNCLUSTERED_LAYER_ID, (event) => {
        const feature = event.features?.[0];
        const placeId = feature?.properties?.placeId as string | undefined;
        if (placeId) {
          router.push(`/places/${placeId}`);
        }
      });

      map.on("mouseenter", CLUSTER_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CLUSTER_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", UNCLUSTERED_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", UNCLUSTERED_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      updateSource(map, index);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [index, router]);

  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      updateSource(mapRef.current, index);
    }
  }, [index]);

  useEffect(() => {
    if (!mapRef.current || places.length === 0) {
      return;
    }

    const bounds = new maplibregl.LngLatBounds();
    places.forEach((place) => {
      bounds.extend([place.lng, place.lat]);
    });

    if (bounds.isEmpty()) {
      return;
    }

    mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 10, duration: 0 });
  }, [places]);

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl border shadow-lg">
      <div ref={mapContainerRef} className="h-full w-full" />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="absolute bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>新しい場所を追加</DialogTitle>
          <PlaceForm
            onSuccess={() => {
              setIsDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const updateSource = (
  map: MapLibreMap,
  index: Supercluster<{ placeId: string; title: string; memoryCount: number }>
) => {
  const source = map.getSource(CLUSTER_SOURCE_ID) as GeoJSONSource | undefined;
  if (!source) return;

  const bounds = map.getBounds();
  const clusters = index.getClusters([
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ], Math.round(map.getZoom()));

  source.setData({
    type: "FeatureCollection",
    features: clusters as GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>[],
  });
};
