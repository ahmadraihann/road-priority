// src/ provider/router-provider.tsx
import { createBrowserRouter, type RouteObject } from "react-router";

import { lazyLoad } from "@/hooks/lazy-load";
import { DefaultLayout } from "@/components/layouts/default-layout";
import { BlankLayout } from "@/components/layouts/blank-layout";
import { NotFoundError } from "@/components/404";
import DashboardPage from "@/modules/dashboard/views";
import InputFormPage from "@/modules/analysis/views/form";
import ReviewDataPage from "@/modules/analysis/views/list";
import CalculatePage from "@/modules/analysis/views/calculate";
import ResultsPage from "@/modules/analysis/views/results";
import MapPage from "@/modules/analysis/views/map";
import DetailPage from "@/modules/analysis/views/detail";
import CriteriaManagePage from "@/modules/criteria/views/manage";

const RedirectPage = lazyLoad(() => import("@/modules/redirect"));

const createLayoutRoute = (
  Layout: React.ComponentType,
  children: RouteObject[],
  loader?: RouteObject["loader"]
): RouteObject => ({
  Component: Layout,
  loader,
  children: [
    {
      index: true,
      element: <RedirectPage />,
    },
    ...children,
    {
      path: "*",
      element: <NotFoundError />,
    },
  ],
});

// Default layout routes
const defaultLayoutRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/form",
    element: <InputFormPage />,
  },
  {
    path: "/form:id",
    element: <InputFormPage />,
  },
  {
    path: "/review",
    element: <ReviewDataPage />,
  },
  {
    path: "/calculate",
    element: <CalculatePage />,
  },
  {
    path: "/results",
    element: <ResultsPage />,
  },
  {
    path: "/detail",
    element: <DetailPage />,
  },
  {
    path: "/criteria",
    element: <CriteriaManagePage />,
  },
];

// Blank layout routes
const blankLayoutRoutes: RouteObject[] = [
  {
    path: "/map",
    element: <MapPage />,
  },
];

// Main router configuration
export const router = createBrowserRouter([
  {
    children: [
      createLayoutRoute(DefaultLayout, defaultLayoutRoutes),
      createLayoutRoute(BlankLayout, blankLayoutRoutes),

      {
        path: "*",
        element: <NotFoundError />,
      },
    ],
  },
]);
