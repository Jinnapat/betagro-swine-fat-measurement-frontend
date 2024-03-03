"use client";

import UserAuthorizationGuard from "@/components/UnauthorizedUserGuard";

export default function PredictionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserAuthorizationGuard needAuthorized={true} needUnauthorized={false}>
      <div className="pl-20 py-5 grow">{children}</div>
    </UserAuthorizationGuard>
  );
}
