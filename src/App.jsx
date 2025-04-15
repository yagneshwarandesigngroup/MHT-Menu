import { useEffect, useState } from 'react';

const SHEET_ID = '1kAP9bnfqRofpeuWM-BKnYxvaIX84-v0iQsOk_BhQ0cQ';
const TABS = [
  'SOUP',
  'STARTERS',
  'RICE AND NOODLES',
  'CURRY',
  'INDIAN BREADS',
  'SALADS',
  'SNACKS',
  'SANDWICH',
  'BEVERAGES',
  'DESSERTS'
];

// Splash Screen Component
function SplashScreen() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'black',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 'bold' }}>
        Meridin Hill Top
      </h1>
      <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Thai Aroma</h2>
      <div style={{ marginTop: '20px' }}>
        <div
          style={{
            border: '4px solid white',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>
      {/* Spinner keyframes */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

// News Ticker Component
function NewsTicker() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch(`https://opensheet.elk.sh/${SHEET_ID}/Ads`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAds(data);
        }
      })
      .catch((err) => console.error('Error fetching ads:', err));
  }, []);

  // Combine the ad text from the "Ads" sheet. Assumes first column header is "Ads".
  const adsText = ads
    .map((item) => item['Ads'])
    .filter(Boolean)
    .join('    ||    ');

  if (!adsText) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: '100%',
        background: 'black',
        color: 'white',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '4px 0'  // reduced padding (vertical height) by roughly 15%
      }}
    >
      <div
        style={{
          display: 'inline-block',
          paddingLeft: '100%',
          animation: 'marquee 30s linear infinite'
        }}
      >
        {adsText}
      </div>
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </div>
  );
}

function App() {
  // State for primary UI
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Splash screen control state
  const [showSplash, setShowSplash] = useState(true);
  const [timerComplete, setTimerComplete] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Ensure splash screen stays for at least 1 second
  useEffect(() => {
    const timer = setTimeout(() => setTimerComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch menu data when active tab changes
  useEffect(() => {
    setMenuItems([]);
    setError(null);
    setLoading(true);

    fetch(`https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(activeTab)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Sheet not found');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMenuItems(data);
        } else {
          setError('Invalid data format from sheet');
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError(`Error loading data for "${activeTab}"`);
      })
      .finally(() => setLoading(false));
  }, [activeTab]);

  // Hide splash screen when both timer and initial load are complete
  useEffect(() => {
    if (initialLoad && timerComplete && !loading) {
      setShowSplash(false);
      setInitialLoad(false);
    }
  }, [initialLoad, timerComplete, loading]);

  if (showSplash) {
    return <SplashScreen />;
  }

  // Group menu items by Category
  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.Category?.trim();
    if (category) {
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
    } else {
      if (!acc._uncategorized) acc._uncategorized = [];
      acc._uncategorized.push(item);
    }
    return acc;
  }, {});

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        padding: '10px',
        textAlign: 'left',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '50px' // to ensure content doesn't hide behind ticker
      }}
    >
      {/* Top Tabs Container */}
      <div
        style={{
          padding: '5px 0',
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3px',
          justifyContent: 'flex-start',
          borderBottom: '1px solid #ddd'
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '4px 10px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#007bff' : '#eee',
              color: activeTab === tab ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Menu Content Area */}
      <div style={{ marginTop: '10px' }}>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!error && loading && (
          <p style={{ textAlign: 'center', paddingTop: '20px' }}>Loading...</p>
        )}

        {!error &&
          !loading &&
          Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} style={{ marginTop: '10px' }}>
              {category !== '_uncategorized' && (
                <h2
                  style={{
                    margin: '0 0 10px 0',
                    borderBottom: '1px solid #ddd',
                    paddingBottom: '5px'
                  }}
                >
                  {category}
                </h2>
              )}
              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    borderBottom: '1px solid #eee',
                    paddingBottom: '8px'
                  }}
                >
                  <div style={{ flexGrow: 1 }}>
                    <strong>{item['Item Name']}</strong>
                    {item.Description && (
                      <div>
                        <em>{item.Description}</em>
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '10px' }}>
                    ₹{item.Price}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
      {/* News Ticker at Bottom */}
      <NewsTicker />
    </div>
  );
}

export default App;
