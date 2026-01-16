"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearSession, getSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [session] = useState(getSession());

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [router, session]);

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">控制台</h1>
            <p className="text-sm text-gray-500">当前角色：{session.role}</p>
          </div>
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => {
              clearSession();
              router.push("/login");
            }}
          >
            退出登录
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link className="rounded-lg border bg-white p-4 hover:shadow" href="/admin">
            管理员入口
          </Link>
          <Link className="rounded-lg border bg-white p-4 hover:shadow" href="/coach">
            班主任入口
          </Link>
          <Link className="rounded-lg border bg-white p-4 hover:shadow" href="/student">
            学生入口
          </Link>
        </div>
      </div>
    </div>
  );
}
