import { useLocation } from "react-router-dom";

/**
 * Page transition wrapper: the `.page-enter` animation replays on every
 * route change (the key forces a remount).
 */
export function PageTransition({ children, className = "" }) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className={`page-enter ${className}`}>
      {children}
    </div>
  );
}

export default PageTransition;
