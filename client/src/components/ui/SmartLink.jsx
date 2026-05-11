/**
 * SmartLink - Wraps children in a smart link (monetized hyperlink).
 * @param {string} className - Optional CSS classes
 * @param {React.ReactNode} children - The link text/content
 */
export default function SmartLink({ children, className = '' }) {
  return (
    <a
      href="https://www.profitablecpmratenetwork.com/f05jm0t5x?key=67b0365814732f71f0e8cf326f972374"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
