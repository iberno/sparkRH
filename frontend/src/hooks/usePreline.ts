import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    HSStaticMethods?: {
      autoInit: () => void;
    };
    HSSelect?: {
      getInstance: (el: HTMLElement | string) => any;
      autoInit: () => void;
    };
  }
}

export function usePreline() {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.HSStaticMethods?.autoInit();
      window.HSSelect?.autoInit();
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);
}
