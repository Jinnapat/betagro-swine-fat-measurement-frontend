import { Model } from "@/types/model";
import Button from "./Button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";

type GetModelResponse = {
  page_number: number;
  page_size: number;
  last_page: number;
  count: number;
  models: Model[];
};

export default function ModelSelector({
  onStartHandler,
  onStopHandler,
  selectedModel,
  setSelectedModel,
  startButtonDisabled,
  stopButtonDisabled,
  customButton,
}: {
  onStartHandler: (model: Model) => void;
  onStopHandler?: () => void;
  selectedModel: Model | undefined;
  setSelectedModel: Dispatch<SetStateAction<Model | undefined>>;
  startButtonDisabled?: boolean;
  stopButtonDisabled?: boolean;
  customButton?: React.ReactNode;
}) {
  const access_token = useStore(useUserStore, (state) => state.accessToken);
  const [showDropDown, setShowDropDown] = useState<boolean>(false);

  const [listOfModels, setListOfModels] = useState<Model[] | undefined>(
    undefined
  );

  const predict = () => {
    if (!selectedModel) return;
    onStartHandler(selectedModel);
  };

  useEffect(() => {
    if (!access_token) return;
    const getAllModels = async () => {
      const getAllModelsResult = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_ROOT}/models?page=1&size=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const jsonResponse: GetModelResponse = await getAllModelsResult.json();
      setListOfModels(jsonResponse.models);
    };
    getAllModels();
  }, [access_token]);

  return (
    <div className="flex flex-row justify-between py-4 px-12 bg-gray-200 rounded-l-2xl items-center">
      <div>
        <div className="bg-gray-300 rounded-lg flex flex-row gap-4 items-center p-3">
          <div className="w-96">
            <p className="text-sm">Choose Model Version</p>
            <p className="font-bold">
              {selectedModel ? selectedModel.name : "No model selected"}
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
            {listOfModels &&
              listOfModels.map((model) => (
                <button
                  key={model.name}
                  className="z-50 rounded-lg p-3 hover:bg-black text-white"
                  onClick={() => {
                    setShowDropDown(false);
                    setSelectedModel(model);
                  }}
                >
                  {model.name}
                </button>
              ))}
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        {customButton}
        <Button
          text="Predict"
          colorClass="bg-green-400"
          handler={predict}
          disabled={startButtonDisabled}
        />
        {onStopHandler && (
          <Button
            text="stop"
            colorClass="bg-red-400"
            handler={onStopHandler}
            disabled={stopButtonDisabled}
          />
        )}
      </div>
    </div>
  );
}
