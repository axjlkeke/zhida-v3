"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

export default function CoachPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.role !== "coach") {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-lg border bg-white p-6">
        <h1 className="text-xl font-semibold">班主任工作台（M0）</h1>
        <p className="mt-2 text-sm text-gray-600">
          这里将展示异常队列、交付清单审核与备注功能。
        </p>
      </div>
    </div>
  );
}
