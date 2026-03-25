"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/common";
import { PageHeader, Card, CardContent, Badge, Select, FilterChip, Alert } from "@/components/ui";
import { useNearbyPlaces, usePlaceCategories } from "@/features/nearby-places";
import { MapPin, Phone, LocateFixed } from "lucide-react";

const RADIUS_OPTIONS = [
  { value: "1000", label: "1 km" },
  { value: "2000", label: "2 km" },
  { value: "3000", label: "3 km" },
  { value: "5000", label: "5 km" },
];

function formatDistance(meters: number | null): string {
  if (meters == null) return "";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function NearbyPlacesPageContent() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [radius, setRadius] = useState(3000);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(true);

  // Request browser location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocating(false);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Location access denied. Please allow location permission and reload."
            : "Unable to get your location. Please try again."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const categoriesQ = usePlaceCategories();
  const placesQ = useNearbyPlaces(lat, lng, category, radius);

  const categories = categoriesQ.data ?? [];
  const places = placesQ.data?.places ?? [];

  return (
    <PageWrapper>
      <PageHeader
        title="Nearby Places"
        description="Shops, services, and facilities near your location."
      />

      {/* Location loading */}
      {locating && (
        <Card className="overflow-hidden rounded-lg mb-4">
          <div className="py-10 text-center text-sm text-muted-foreground">
            <LocateFixed className="w-5 h-5 animate-pulse inline-block mr-2 align-middle" />
            Getting your location...
          </div>
        </Card>
      )}

      {/* Location error */}
      {locationError && (
        <Alert variant="error" className="mb-4 text-sm">
          {locationError}
        </Alert>
      )}

      {/* Main content — only show when location is available */}
      {lat != null && lng != null && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex flex-1 flex-wrap gap-1.5">
              <FilterChip selected={!category} onClick={() => setCategory(undefined)}>
                All
              </FilterChip>
              {categories.map((c) => (
                <FilterChip key={c.id} selected={category === c.id} onClick={() => setCategory(c.id)}>
                  {c.label}
                </FilterChip>
              ))}
            </div>

            <Select
              id="radius"
              value={String(radius)}
              onChange={(e) => setRadius(Number(e.target.value))}
              options={RADIUS_OPTIONS}
              className="w-24"
            />
          </div>

          {/* Loading state */}
          {placesQ.isLoading && (
            <Card className="overflow-hidden rounded-lg">
              <div className="py-10 text-center text-sm text-muted-foreground">
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                Finding nearby places...
              </div>
            </Card>
          )}

          {/* Error state */}
          {placesQ.isError && (
            <Card className="overflow-hidden rounded-lg">
              <div className="py-10 text-center text-sm text-destructive">
                {(placesQ.error as Error)?.message || "Failed to load nearby places. Please try again."}
              </div>
            </Card>
          )}

          {/* Empty state */}
          {!placesQ.isLoading && !placesQ.isError && places.length === 0 && (
            <Card className="overflow-hidden rounded-lg">
              <div className="py-10 text-center text-sm text-muted-foreground">
                No places found{category ? " in this category" : ""}. Try increasing the radius.
              </div>
            </Card>
          )}

          {/* Places grid */}
          {places.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {places.map((place, idx) => (
                <Card key={`${place.place_id}-${idx}`} className="overflow-hidden rounded-lg hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1">{place.name}</h3>
                      <Badge variant="outline" size="sm" className="shrink-0">
                        {place.category}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      {place.address && (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground line-clamp-2">{place.address}</p>
                        </div>
                      )}

                      {place.distance_m != null && (
                        <p className="text-xs font-medium text-primary">
                          {formatDistance(place.distance_m)} away
                        </p>
                      )}

                      {place.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <a
                            href={`tel:${place.phone}`}
                            className="text-xs text-primary hover:underline"
                          >
                            {place.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
