import { useEffect, useRef } from 'react';

/**
 * NativeBanner - Renders the native banner ad from the ad network.
 * @param {string} className - Optional extra CSS classes
 */
export default function NativeBanner({ className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Create the container div expected by the native ad script
    const adDiv = document.createElement('div');
    adDiv.id = 'container-f568315cbd27bc486175b0fb6b40b579';
    containerRef.current.appendChild(adDiv);

    // Create the invoke script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl29413847.profitablecpmratenetwork.com/f568315cbd27bc486175b0fb6b40b579/invoke.js';
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden ${className}`}
    />
  );
}
