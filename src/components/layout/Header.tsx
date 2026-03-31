'use client';

import { LogOut, Menu, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-widest text-foreground">
          PALACE <span className="text-gold">FRYS</span>
        </h1>
        <span className="hidden md:inline-block px-3 py-1 bg-surface border border-border rounded-full text-xs text-gray-400 tracking-widest uppercase">
          System
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          System Online
        </div>

        <div className="flex items-center gap-4 border-l border-border pl-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface border border-gold/30 flex items-center justify-center text-gold">
              <User size={20} />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Owner</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-2"
            title="Secure Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
