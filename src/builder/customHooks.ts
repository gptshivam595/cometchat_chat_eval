import { useEffect, useState } from 'react';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * A custom hook that detects and returns the system's preferred color scheme.
 *
 * Reads the preference on the first render rather than in an effect, so a dark system theme is
 * dark from the start instead of rendering light once and then switching.
 *
 * @returns {'light' | 'dark'} The current system color scheme.
 */
const useSystemColorScheme = (): 'light' | 'dark' => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() =>
    typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_QUERY);

    // Listen for changes to the color scheme preference
    const handleChange = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    // Clean up the listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return colorScheme;
};

export default useSystemColorScheme;
