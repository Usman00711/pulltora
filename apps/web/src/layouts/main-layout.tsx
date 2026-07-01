import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Repositories', to: '/repositories' },
  { label: 'Settings', to: '/settings' }
];

export function MainLayout() {
  const { pathname } = useLocation();

  return (
    <div className="theme-shell min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="Pulltora home"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface/90 shadow-sm shadow-primary/20">
              <img
                src="/branding/pulltora_logo.png"
                alt="Pulltora logo"
                className="h-8 w-8 rounded-lg"
              />
            </span>
            <span className="brand-wordmark">Pulltora</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
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
          </div>
        </div>
      </header>

      <main className="route-shell mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 motion-fade-up">
        <Outlet />
      </main>
    </div>
  );
}
