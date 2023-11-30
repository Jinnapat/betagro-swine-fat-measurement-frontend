import Link from "next/link";
import Button from "./Button";

interface Proptype {
  authenticated: boolean;
  showPredictionModes: boolean;
}

export default function Navbar({
  authenticated,
  showPredictionModes,
}: Proptype) {
  return (
    <div className="w-full border-b-gray-200 py-2 px-6 border-b-2 flex flex-row justify-between items-center">
      <Link
        href="/"
        className="text-purple-700 font-bold text-2xl hover:underline"
      >
        AlmostSwine
      </Link>
      <div className="flex flex-row gap-9 items-center">
        {showPredictionModes && (
          <>
            <Link href="/predict/image" className="hover:underline font-bold">
              Image prediction
            </Link>
            <Link href="/predict/video" className="hover:underline font-bold">
              Video prediction
            </Link>
            <Link
              href="/predict/realtime"
              className="hover:underline  font-bold"
            >
              Realtime prediction
            </Link>
          </>
        )}
        {authenticated ? (
          <Link href="/logout">
            <Button text="Logout" colorClass="bg-red-700" />
          </Link>
        ) : (
          <Link href="/login">
            <Button text="Login" colorClass="bg-purple-700" />
          </Link>
        )}
      </div>
    </div>
  );
}
