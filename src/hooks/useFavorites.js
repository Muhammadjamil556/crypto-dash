import { useState, useEffect } from 'react';

const STORAGE_KEY = 'crypto-dash:favorites';

const readFavorites = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored)
      ? stored.filter((id) => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
};

const useFavorites = () => {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    // Fires for changes made in other tabs; key is null when storage is cleared
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setFavorites(readFavorites());
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleFavorite = (id) => {
    const next = favorites.includes(id)
      ? favorites.filter((favoriteId) => favoriteId !== id)
      : [...favorites, id];

    setFavorites(next);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage is blocked or full, so favorites only last for this visit
    }
  };

  return { favorites, toggleFavorite };
};

export default useFavorites;
