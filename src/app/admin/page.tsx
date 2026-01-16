"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.role !== "admin") {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-lg border bg-white p-6">
        <h1 className="text-xl font-semibold">管理员工作台（M0）</h1>
        <p className="mt-2 text-sm text-gray-600">
          这里将放置岗位导入、规则管理、用户与套餐管理入口。
        </p>
      </div>
    </div>
  );
}
