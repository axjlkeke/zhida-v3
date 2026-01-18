"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildApiUrl, fetchApiJson } from "@/lib/api";
import { getDataMode } from "@/lib/dataMode";
import matchMockPayload from "../../../public/mock/m2_match.json";

type MatchItem = {
  student_id: number;
  job_id: number;
  company?: string | null;
  title?: string | null;
  city?: string | null;
  total_score: number;
  score_breakdown?: Record<string, number>;
  reasons?: Record<string, unknown>;
  rule_version?: string;
};

type MatchResponse = {
  run_id: string;
  rule_version: string;
  items: MatchItem[];
};

const normalizeMatches = (resp: unknown): MatchItem[] => {
  if (Array.isArray(resp)) {
    return resp as MatchItem[];
  }
  if (resp && typeof resp === "object") {
    const candidate = resp as { data?: unknown; items?: unknown };
    if (Array.isArray(candidate.data)) {
      return candidate.data as MatchItem[];
    }
    if (Array.isArray(candidate.items)) {
      return candidate.items as MatchItem[];
    }
  }
  return [];
};

export default function MatchPage() {
  const [studentId, setStudentId] = useState("1");
  const [items, setItems] = useState<MatchItem[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataMode = useMemo(() => getDataMode(), []);
  const { mode, source } = dataMode;
  const [mockLoaded, setMockLoaded] = useState(false);
  const [mockRows, setMockRows] = useState(0);
  const [mockRawType, setMockRawType] = useState("unknown");
  const [mockRawLen, setMockRawLen] = useState(0);
  const [mockRenderedLen, setMockRenderedLen] = useState(0);
  const [mockSource] = useState("/mock/m2_match.json");

  const banner = mode === "mock" ? (
    <div className="rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800">
      Mock Mode (mode=mock, source={source})：展示样例数据，导出已禁用。
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
      const normalized = normalizeMatches(mockJson);
      const runIdFromPayload =
        typeof (mockJson as { run_id?: unknown })?.run_id === "string"
          ? (mockJson as { run_id: string }).run_id
          : null;
      const rawType = Array.isArray(mockJson) ? "array" : mockJson ? "object" : "unknown";
      const rawLen = Array.isArray(mockJson)
        ? mockJson.length
        : Array.isArray((mockJson as { data?: unknown })?.data)
          ? ((mockJson as { data: unknown[] }).data ?? []).length
          : Array.isArray((mockJson as { items?: unknown })?.items)
            ? ((mockJson as { items: unknown[] }).items ?? []).length
            : 0;
      setItems(normalized);
      setRunId(runIdFromPayload);
      setMockLoaded(true);
      setMockRows(normalized.length);
      setMockRawType(rawType);
      setMockRawLen(rawLen);
      setMockRenderedLen(normalized.length);
    } catch {
      const fallback = matchMockPayload as unknown;
      const normalized = normalizeMatches(fallback);
      const runIdFromPayload =
        typeof (fallback as { run_id?: unknown })?.run_id === "string"
          ? (fallback as { run_id: string }).run_id
          : null;
      const rawType = Array.isArray(fallback) ? "array" : fallback ? "object" : "unknown";
      const rawLen = Array.isArray(fallback)
        ? fallback.length
        : Array.isArray((fallback as { data?: unknown })?.data)
          ? ((fallback as { data: unknown[] }).data ?? []).length
          : Array.isArray((fallback as { items?: unknown })?.items)
            ? ((fallback as { items: unknown[] }).items ?? []).length
            : 0;
      setItems(normalized);
      setRunId(runIdFromPayload);
      setMockLoaded(true);
      setMockRows(normalized.length);
      setMockRawType(rawType);
      setMockRawLen(rawLen);
      setMockRenderedLen(normalized.length);
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

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "mock") {
        await loadMock();
        return;
      }
      const payload = {
        studentIds: [Number(studentId)],
        limitPerStudent: 50,
      };
      const data = await fetchApiJson<MatchResponse>("/m2/match/run", {
        init: {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      });
      setItems(data.items ?? []);
      setRunId(data.run_id ?? null);
    } catch {
      setError("运行失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const exportUrl = buildApiUrl("/m2/export/matches.xlsx", {
    student_id: studentId,
    top: 50,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">匹配结果</h1>
            <p className="text-sm text-gray-600">选择 student_id 跑 top50 并导出</p>
          </div>
          <Link className="text-sm text-blue-600" href="/">
            返回首页
          </Link>
        </header>

        {banner}

        <div className="rounded-xl border bg-white p-6">
          <label className="flex flex-col gap-1 text-sm">
            student_id
            <input
              className="rounded-md border px-3 py-2"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
            />
          </label>
          <div className="mt-4 flex gap-3">
            <button
              className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
              onClick={handleRun}
              disabled={loading}
            >
              {loading ? "运行中..." : "运行匹配"}
            </button>
            <button
              className="rounded-md border px-4 py-2 disabled:opacity-50"
              onClick={() => window.open(exportUrl, "_blank")}
              disabled={mode === "mock"}
            >
              导出 XLSX
            </button>
          </div>
          {runId && <p className="mt-3 text-sm text-gray-600">run_id: {runId}</p>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Top 50 结果</h2>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">暂无结果</p>
          ) : (
            <div className="mt-4 space-y-3">
              {items.map((item, index) => (
                <div key={`${item.job_id}-${index}`} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold">
                        {item.title ?? "-"} · {item.company ?? "-"}
                      </div>
                      <div className="text-sm text-gray-600">
                        job_id: {item.job_id} · {item.city ?? "-"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">total_score: {item.total_score}</div>
                  </div>
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer text-blue-600">详情</summary>
                    <div className="mt-2 space-y-2 text-gray-600">
                      <div>score_breakdown: {JSON.stringify(item.score_breakdown ?? {})}</div>
                      <div>reasons_json: {JSON.stringify(item.reasons ?? {})}</div>
                      <div>rule_version: {item.rule_version ?? "-"}</div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
