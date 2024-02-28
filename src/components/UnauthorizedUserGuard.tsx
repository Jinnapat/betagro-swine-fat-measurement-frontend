import { UserState, useUserStore } from "@/store/userStore";
import { useStore } from "@/store/useStore";
import PageLoading from "@/components/PageLoading";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";

export default function UnauthorizedUserGuard({
  children,
  setUserStore,
}: {
  children: JSX.Element;
  setUserStore: Dispatch<SetStateAction<UserState | undefined>>;
}) {
  const router = useRouter();
  const userStore = useStore(useUserStore, (state) => state);
  setUserStore(userStore);
  if (!userStore) return <PageLoading />;
  if (userStore.accessToken.length === 0) {
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
