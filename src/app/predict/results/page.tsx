"use client";

import PredictionLayout from "@/components/PredictionLayout";
import { Model } from "@/types/model";
import { useState } from "react";
import Image from "next/image";

export default function RealtimePredictionPage() {
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(
    undefined
  );

  const downloadResults = () => {};

  const results = [
    {
      id: "1",
      image: "/pig.jpg",
      filename: "21_10_2023_001.jpg",
      pf1: 3.2,
      pf2: 5.7,
    },
    {
      id: "2",
      image: "/pig.jpg",
      filename: "21_10_2023_002.jpg",
      pf1: 3.1,
      pf2: 5.0,
    },
    {
      id: "3",
      image: "/pig.jpg",
      filename: "21_10_2023_003.jpg",
      pf1: 2.2,
      pf2: 6.2,
    },
    {
      id: "4",
      image: "/pig.jpg",
      filename: "21_10_2023_004.jpg",
      pf1: 1.3,
      pf2: 2.7,
    },
    {
      id: "5",
      image: "/pig.jpg",
      filename: "21_10_2023_005.jpg",
      pf1: 5.7,
      pf2: 8.8,
    },
    {
      id: "6",
      image: "/pig.jpg",
      filename: "21_10_2023_006.jpg",
      pf1: 3.4,
      pf2: 5.7,
    },
    {
      id: "7",
      image: "/pig.jpg",
      filename: "21_10_2023_007.jpg",
      pf1: 2.9,
      pf2: 9.3,
    },
  ];

  return (
    <PredictionLayout
      onStartHandler={downloadResults}
      inputDescriptionText="Results"
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
    >
      <table className="table-auto text-center w-full bg-white">
        <thead>
          <tr>
            <th className="border border-purple-600 p-4">Image</th>
            <th className="border border-purple-600 p-4">Filename</th>
            <th className="border border-purple-600 p-4">PF1</th>
            <th className="border border-purple-600 p-4">PF2</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border border-purple-600">
              <td className="border border-purple-600 relative h-56 w-2/5">
                <Image
                  src={result.image}
                  fill
                  className="object-contain"
                  alt="predicted image"
                />
              </td>
              <td className="border border-purple-600">{result.filename}</td>
              <td className="border border-purple-600">{result.pf1}</td>
              <td className="border border-purple-600">{result.pf2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PredictionLayout>
  );
}
