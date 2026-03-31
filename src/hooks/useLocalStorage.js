import { useState, useEffect } from 'react';

export const useLocalStorage = (key) => {
  const [value, setValue] = useState(null); 

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      setValue(item ? JSON.parse(item) : null);
    } catch {
      setValue(null);
    }

    const handleChange = () => {
      try {
        const item = localStorage.getItem(key);
        setValue(item ? JSON.parse(item) : null);
      } catch (err) {
        console.error("Parse error", err);
      }
    };

    window.addEventListener('storage', handleChange);
    const interval = setInterval(handleChange, 1000);

    return () => {
      window.removeEventListener('storage', handleChange);
      clearInterval(interval);
    };
  }, [key]);

  return value;
};