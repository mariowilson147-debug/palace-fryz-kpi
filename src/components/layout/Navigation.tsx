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

export default function Navigation() {
  const pathname = usePathname();

  return (
    <div className="w-full bg-surface border-b border-border z-20 flex px-4 md:px-6 py-3 overflow-x-auto hide-scrollbar sticky top-20">
      <nav className="flex space-x-2 mx-auto max-w-7xl w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-gold/10 text-gold border border-gold/30 shadow-[0_0_10px_rgba(212,175,55,0.1)]'
                  : 'text-gray-400 hover:text-foreground hover:bg-background'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-gold' : ''} />
              <span className="font-medium tracking-wide text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
