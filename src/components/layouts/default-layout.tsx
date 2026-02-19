// src/components/layouts/default-layout.tsx
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { Map, ListChecks, Plus } from "lucide-react";

import { LayoutsProvider } from "@/provider/layouts-provider";
import { NavigationProgress } from "../navigation-progress";
import { cn } from "@/lib/utils";

type DefaultLayoutProps = {
  children?: React.ReactNode;
};

const navItems = [
  { label: "Data Jalan", href: "/review", icon: ListChecks },
  { label: "Tambah Data", href: "/form", icon: Plus },
];

export function DefaultLayout({ children }: DefaultLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <LayoutsProvider>
      <NavigationProgress />
      <div className="flex min-h-screen flex-col">
        <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/")}
              >
                <div className="w-8 h-8 bg-linear-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Map className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  RoadPriority
                </span>
              </div>

              {/* Nav Links */}
              <div className="flex items-center gap-1">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const isActive = location.pathname === href;
                  return (
                    <Link
                      key={href}
                      to={href}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 relative @container/content">
          {children ?? <Outlet />}
        </main>
      </div>
    </LayoutsProvider>
  );
}
