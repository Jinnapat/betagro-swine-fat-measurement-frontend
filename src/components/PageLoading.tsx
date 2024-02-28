import Image from "next/image";

export default function PageLoading() {
  return (
    <div className="flex flex-col w-full items-center p-7">
      <Image
        src="/loading.png"
        width={20}
        height={20}
        alt="loading"
        className="absolute z-10 animate-spin"
        priority={true}
      />
    </div>
  );
}
