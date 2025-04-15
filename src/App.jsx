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

function App() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMenuItems([]);
    setError(null);

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
      });
  }, [activeTab]);

  // Group items by category (Veg / Non-Veg), or uncategorized
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
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>Thai Aroma Menu</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#007bff' : '#eee',
              color: activeTab === tab ? 'white' : '#333',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Menu Items */}
      {!error && (
        <>
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              {category !== '_uncategorized' && <h2>{category}</h2>}
              {items.map((item, index) => (
                <div key={index} style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                  <strong>{item['Item Name']}</strong> - ₹{item.Price}
                  <br />
                  <em>{item.Description}</em>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
