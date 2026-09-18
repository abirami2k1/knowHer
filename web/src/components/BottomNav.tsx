import { BookOpen, House, PenLine, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/log', label: 'Log', icon: PenLine, end: false },
  { to: '/learn', label: 'Learn', icon: BookOpen, end: false },
  { to: '/profile', label: 'Profile', icon: UserRound, end: false },
] as const;

/** Primary navigation. Pinned to the bottom, ≥44px targets, safe-area aware. */
export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-primary/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                  isActive ? 'text-primary' : 'text-muted hover:text-ink'
                }`
              }
            >
              <Icon aria-hidden="true" className="size-6" strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
