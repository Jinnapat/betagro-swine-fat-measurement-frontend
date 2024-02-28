import Image from "next/image";

interface Proptype {
  children: React.ReactNode;
}

export default function LayoutWithWallpaper({ children }: Proptype) {
  return (
    <div className="flex flex-row h-full justify-end items-center">
      {children}
      <div className="h-full w-5/12 relative">
        <Image
          src="/pig.jpg"
          fill
          alt="wallpaper"
          className="rounded-bl-3xl object-cover"
          priority={true}
        />
      </div>
    </div>
  );
}
