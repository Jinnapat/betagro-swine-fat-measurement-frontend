"use client";

import PredictionLayout from "@/components/PredictionLayout";
import SquareIconButton from "@/components/SquareIconButton";
import { Model } from "@/types/model";
import { useRef, useState } from "react";
interface MediaState {
  typeOfMedia: "video" | "image" | null;
}

export default function RealtimePredictionPage() {
  const [mediaUpload, setMediaUpload] = useState<boolean>(false);
  const [mediaState, setMediaState] = useState<MediaState>({
    typeOfMedia: null,
  });
  const mediaRef = useRef<HTMLMediaElement>(null);
  const [mediaList, setMediaList] = useState<string[]>([]); // URLs of the uploaded media
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(
    undefined
  );
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return; // No file selected

    const newMediaList: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = () => {
        const url = reader.result as string;
        newMediaList.push(url);

        if (i === files.length - 1) {
          // All files have been processed, update state
          setMediaList([...mediaList, ...newMediaList]);
          setMediaUpload(true);
        }
      };

      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
        setMediaState({ typeOfMedia: "image" });
      } else if (file.type.startsWith("video/")) {
        reader.readAsDataURL(file);
        setMediaState({ typeOfMedia: "video" });
      } else {
        console.error("Unsupported file type:", file.type);
      }
    }
  };

  // Function to trigger file input click
  const handleButtonClick = () => {
    document.getElementById("fileInput")?.click();
  };

  return (
    <PredictionLayout
      inputDescriptionText={
        !mediaUpload
          ? "Upload Media"
          : mediaList.length > 0 && mediaList[0].startsWith("data:image")
          ? "Images"
          : "Video"
      }
      //onStartHandler={openCamera}
      //onStopHandler={closeCamera}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      startButtonDisabled={!selectedModel || mediaUpload}
      stopButtonDisabled={!mediaUpload}
    >
      <div className="w-full h-full flex flex-row justify-center gap-5 items-center flex-wrap">
        {!mediaUpload ? (
          <div className="flex flex-col justify-center items-center w-11/12 h-full bg-white border border-purple-700">
            <div className="flex flex-col justify-center items-center gap-10 w-80 h-80 lg:w-96 lg:h-96 xl:w-112 xl:h-112 border rounded-xl bg-gray-200 text-center">
              <input
                id="fileInput"
                type="file"
                accept="image/*, video/*"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <img
                src="/dragdrop.png"
                alt="Select Model"
                onClick={handleButtonClick}
                style={{ cursor: "pointer" }}
              />
              <p>{!selectedModel ? "Select Model" : "Drag & Drop"}</p>
            </div>
          </div>
        ) : (
          mediaList.map((media, index) => (
            <div key={index} className="flex-none w-1/5 max-w-1/5">
              {media.startsWith("data:image") ? (
                <img
                  src={media}
                  alt={`Uploaded Image ${index}`}
                  className="w-full"
                />
              ) : (
                <video src={media} controls className="w-full" />
              )}
            </div>
          ))
        )}
      </div>
    </PredictionLayout>
  );
}
