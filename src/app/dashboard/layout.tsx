import Navigation from '@/components/layout/Navigation';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-background">
      <div className="shrink-0 z-30 shadow-md">
        <Header />
        <Navigation />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <main className="p-4 md:p-6 z-0">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
