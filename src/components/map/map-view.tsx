"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap, type MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Place = { id: string; lat: number; lng: number; title?: string };

interface MapViewProps {
  places: Place[];
  onSelectPlace?: (placeId: string) => void;
}

const toGeoJSON = (places: Place[]) => ({
  type: "FeatureCollection",
  features: places.map((p) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    properties: { id: p.id, title: p.title ?? "" }
  }))
});

const MAP_SOURCE_ID = "tm-places";
const CLUSTER_LAYER_ID = "tm-clusters";
const CLUSTER_COUNT_LAYER_ID = "tm-cluster-count";
const POINT_LAYER_ID = "tm-point";

export default function MapView({ places, onSelectPlace }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const layersInitialized = useRef(false);
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const geojson = useMemo(() => toGeoJSON(places), [places]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!apiKey) { setMapError("MapTiler API key is not configured."); return; }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
      center: [139.6917, 35.6895],
      zoom: 10
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    const onError = (e: any) => { console.error(e); setMapError("Map failed to load."); };
    map.on("error", onError);
    map.on("load", () => setIsReady(true));

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    mapRef.current = map;
    return () => { ro.disconnect(); map.off("error", onError); map.remove(); mapRef.current = null; };
  }, [apiKey]);

  useEffect(() => {
    if (!mapRef.current || !isReady) return;
    const map = mapRef.current;

    if (!layersInitialized.current) {
      map.addSource(MAP_SOURCE_ID, { type: "geojson", data: geojson as any, cluster: true, clusterMaxZoom: 16, clusterRadius: 50 });

      map.addLayer({
        id: CLUSTER_LAYER_ID, type: "circle", source: MAP_SOURCE_ID, filter: ["has", "point_count"],
        paint: { "circle-color": "#2563eb", "circle-radius": ["step", ["get","point_count"], 20, 20, 25, 50, 30], "circle-opacity": 0.8 }
      });

      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID, type: "symbol", source: MAP_SOURCE_ID, filter: ["has","point_count"],
        layout: { "text-field": ["get","point_count_abbreviated"], "text-size": 12 },
        paint: { "text-color": "#ffffff" }
      });

      map.addLayer({
        id: POINT_LAYER_ID, type: "circle", source: MAP_SOURCE_ID, filter: ["!", ["has","point_count"]],
        paint: { "circle-color": "#f97316", "circle-radius": 10, "circle-stroke-width": 2, "circle-stroke-color": "#ffffff" }
      });

      map.on("click", CLUSTER_LAYER_ID, (e) => {
        const f = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER_ID] }) as MapGeoJSONFeature[];
        const cid = f[0]?.properties?.cluster_id;
        const src = map.getSource(MAP_SOURCE_ID) as maplibregl.GeoJSONSource;
        if (cid && src) {
          src.getClusterExpansionZoom(cid, (err, zoom) => {
            if (err) return;
            const [lng, lat] = f[0].geometry.coordinates as [number, number];
            map.easeTo({ center: [lng, lat], zoom });
          });
        }
      });

      map.on("click", POINT_LAYER_ID, (e) => {
        const f = map.queryRenderedFeatures(e.point, { layers: [POINT_LAYER_ID] }) as MapGeoJSONFeature[];
        const id = f[0]?.properties?.id as string | undefined;
        if (id && onSelectPlace) onSelectPlace(id);
      });

      map.on("mouseenter", CLUSTER_LAYER_ID, () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", CLUSTER_LAYER_ID, () => (map.getCanvas().style.cursor = ""));
      map.on("mouseenter", POINT_LAYER_ID, () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", POINT_LAYER_ID, () => (map.getCanvas().style.cursor = ""));

      layersInitialized.current = true;
    }

    const src = map.getSource(MAP_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (src) src.setData(geojson as any);
  }, [geojson, isReady, onSelectPlace]);

  if (mapError) {
    return <div className="flex h-full w-full items-center justify-center text-red-600">{mapError}</div>;
  }
  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
}
