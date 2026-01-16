"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setSession } from "@/lib/auth";

const roles = [
  { value: "admin", label: "管理员" },
  { value: "coach", label: "班主任/教练" },
  { value: "student", label: "学生" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof roles)[number]["value"]>("admin");
  const [name, setName] = useState("");

  const handleLogin = () => {
    setSession({ role, name: name || undefined });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">职达教育 · 登录（M0模拟）</h1>
        <p className="mt-1 text-sm text-gray-500">选择角色进入对应控制台。</p>

        <label className="mt-4 block text-sm font-medium">姓名</label>
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          placeholder="可选"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="mt-4 block text-sm font-medium">角色</label>
        <select
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value as (typeof roles)[number]["value"])}
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleLogin}
          className="mt-6 w-full rounded-md bg-black px-4 py-2 text-white"
        >
          进入系统
        </button>
      </div>
    </div>
  );
}
