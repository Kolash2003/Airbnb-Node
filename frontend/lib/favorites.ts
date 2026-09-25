// Client-side wishlist (DESIGN.md gap §7: no service stores per-user favorites,
// so they live in localStorage until a backend exists).

"use client";

import * as React from "react";

const FAVORITES_KEY = "haven.favorites";

export function loadFavorites(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === "number");
  } catch {
    return [];
  }
}

function persistFavorites(ids: number[]) {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // Storage full or private mode — non-fatal, wishlist just won't persist.
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = React.useState<number[]>(loadFavorites);

  const toggleFavorite = React.useCallback((hotelId: number) => {
    setFavorites((prev) => {
      const next = prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId];
      persistFavorites(next);
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}