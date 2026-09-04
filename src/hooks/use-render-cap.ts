import { useEffect, useMemo, useState } from "react";

const DEFAULT_INITIAL_COUNT = 20;
const DEFAULT_STEP = 20;

/**
 * Caps how many items of a (possibly large, already-fetched) list get mounted into the DOM at
 * once, revealing more in fixed steps on demand. Search result lists accumulate every fetched
 * page into one in-memory array (see useHotelSearchWithLoadMore and friends) with nothing
 * capping how much of that array actually gets rendered - for a large result set that's
 * unbounded DOM growth for cards with real weight (images, nested per-quote rows). This is a
 * cheap client-side cap, not pagination from the server: `items` is still the full array,
 * `visible` is just the prefix currently mounted.
 */
export function useRenderCap<T>(items: T[], initialCount = DEFAULT_INITIAL_COUNT, step = DEFAULT_STEP) {
  const [count, setCount] = useState(initialCount);

  // A new search or a changed filter hands this hook a new `items` array - start capped again
  // rather than keeping whatever count a previous, unrelated result set had grown to.
  useEffect(() => {
    setCount(initialCount);
  }, [items, initialCount]);

  const visible = useMemo(() => items.slice(0, count), [items, count]);
  const hasMore = count < items.length;

  function showMore() {
    setCount((current) => current + step);
  }

  return { visible, hasMore, showMore };
}
