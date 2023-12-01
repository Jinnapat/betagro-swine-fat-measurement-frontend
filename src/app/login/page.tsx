"use client";
import { useState } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LayoutWithWallpaper from "@/components/LayoutWithWallpaper";
import Navbar from "@/components/NavBar";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const login = () => {
    router.push("mode_selection");
  };

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
            disabled={email == "" || password == ""}
          />
        </div>
      </LayoutWithWallpaper>
    </>
  );
}
