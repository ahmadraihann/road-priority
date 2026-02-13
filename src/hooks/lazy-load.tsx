// src/hooks/lazy-load.tsx
import React from "react";

/*
 * Lazy load a React component
 * It helps to split code and load components only when needed
 * Improves performance and user experience
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return React.lazy(factory);
}
