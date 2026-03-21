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
        <button className="md:hidden text-gray-400 hover:text-gold transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold tracking-wide hidden sm:block">
          Executive <span className="text-gold">Dashboard</span>
        </h1>
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
