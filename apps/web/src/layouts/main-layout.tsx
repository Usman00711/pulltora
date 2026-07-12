import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Repositories', to: '/repositories' },
  { label: 'Settings', to: '/settings' }
];

export function MainLayout() {
  const { pathname } = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div className="theme-shell min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/78 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="Pulltora home"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-surface/90 shadow-[0_0_30px_rgba(34,211,238,0.14)]">
              <img
                src="/branding/pulltora_logo.png"
                alt="Pulltora logo"
                className="h-8 w-8 rounded-lg"
              />
            </span>
            <span className="brand-wordmark">Pulltora</span>
          </Link>

          <nav className="order-3 flex w-full flex-wrap items-center gap-1.5 text-sm font-medium sm:order-none sm:w-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-3.5 py-1.5 nav-pill ${
                    isActive ? 'nav-pill-active' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden text-xs text-muted-foreground sm:inline">Hi, {user?.name || 'team'}</span>
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => {
                    logout();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-soft"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="route-shell mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 motion-fade-up">
        <Outlet />
      </main>
    </div>
  );
}
