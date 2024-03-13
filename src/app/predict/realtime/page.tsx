"use client";

import PredictionLayout from "@/components/PredictionLayout";
import SquareIconButton from "@/components/SquareIconButton";
import { Model } from "@/types/model";
import { useEffect, useRef, useState } from "react";

export default function RealtimePredictionPage() {
  const [camOpened, setCamOpened] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | undefined>(
    undefined
  );
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(
    undefined
  );

  const canvasRef = useRef<HTMLCanvasElement>();
  const ctxRef = useRef<CanvasRenderingContext2D | null>();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvasRef.current = canvas;
    ctxRef.current = context;
  }, []);

  useEffect(() => {
    if (!videoStream) return;
    const settings = videoStream.getTracks()[0].getSettings();
    const width = settings.width as number;
    const height = settings.height as number;

    intervalRef.current = setInterval(() => {
      if (!ctxRef.current || !canvasRef.current || !videoRef.current) return;
      ctxRef.current.drawImage(videoRef.current, 0, 0, width, height);
      var data = canvasRef.current.toDataURL("image/jpeg", 1);
      ctxRef.current.clearRect(0, 0, width, height);
      console.log(data);
    }, 1000);
  }, [videoStream]);

  const openCamera = async () => {
    setCamOpened(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setVideoStream(stream);
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  const closeCamera = () => {
    if (!videoStream) return;
    clearInterval(intervalRef.current);
    videoStream.getTracks().forEach(function (track) {
      track.stop();
    });
    setVideoStream(undefined);
    setCamOpened(false);
  };

  return (
    <PredictionLayout
      inputDescriptionText="Results"
      onStartHandler={openCamera}
      onStopHandler={closeCamera}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      startButtonDisabled={!selectedModel || camOpened}
      stopButtonDisabled={!camOpened}
    >
      <div className="w-full h-full flex flex-row justify-center gap-5 items-center">
        <div className="flex flex-col justify-center items-center w-7/12 h-full bg-white border border-purple-700">
          {!camOpened && (
            <SquareIconButton
              iconUrl="/capture.png"
              text={!selectedModel ? "Select Model" : "Open Camera"}
              handler={openCamera}
              disabled={!selectedModel}
            />
          )}
          {camOpened && <video ref={videoRef} />}
        </div>
        <div className="flex flex-col gap-2">
          <p>Swine no.: 1,209</p>
          <p>PF1 : 3.0 cm</p>
          <p>PF2 : 1.5 cm</p>
          <p>FPS: 25/25</p>
          <p>Timestamp : 31 oct 2023 23:59:59 </p>
        </div>
      </div>
    </PredictionLayout>
  );
}
