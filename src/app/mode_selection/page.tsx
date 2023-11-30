import LayoutWithWallpaper from "@/components/LayoutWithWallpaper";
import Navbar from "@/components/NavBar";
import Link from "next/link";
import Image from "next/image";

interface Proptype {
  text: string;
  routeTo: string;
}

export default function ModeSelectionPage() {
  return (
    <>
      <Navbar authenticated={true} showPredictionModes={false} />
      <LayoutWithWallpaper>
        <div className="w-7/12 flex flex-col gap-4 p-20">
          <ModeSelectionButton
            text="Image Prediction"
            routeTo="/predict/image"
          />
          <ModeSelectionButton
            text="Video Prediction"
            routeTo="/predict/video"
          />
          <ModeSelectionButton
            text="Realtime Prediction"
            routeTo="/predict/realtime"
          />
        </div>
      </LayoutWithWallpaper>
    </>
  );
}

function ModeSelectionButton({ text, routeTo }: Proptype) {
  return (
    <div className="bg-gray-200 rounded-lg w-full text-center flex flex-row p-6 justify-between items-center">
      <p className="ml-6">{text}</p>
      <Link
        href={routeTo}
        className="border-2 rounded-lg w-12 h-12 border-gray-300 flex flex-row justify-center items-center hover:bg-yellow-100 transition-colors duration-300"
      >
        <Image src="/arrow.png" alt="go to mode" width="20" height="20" />
      </Link>
    </div>
  );
}
