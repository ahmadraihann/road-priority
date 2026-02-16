// src/App.tsx
import { RouterProvider } from "react-router";
import { NuqsAdapter } from "nuqs/adapters/react";
import { Toaster } from "sonner";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/provider/theme-provider";
import { router } from "@/provider/router-provider";

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ThemeProvider defaultTheme="light">
          <RouterProvider router={router} />
          <Toaster />

          <ReactQueryDevtools buttonPosition="bottom-right" />
        </ThemeProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
