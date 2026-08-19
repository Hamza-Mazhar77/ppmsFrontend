/**
 * Load the shared catalogue option lists (colleges, programs, semesters, years,
 * paper types) once per mount
 * Nothing in the UI hardcodes these values: the server is the single source of
 * truth, so seeding a new college or program immediately shows up everywhere.
 */
import { useEffect, useState } from 'react';
import { catalogApi } from '../services/ppms.service';

export default function useCatalogOptions() {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    catalogApi
      .getOptions()
      .then((response) => {
        if (!cancelled) setOptions(response.data);
      })
      .catch((apiError) => {
        if (!cancelled) setError(apiError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading, error };
}
