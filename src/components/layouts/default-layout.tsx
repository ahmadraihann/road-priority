import { Outlet, useNavigate } from "react-router";
import { Map } from "lucide-react";

import { LayoutsProvider } from "@/provider/layouts-provider";

import { NavigationProgress } from "../navigation-progress";

type DefaultLayoutProps = {
  children?: React.ReactNode;
};

export function DefaultLayout({ children }: DefaultLayoutProps) {
  const navigate = useNavigate();
  return (
    <LayoutsProvider>
      <NavigationProgress />
      <div className="flex min-h-screen flex-col">
        <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
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
