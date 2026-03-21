'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Trash2, 
  History, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sales', href: '/sales', icon: Wallet },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Waste', href: '/waste', icon: Trash2 },
  { name: 'History', href: '/history', icon: History },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 premium-card rounded-none border-t-0 border-l-0 border-b-0 h-full z-20 relative">
      <div className="p-6 text-center border-b border-border mb-4">
        <h2 className="text-2xl font-bold tracking-widest text-foreground">
          PALACE <span className="text-gold">FRYS</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">System</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gold/10 text-gold border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                  : 'text-gray-400 hover:text-foreground hover:bg-surface'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-gold' : ''} />
              <span className="font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="text-xs text-center text-gray-500">
          Logged in as <span className="text-gold font-semibold">Admin</span>
        </div>
      </div>
    </div>
  );
}
