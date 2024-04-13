import { useUserStore } from "@/store/userStore";
import { useStore } from "@/store/useStore";
import PageLoading from "@/components/PageLoading";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserAuthorizationGuard({
  children,
  needAuthorized,
  needUnauthorized,
}: {
  children: JSX.Element;
  needAuthorized: boolean;
  needUnauthorized: boolean;
}) {
  const router = useRouter();
  const userStore = useStore(useUserStore, (state) => state);
  const [status, setStatus] = useState({ isLoading: true, isLoggedIn: false });

  useEffect(() => {
    if (!userStore || !userStore._hasHydrated || !status.isLoading) return
    setStatus({
      isLoading: false,
      isLoggedIn: userStore.accessToken.length > 0,
    })
  }, [userStore, status.isLoading])

  if (status.isLoading) return <PageLoading />;
  if ((needAuthorized && !status.isLoggedIn) || (needUnauthorized && status.isLoggedIn)) {
    return (
      <div className="flex flex-col items-center p-14 gap-4">
        <p className="font-bold text-center text-xl">Unauthorized access</p>
        <button className="hover:underline" onClick={() => router.back()}>
          Go back
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
