interface Proptype {
  text: string;
  handler?: () => void;
  colorClass: string;
  disabled?: boolean;
}

export default function Button({
  text,
  handler,
  colorClass,
  disabled,
}: Proptype) {
  return (
    <button
      disabled={disabled}
      className={
        "text-white h-12 w-24 disabled:text-gray-400 transition-all duration-500 disabled:no-underline hover:underline rounded-lg " +
        colorClass
      }
      onClick={handler}
    >
      {text}
    </button>
  );
}
