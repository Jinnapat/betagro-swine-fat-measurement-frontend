"use client";

import PageLoading from "@/components/PageLoading";
import UserAuthorizationGuard from "@/components/UnauthorizedUserGuard";
import { useStore } from "@/store/useStore";
import { useUserStore } from "@/store/userStore";
import Link from "next/link";
import { useEffect, useState } from "react";

export type Task = {
  tid: string;
  name: string;
  uid: string;
  m_name: string;
  create_at: string;
  start_time: string | null;
  finish_time: string | null;
  task_type: string;
  status: string;
  number_of_input: number;
  processed: number;
  input_list: {
    index: number;
    source_ref: string;
  }[];
};

export default function ResultPage() {
  const userStore = useStore(useUserStore, (state) => state);
  const [isGettingTasks, setIsGettingTasks] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const accessToken = userStore?.accessToken;

  useEffect(() => {
    if (!accessToken || !userStore) return;
    const getTasks = async () => {
      const getTasksResult = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_ROOT}/tasks?page=1&size=64&desc=false`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (getTasksResult.status === 401) {
        userStore.setAccessToken("");
        return;
      }
      if (getTasksResult.status !== 200) {
        setErrorMessage("Cannot get task list");
        setIsGettingTasks(false);
        return;
      }
      const jsonBody = await getTasksResult.json();
      setTasks(jsonBody["tasks"]);
      setIsGettingTasks(false);
    };
    getTasks();
  }, [accessToken, userStore]);

  return (
    <UserAuthorizationGuard needAuthorized={true} needUnauthorized={false}>
      <>
        <>{isGettingTasks && <PageLoading />}</>
        <>
          {!isGettingTasks && (
            <div className="pl-20 py-5 w-full">
              <div className="flex flex-col bg-gray-100 h-full rounded-l-2xl">
                <div className="bg-purple-700 text-white p-3 pl-12 rounded-l-2xl">
                  Task List
                </div>
                <div className="h-full p-4">
                  <TaskList tasks={tasks} />
                </div>
              </div>
            </div>
          )}
        </>
      </>
    </UserAuthorizationGuard>
  );
}

const TaskList = ({ tasks }: { tasks: Task[] }) => {
  return (
    <table className="table-auto text-center w-full bg-white">
      <thead>
        <tr>
          <th className="border border-purple-600 p-2 w-3/6">Name</th>
          <th className="border border-purple-600 p-2 w-1/6">Type</th>
          <th className="border border-purple-600 p-2 w-1/6">Create At</th>
          <th className="border border-purple-600 p-2 w-1/6">Status</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.tid} className="border border-purple-600">
            <td className="border border-purple-600 hover:text-yellow-700 transition-color duration-300 p-2">
              <Link href={`/result/${task.tid}`}>{task.name}</Link>
            </td>
            <td className="border border-purple-600 p-2">{task.task_type}</td>
            <td className="border border-purple-600 p-2">{task.create_at}</td>
            <td className="border border-purple-600 p-2">{task.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
