import { useEffect, useRef } from 'react';

/**
 * AdBanner - Renders a real ad banner by injecting the ad network script.
 * @param {string} adKey - The unique ad key from the network
 * @param {number} width - Banner width
 * @param {number} height - Banner height
 * @param {string} className - Optional extra CSS classes
 */
export default function AdBanner({ adKey, width, height, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !adKey) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Create the atOptions script
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.text = `
      atOptions = {
        'key' : '${adKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;
    containerRef.current.appendChild(optionsScript);

    // Create the invoke script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
    containerRef.current.appendChild(invokeScript);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [adKey, width, height]);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{ minWidth: width, minHeight: height }}
    />
  );
}
