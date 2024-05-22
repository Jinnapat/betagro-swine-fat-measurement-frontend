import { Model } from "@/types/model";
import Button from "./Button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";
import { Dropdown } from "./Dropdown";

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
  customDropdown,
}: {
  onStartHandler: (model: Model) => void;
  onStopHandler?: () => void;
  selectedModel: Model | undefined;
  setSelectedModel: Dispatch<SetStateAction<Model | undefined>>;
  startButtonDisabled?: boolean;
  stopButtonDisabled?: boolean;
  customButton?: React.ReactNode;
  customDropdown?: React.ReactNode;
}) {
  const userStore = useStore(useUserStore, (state) => state);
  const [listOfModels, setListOfModels] = useState<Model[] | undefined>(
    undefined
  );

  const access_token = userStore?.accessToken;

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
      if (getAllModelsResult.status == 401) {
        userStore.setAccessToken("");
        location.reload();
        throw new Error("No session");
      }
      const jsonResponse: GetModelResponse = await getAllModelsResult.json();
      setListOfModels(jsonResponse.models);
    };
    getAllModels();
  }, [userStore, access_token]);

  return (
    <div className="flex flex-row justify-between py-4 px-12 bg-gray-200 rounded-l-2xl items-center">
      <div className="flex flex-row gap-4">
        <Dropdown
          selected={selectedModel}
          listOfItems={listOfModels}
          setSelected={setSelectedModel}
          label="Model Version"
        />
        {customDropdown}
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
