import { useState, useEffect } from "react";

const Options = () => {
  const [site, setSite] = useState('');
  const [blockedSites, setBlockedSites] = useState<string[]>([]);

  // Load from chrome storage
  useEffect(() => {
    chrome.storage.sync.get(['blockedSites'], (result) => {
      setBlockedSites(result.blockedSites || []);
    });
  }, []);

  // Save to chrome storage
  const updateStorage = (sites: string[]) => {
    chrome.storage.sync.set({ blockedSites: sites });
    setBlockedSites(sites);
  };

  const handleAdd = () => {
    if (site && !blockedSites.includes(site)) {
      updateStorage([...blockedSites, site]);
      setSite(''); // <-- fix here
    }
  };

  const handleRemove = (removeSite: string) => {
    updateStorage(blockedSites.filter((s) => s !== removeSite));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>🔒 Blocked Websites</h2>

      <input
        type="text"
        value={site}
        onChange={(e) => setSite(e.target.value)}
        placeholder="Enter site e.g. facebook.com"
        style={{ marginRight: '10px', padding: '5px' }}
      />
      <button onClick={handleAdd}>Add</button>

      <ul style={{ marginTop: '20px' }}>
        {blockedSites.map((s, i) => (
          <li key={i} style={{ marginBottom: '8px' }}>
            {s}{' '}
            <button onClick={() => handleRemove(s)} style={{ marginLeft: '10px' }}>
              ❌ Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Options;
