'use client'

import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { useFeaturedRoutes } from '@/lib/hooks/useFeaturedRoutes';
import { getIconForRoute } from '@/lib/utils/route-icons';
import { useMemo } from 'react';
import { MoreHorizontal } from 'lucide-react';

export function AccentSection() {
  const router = useRouter();
  const pathname = usePathname();
  const { featuredRoutes, loading } = useFeaturedRoutes();

  const navigationSections = useMemo(() => {
    if (loading || !featuredRoutes.length) {
      return [];
    }

    return featuredRoutes.map((route) => {
      const Icon = getIconForRoute(route.path);
      return {
        id: route.id,
        name: route.label,
        path: route.path,
        icon: Icon,
      };
    });
  }, [featuredRoutes, loading]);

  return (
    <div className="flex flex-col items-center justify-center md:justify-between h-full md:h-auto py-8 md:py-16 bg-primary/5 backdrop-blur-sm md:border-l border-border/50 w-full md:w-80 lg:w-96 pointer-events-auto">
      {/* Top Part - Centered Initials */}
      <div className="flex flex-col items-center justify-center flex-grow gap-6 md:gap-0">
        <img
          src="/assets/michael_douglas_profile.png"
          alt="Michael Douglas"
          className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full border-4 border-primary/20 object-cover shadow-2xl"
          style={{
            filter: 'brightness(1.1) contrast(1.15) saturate(1.1)',
          }}
        />
        <div className="text-6xl md:text-8xl lg:text-9xl font-black text-primary/80 leading-none mt-4 md:mt-0">
          MD
        </div>
        <div className="text-sm md:text-base lg:text-xl font-black text-primary/80 mt-2 uppercase tracking-tighter">
          Michael Douglas
        </div>

        {/* Portfolio Section Menu - Traditional shadcn style matching resume */}
        <div className="w-full max-w-sm px-4 md:px-4 mt-6 md:mt-8 pointer-events-auto">
          <div className="text-[10px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-3 md:mb-4 px-3 md:px-4">
            Navigation
          </div>
          <div className="space-y-2 md:space-y-3">
            {loading ? (
              <div className="text-sm text-muted-foreground px-3 py-2">Loading navigation...</div>
            ) : navigationSections.length === 0 ? (
              <div className="text-sm text-muted-foreground px-3 py-2">No navigation items</div>
            ) : (
              <>
                {navigationSections.map((section) => {
                  const isActive = pathname === section.path || pathname?.startsWith(section.path + '/');
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => router.push(section.path)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 md:px-3 md:py-2 text-sm md:text-sm rounded-lg transition-all group",
                        isActive
                          ? "bg-primary text-primary-foreground font-bold shadow-md"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 md:w-4 md:h-4 transition-all flex-shrink-0",
                        isActive ? "text-primary-foreground" : "text-muted-foreground/60 group-hover:text-foreground"
                      )} />
                      <span className="flex-1 text-left truncate">{section.name}</span>
                    </button>
                  );
                })}
                {/* More button - links to dashboard */}
                <button
                  onClick={() => router.push('/dashboard')}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 md:px-3 md:py-2 text-sm md:text-sm rounded-lg transition-all group",
                    pathname === '/dashboard'
                      ? "bg-primary text-primary-foreground font-bold shadow-md"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MoreHorizontal className={cn(
                    "w-4 h-4 md:w-4 md:h-4 transition-all flex-shrink-0",
                    pathname === '/dashboard' ? "text-primary-foreground" : "text-muted-foreground/60 group-hover:text-foreground"
                  )} />
                  <span className="flex-1 text-left truncate">More</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="w-full max-w-sm flex justify-center pt-4 md:pt-4 border-t border-border/50 mt-6 md:mt-auto">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

