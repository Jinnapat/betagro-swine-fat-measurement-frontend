import { UserState, useUserStore } from "@/store/userStore";
import { useStore } from "@/store/useStore";
import PageLoading from "@/components/PageLoading";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";

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
  if (!userStore) return <PageLoading />;
  if (
    (needAuthorized && userStore.accessToken.length === 0) ||
    (needUnauthorized && userStore.accessToken.length > 0)
  ) {
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
