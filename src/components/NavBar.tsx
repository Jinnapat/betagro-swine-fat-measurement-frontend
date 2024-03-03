"use client";

import Link from "next/link";
import Button from "./Button";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const userStore = useStore(useUserStore, (state) => state);

  const logout = () => {
    if (!userStore) return;
    userStore.setAccessToken("");
    router.push("/");
  };

  const authenticated = userStore && userStore.accessToken.length > 0;
  return (
    <div className="w-full border-b-gray-200 py-2 px-6 border-b-2 flex flex-row justify-between items-center">
      <Link
        href="/"
        className="text-purple-700 font-bold text-2xl hover:underline"
      >
        AlmostSwine
      </Link>
      <div className="flex flex-row gap-5 items-center">
        {userStore && authenticated && (
          <>
            <Link href="/predict/image" className="hover:underline font-bold">
              Image prediction
            </Link>
            <Link href="/predict/video" className="hover:underline font-bold">
              Video prediction
            </Link>
            <Link
              href="/predict/realtime"
              className="hover:underline font-bold"
            >
              Realtime prediction
            </Link>
            <Link href="/result" className="hover:underline font-bold">
              Result
            </Link>
          </>
        )}
        {userStore && authenticated && (
          <Button text="Logout" handler={logout} colorClass="bg-red-700" />
        )}
        {userStore && !authenticated && (
          <Link href="/login">
            <Button text="Login" colorClass="bg-purple-700" />
          </Link>
        )}
      </div>
    </div>
  );
}
