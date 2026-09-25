import { BookOpen, House, LineChart, PenLine, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/log', label: 'Log', icon: PenLine, end: false },
  { to: '/cycle', label: 'Chart', icon: LineChart, end: false },
  { to: '/learn', label: 'Learn', icon: BookOpen, end: false },
  { to: '/profile', label: 'You', icon: UserRound, end: false },
] as const;

/** Primary navigation. Pinned to the bottom, ≥44px targets, safe-area aware. */
export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `group flex min-h-14 flex-col items-center justify-center gap-1 pt-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                  isActive ? 'text-primary' : 'text-muted hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* A small mark above the active tab, instead of colour alone. */}
                  <span
                    aria-hidden
                    className={`h-0.5 w-6 rounded-pill transition-colors ${
                      isActive ? 'bg-primary' : 'bg-transparent'
                    }`}
                  />
                  <Icon
                    aria-hidden="true"
                    className="size-[22px]"
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
