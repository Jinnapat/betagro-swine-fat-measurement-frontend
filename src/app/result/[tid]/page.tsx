"use client";

import PageLoading from "@/components/PageLoading";
import UserAuthorizationGuard from "@/components/UnauthorizedUserGuard";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";
import Image from "next/image";
import { formatDate } from "@/helper/formatDate";

type PredictionResult = {
  tid: string;
  outputs: {
    p1: {
      center_x: number | null;
      center_y: number | null;
      width: number | null;
      height: number | null;
      predict: number | null;
    };
    p2: {
      center_x: number | null;
      center_y: number | null;
      width: number | null;
      height: number | null;
      predict: number | null;
    };
    input_file: string;
    output_file: string;
  }[];
  name: string;
  uid: string;
  m_name: string;
  create_at: string;
  start_time: string;
  finish_time: string;
  task_type: string;
  status: string;
  number_of_input: number;
  processed: number;
};

export default function ResultInfoPage({
  params,
}: {
  params: { tid: string };
}) {
  const userStore = useStore(useUserStore, (state) => state);
  const [isGettingResult, setIsGettingResult] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);

  useEffect(() => {
    if (!userStore) return;
    if (!userStore.accessToken) return;
    const getTaskInfo = async () => {
      const getTaskInfoResult = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_ROOT}/results/${params.tid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userStore.accessToken}`,
          },
        }
      );
      console.log(getTaskInfoResult);
      if (getTaskInfoResult.status === 401) {
        userStore.setAccessToken("");
        return;
      }
      if (getTaskInfoResult.status !== 200) {
        setErrorMessage("Cannot get task list");
        setIsGettingResult(false);
        return;
      }
      const jsonBody = await getTaskInfoResult.json();
      setPredictionResult(jsonBody);
      setIsGettingResult(false);
    };
    getTaskInfo();
  }, [userStore, params.tid]);

  return (
    <UserAuthorizationGuard needAuthorized={true} needUnauthorized={false}>
      <>
        <>{isGettingResult && <PageLoading />}</>
        <>
          {!isGettingResult && predictionResult && (
            <div className="pl-20 py-5 w-full">
              <div className="flex flex-col bg-gray-100 h-full rounded-l-2xl">
                <TaskHead predictionResult={predictionResult} />
                <div className="bg-purple-700 text-white p-3 pl-12 rounded-l-2xl">
                  Result
                </div>
                <div className="h-full p-4">
                  <TaskInfoZone predictionResult={predictionResult} />
                </div>
              </div>
            </div>
          )}
        </>
      </>
    </UserAuthorizationGuard>
  );
}

function TaskInfoZone({
  predictionResult,
}: {
  predictionResult: PredictionResult;
}) {
  return (
    <table className="table-auto text-center w-full bg-white">
      <thead>
        <tr>
          <th className="border border-purple-600 p-2 w-3/6">Image</th>
          <th className="border border-purple-600 p-2 w-1/6">Filename</th>
          <th className="border border-purple-600 p-2 w-1/6">PF1 (cm)</th>
          <th className="border border-purple-600 p-2 w-1/6">PF2 (cm)</th>
        </tr>
      </thead>
      <tbody>
        {predictionResult.outputs.map((output) => (
          <tr key={output.input_file} className="border border-purple-600">
            <td className="flex flex-col items-center">
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_API_ROOT}/images/output/${predictionResult.tid}/${output.output_file}`}
                alt="output image"
                width={300}
                height={300}
              />
            </td>
            <td className="border border-purple-600">{output.input_file}</td>
            <td className="border border-purple-600">{output.p1.predict}</td>
            <td className="border border-purple-600">{output.p2.predict}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TaskHead({
  predictionResult,
}: {
  predictionResult: PredictionResult;
}) {
  return (
    <div className="pl-8 py-5">
      <div className="rounded-l-lg bg-gray-200 p-4 flex flex-row justify-between px-10">
        <div className="flex flex-col items-center">
          <b>Name</b>
          <p>{predictionResult.name}</p>
        </div>
        <div className="flex flex-col items-center">
          <b>Type</b>
          <p>{predictionResult.task_type}</p>
        </div>
        <div className="flex flex-col items-center">
          <b>Model name</b>
          <p>{predictionResult.m_name}</p>
        </div>
        <div className="flex flex-col items-center">
          <b>Total image</b>
          <p>{predictionResult.processed}</p>
        </div>
        <div className="flex flex-col items-center">
          <b>Created at</b>
          <p>{formatDate(predictionResult.create_at)}</p>
        </div>
        <div className="flex flex-col items-center">
          <b>Start at</b>
          <p>{formatDate(predictionResult.start_time)}</p>
        </div>
        <div className="flex flex-col items-center">
          <b>Finished at</b>
          <p>{formatDate(predictionResult.finish_time)}</p>
        </div>
      </div>
    </div>
  );
}
