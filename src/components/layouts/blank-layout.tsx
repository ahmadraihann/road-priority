import { Outlet } from "react-router";

import { LayoutsProvider } from "@/provider/layouts-provider";

import { NavigationProgress } from "../navigation-progress";

type BlankLayoutProps = {
  children?: React.ReactNode;
};

export function BlankLayout({ children }: BlankLayoutProps) {
  return (
    <LayoutsProvider>
      <NavigationProgress />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 relative @container/content">
          {children ?? <Outlet />}
        </main>
      </div>
    </LayoutsProvider>
  );
}
