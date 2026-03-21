import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Card({ title, subtitle, children, className = '', action }: CardProps) {
  return (
    <div className={`premium-card p-6 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
          <div>
            {title && <h3 className="text-lg font-bold tracking-wide text-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="premium-card p-6 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 text-gold/5 group-hover:text-gold/10 transition-colors duration-500">
        <Icon size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
          <div className="p-2 rounded-lg bg-gold/10 text-gold border border-gold/20">
            <Icon size={20} />
          </div>
        </div>
        
        <div className="flex items-baseline gap-4">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={`text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
