"use client";

import PredictionLayout from "@/components/PredictionLayout";
import { Model } from "@/types/model";
import { ChangeEventHandler, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/Button";

export default function VideoPredictionPage() {
  const [inputVideo, setVideo] = useState<File | null>(null);
  const [inputVideoUrl, setInputVideoUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(
    undefined
  );
  const inputElementRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => {
    if (!inputElementRef.current) return;
    inputElementRef.current.click();
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const files = e.currentTarget.files;
    if (!files) return;
    setVideo(files[0]);
    setInputVideoUrl(URL.createObjectURL(files[0]));
  };

  const removeVideo = () => {
    setVideo(null);
    setInputVideoUrl(null);
  };

  const predictBatchImage = async () => {};

  return (
    <PredictionLayout
      inputDescriptionText="Video"
      onStartHandler={predictBatchImage}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      startButtonDisabled={!selectedModel}
      customButton={
        <Button
          text="Add video"
          handler={openFileDialog}
          colorClass="bg-blue-400"
        />
      }
    >
      <div className="w-full h-full flex flex-row justify-center gap-5 items-center">
        <input
          type="file"
          ref={inputElementRef}
          accept="video/*"
          hidden
          onChange={handleFileChange}
        />
        <div className="flex flex-row justify-center items-center w-full h-full bg-white border border-purple-700 gap-3 flex-wrap max-w-5xl">
          {!inputVideoUrl && (
            <p className="font-bold text-center text-lg">
              No video selected yet
            </p>
          )}
          {inputVideoUrl && (
            <div className="border">
              <button className="w-8 h-8 relative" onClick={removeVideo}>
                <Image src="/close.png" alt="close" fill />
              </button>
              <video src={inputVideoUrl} controls />
            </div>
          )}
        </div>
      </div>
    </PredictionLayout>
  );
}
