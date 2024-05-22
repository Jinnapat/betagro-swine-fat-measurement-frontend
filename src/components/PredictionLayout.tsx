import { Dispatch, SetStateAction } from "react";
import ModelSelector from "./ModelSelector";
import { Model } from "@/types/model";

export default function PredictionLayout({
  onStartHandler,
  onStopHandler,
  inputDescriptionText,
  children,
  selectedModel,
  setSelectedModel,
  startButtonDisabled,
  stopButtonDisabled,
  customButton,
  customDropdown,
}: {
  onStartHandler: () => void;
  onStopHandler?: () => void;
  inputDescriptionText: string;
  children: React.ReactNode;
  selectedModel: Model | undefined;
  setSelectedModel: Dispatch<SetStateAction<Model | undefined>>;
  startButtonDisabled?: boolean;
  stopButtonDisabled?: boolean;
  customButton?: React.ReactNode;
  customDropdown?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-gray-100 h-full rounded-l-2xl">
      <ModelSelector
        onStartHandler={onStartHandler}
        onStopHandler={onStopHandler}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        startButtonDisabled={startButtonDisabled}
        stopButtonDisabled={stopButtonDisabled}
        customButton={customButton}
        customDropdown={customDropdown}
      />
      <div className="bg-purple-700 text-white p-3 pl-12 rounded-l-2xl">
        {inputDescriptionText}
      </div>
      <div className="h-full p-4">{children}</div>
    </div>
  );
}
