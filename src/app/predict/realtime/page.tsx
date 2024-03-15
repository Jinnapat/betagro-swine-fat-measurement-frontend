"use client";

import PredictionLayout from "@/components/PredictionLayout";
import SquareIconButton from "@/components/SquareIconButton";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";
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
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const userStore = useStore(useUserStore, (state) => state);

  useEffect(() => {
    if (!videoStream || !resultCanvasRef.current || !userStore) return;
    const settings = videoStream.getTracks()[0].getSettings();
    const width = settings.width as number;
    const height = settings.height as number;

    const drawCanvas = document.createElement("canvas");
    const drawContext = drawCanvas.getContext("2d");
    const resultContext = resultCanvasRef.current.getContext("2d");

    drawCanvas.width = width;
    drawCanvas.height = height;
    resultCanvasRef.current.width = width;
    resultCanvasRef.current.height = height;

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
      // addNewResult({});
      displayOutput(dataJson.image as string, resultContext);
    });
  }, [videoStream, userStore]);

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
    resultContext: CanvasRenderingContext2D | null
  ) => {
    const image = new Image();
    image.onload = () => {
      if (!resultContext) return;
      resultContext.drawImage(image, 0, 0);
    };
    image.src = imageSrc;
  };

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
        <video ref={videoRef} hidden />
        <div className="flex flex-col justify-center items-center w-7/12 h-full bg-white border border-purple-700">
          {!camOpened && (
            <SquareIconButton
              iconUrl="/capture.png"
              text={!selectedModel ? "Select Model" : "Open Camera"}
              handler={openCamera}
              disabled={!selectedModel}
            />
          )}
          {camOpened && <canvas ref={resultCanvasRef}></canvas>}
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
