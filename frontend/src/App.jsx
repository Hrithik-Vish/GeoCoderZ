import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TextHighlighter from './components/TextHighlighter';
import HighlightedText from './components/HighlightedText';
import ResultsPanel from './components/ResultsPanel';
import MapView from './components/MapView';
import LandingPage from './components/LandingPage';
import GeographicBackground from './components/GeographicBackground';

import {
  MOCK_SUCCESS_RESPONSE,
  MOCK_EMPTY_RESPONSE,
} from './mocks/mockResponse';

import './App.css';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000';

// Dev-only offline toggle. When true, /resolve is never actually called —
// a fixture matching contract.md is returned instead after a short
// simulated delay, so the full UI (including the loading animation) can
// be seen and tested without the backend running.
//
// Defaults to FALSE — this build talks to the real backend at
// API_BASE_URL (see the fetch call in the try block below). Set
// VITE_API_BASE_URL in .env (see .env.example) if the backend isn't on
// localhost:8000. Flip this back to true only for offline UI/animation
// development when no backend is running.
const USE_MOCK = false;
const MOCK_DELAY_MS = 2200;

// Text containing the whole word "empty" routes to the zero-results
// fixture instead of the success one, so both edge cases in contract.md
// Section 5 are reachable via USE_MOCK without touching this file again.
function resolveMock(text) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const useEmpty = /\bempty\b/i.test(text);
      const base = useEmpty
        ? MOCK_EMPTY_RESPONSE
        : MOCK_SUCCESS_RESPONSE;

      resolve({ ...base, original_text: text });
    }, MOCK_DELAY_MS);
  });
}

function App() {
  const [theme, setTheme] = useState('dark');
  const [hasEnteredApp, setHasEnteredApp] =
    useState(false);

  const [extractedPlaces, setExtractedPlaces] =
    useState([]);

  const [analyzedText, setAnalyzedText] =
    useState('');

  const [responseMessage, setResponseMessage] =
    useState(null);

  const [isExtracting, setIsExtracting] =
    useState(false);

  const [apiError, setApiError] = useState('');

  const [selectedPlace, setSelectedPlace] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState('Incident Report');

  // A click on the "Need review" summary stat asks the compact
  // location list to jump straight to the review filter. Kept as a
  // small {value, token} object rather than lifting ResultsPanel's
  // whole filter state up here — App.jsx only needs to say "show me
  // the review ones now," not own the filter lifecycle. token
  // increments on every click so a second click re-applies the
  // filter even if it was manually changed back to "All" since.
  const [reviewFocusRequest, setReviewFocusRequest] =
    useState(null);

  const focusOnReviewItems = () => {
    setReviewFocusRequest((previous) => ({
      value: 'unresolved',
      token: (previous?.token ?? 0) + 1,
    }));
  };

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((previous) =>
      previous === 'light'
        ? 'dark'
        : 'light'
    );
  };

  const handleExtract = async (text) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    setIsExtracting(true);
    setApiError('');
    setResponseMessage(null);
    setExtractedPlaces([]);
    setAnalyzedText('');
    setSelectedPlace(null);

    try {
      let data;

      if (USE_MOCK) {
        data = await resolveMock(trimmedText);
      } else {
        const response = await fetch(
          `${API_BASE_URL}/resolve`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: trimmedText,
            }),
          }
        );

        if (!response.ok) {
          let errorMessage =
            'Backend request failed.';

          try {
            const errorData =
              await response.json();

            if (
              errorData?.message &&
              typeof errorData.message === 'string'
            ) {
              errorMessage =
                errorData.message;
            } else if (
              typeof errorData?.detail === 'string'
            ) {
              // FastAPI's own HTTPException(detail="...") shape.
              errorMessage =
                errorData.detail;
            } else if (
              Array.isArray(errorData?.detail) &&
              errorData.detail.length > 0
            ) {
              // FastAPI/Pydantic's automatic request-validation shape —
              // detail is a list of {loc, msg, type} objects, not a
              // string. Surface the first message rather than stringify
              // the whole array (which renders as "[object Object]").
              const [firstIssue] = errorData.detail;

              errorMessage =
                firstIssue?.msg &&
                typeof firstIssue.msg === 'string'
                  ? firstIssue.msg
                  : errorMessage;
            }
          } catch {
            // Ignore invalid error JSON
          }

          throw new Error(errorMessage);
        }

        data = await response.json();
      }

      if (
        !data ||
        typeof data !== 'object'
      ) {
        throw new Error(
          'Invalid response received from backend.'
        );
      }

      if (!Array.isArray(data.extracted)) {
        throw new Error(
          'Backend response is missing the extracted array.'
        );
      }

      const normalizedPlaces =
        data.extracted.map((place) => ({
          raw: place.raw ?? '',
          canonical:
            place.canonical ?? null,
          lat:
            typeof place.lat === 'number'
              ? place.lat
              : null,
          long:
            typeof place.long === 'number'
              ? place.long
              : null,
          confidence:
            typeof place.confidence ===
              'number'
              ? place.confidence
              : 0,
          reason:
            place.reason ??
            'No explanation provided.',
          source:
            place.source ?? null,
          status:
            place.status === 'resolved'
              ? 'resolved'
              : 'failed',
          state:
            place.state ?? null,
        }));

      setExtractedPlaces(
        normalizedPlaces
      );

      setAnalyzedText(
        typeof data.original_text === 'string'
          ? data.original_text
          : trimmedText
      );

      setResponseMessage(
        data.message ?? null
      );
    } catch (error) {
      console.error(
        'Extraction error:',
        error
      );

      setExtractedPlaces([]);
      setAnalyzedText('');
      setResponseMessage(null);

      setApiError(
        error?.message ||
          'Unable to connect to the backend.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const stats = useMemo(() => {
    const resolved =
      extractedPlaces.filter(
        (place) =>
          place.status === 'resolved'
      );

    const needsReview =
      extractedPlaces.filter(
        (place) =>
          place.status !== 'resolved'
      );

    // Average confidence across resolved places only — an unresolved
    // entry has no meaningful confidence to average in (contract.md
    // sends 0.0 for those, which would just drag the number down
    // without saying anything real about resolution quality).
    const averageConfidence =
      resolved.length > 0
        ? Math.round(
            (resolved.reduce(
              (sum, place) =>
                sum +
                (typeof place.confidence === 'number'
                  ? place.confidence
                  : 0),
              0
            ) /
              resolved.length) *
              100
          )
        : null;

    return {
      locations:
        extractedPlaces.length,
      resolved: resolved.length,
      needsReview: needsReview.length,
      averageConfidence,
    };
  }, [extractedPlaces]);

  if (!hasEnteredApp) {
    return (
      <LandingPage
        theme={theme}
        onToggleTheme={toggleTheme}
        onEnter={() => setHasEnteredApp(true)}
      />
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="main-content">
        <GeographicBackground isActive={isExtracting} />

        <Header
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="page-content">
          {activeTab === 'Incident Report' && (
            <div className="dashboard-page">
              <div className="welcome-section">
                <span className="eyebrow">
                  <span className="eyebrow-dot" />
                  INCIDENT REPORT
                </span>

                <h2>
                  Paste an incident report.
                  <span> Get map-ready locations.</span>
                </h2>

                <p>
                  GeoMapAI extracts every place mentioned in a raw report,
                  resolves each one to a real coordinate, and shows its
                  reasoning — so you can verify the answer instead of
                  reading the report by hand.
                </p>
              </div>

              {apiError && (
                <div className="global-error">
                  <AlertCircle size={18} />

                  <div>
                    <strong>
                      Unable to process this report
                    </strong>

                    <p>{apiError}</p>
                  </div>
                </div>
              )}

              {responseMessage && (
                <div className="info-message">
                  <AlertCircle size={18} />

                  <span>
                    {responseMessage}
                  </span>
                </div>
              )}

              <div className="incident-input-section">
                <TextHighlighter
                  onExtract={handleExtract}
                  isExtracting={
                    isExtracting
                  }
                />
              </div>

              {extractedPlaces.length > 0 && (
                <div className="incident-summary-strip">
                  <div className="incident-summary-stat">
                    <strong>{stats.locations}</strong>
                    <span>
                      Location{stats.locations !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="incident-summary-divider" />

                  <div className="incident-summary-stat incident-summary-stat--resolved">
                    <strong>{stats.resolved}</strong>
                    <span>Resolved</span>
                  </div>

                  <div className="incident-summary-divider" />

                  <button
                    type="button"
                    className={`incident-summary-stat incident-summary-stat--button ${
                      stats.needsReview > 0
                        ? 'incident-summary-stat--review'
                        : ''
                    }`}
                    onClick={focusOnReviewItems}
                    disabled={stats.needsReview === 0}
                    title={
                      stats.needsReview > 0
                        ? 'Filter the list to locations needing review'
                        : undefined
                    }
                  >
                    {stats.needsReview > 0 && <AlertTriangle size={13} />}
                    <strong>{stats.needsReview}</strong>
                    <span>Need review</span>
                  </button>

                  {stats.averageConfidence !== null && (
                    <>
                      <div className="incident-summary-divider" />

                      <div className="incident-summary-stat">
                        <strong>{stats.averageConfidence}%</strong>
                        <span>Avg. confidence</span>
                      </div>
                    </>
                  )}

                  <div className="incident-summary-status">
                    <span
                      className={
                        isExtracting
                          ? 'incident-summary-status-dot is-processing'
                          : 'incident-summary-status-dot'
                      }
                    />
                    {isExtracting ? 'Processing' : 'Ready'}
                  </div>
                </div>
              )}

              <div className="dashboard-layout">
                <div className="analysis-column">
                  <ResultsPanel
                    places={extractedPlaces}
                    selectedPlace={selectedPlace}
                    onPlaceSelect={setSelectedPlace}
                    focusFilter={reviewFocusRequest}
                    compact
                  />
                </div>

                <div className="visual-column">
                  <div className="map-card">
                    <div className="map-card-header">
                      <div>
                        <h3>
                          Incident Map
                        </h3>

                        <p>
                          Where the report is referring to
                        </p>
                      </div>

                      <div className="map-live-status">
                        <span />
                        Live
                      </div>
                    </div>

                    <div className="map-card-body">
                      <MapView
                        places={
                          extractedPlaces
                        }
                        selectedPlace={
                          selectedPlace
                        }
                        onPlaceSelect={setSelectedPlace}
                        theme={theme}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {analyzedText && (
                <div className="highlighted-text-panel">
                  <div className="panel-heading">
                    <div className="panel-heading-icon blue">
                      <MapPin size={19} />
                    </div>

                    <div>
                      <h2>Original Incident Report</h2>

                      <p>
                        Detected place names are highlighted —
                        click one to view it on the map
                      </p>
                    </div>
                  </div>

                  <HighlightedText
                    text={analyzedText}
                    places={extractedPlaces}
                    selectedPlace={selectedPlace}
                    onSelectPlace={setSelectedPlace}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'Map View' && (
            <div className="full-page">
              <div className="page-heading">
                <span className="eyebrow">
                  <span className="eyebrow-dot" />
                  SPATIAL EXPLORER
                </span>

                <h2>
                  Global Map View
                </h2>

                <p>
                  Explore all resolved
                  locations across
                  geographical space.
                </p>
              </div>

              <div className="full-map-card">
                <MapView
                  places={
                    extractedPlaces
                  }
                  selectedPlace={
                    selectedPlace
                  }
                  onPlaceSelect={setSelectedPlace}
                  fullScreen
                  theme={theme}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;