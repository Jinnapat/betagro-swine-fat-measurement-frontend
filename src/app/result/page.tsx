"use client";

import Button from "@/components/Button";
import UserAuthorizationGuard from "@/components/UnauthorizedUserGuard";
import { Dispatch, SetStateAction, useState } from "react";

export default function ResultPage() {
  const [startDatetime, setStartDatetime] = useState<string>("");
  const [endDatetime, setEndDatetime] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const validateDatetimes = () => {
    if (Date.parse(startDatetime) >= Date.parse(endDatetime)) {
      setErrorMessage("End date comes before start date.");
      return false;
    }
    return true;
  };

  const downloadResults = () => {
    setErrorMessage("");
    if (!validateDatetimes()) return;
  };

  return (
    <UserAuthorizationGuard needAuthorized={true} needUnauthorized={false}>
      <div className="flex flex-col justify-center items-center p-8">
        <div className="bg-gray-100 rounded-xl w-full p-8 max-w-4xl flex flex-col gap-4 items-center">
          <h1 className="font-bold text-3xl">Download recorded predictions</h1>
          <DatetimeSelector
            text="Start"
            datetimeUpdateHandler={setStartDatetime}
          />
          <DatetimeSelector text="End" datetimeUpdateHandler={setEndDatetime} />
          <Button
            text="Download"
            colorClass="bg-purple-700"
            disabled={startDatetime == "" || endDatetime == ""}
            handler={downloadResults}
          />
          <p className="text-red-700 text-center text-sm">{errorMessage}</p>
        </div>
      </div>
    </UserAuthorizationGuard>
  );
}

function DatetimeSelector({
  text,
  datetimeUpdateHandler,
}: {
  text: string;
  datetimeUpdateHandler: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="flex flex-row bg-gray-200 rounded-lg items-center border-2">
      <label className="w-28 text-center font-bold">{text}</label>
      <input
        className="p-4 rounded-lg w-56"
        type="datetime-local"
        onChange={(e) => datetimeUpdateHandler(e.target.value)}
      />
    </div>
  );
}
