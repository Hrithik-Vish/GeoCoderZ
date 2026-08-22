import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  MapPin,
  CheckCircle2,
  Download,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileJson,
  AlertTriangle,
} from 'lucide-react';

const ResultsPanel = ({
  places = [],
  selectedPlace = null,
  onPlaceSelect,
  compact = false,
  focusFilter = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterConfidence, setFilterConfidence] = useState('All');
  const [expandedReason, setExpandedReason] = useState(null);

  // focusFilter lets a parent (the incident summary strip's "Need
  // review" stat) request a specific filter be applied here, without
  // lifting filterConfidence's full state up — App.jsx only ever needs
  // to say "show me the review ones," not manage the whole filter
  // lifecycle. Keyed by an incrementing `token` (not just the filter
  // value) so clicking the same stat twice in a row re-applies the
  // filter even if the person had since changed the dropdown by hand.
  useEffect(() => {
    if (focusFilter?.value) {
      setFilterConfidence(focusFilter.value);
    }
    // Intentionally keyed on focusFilter.token only, not
    // focusFilter.value, so repeated clicks on the same summary stat
    // re-trigger this even when the value is unchanged from last time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusFilter?.token]);

  const resolvedPlaces = places.filter(
    (place) =>
      place.status === 'resolved' &&
      typeof place.lat === 'number' &&
      typeof place.long === 'number'
  );

  const states = useMemo(() => {
    const uniqueStates = new Set();

    places.forEach((place) => {
      if (place.state) {
        uniqueStates.add(place.state);
      }
    });

    return ['All', ...uniqueStates];
  }, [places]);

  // The connected backend doesn't currently send a `state` field per
  // contract.md, so `states` is always just ['All'] in practice. A
  // dropdown offering a single option that can never change anything is
  // dead UI, not a real filter — hide it until there's genuinely more
  // than one state to choose between. Filtering logic below is untouched
  // and stays correct either way (filterState === 'All' always matches).
  const hasStateFilterOptions = states.length > 1;

  // Unlike `state`, `confidence` is always present on every extracted
  // item per contract.md (0.0 for failed entries) — so this filter is
  // never dead UI and only needs to hide when there's nothing to filter
  // at all yet.
  const getConfidenceBand = (place) => {
    if (place.status !== 'resolved') return 'unresolved';

    const value =
      typeof place.confidence === 'number'
        ? place.confidence
        : 0;

    if (value >= 0.9) return 'High';
    if (value >= 0.6) return 'Medium';
    return 'Low';
  };

  const filteredPlaces = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return places.filter((place) => {
      const raw = place.raw?.toLowerCase() || '';
      const canonical =
        place.canonical?.toLowerCase() || '';
      const state =
        place.state?.toLowerCase() || '';

      const matchesSearch =
        raw.includes(search) ||
        canonical.includes(search) ||
        state.includes(search);

      const matchesState =
        filterState === 'All' ||
        place.state === filterState;

      const matchesConfidence =
        filterConfidence === 'All' ||
        getConfidenceBand(place) === filterConfidence;

      return matchesSearch && matchesState && matchesConfidence;
    });
  }, [places, searchTerm, filterState, filterConfidence]);

  const confidencePercent = (value) => {
    if (
      typeof value !== 'number' ||
      Number.isNaN(value)
    ) {
      return 0;
    }

    return Math.round(
      Math.max(0, Math.min(1, value)) * 100
    );
  };

  const getSourceLabel = (source) => {
    if (source === 'local_geonames') {
      return 'Local GeoNames';
    }

    if (source === 'nominatim_fallback') {
      return 'Nominatim Fallback';
    }

    return 'Unavailable';
  };

  const toggleReason = (key) => {
    setExpandedReason((current) =>
      current === key ? null : key
    );
  };

  /* =========================
     CSV EXPORT
  ========================= */

  const handleExportCSV = () => {
    if (!filteredPlaces.length) {
      alert('No results available to export.');
      return;
    }

    const headers = [
      'Input Name',
      'Canonical Name',
      'Latitude',
      'Longitude',
      'Confidence',
      'Reason',
      'Source',
      'Status',
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = filteredPlaces.map((place) => [
      escapeCSV(place.raw),
      escapeCSV(place.canonical),
      place.lat ?? '',
      place.long ?? '',
      `${confidencePercent(place.confidence)}%`,
      escapeCSV(place.reason),
      escapeCSV(getSourceLabel(place.source)),
      escapeCSV(place.status),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download =
      'geomapai_extracted_places.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================
     GEOJSON EXPORT
  ========================= */

  const handleExportGeoJSON = () => {
    if (!resolvedPlaces.length) {
      alert(
        'No resolved locations available to export.'
      );
      return;
    }

    const geojson = {
      type: 'FeatureCollection',

      features: resolvedPlaces.map(
        (place, index) => ({
          type: 'Feature',

          id: place.id ?? index + 1,

          geometry: {
            type: 'Point',

            // GeoJSON uses [longitude, latitude]
            coordinates: [
              place.long,
              place.lat,
            ],
          },

          properties: {
            historical_name:
              place.raw ?? '',
            canonical_name:
              place.canonical ?? '',
            confidence:
              place.confidence ?? 0,
            confidence_percent:
              confidencePercent(
                place.confidence
              ),
            reason:
              place.reason ?? '',
            source:
              place.source ?? null,
            status:
              place.status ?? 'resolved',
            state:
              place.state ?? null,
          },
        })
      ),
    };

    const blob = new Blob(
      [JSON.stringify(geojson, null, 2)],
      {
        type: 'application/geo+json;charset=utf-8;',
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download =
      'geomapai_extracted_places.geojson';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================
     COMPACT MODE
     A vertical location list rather than a wide table — used when
     ResultsPanel sits in a narrow column next to the map (the primary
     "Detected Locations | Incident Map" workspace pane), where the
     full table's 780px min-width would force horizontal scrolling
     inside an already-narrow pane. Shares every piece of state,
     filtering, and the export/reason-toggle logic above with the
     table view below — only the markup differs, so search, filters,
     CSV/GeoJSON export, and text<->map<->list sync all keep working
     identically in either mode.
  ========================= */

  if (compact) {
    return (
      <div className="panel-card results-panel results-panel--compact">
        <div className="results-header">
          <div className="panel-heading">
            <div className="panel-heading-icon green">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <h2>Detected Locations</h2>

              <p>
                {resolvedPlaces.length} resolved
                {places.length - resolvedPlaces.length > 0 &&
                  `, ${places.length - resolvedPlaces.length} need review`}
              </p>
            </div>
          </div>

          <div className="export-actions">
            <button
              className="export-button"
              onClick={handleExportCSV}
              disabled={!filteredPlaces.length}
              title="Export CSV"
            >
              <Download size={15} />
            </button>

            <button
              className="export-button geojson-button"
              onClick={handleExportGeoJSON}
              disabled={!resolvedPlaces.length}
              title="Export GeoJSON"
            >
              <FileJson size={15} />
            </button>
          </div>
        </div>

        <div className="results-toolbar results-toolbar--compact">
          <div className="search-box">
            <Search size={15} />

            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {places.length > 0 && (
            <select
              className="compact-filter-select"
              value={filterConfidence}
              onChange={(event) => setFilterConfidence(event.target.value)}
            >
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="unresolved">Review</option>
            </select>
          )}
        </div>

        <div className="location-list">
          {filteredPlaces.length === 0 ? (
            <div className="empty-results empty-results--compact">
              <div className="empty-results-icon">
                <Search size={22} />
              </div>

              <h3>
                {places.length === 0
                  ? 'No locations yet'
                  : 'No matching results'}
              </h3>

              <p>
                {places.length === 0
                  ? 'Paste an incident report above to begin.'
                  : 'Try a different search or filter.'}
              </p>
            </div>
          ) : (
            filteredPlaces.map((place, index) => {
              const key = `${place.raw}-${index}`;
              const isResolved = place.status === 'resolved';
              const confidence = confidencePercent(place.confidence);

              const isSelected =
                selectedPlace &&
                selectedPlace.raw === place.raw &&
                selectedPlace.lat === place.lat &&
                selectedPlace.long === place.long;

              const confidenceBand = getConfidenceBand(place);

              return (
                <div
                  key={key}
                  className={[
                    'location-card',
                    isSelected ? 'location-card-selected' : '',
                    !isResolved ? 'location-card-review' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="location-card-main">
                    <div className="location-card-name">
                      <strong>
                        {isResolved ? place.canonical : place.raw || 'Unknown'}
                      </strong>

                      {isResolved && place.raw && place.raw !== place.canonical && (
                        <span className="location-card-raw">“{place.raw}”</span>
                      )}

                      {place.state && (
                        <span className="location-card-state">{place.state}</span>
                      )}
                    </div>

                    {isResolved ? (
                      <div className={`location-card-confidence confidence-${confidenceBand.toLowerCase()}`}>
                        <strong>{confidence}%</strong>
                        <span>{confidenceBand.toUpperCase()} CONFIDENCE</span>
                      </div>
                    ) : (
                      <span className="review-badge">
                        <AlertTriangle size={12} />
                        Needs review
                      </span>
                    )}
                  </div>

                  <div className="location-card-reason">
                    <span className="location-card-reason-label">
                      {isResolved
                        ? 'Why this location?'
                        : "Why couldn't this resolve?"}
                    </span>

                    <p>{place.reason || 'No explanation was provided.'}</p>

                    {isResolved && (
                      <div className="reason-expanded-meta">
                        <span>
                          Source: <strong>{getSourceLabel(place.source)}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {isResolved && (
                    <button
                      className="location-card-view-button"
                      onClick={() => onPlaceSelect(place)}
                    >
                      <MapPin size={13} />
                      {isSelected ? 'Viewing on map' : 'View on map'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="panel-card results-panel">
      <div className="results-header">
        <div className="panel-heading">
          <div className="panel-heading-icon green">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <h2>Extraction Results</h2>

            <p>
              {places.length} location
              {places.length !== 1
                ? 's'
                : ''}{' '}
              detected
            </p>
          </div>
        </div>

        <div className="export-actions">
          <button
            className="export-button"
            onClick={handleExportCSV}
            disabled={!filteredPlaces.length}
          >
            <Download size={15} />
            Export CSV
          </button>

          <button
            className="export-button geojson-button"
            onClick={handleExportGeoJSON}
            disabled={!resolvedPlaces.length}
          >
            <FileJson size={15} />
            Export GeoJSON
          </button>
        </div>
      </div>

      <div className="results-toolbar">
        <div className="search-box">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search places or states..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        {hasStateFilterOptions && (
          <div className="filter-box">
            <SlidersHorizontal size={16} />

            <select
              value={filterState}
              onChange={(event) =>
                setFilterState(event.target.value)
              }
            >
              {states.map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state === 'All'
                    ? 'All States'
                    : state}
                </option>
              ))}
            </select>
          </div>
        )}

        {places.length > 0 && (
          <div className="filter-box">
            <SlidersHorizontal size={16} />

            <select
              value={filterConfidence}
              onChange={(event) =>
                setFilterConfidence(event.target.value)
              }
            >
              <option value="All">All Confidence</option>
              <option value="High">High Confidence</option>
              <option value="Medium">Medium Confidence</option>
              <option value="Low">Low Confidence</option>
              <option value="unresolved">Unresolved</option>
            </select>
          </div>
        )}
      </div>

      {places.length > 0 && (
        <div className="results-summary">
          <span className="summary-resolved">
            <CheckCircle2 size={12} />
            {resolvedPlaces.length} resolved
          </span>

          <span className="summary-failed">
            {places.length -
              resolvedPlaces.length}{' '}
            unresolved
          </span>
        </div>
      )}

      <div className="results-count">
        Showing {filteredPlaces.length} of{' '}
        {places.length} results
      </div>

      <div className="table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Input Name</th>
              <th>Canonical Name</th>
              <th>Location</th>
              <th>Confidence</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredPlaces.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-results">
                    <div className="empty-results-icon">
                      <Search size={24} />
                    </div>

                    <h3>
                      {places.length === 0
                        ? 'No locations detected'
                        : 'No matching results'}
                    </h3>

                    <p>
                      {places.length === 0
                        ? 'Run text analysis to see detected places here.'
                        : 'Try changing your search or filter.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPlaces.map(
                (place, index) => {
                  const key = `${place.raw}-${index}`;

                  const isResolved =
                    place.status ===
                    'resolved';

                  const confidence =
                    confidencePercent(
                      place.confidence
                    );

                  const isOpen =
                    expandedReason === key;

                  const isSelected =
                    selectedPlace &&
                    selectedPlace.raw === place.raw &&
                    selectedPlace.lat === place.lat &&
                    selectedPlace.long === place.long;

                  return (
                    <FragmentRow
                      key={key}
                      place={place}
                      isResolved={isResolved}
                      confidence={confidence}
                      isOpen={isOpen}
                      isSelected={isSelected}
                      getSourceLabel={
                        getSourceLabel
                      }
                      toggleReason={
                        toggleReason
                      }
                      onPlaceSelect={
                        onPlaceSelect
                      }
                      rowKey={key}
                    />
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FragmentRow = ({
  place,
  isResolved,
  confidence,
  isOpen,
  isSelected,
  getSourceLabel,
  toggleReason,
  onPlaceSelect,
  rowKey,
}) => {
  return (
    <>
      <tr
        className={[
          isOpen ? 'result-row-open' : '',
          isSelected ? 'result-row-selected' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <td>
          <div className="historical-name">
            <span
              className={
                isResolved
                  ? 'is-superseded'
                  : ''
              }
            >
              {place.raw || 'Unknown'}
            </span>
          </div>
        </td>

        <td>
          {isResolved ? (
            <div className="canonical-name">
              <CheckCircle2 size={16} />
              {place.canonical}
            </div>
          ) : (
            <div className="failed-name">
              Unresolved
            </div>
          )}
        </td>

        <td>
          {isResolved &&
          typeof place.lat ===
            'number' &&
          typeof place.long ===
            'number' ? (
            <div className="location-cell">
              {place.state && (
                <strong>
                  {place.state}
                </strong>
              )}

              <span>
                {place.lat.toFixed(4)},{' '}
                {place.long.toFixed(4)}
              </span>
            </div>
          ) : (
            <span className="not-available">
              Not available
            </span>
          )}
        </td>

       <td>
  <div className="confidence-cell">
    <div className="confidence-value-row">
      <span
        className={`confidence-badge ${
          confidence >= 90
            ? 'high'
            : confidence >= 60
            ? 'medium'
            : 'low'
        }`}
      >
        {confidence}%
      </span>
    </div>

    <div className="confidence-bar">
      <div
        className={`confidence-fill ${
          confidence >= 90
            ? 'high'
            : confidence >= 60
            ? 'medium'
            : 'low'
        }`}
        style={{
          '--confidence-width': `${confidence}%`,
        }}
      />
    </div>
  </div>
</td>

        <td>
          <span
            className={`status-badge ${
              isResolved
                ? 'resolved'
                : 'failed'
            }`}
          >
            {isResolved
              ? 'Resolved'
              : 'Failed'}
          </span>
        </td>

        <td>
          <div className="result-actions">
            <button
  className="reason-button"
  onClick={() =>
    toggleReason(rowKey)
  }
>
  {isOpen
    ? 'Hide reason'
    : isResolved
    ? 'Why was this location selected?'
    : "Why couldn't this location be resolved?"}

  {isOpen ? (
    <ChevronUp size={14} />
  ) : (
    <ChevronDown size={14} />
  )}
</button>

            {isResolved && (
              <button
                className="view-button"
                onClick={() =>
                  onPlaceSelect(place)
                }
              >
                <MapPin size={15} />
                View
              </button>
            )}
          </div>
        </td>
      </tr>

      {isOpen && (
        <tr className="reason-expanded-row">
          <td colSpan="6">
            <div className="reason-expanded-card">
              <div className="reason-expanded-icon">
                <ShieldCheck size={18} />
              </div>

              <div className="reason-expanded-content">
                <div className="reason-expanded-header">
                  <strong>
  {isResolved
    ? 'Why was this location selected?'
    : "Why couldn't this location be resolved?"}
</strong>

                  <span>
                    {place.raw} →{' '}
                    {isResolved
                      ? place.canonical
                      : 'Unresolved'}
                  </span>
                </div>

                <p>
                  {place.reason ||
                    'No explanation was provided.'}
                </p>

                <div className="reason-expanded-meta">
                  <span>
                    Source:{' '}
                    <strong>
                      {getSourceLabel(
                        place.source
                      )}
                    </strong>
                  </span>

                  <span>
                    Confidence:{' '}
                    <strong>
                      {confidence}%
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ResultsPanel;