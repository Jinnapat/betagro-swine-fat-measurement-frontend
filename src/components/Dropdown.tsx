import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";

export type Item = {
  name: string;
};

export function Dropdown({
  selected,
  listOfItems,
  setSelected,
  label,
}: {
  selected: Item | undefined;
  listOfItems: Item[] | undefined;
  setSelected: Dispatch<SetStateAction<Item | undefined>>;
  label: string;
}) {
  const [showDropDown, setShowDropDown] = useState<boolean>(false);

  return (
    <div>
      <div className="bg-gray-300 rounded-lg flex flex-row gap-4 items-center p-3">
        <div className="w-64">
          <p className="text-sm">Choose {label}</p>
          <p className="font-bold">
            {selected ? selected.name : `No ${label.toLowerCase()} selected`}
          </p>
        </div>
        <button
          className="border-2 h-12 w-12 flex flex-row justify-center items-center border-gray-400 rounded-lg hover:bg-yellow-100 transition-colors duration-300"
          onClick={() => setShowDropDown(!showDropDown)}
        >
          <Image src="/down.png" alt="down" width={15} height={15} />
        </button>
      </div>
      <div
        className={
          "w-full transition-all duration-300 origin-top h-0 translate-y-1" +
          (showDropDown ? "" : " scale-y-0 opacity-0")
        }
      >
        <div className="flex flex-col gap-1 w-full z-50 relative bg-gray-500 rounded-lg">
          {listOfItems &&
            listOfItems.map((item) => (
              <button
                key={item.name}
                className="z-50 rounded-lg p-3 hover:bg-black text-white"
                onClick={() => {
                  setShowDropDown(false);
                  setSelected(item);
                }}
              >
                {item.name}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
