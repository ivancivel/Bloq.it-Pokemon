import { useLocation, useNavigate } from 'react-router-dom';

/**
 * @component Navbar
 * @description Global navigation component with iOS-specific touch optimizations.
 *
 * ENGINEERING PRINCIPLE: Progressive Enhancement & Mobile UX
 * Handles the "Ghost Click" issue on iOS Safari by implementing explicit
 * touch handlers alongside standard click events.
 */
export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // UX OPTIMIZATION: Hide navbar on Details Page to focus on content
  if (location.pathname.startsWith('/pokemon/')) return null;

  /**
   * Unified navigation handler to prevent race conditions and touch delays.
   */
  const handleNavigation = (path: string, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault(); // Critical for overriding iOS double-tap zoom/hover behavior
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const baseClasses =
    'px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-colors duration-200 cursor-pointer select-none';

  const getButtonClasses = (isActive: boolean) => {
    return `${baseClasses} ${
      isActive
        ? 'bg-red-600 text-white shadow-md'
        : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
    }`;
  };

  return (
    <header className="mb-8 text-center pt-8 px-4">
      <nav className="flex justify-center gap-4" role="navigation" aria-label="Main navigation">
        <button
          type="button"
          onTouchEnd={(e) => handleNavigation('/', e)}
          onClick={(e) => handleNavigation('/', e)}
          className={getButtonClasses(location.pathname === '/')}
        >
          Explore 🌍
        </button>

        <button
          type="button"
          onTouchEnd={(e) => handleNavigation('/pokedex', e)}
          onClick={(e) => handleNavigation('/pokedex', e)}
          className={getButtonClasses(location.pathname === '/pokedex')}
        >
          Pokédex 🎒
        </button>
      </nav>
    </header>
  );
};
