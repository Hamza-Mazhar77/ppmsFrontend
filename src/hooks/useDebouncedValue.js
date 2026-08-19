/**
 * Debounce a rapidly changing value (the search box) so the API is queried once
 * the user pauses rather than on every keystroke.
 */
import { useEffect, useState } from 'react';

export default function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
