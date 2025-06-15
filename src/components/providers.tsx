"use client";

import React from "react";
import { IGAuthProvider } from "@/hooks/use-ig-auth";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return React.createElement(IGAuthProvider, null, children);
} 