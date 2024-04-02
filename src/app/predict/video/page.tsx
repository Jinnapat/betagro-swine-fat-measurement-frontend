"use client";

import PredictionLayout from "@/components/PredictionLayout";
import { Model } from "@/types/model";
import { ChangeEventHandler, useRef, useState } from "react";
import NextImage from "next/image";
import Button from "@/components/Button";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";

const FRAME_WIDTH = 600;

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
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

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
      !resultCanvasRef.current ||
      !inputVideoUrl
    )
      return;
    setIsUploading(true);

    const drawCanvas = document.createElement("canvas");
    const drawContext = drawCanvas.getContext("2d");
    const resultContext = resultCanvasRef.current.getContext("2d");

    const { width, height } = await getVideoDimensionsOf(inputVideoUrl);

    drawCanvas.width = width;
    drawCanvas.height = height;

    resultCanvasRef.current.width = FRAME_WIDTH;
    resultCanvasRef.current.height = FRAME_WIDTH * (height / width);

    const client = new WebSocket(
      process.env.NEXT_PUBLIC_BACKEND_WS_ROOT +
      "?access_token=" +
      userStore.accessToken
    );

    client.addEventListener("open", () => {
      client.send("start");
      intervalRef.current = setInterval(
        () => sendFrame(width, height, client, drawContext, drawCanvas),
        100
      );
    });

    client.addEventListener("message", (ev) => {
      const dataJson = JSON.parse(ev.data);
      displayOutput(dataJson.image as string, resultContext, width, height);
    });

    videoRef.current.addEventListener("ended", () => {
      clearInterval(intervalRef.current);
      setIsUploading(false);
    });
    videoRef.current.play();
  };

  const sendFrame = (
    width: number,
    height: number,
    client: WebSocket,
    drawContext: CanvasRenderingContext2D | null,
    drawCanvas: HTMLCanvasElement
  ) => {
    if (!drawContext || !resultCanvasRef.current || !videoRef.current) return;
    drawContext.drawImage(videoRef.current, 0, 0, width, height);
    var data = drawCanvas.toDataURL("image/jpeg", 1);
    drawContext.clearRect(0, 0, width, height);
    client.send(data);
  };

  const displayOutput = (
    imageSrc: string,
    resultContext: CanvasRenderingContext2D | null,
    width: number,
    height: number
  ) => {
    const image = new Image();
    image.onload = () => {
      if (!resultContext) return;
      resultContext.drawImage(
        image,
        0,
        0,
        width,
        height,
        0,
        0,
        FRAME_WIDTH,
        FRAME_WIDTH * (height / width)
      );
    };
    image.src = imageSrc;
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
          <canvas ref={resultCanvasRef} hidden={!isUploading}></canvas>
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
