"use client";

import { Dropdown, Item } from "@/components/Dropdown";
import PredictionLayout from "@/components/PredictionLayout";
import SquareIconButton from "@/components/SquareIconButton";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";
import { Model } from "@/types/model";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const QUALITY = 0.8;

type Camera = {
  name: string;
  username: string;
  host: string;
  port: number;
  path: string;
};

type GetCameraResponse = {
  page_number: number;
  page_size: number;
  last_page: number;
  count: number;
  cameras: Camera[];
};

export default function RealtimePredictionPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [camOpened, setCamOpened] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | undefined>(
    undefined
  );
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(
    undefined
  );
  const [listOfCameras, setListOfCameras] = useState<Item[] | undefined>(
    undefined
  );
  const [selectedCamera, setSelectedCamera] = useState<Item | undefined>(
    undefined
  );

  const encoder = new TextEncoder();

  const intervalRef = useRef<NodeJS.Timeout>();
  const showImage = useRef<HTMLImageElement>(null);
  const clientRef = useRef<WebSocket>();

  const userStore = useStore(useUserStore, (state) => state);
  const access_token = userStore?.accessToken;

  const sendFrame = (
    client: WebSocket,
    octx: CanvasRenderingContext2D | null,
    oc: HTMLCanvasElement
  ) => {
    if (!oc || !videoRef.current || !octx) return;
    octx.drawImage(videoRef.current, 0, 0, 972, 1296);
    var dataURL = oc.toDataURL("image/jpeg", QUALITY);
    var binary = atob(dataURL.split(",")[1]);
    var length = binary.length;
    var bytes = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    client.send(bytes);
  };

  const displayOutput = (imageSrc: string) => {
    setIsLoading(false);
    if (!showImage.current) return;
    showImage.current.src = imageSrc;
  };

  const openLocalWebcam = async () => {
    setCamOpened(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setVideoStream(stream);
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play();

    if (!userStore || !selectedModel) return;

    const settings = stream.getTracks()[0].getSettings();
    const width = 972;
    const height = 1296;

    const drawCanvas = document.createElement("canvas");
    const drawContext = drawCanvas.getContext("2d");

    drawCanvas.width = width;
    drawCanvas.height = height;

    const task_name = `Webcam prediction on ${new Date().toLocaleDateString()}`;
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
        displayOutput(dataJson.img as string);
      }
    });
  };

  const closeLocalWebcam = () => {
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

  const openRemoteCamera = () => {
    setCamOpened(true);
    if (!selectedCamera || !selectedModel || !userStore) return;
    const task_name = `Camera prediction on ${new Date().toLocaleDateString()}`;
    const client = new WebSocket(
      `${process.env.NEXT_PUBLIC_BACKEND_WS_ROOT}/rt-cam/${selectedCamera.name}/${selectedModel.name}?access_token=${userStore.accessToken}&task_name=${task_name}`
    );
    clientRef.current = client;

    client.addEventListener("open", () => {
      client.send(encoder.encode("start"));
    });

    client.addEventListener("message", (ev) => {
      const dataJson = JSON.parse(ev.data);
      if (dataJson.img) {
        displayOutput(dataJson.img as string);
      }
    });
  };

  const closeRemoteCamera = () => {
    if (clientRef.current) {
      clientRef.current.send(encoder.encode("q"));
      clientRef.current.close();
      clientRef.current = undefined;
    }
    setCamOpened(false);
  };

  useEffect(() => {
    if (!access_token) return;
    const getAllCameras = async () => {
      const getAllCamerasResult = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_ROOT}/cameras?page=1&size=26`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      if (getAllCamerasResult.status == 401) {
        userStore.setAccessToken("");
        location.reload();
        throw new Error("No session");
      }
      const jsonResponse: GetCameraResponse = await getAllCamerasResult.json();
      setListOfCameras([...jsonResponse.cameras, { name: "Local webcam" }]);
    };
    getAllCameras();
  }, [access_token, userStore]);

  const openCamera = () => {
    setIsLoading(true);
    if (selectedCamera?.name === "Local webcam") {
      openLocalWebcam();
    } else {
      openRemoteCamera();
    }
  };

  const closeCamera = () => {
    if (selectedCamera?.name === "Local webcam") {
      closeLocalWebcam();
    } else {
      closeRemoteCamera();
    }
  };

  return (
    <PredictionLayout
      inputDescriptionText="Results"
      onStartHandler={openCamera}
      onStopHandler={closeCamera}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      startButtonDisabled={!selectedModel || camOpened || !selectedCamera}
      stopButtonDisabled={!camOpened}
      customDropdown={
        <Dropdown
          listOfItems={listOfCameras}
          selected={selectedCamera}
          setSelected={setSelectedCamera}
          label="Camera"
        />
      }
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
          {camOpened && isLoading && (
            <Image
              src="/loading.png"
              width={80}
              height={80}
              alt="loading"
              className="absolute z-10 animate-spin"
            />
          )}
          {camOpened && !isLoading && (
            <img ref={showImage} className="w-[600px]"></img>
          )}
        </div>
      </div>
    </PredictionLayout>
  );
}
