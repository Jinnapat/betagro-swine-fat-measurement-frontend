"use client";

import PredictionLayout from "@/components/PredictionLayout";
import SquareIconButton from "@/components/SquareIconButton";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";
import { Model } from "@/types/model";
import { useRef, useState } from "react";

export default function CameraPredictionPage() {
    const [camOpened, setCamOpened] = useState<boolean>(false);
    const [selectedModel, setSelectedModel] = useState<Model | undefined>(
        undefined
    );
    const encoder = new TextEncoder()

    const camera_name = "dahua123"

    const showImage = useRef<HTMLImageElement>(null);
    const clientRef = useRef<WebSocket>();

    const userStore = useStore(useUserStore, (state) => state);

    const openCamera = () => {
        if (!userStore || !selectedModel) return;
        setCamOpened(true);

        const task_name = `Camera prediction on ${new Date().toLocaleDateString()}`
        const client = new WebSocket(
            `${process.env.NEXT_PUBLIC_BACKEND_WS_ROOT}/rt-cam/${camera_name}/${selectedModel.name}?access_token=${userStore.accessToken}&task_name=${task_name}`
        );

        clientRef.current = client;

        client.addEventListener("open", () => {
            client.send(encoder.encode("start"));
        });

        client.addEventListener("message", (ev) => {
            const dataJson = JSON.parse(ev.data);
            if (dataJson.img) {
                console.log(dataJson)
                displayOutput(dataJson.img as string);
            }
        });
    }

    const displayOutput = (
        imageSrc: string,
    ) => {
        if (!showImage.current) return;
        showImage.current.src = imageSrc;
    };

    const closeCamera = () => {
        if (clientRef.current) {
            clientRef.current.send(encoder.encode("q"));
            clientRef.current.close();
            clientRef.current = undefined;
        }
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
                    {camOpened && <img ref={showImage} className="w-[600px]"></img>
                    }
                </div>
            </div>
        </PredictionLayout>
    );
}
