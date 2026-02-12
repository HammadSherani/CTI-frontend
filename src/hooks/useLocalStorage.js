// Custom hook to watch localStorage changes (realtime)
import { useState, useEffect } from 'react';
export const useLocalStorage = (key) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleChange = () => {
      try {
        const item = localStorage.getItem(key);
        const parsed = item ? JSON.parse(item) : null;
        setValue(parsed);
      } catch (err) {
        console.error("Currency parse error", err);
      }
    };

    // Same tab changes ke liye
    window.addEventListener('storage', handleChange);
    
    // Agar same tab mein change ho to bhi detect ho (storage event same tab mein nahi chalta)
    const interval = setInterval(handleChange, 1000);

    return () => {
      window.removeEventListener('storage', handleChange);
      clearInterval(interval);
    };
  }, [key]);

  return value;
};