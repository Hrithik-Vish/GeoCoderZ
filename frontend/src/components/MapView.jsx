import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet';
import {
  LocateFixed,
  MapPin,
  Maximize2,
} from 'lucide-react';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/* =========================
   DEFAULT LEAFLET ICON
========================= */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* =========================
   EXTRACTED PLACE ICON

   Marker color follows the same confidence bands as the results
   table (high/medium/low), built once per band rather than per
   marker instance — Leaflet icons are cheap to share. A selected
   place gets a larger pin plus a pulse ring so it's unambiguous
   which marker a result-card click or text-highlight click landed
   on, per the text<->map linking behavior.
========================= */

const CONFIDENCE_BANDS = ['high', 'medium', 'low'];

const getConfidenceBand = (confidence) => {
  const value = typeof confidence === 'number' ? confidence : 0;

  if (value >= 0.9) return 'high';
  if (value >= 0.6) return 'medium';
  return 'low';
};

const extractedPlaceIcons = Object.fromEntries(
  CONFIDENCE_BANDS.map((band) => [
    band,
    L.divIcon({
      className: 'geomapai-marker-wrapper',

      html: `
        <div class="geomapai-marker-pin geomapai-marker-pin--${band}">
          <div class="geomapai-marker-dot"></div>
        </div>
      `,

      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -38],
    }),
  ])
);

const selectedPlaceIcons = Object.fromEntries(
  CONFIDENCE_BANDS.map((band) => [
    band,
    L.divIcon({
      className: 'geomapai-marker-wrapper',

      html: `
        <div class="geomapai-marker-pin geomapai-marker-pin--${band} geomapai-marker-pin--selected">
          <div class="geomapai-marker-ring"></div>
          <div class="geomapai-marker-dot"></div>
        </div>
      `,

      iconSize: [38, 50],
      iconAnchor: [19, 50],
      popupAnchor: [0, -46],
    }),
  ])
);

/* =========================
   CURRENT LOCATION ICON
========================= */

const currentLocationIcon = L.divIcon({
  className: 'current-location-marker',

  html: `
    <div class="current-location-pulse">
      <div class="current-location-dot"></div>
    </div>
  `,

  iconSize: [34, 34],
  iconAnchor: [17, 17],
});


/* =========================
   SELECTED PLACE RECENTER
========================= */

const MapRecenter = ({ place }) => {
  const map = useMap();

  useEffect(() => {
    if (
      place &&
      place.status === 'resolved' &&
      typeof place.lat === 'number' &&
      typeof place.long === 'number'
    ) {
      map.flyTo(
        [place.lat, place.long],
        11,
        {
          duration: 1.2,
          easeLinearity: 0.25,
        }
      );
    }
  }, [place, map]);

  return null;
};

/* =========================
   FIT ALL LOCATIONS
========================= */

const MapFitController = ({
  trigger,
  places,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!trigger || !places.length) {
      return;
    }

    const bounds = L.latLngBounds(
      places.map((place) => [
        place.lat,
        place.long,
      ])
    );

    if (!bounds.isValid()) {
      return;
    }

    map.flyToBounds(bounds, {
      paddingTopLeft: [50, 60],
      paddingBottomRight: [50, 60],
      duration: 1.3,
      maxZoom: 10,
    });
  }, [trigger, places, map]);

  return null;
};

/* =========================
   CURRENT LOCATION RECENTER
========================= */

const LocationController = ({
  currentLocation,
}) => {
  const map = useMap();

  useEffect(() => {
    if (
      currentLocation &&
      typeof currentLocation.lat === 'number' &&
      typeof currentLocation.lng === 'number'
    ) {
      map.flyTo(
        [
          currentLocation.lat,
          currentLocation.lng,
        ],
        13,
        {
          duration: 1.2,
          easeLinearity: 0.25,
        }
      );
    }
  }, [currentLocation, map]);

  return null;
};

/* =========================
   MAP VIEW
========================= */

/* =========================
   BASEMAP TILES

   CARTO's free raster tile CDN (no API key, no signup — matches the
   project's free/open-source, no-vendor-lock-in constraint) rather
   than plain OpenStreetMap "Standard" tiles: OSM Standard is busy
   with saturated road colors and dense POI icons, which reads as
   generic web-map clutter rather than the calm, neutral cartographic
   basemap this product wants as a backdrop for its own markers.
   Positron (light_all) is a light, desaturated basemap; Dark Matter
   (dark_all) is its dark equivalent — both are genuinely neutral
   styles meant to sit under data layers, not a "neon" theme, so
   switching between them by theme keeps the map visually calm in
   both modes instead of always dropping a bright white map into a
   dark dashboard.
========================= */

const BASEMAP_TILES = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    detectRetina: true,
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    detectRetina: true,
  },
};

const MapView = ({
  places = [],
  selectedPlace = null,
  onPlaceSelect,
  fullScreen = false,
  theme = 'dark',
}) => {
  const [currentLocation, setCurrentLocation] =
    useState(null);

  const [locationStatus, setLocationStatus] =
    useState('idle');

  const watchIdRef = useRef(null);
  const stopWatchTimerRef = useRef(null);

  const [fitTrigger, setFitTrigger] =
    useState(0);

  const defaultCenter = [
    20.5937,
    78.9629,
  ];

  const resolvedPlaces = useMemo(
    () =>
      places.filter(
        (place) =>
          place.status === 'resolved' &&
          typeof place.lat === 'number' &&
          typeof place.long === 'number'
      ),
    [places]
  );

  const getSourceLabel = (source) => {
    if (source === 'local_geonames') {
      return 'Local GeoNames';
    }

    if (source === 'nominatim_fallback') {
      return 'Nominatim Fallback';
    }

    return 'Unavailable';
  };

  /* =========================
     YOUR LOCATION

     A single getCurrentPosition() call takes whatever fix the device
     hands back first and stops — if that's a coarse network/WiFi-based
     reading (common when GPS hasn't locked yet, or isn't available at
     all, e.g. a laptop with no GPS hardware), the app displays that
     coarse reading as if it were final. That's the likely cause behind
     "shows a neighboring area instead of where I actually am" reports:
     the browser's own positioning was imprecise, not a bug in how this
     app reads it.

     watchPosition() instead keeps listening for a few seconds — GPS
     fixes typically get MORE accurate as more satellites lock on, so
     later callbacks often report a smaller accuracy radius than the
     first one. Each callback below only replaces the marker if the new
     reading is actually better (smaller accuracy value) than what's
     already shown, so a late, worse reading (e.g. from a dropped GPS
     lock) can't un-improve it. The watch stops — via clearWatch — as
     soon as accuracy is "good enough", or after MAX_WATCH_MS regardless,
     so this never keeps the device's GPS hardware running indefinitely.
  ========================= */

  const GOOD_ACCURACY_METERS = 100;
  const MAX_WATCH_MS = 8000;

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      );
      watchIdRef.current = null;
    }

    if (stopWatchTimerRef.current) {
      clearTimeout(stopWatchTimerRef.current);
      stopWatchTimerRef.current = null;
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }

    stopWatching();
    setLocationStatus('loading');

    watchIdRef.current =
      navigator.geolocation.watchPosition(
        (position) => {
          const nextAccuracy =
            position.coords.accuracy;

          setCurrentLocation((previous) => {
            const isFirstReading = !previous;

            const isBetterReading =
              previous &&
              nextAccuracy < previous.accuracy;

            if (
              !isFirstReading &&
              !isBetterReading
            ) {
              return previous;
            }

            return {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: nextAccuracy,
            };
          });

          setLocationStatus('success');

          if (
            nextAccuracy <=
            GOOD_ACCURACY_METERS
          ) {
            stopWatching();
          }
        },
        (error) => {
          console.error(
            'Geolocation error:',
            error
          );

          setLocationStatus('error');
          stopWatching();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

    stopWatchTimerRef.current = setTimeout(
      stopWatching,
      MAX_WATCH_MS
    );
  };

  // Never leave a watch running past this component's lifetime.
  useEffect(() => {
    return () => stopWatching();
  }, []);

  /* =========================
     FIT ALL
  ========================= */

  const handleFitAll = () => {
    if (!resolvedPlaces.length) {
      return;
    }

    setFitTrigger(
      (previous) => previous + 1
    );
  };

  return (
    <div
      className={`map-wrapper ${
        fullScreen
          ? 'map-fullscreen'
          : ''
      }`}
    >
      <MapContainer
        center={defaultCenter}
        zoom={fullScreen ? 5 : 4}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <TileLayer
          url={BASEMAP_TILES[theme]?.url ?? BASEMAP_TILES.dark.url}
          attribution={
            BASEMAP_TILES[theme]?.attribution ?? BASEMAP_TILES.dark.attribution
          }
          detectRetina={BASEMAP_TILES[theme]?.detectRetina ?? true}
          maxZoom={20}
          subdomains="abcd"
        />

        <MapRecenter
          place={selectedPlace}
        />

        <LocationController
          currentLocation={currentLocation}
        />

        <MapFitController
          trigger={fitTrigger}
          places={resolvedPlaces}
        />

        {/* =========================
            EXTRACTED LOCATIONS
        ========================= */}

        {resolvedPlaces.map(
          (place, index) => {
            const band = getConfidenceBand(place.confidence);

            const isSelected =
              selectedPlace &&
              selectedPlace.raw === place.raw &&
              selectedPlace.lat === place.lat &&
              selectedPlace.long === place.long;

            const icon = isSelected
              ? selectedPlaceIcons[band]
              : extractedPlaceIcons[band];

            return (
            <Marker
              key={`${place.raw}-${index}`}
              position={[
                place.lat,
                place.long,
              ]}
              icon={icon}
              zIndexOffset={isSelected ? 900 : 0}
              eventHandlers={{
                click: () => {
                  // Completes the third leg of the sync triangle
                  // (plan section 9): selecting text highlights the
                  // result row and focuses the map; selecting a
                  // result highlights the text and focuses the map;
                  // this handler makes selecting the marker itself
                  // highlight both the result row and the source
                  // text, the same as the other two directions.
                  onPlaceSelect?.(place);
                },
              }}
            >
              <Popup>
                <div className="map-popup">
                  <div className={`popup-badge popup-badge--${band}`}>
                    {band === 'high'
                      ? 'High Confidence'
                      : band === 'medium'
                      ? 'Medium Confidence'
                      : 'Low Confidence'}
                  </div>

                  <h3>
                    {place.canonical ||
                      'Unknown Location'}
                  </h3>

                  <p className="popup-original">
                    Input name:{' '}
                    {place.raw ||
                      'Not available'}
                  </p>

                  <div className="popup-divider" />

                  <div className="popup-info">
                    <span>
                      Confidence
                    </span>

                    <strong>
                      {Math.round(
                        (place.confidence || 0) *
                          100
                      )}
                      %
                    </strong>
                  </div>

                  <div className="popup-info">
                    <span>Source</span>

                    <strong>
                      {getSourceLabel(
                        place.source
                      )}
                    </strong>
                  </div>

                  <div className="popup-info">
                    <span>Latitude</span>

                    <strong>
                      {place.lat.toFixed(6)}
                    </strong>
                  </div>

                  <div className="popup-info">
                    <span>Longitude</span>

                    <strong>
                      {place.long.toFixed(6)}
                    </strong>
                  </div>

                  <div className="popup-divider" />

                  <p className="popup-reason">
                    {place.reason ||
                      'No explanation available.'}
                  </p>
                </div>
              </Popup>
            </Marker>
            );
          }
        )}

        {/* =========================
            CURRENT LOCATION
        ========================= */}

        {currentLocation && (
          <Circle
            center={[
              currentLocation.lat,
              currentLocation.lng,
            ]}
            radius={currentLocation.accuracy}
            pathOptions={{
              className: 'accuracy-circle',
              fillOpacity: 0.08,
              weight: 1,
              opacity: 0.35,
            }}
          />
        )}

        {currentLocation && (
          <Marker
            position={[
              currentLocation.lat,
              currentLocation.lng,
            ]}
            icon={currentLocationIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="map-popup">
                <div className="popup-badge current-location-badge">
                  Your Location
                </div>

                <h3>
                  Current Position
                </h3>

                <p className="popup-original">
                  Detected from your browser
                  location.
                  {currentLocation.accuracy >
                    1000 && (
                    <>
                      {' '}
                      Accuracy is low right
                      now — this usually means
                      the reading came from
                      network signal rather
                      than GPS.
                    </>
                  )}
                </p>

                <div className="popup-divider" />

                <div className="popup-info">
                  <span>Latitude</span>

                  <strong>
                    {currentLocation.lat.toFixed(
                      6
                    )}
                  </strong>
                </div>

                <div className="popup-info">
                  <span>Longitude</span>

                  <strong>
                    {currentLocation.lng.toFixed(
                      6
                    )}
                  </strong>
                </div>

                <div className="popup-info">
                  <span>Accuracy</span>

                  <strong>
                    ±
                    {Math.round(
                      currentLocation.accuracy
                    )}
                    m
                  </strong>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* =========================
          MAP ACTIONS
      ========================= */}

      <div className="map-action-stack">
        <button
          type="button"
          className={`map-action-button ${
            locationStatus === 'loading'
              ? 'loading'
              : ''
          }`}
          onClick={handleLocateMe}
          disabled={
            locationStatus === 'loading'
          }
          title="Show your current location"
        >
          <LocateFixed size={16} />

          <span>
            {locationStatus === 'loading'
              ? 'Locating...'
              : 'Your Location'}
          </span>
        </button>

        <button
          type="button"
          className="map-action-button"
          onClick={handleFitAll}
          disabled={
            resolvedPlaces.length === 0
          }
          title="Fit all mapped locations"
        >
          <Maximize2 size={16} />

          <span>
            Fit All Locations
          </span>
        </button>
      </div>

      {/* =========================
          LOCATION MESSAGES
      ========================= */}

      {locationStatus === 'error' && (
        <div className="location-message error">
          <MapPin size={15} />

          <span>
            Unable to access your
            location. Please allow
            location permission.
          </span>
        </div>
      )}

      {locationStatus ===
        'unsupported' && (
        <div className="location-message error">
          <MapPin size={15} />

          <span>
            Geolocation is not supported
            by your browser.
          </span>
        </div>
      )}

      {locationStatus === 'success' && (
        <div className="location-message success">
          <MapPin size={15} />

          <span>
            Your current location is
            shown on the map.
          </span>
        </div>
      )}

      {/* =========================
          MAP COUNTER
      ========================= */}

      {resolvedPlaces.length > 0 && (
        <div className="map-counter">
          <span className="map-counter-dot" />

          {resolvedPlaces.length}{' '}
          {resolvedPlaces.length === 1
            ? 'location'
            : 'locations'}{' '}
          mapped
        </div>
      )}
    </div>
  );
};

export default MapView;