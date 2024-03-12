"use client";

import PredictionLayout from "@/components/PredictionLayout";
import { Model } from "@/types/model";
import { ChangeEventHandler, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";

type CreateTasksResponse = {
  tid: string;
  name: string;
  uid: string;
  m_name: string;
  create_at: string;
  start_time: null;
  finish_time: null;
  task_type: string;
  status: string;
  number_of_input: number;
  processed: number;
  input_list: {
    index: number;
    source_ref: string;
  }[];
};

const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export default function ImagePredictionPage() {
  const userStore = useStore(useUserStore, (state) => state);
  const [inputImages, setInputImages] = useState<File[]>([]);
  const [inputImageUrls, setInputImageUrls] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(
    undefined
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [uploadMessage, setUploadMessage] = useState<string>("");

  const inputElementRef = useRef<HTMLInputElement>(null);
  const accessToken = userStore?.accessToken;

  const openFileDialog = () => {
    if (!inputElementRef.current) return;
    inputElementRef.current.click();
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setUploadMessage("");
    const files = e.currentTarget.files;
    if (!files) return;
    setInputImages([...inputImages, ...Object.values(files)]);
    setInputImageUrls([
      ...inputImageUrls,
      ...Object.values(files).map((image) => URL.createObjectURL(image)),
    ]);
  };

  const removeImage = (targetIdx: number) => {
    setErrorMessage("");
    setUploadMessage("");
    setInputImages(inputImages.filter((_, idx) => idx !== targetIdx));
    setInputImageUrls(inputImageUrls.filter((_, idx) => idx !== targetIdx));
  };

  const createTask = async () => {
    if (!accessToken || !selectedModel) return;
    const imageBase64 = await toBase64(inputImages[0]);
    const createTaskResult = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_ROOT}/tasks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: `Batch prediction on ${new Date().toLocaleDateString()}`,
          task_type: "batch",
          m_name: selectedModel.name,
          input_list: [imageBase64],
        }),
      }
    );
    if (createTaskResult.status == 401) {
      userStore.setAccessToken("");
      throw new Error("No session");
    }
    if (createTaskResult.status != 200) {
      throw new Error("Can't create the task");
    }
    return await createTaskResult.json();
  };

  const uploadImage = async (taskId: string, image: File) => {
    if (!accessToken) return;
    const imageBase64 = await toBase64(image);
    const uploadImageResult = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_ROOT}/tasks/${taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          input_to_add: [imageBase64],
        }),
      }
    );
    if (uploadImageResult.status == 401) {
      userStore.setAccessToken("");
      throw new Error("No session");
    }
    if (uploadImageResult.status != 200) {
      throw new Error(`Can't upload the image: ${image.name}`);
    }
  };

  const startTask = async (taskId: string) => {
    if (!accessToken) return;
    const imageBase64 = await toBase64(inputImages[0]);
    const startResult = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_ROOT}/tasks/${taskId}/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (startResult.status == 401) {
      userStore.setAccessToken("");
      throw new Error("No session");
    }
    if (startResult.status != 200) {
      throw new Error("Can't start the task");
    }
    return await startResult.json();
  };

  const predictBatchImage = async () => {
    if (!accessToken || !selectedModel) return;
    setIsUploading(true);
    setErrorMessage("");
    setUploadMessage(`0/${inputImages.length} uploaded`);
    let message = "";
    try {
      const createTaskResult: CreateTasksResponse = await createTask();
      setUploadMessage(`1/${inputImages.length} uploaded`);
      for (let imageIdx = 1; imageIdx < inputImages.length; imageIdx += 1) {
        await uploadImage(createTaskResult.tid, inputImages[imageIdx]);
        message = `${imageIdx + 1}/${inputImages.length} uploaded`;
        setUploadMessage(message);
      }
      await startTask(createTaskResult.tid);
      message += " : Prediction started.";
      setUploadMessage(message);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PredictionLayout
      inputDescriptionText="Images"
      onStartHandler={predictBatchImage}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      startButtonDisabled={
        !selectedModel || inputImages.length === 0 || isUploading
      }
      customButton={
        <Button
          text="Add image"
          handler={openFileDialog}
          colorClass="bg-blue-400"
        />
      }
    >
      <p className="text-center font-bold">{uploadMessage}</p>
      <p className="text-red-600 text-center font-bold">{errorMessage}</p>
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
