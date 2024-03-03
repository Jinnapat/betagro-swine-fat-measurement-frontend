"use client";

import PredictionLayout from "@/components/PredictionLayout";
import { Model } from "@/types/model";
import { ChangeEventHandler, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/Button";

export default function ImagePredictionPage() {
  const [inputImages, setInputImages] = useState<File[]>([]);
  const [inputImageUrls, setInputImageUrls] = useState<string[]>([]);
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
    setInputImages([...inputImages, ...Object.values(files)]);
    setInputImageUrls([
      ...inputImageUrls,
      ...Object.values(files).map((image) => URL.createObjectURL(image)),
    ]);
  };

  const removeImage = (targetIdx: number) => {
    setInputImages(inputImages.filter((_, idx) => idx !== targetIdx));
    setInputImageUrls(inputImageUrls.filter((_, idx) => idx !== targetIdx));
  };

  const predictBatchImage = async () => {};

  return (
    <PredictionLayout
      inputDescriptionText="Images"
      onStartHandler={predictBatchImage}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      startButtonDisabled={!selectedModel}
      customButton={
        <Button
          text="Add image"
          handler={openFileDialog}
          colorClass="bg-blue-400"
        />
      }
    >
      <div className="w-full h-full flex flex-row justify-center gap-5 items-center">
        <input
          type="file"
          ref={inputElementRef}
          accept="image/*"
          multiple
          hidden
          onChange={handleFileChange}
        />
        <div className="flex flex-row justify-center items-center w-full h-full bg-white border border-purple-700 gap-3 flex-wrap max-w-5xl">
          {inputImageUrls.length === 0 && (
            <p className="font-bold text-center text-lg">
              No image selected yet
            </p>
          )}
          {inputImageUrls.map((imageUrl, idx) => (
            <div key={idx} className="w-[200px] h-[200px] relative border">
              <Image
                src={imageUrl}
                fill
                alt="uploaded image"
                className="object-cover"
              />
              <button
                className="w-8 h-8 relative"
                onClick={() => removeImage(idx)}
              >
                <Image src="/close.png" alt="close" fill />
              </button>
            </div>
          ))}
        </div>
      </div>
    </PredictionLayout>
  );
}
