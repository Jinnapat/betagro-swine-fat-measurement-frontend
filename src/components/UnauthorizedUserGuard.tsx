import { useUserStore } from "@/store/userStore";
import { useStore } from "@/store/useStore";
import PageLoading from "@/components/PageLoading";
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
  if (!userStore || !userStore._hasHydrated) return <PageLoading />;
  const isLoggedIn = userStore.accessToken.length > 0;
  if ((needAuthorized && !isLoggedIn) || (needUnauthorized && isLoggedIn)) {
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
