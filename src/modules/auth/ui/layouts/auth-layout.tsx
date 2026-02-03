"use client";

import { AuthLoadingView } from "@/modules/auth/ui/views/auth-loading-view";
import { UnauthenticatedView } from "@/modules/auth/ui/views/unauthenticated-view";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <UnauthenticatedView />
      </Unauthenticated>
      <AuthLoading>
        <AuthLoadingView />
      </AuthLoading>
    </>
  );
};
