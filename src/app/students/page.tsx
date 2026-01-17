"use client";

import { useState } from "react";
import Link from "next/link";
import { buildApiUrl, fetchJson, getApiTimeoutMs } from "@/lib/api";

type ImportResult = {
  ok: boolean;
  inserted: number;
  failed: number;
  errors: string[];
};

export default function StudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [mode, setMode] = useState<"real" | "mock">("real");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const banner = mode === "mock" ? (
    <div className="rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800">
      Mock Mode：后端不可达，展示样例数据。
    </div>
  ) : (
    <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
      Real API Mode：已连接后端。
    </div>
  );

  const handleUpload = async () => {
    if (!file) {
      setError("请先选择文件");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetchJson<ImportResult>(buildApiUrl("/m2/import/students"), {
        timeoutMs: getApiTimeoutMs(),
        init: {
          method: "POST",
          body: formData,
        },
      });
      if (!response.ok) {
        throw new Error(response.error);
      }
      setResult(response.data);
      setMode("real");
    } catch (err) {
      try {
        const mockRes = await fetch("/mock/m2_import.json");
        const mockJson = (await mockRes.json()) as ImportResult;
        setResult(mockJson);
        setMode("mock");
      } catch {
        setError("上传失败，请稍后重试。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">学生导入</h1>
            <p className="text-sm text-gray-600">上传 students_sample.xlsx/csv 并查看导入结果</p>
          </div>
          <Link className="text-sm text-blue-600" href="/">
            返回首页
          </Link>
        </header>

        {banner}

        <div className="rounded-xl border bg-white p-6">
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <div className="mt-4 flex gap-3">
            <button
              className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "上传中..." : "上传并导入"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">导入结果</h2>
          {result ? (
            <div className="mt-4 space-y-2 text-sm">
              <div>inserted: {result.inserted}</div>
              <div>failed: {result.failed}</div>
              <div>
                errorsPreview: {result.errors?.length ? result.errors.slice(0, 20).join("\n") : "[]"}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">暂无结果</p>
          )}
        </div>
      </div>
    </div>
  );
}
