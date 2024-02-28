"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LayoutWithWallpaper from "@/components/LayoutWithWallpaper";
import Navbar from "@/components/NavBar";
import { useUserStore } from "@/store/userStore";
import { useStore } from "@/store/useStore";
import PageLoading from "@/components/PageLoading";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const userStore = useStore(useUserStore, (state) => state);

  const login = async () => {
    if (!userStore) return;
    setErrorMessage("");
    setIsProcessing(true);
    const loginResult = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_ROOT}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );
    if (loginResult.status != 200) {
      const errorJson = await loginResult.json();
      setErrorMessage(errorJson.detail);
      setIsProcessing(false);
      return;
    }
    const responseJson = await loginResult.json();
    userStore.setAccessToken(responseJson.access_token);
    router.push("mode_selection");
  };

  if (!userStore) return <PageLoading />;
  if (userStore.accessToken.length > 0) {
    router.push("/mode_selection");
    return <PageLoading />;
  }
  return (
    <>
      <Navbar authenticated={false} showPredictionModes={false} />
      <LayoutWithWallpaper>
        <div className="flex flex-col w-7/12 p-20 justify-center items-center gap-4">
          <p className="w-full">Login to AlmostSwine</p>
          <input
            className="w-full bg-gray-100 rounded-lg p-4 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
          />
          <div className="flex flex-row w-full bg-gray-100 rounded-lg p-3 gap-2">
            <input
              className="w-full bg-gray-100 outline-none"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
            />
            <button onClick={() => setShowPassword(!showPassword)}>
              <Image
                src={showPassword ? "/show.png" : "/hidden.png"}
                width={30}
                height={30}
                alt="visibility"
              />
            </button>
          </div>

          <Button
            text="Login"
            colorClass="bg-purple-700"
            handler={login}
            disabled={email == "" || password == "" || isProcessing}
          />
          <p className="text-red-600">{errorMessage}</p>
          {isProcessing && (
            <Image
              src="/loading.png"
              width={80}
              height={80}
              alt="loading"
              className="absolute z-10 animate-spin"
            />
          )}
        </div>
      </LayoutWithWallpaper>
    </>
  );
}
