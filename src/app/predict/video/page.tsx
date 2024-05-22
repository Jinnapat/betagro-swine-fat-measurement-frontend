"use client";

import PredictionLayout from "@/components/PredictionLayout";
import { Model } from "@/types/model";
import { ChangeEventHandler, useRef, useState } from "react";
import NextImage from "next/image";
import Button from "@/components/Button";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";

const STEP = 0.5;
const QUALITY = 0.8;

export default function VideoPredictionPage() {
  const [inputVideo, setVideo] = useState<File | null>(null);
  const [inputVideoUrl, setInputVideoUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(
    undefined
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const userStore = useStore(useUserStore, (state) => state);

  const inputElementRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const showImage = useRef<HTMLImageElement>(null);

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

  const predictVideo = async () => {
    if (
      !inputVideo ||
      !videoRef.current ||
      !userStore ||
      !inputVideoUrl ||
      !selectedModel
    )
      return;
    setIsUploading(true);
    const encoder = new TextEncoder()

    const drawCanvas = document.createElement("canvas");
    const drawContext = drawCanvas.getContext("2d");

    const { width, height } = await getVideoDimensionsOf(inputVideoUrl);

    drawCanvas.width = Math.floor(width * STEP);
    drawCanvas.height = Math.floor(height * STEP);

    const task_name = `Video prediction on ${new Date().toLocaleDateString()}`
    const client = new WebSocket(
      `${process.env.NEXT_PUBLIC_BACKEND_WS_ROOT}/rt/${selectedModel.name}?access_token=${userStore.accessToken}&task_name=${task_name}`
    );

    client.addEventListener("open", () => {
      client.send(encoder.encode("start"));
    });

    client.addEventListener("message", (ev) => {
      const dataJson = JSON.parse(ev.data);
      if (dataJson.msg) {
        if (!videoRef.current) return;
        intervalRef.current = setInterval(
          () => sendFrame(client, drawContext, drawCanvas),
          40
        );
        videoRef.current.play();
      }
      if (dataJson.img) {
        displayOutput(dataJson.img as string);
      }
    });

    videoRef.current.addEventListener("ended", () => {
      client.send(encoder.encode("q"));
      client.close();
      clearInterval(intervalRef.current);
      setIsUploading(false);
    });
  };

  const sendFrame = (
    client: WebSocket,
    octx: CanvasRenderingContext2D | null,
    oc: HTMLCanvasElement,
  ) => {
    if (!oc || !videoRef.current || !octx) return;
    octx.drawImage(videoRef.current, 0, 0, oc.width, oc.height);
    var dataURL = oc.toDataURL('image/jpeg', QUALITY)
    var binary = atob(dataURL.split(',')[1]);
    var length = binary.length;
    var bytes = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    client.send(bytes);
  };

  const displayOutput = (
    imageSrc: string,
  ) => {
    if (!showImage.current) return;
    showImage.current.src = imageSrc;
  };

  return (
    <PredictionLayout
      inputDescriptionText="Video"
      onStartHandler={predictVideo}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      startButtonDisabled={!selectedModel || !inputVideo || isUploading}
      customButton={
        <Button
          text="Add video"
          handler={openFileDialog}
          colorClass="bg-blue-400"
          disabled={isUploading}
        />
      }
    >
      <div className="w-full h-full flex flex-row justify-center gap-5 items-center">
        <input
          type="file"
          ref={inputElementRef}
          accept="video/*"
          hidden
          onClick={(event) => {
            event.currentTarget.value = ""
          }}
          onChange={handleFileChange}
        />
        <div
          className={
            "flex flex-row justify-center items-center w-full h-full bg-white border border-purple-700 gap-3 flex-wrap max-w-5xl" +
            (isUploading ? " hidden" : "")
          }
        >
          {!inputVideoUrl && (
            <p className="font-bold text-center text-lg">
              No video selected yet
            </p>
          )}
          {inputVideoUrl && (
            <div className="border">
              <button className="w-8 h-8 relative" onClick={removeVideo}>
                <NextImage src="/close.png" alt="close" fill />
              </button>
              <video src={inputVideoUrl} ref={videoRef} controls />
            </div>
          )}
        </div>
        <div className="flex flex-col items-center">
          {isUploading && (
            <p className="font-bole text-center text-xl">is uploading...</p>
          )}
          <img ref={showImage} className="w-[600px]"></img>
        </div>
      </div>
    </PredictionLayout>
  );
}

function getVideoDimensionsOf(url: string) {
  return new Promise<{ width: number; height: number }>((resolve) => {
    const video = document.createElement("video");

    video.addEventListener(
      "loadedmetadata",
      function () {
        const height = this.videoHeight;
        const width = this.videoWidth;
        resolve({ width, height });
      },
      false
    );
    video.src = url;
  });
}
