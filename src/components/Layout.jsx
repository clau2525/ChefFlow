import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, CalendarHeart, ShoppingBasket, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const nav = [
  { to: '/', label: 'Recipes', icon: UtensilsCrossed },
  { to: '/plan', label: 'To Cook', icon: CalendarHeart },
  { to: '/shopping', label: 'Shopping', icon: ShoppingBasket },
];

export default function Layout() {
  const loc = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-3 px-4 h-12 border-b">
        <span className="font-heading font-semibold tracking-tight">ChefFlow</span>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-muted-foreground truncate hidden sm:inline">
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
      <main className="pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur border-t z-40">
        <div className="max-w-2xl mx-auto grid grid-cols-3">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
