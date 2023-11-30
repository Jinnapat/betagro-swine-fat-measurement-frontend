import LoginButton from "@/components/Button";
import LayoutWithWallpaper from "@/components/LayoutWithWallpaper";
import Navbar from "@/components/NavBar";
import Link from "next/link";

export default function Home() {
  const statistics = [
    { name: "Model Version", value: "12" },
    { name: "Training Image", value: "42069+" },
    { name: "Accuracy", value: "96.69%" },
  ];

  return (
    <>
      <Navbar authenticated={false} showPredictionModes={false} />
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
          <Link href="/login">
            <LoginButton text="Login" colorClass="purple-700" />
          </Link>
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
    </>
  );
}
