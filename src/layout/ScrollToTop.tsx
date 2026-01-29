/**
 * @file ScrollToTop.tsx
 * @description UX Utility to manage scroll position on route transitions.
 *
 * ENGINEERING PRINCIPLE: SPA Navigation Experience (Scroll Restoration)
 *
 * Problem: In Single Page Applications (SPAs), navigating between pages (routes)
 * does not trigger a full page reload. Consequently, the browser maintains the
 * user's previous scroll position. If a user scrolls down on the Home page and
 * clicks a link, they land on the middle of the new page, which is confusing.
 *
 * Solution: This "Headless" component listens for route changes and forces
 * the window to scroll to the top (0,0), mimicking the natural feel of
 * a traditional website navigation.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * A utility component that renders nothing but produces a side effect (scrolling).
 * Must be placed inside the <BrowserRouter> context to access the location.
 */
export const ScrollToTop = () => {
  // We destructure 'pathname' to trigger the effect only when the path changes
  // (ignoring query params or hash changes if not needed).
  const { pathname } = useLocation();

  useEffect(() => {
    // Execute the scroll immediately.
    // We default to standard behavior (instant jump) for snappier navigation,
    // though 'behavior: smooth' could be added if a transition is desired.
    window.scrollTo(0, 0);
  }, [pathname]);

  // Renders nothing in the DOM
  return null;
};
