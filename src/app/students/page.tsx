"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildApiUrl, fetchJson, getApiTimeoutMs } from "@/lib/api";
import { getDataMode } from "@/lib/dataMode";
import importMockPayload from "../../../public/mock/m2_import.json";

type ImportResult = {
  ok: boolean;
  inserted: number;
  failed: number;
  errors: string[];
};

const normalizeImport = (resp: unknown): ImportResult => {
  if (resp && typeof resp === "object") {
    const candidate = resp as {
      inserted?: number;
      failed?: number;
      errors?: string[];
      data?: { inserted?: number; failed?: number; errors?: string[] };
    };
    const inserted = candidate.inserted ?? candidate.data?.inserted ?? 0;
    const failed = candidate.failed ?? candidate.data?.failed ?? 0;
    const errors = candidate.errors ?? candidate.data?.errors ?? [];
    return {
      ok: true,
      inserted,
      failed,
      errors,
    };
  }
  return { ok: false, inserted: 0, failed: 0, errors: [] };
};

export default function StudentsPage() {
  const dataMode = useMemo(() => getDataMode(), []);
  const { mode, source } = dataMode;
  const initialMock = mode === "mock" ? normalizeImport(importMockPayload as unknown) : null;
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(initialMock);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockLoaded, setMockLoaded] = useState(mode === "mock");
  const [mockRows, setMockRows] = useState(mode === "mock" ? 1 : 0);
  const [mockRawType, setMockRawType] = useState(mode === "mock" ? "object" : "unknown");
  const [mockRawLen, setMockRawLen] = useState(mode === "mock" ? 1 : 0);
  const [mockRenderedLen, setMockRenderedLen] = useState(mode === "mock" ? 1 : 0);
  const [mockSource] = useState("/mock/m2_import.json");

  const banner = mode === "mock" ? (
    <div className="rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800">
      Mock Mode (mode=mock, source={source})：展示样例数据。
      <div className="mt-1 text-xs text-yellow-700">
        mock_loaded: {mockLoaded ? "true" : "false"} · mock_rows: {mockRows} · mock_source: {mockSource}
    </div>
      <div className="mt-1 text-xs text-yellow-700">
        mock_raw_type: {mockRawType} · mock_len: {mockRawLen} · rendered_len: {mockRenderedLen}
      </div>
    </div>
  ) : (
    <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
      Real API Mode (mode=real, source={source})：已连接后端。
    </div>
  );

  const loadMock = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const mockRes = await fetch(mockSource, { cache: "no-store" });
      const mockJson = (await mockRes.json()) as unknown;
      const normalized = normalizeImport(mockJson);
      setResult(normalized);
      setMockLoaded(true);
      setMockRows(1);
      const rawType = Array.isArray(mockJson) ? "array" : mockJson ? "object" : "unknown";
      const rawLen = Array.isArray(mockJson) ? mockJson.length : mockJson ? 1 : 0;
      setMockRawType(rawType);
      setMockRawLen(rawLen);
      setMockRenderedLen(1);
    } catch {
      const fallback = importMockPayload as unknown;
      const normalized = normalizeImport(fallback);
      const rawType = Array.isArray(fallback) ? "array" : fallback ? "object" : "unknown";
      const rawLen = Array.isArray(fallback) ? fallback.length : fallback ? 1 : 0;
      setResult(normalized);
      setMockLoaded(true);
      setMockRows(1);
      setMockRawType(rawType);
      setMockRawLen(rawLen);
      setMockRenderedLen(1);
      setError("无法从网络获取样例数据，已使用本地 Mock。");
    } finally {
      setLoading(false);
    }
  }, [mockSource]);

  useEffect(() => {
    if (mode === "mock") {
      loadMock();
    }
  }, [loadMock, mode]);

  const handleUpload = async () => {
    if (!file) {
      setError("请先选择文件");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === "mock") {
        await loadMock();
        return;
      }
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
    } catch {
      setError("上传失败，请稍后重试。");
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
