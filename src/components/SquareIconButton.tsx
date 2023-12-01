import Image from "next/image";

export default function SquareIconButton({
  iconUrl,
  text,
  handler,
  disabled,
}: {
  iconUrl: string;
  text: string;
  handler: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="w-36 h-36 rounded-xl bg-gray-300 flex flex-col items-center justify-center gap-3 disabled:bg-gray-500 transition-colors duration-300 "
      onClick={handler}
      disabled={disabled}
    >
      <Image src={iconUrl} width={80} height={80} alt="icon" />
      <p>{text}</p>
    </button>
  );
}
