// src/provider/layouts-provider.tsx
import * as React from "react";

type LayoutsContextType = {
  leftSidebar: {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
  };
  rightSidebar: {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
  };
};

const LayoutsContext = React.createContext<LayoutsContextType | null>(null);

type LayoutsProviderProps = {
  children: React.ReactNode;
  defaultLeftOpen?: boolean;
  defaultRightOpen?: boolean;
};

export function LayoutsProvider({
  children,
  defaultLeftOpen = true,
  defaultRightOpen = true,
}: LayoutsProviderProps) {
  const [leftOpen, setLeftOpen] = React.useState(defaultLeftOpen);
  const [rightOpen, setRightOpen] = React.useState(defaultRightOpen);

  const value = React.useMemo<LayoutsContextType>(
    () => ({
      leftSidebar: {
        open: leftOpen,
        setOpen: setLeftOpen,
        toggle: () => setLeftOpen((prev) => !prev),
      },
      rightSidebar: {
        open: rightOpen,
        setOpen: setRightOpen,
        toggle: () => setRightOpen((prev) => !prev),
      },
    }),
    [leftOpen, rightOpen]
  );

  return (
    <LayoutsContext.Provider value={value}>{children}</LayoutsContext.Provider>
  );
}
