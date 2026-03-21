import Navigation from '@/components/layout/Navigation';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />
      <Navigation />
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
        <main className="flex-1 p-4 md:p-6 z-0">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
