import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
export default function RouteScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      try { document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView(); } catch { /* Invalid URL fragment. */ }
    } else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}
