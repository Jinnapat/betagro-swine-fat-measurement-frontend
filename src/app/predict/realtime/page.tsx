"use client";

import PredictionLayout from "@/components/PredictionLayout";
import SquareIconButton from "@/components/SquareIconButton";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";
import { Model } from "@/types/model";
import { useEffect, useRef, useState } from "react";

const QUALITY = 0.8;

export default function RealtimePredictionPage() {
  const [camOpened, setCamOpened] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | undefined>(
    undefined
  );
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(
    undefined
  );

  const encoder = new TextEncoder()

  const intervalRef = useRef<NodeJS.Timeout>();
  const showImage = useRef<HTMLImageElement>(null);
  const clientRef = useRef<WebSocket>();

  const userStore = useStore(useUserStore, (state) => state);

  useEffect(() => {
    if (!videoStream || !userStore || !selectedModel) return;

    const settings = videoStream.getTracks()[0].getSettings();
    const width = settings.width as number;
    const height = settings.height as number;

    const drawCanvas = document.createElement("canvas");
    const drawContext = drawCanvas.getContext("2d");

    drawCanvas.width = width;
    drawCanvas.height = height;

    const task_name = `Webcam prediction on ${new Date().toLocaleDateString()}`
    const client = new WebSocket(
      `${process.env.NEXT_PUBLIC_BACKEND_WS_ROOT}/rt/${selectedModel.name}?access_token=${userStore.accessToken}&task_name=${task_name}`
    );
    clientRef.current = client;

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
        console.log(dataJson)
        displayOutput(dataJson.img as string);
      }
    });
  }, [videoStream]);

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
    if (clientRef.current) {
      clientRef.current.send(encoder.encode("q"));
      clientRef.current.close();
      clientRef.current = undefined;
    }
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
          {camOpened && <img ref={showImage} className="w-[600px]"></img>
          }
        </div>
      </div>
    </PredictionLayout>
  );
}
