import { createContext, useContext, useEffect, useState } from 'react';
import fallback from './data/content.json';
import { api } from './api.js';

// Content ships with the app (works offline / without backend) and is
// refreshed from the Node API when available, so admin edits show up.
const ContentContext = createContext(fallback);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(fallback);

  useEffect(() => {
    api
      .get('/api/content')
      .then((data) => setContent((prev) => ({ ...prev, ...data })))
      .catch(() => {}); // backend unreachable -> keep bundled content
  }, []);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}
