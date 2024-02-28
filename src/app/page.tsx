"use client";

import Button from "@/components/Button";
import LayoutWithWallpaper from "@/components/LayoutWithWallpaper";
import Navbar from "@/components/NavBar";
import UserAuthorizationGuard from "@/components/UnauthorizedUserGuard";
import { UserState } from "@/store/userStore";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [userStore, setUserStore] = useState<UserState | undefined>(undefined);

  const statistics = [
    { name: "Model Version", value: "12" },
    { name: "Training Image", value: "42069+" },
    { name: "Accuracy", value: "96.69%" },
  ];

  return (
    <UserAuthorizationGuard
      setUserStore={setUserStore}
      needAuthorized={false}
      needUnauthorized={false}
    >
      <LayoutWithWallpaper>
        <div className="w-7/12 pl-20">
          <div className="bg-gray-200 rounded-lg p-2 w-fit">Hello There 🐷</div>
          <br></br>
          <h1 className="font-bold text-4xl pr-10">
            Welcome to Swine fat Measurement system
          </h1>
          <p className="text-sm pr-10">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            vestibulum nisi ante, vel auctor leo pretium vel. Orci varius
            natoque penatibus et magnis dis parturient montes, nascetur
            ridiculus mus. Sed fermentum facilisis erat, ac tempus mi finibus
            at. Mauris varius, est non posuere mattis, purus erat suscipit
            lectus, sed mattis lectus odio at odio.
          </p>
          <br></br>
          {userStore && userStore.accessToken.length === 0 && (
            <Link href="/login">
              <Button text="Login" colorClass="bg-purple-700" />
            </Link>
          )}
          <br></br>
          <br></br>
          <br></br>
          <div className="bg-gray-200 p-6 flex flex-row justify-around rounded-l-lg">
            {statistics.map((stat) => (
              <div key={stat.name} className="flex flex-col text-center">
                <h3 className="font-bold text-3xl">{stat.value}</h3>
                <p className="text-sm">{stat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </LayoutWithWallpaper>
    </UserAuthorizationGuard>
  );
}
