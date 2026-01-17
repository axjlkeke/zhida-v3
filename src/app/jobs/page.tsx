"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildApiUrl, fetchApiJson } from "@/lib/api";
import { getDataMode } from "@/lib/dataMode";

type HitReason = {
  query: string;
  expanded: string[];
  hitToken: string;
  rule: string;
};

type JobItem = {
  id?: number;
  company: string;
  title: string;
  city?: string | null;
  degree?: string | null;
  major?: string | null;
  apply_end?: string | null;
  status?: string | null;
  hitReasons?: Record<string, HitReason>;
};

type JobsResponse = {
  data: JobItem[];
  total: number;
  page: number;
  page_size: number;
};

const normalizeJobs = (resp: unknown): JobItem[] => {
  if (Array.isArray(resp)) {
    return resp as JobItem[];
  }
  if (resp && typeof resp === "object") {
    const candidate = resp as { data?: unknown; items?: unknown };
    if (Array.isArray(candidate.data)) {
      return candidate.data as JobItem[];
    }
    if (Array.isArray(candidate.items)) {
      return candidate.items as JobItem[];
    }
  }
  return [];
};

const DEFAULT_FORM = {
  company: "",
  title: "",
  major: "",
  degree: "",
  city: "",
  job_type: "",
  include_reasons: true,
  include_expired: false,
};

export default function JobsPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [items, setItems] = useState<JobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataMode = useMemo(() => getDataMode(), []);
  const { mode, source } = dataMode;
  const [mockLoaded, setMockLoaded] = useState(false);
  const [mockRows, setMockRows] = useState(0);
  const [mockSource] = useState("/mock/jobs_search.json");

  const query = useMemo(() => {
    return {
      company: form.company || undefined,
      title: form.title || undefined,
      major: form.major || undefined,
      degree: form.degree || undefined,
      city: form.city || undefined,
      job_type: form.job_type || undefined,
      include_reasons: form.include_reasons ? "1" : undefined,
      include_expired: form.include_expired ? "1" : undefined,
      page: "1",
      page_size: "20",
    };
  }, [form]);

  const banner = mode === "mock" ? (
    <div className="rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800">
      Mock Mode (mode=mock, source={source})：展示样例数据，导出已禁用。
      <div className="mt-1 text-xs text-yellow-700">
        mock_loaded: {mockLoaded ? "true" : "false"} · mock_rows: {mockRows} · mock_source: {mockSource}
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
      const mockRes = await fetch(mockSource);
      const mockJson = (await mockRes.json()) as unknown;
      const normalized = normalizeJobs(mockJson);
      const totalFromPayload =
        typeof (mockJson as { total?: unknown })?.total === "number"
          ? (mockJson as { total: number }).total
          : normalized.length;
      setItems(normalized);
      setTotal(totalFromPayload);
      setMockLoaded(true);
      setMockRows(normalized.length);
    } catch {
      setMockLoaded(false);
      setMockRows(0);
      setError("无法加载样例数据，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, [mockSource]);

  useEffect(() => {
    if (mode === "mock") {
      loadMock();
    }
  }, [loadMock, mode]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "mock") {
        await loadMock();
        return;
      }
      const data = await fetchApiJson<JobsResponse>("/m1/jobs/search", {
        query,
      });
      setItems(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("无法加载数据，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const exportCsvUrl = buildApiUrl("/m1/jobs/search.csv", query);
  const exportXlsxUrl = buildApiUrl("/m1/jobs/search.xlsx", query);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">岗位搜索</h1>
            <p className="text-sm text-gray-600">软匹配 + 同义词 + 命中解释 + 导出</p>
          </div>
          <Link className="text-sm text-blue-600" href="/">
            返回首页
          </Link>
        </header>

        {banner}

        <div className="rounded-xl border bg-white p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {([
              { key: "company", label: "公司" },
              { key: "title", label: "岗位" },
              { key: "major", label: "专业" },
              { key: "degree", label: "学历" },
              { key: "city", label: "城市" },
              { key: "job_type", label: "岗位类型" },
            ] as const).map((field) => (
              <label key={field.key} className="flex flex-col gap-1 text-sm">
                {field.label}
                <input
                  className="rounded-md border px-3 py-2"
                  value={form[field.key]}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                />
              </label>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.include_reasons}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, include_reasons: event.target.checked }))
                }
              />
              include_reasons
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.include_expired}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, include_expired: event.target.checked }))
                }
              />
              include_expired
            </label>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "搜索中..." : "搜索"}
            </button>
            <button
              className="rounded-md border px-4 py-2 disabled:opacity-50"
              onClick={() => window.open(exportCsvUrl, "_blank")}
              disabled={mode === "mock"}
            >
              导出 CSV
            </button>
            <button
              className="rounded-md border px-4 py-2 disabled:opacity-50"
              onClick={() => window.open(exportXlsxUrl, "_blank")}
              disabled={mode === "mock"}
            >
              导出 XLSX
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">搜索结果</h2>
            <span className="text-sm text-gray-500">共 {total} 条</span>
          </div>
          <div className="mt-4 space-y-4">
            {items.length === 0 ? (
              <p className="text-sm text-gray-500">暂无数据</p>
            ) : (
              items.map((job) => (
                <div key={job.id ?? `${job.company}-${job.title}`} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold">
                        {job.title} · {job.company}
                      </div>
                      <div className="text-sm text-gray-600">
                        {job.city ?? "-"} · {job.degree ?? "-"} · {job.major ?? "-"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      截止：{job.apply_end ?? "-"} · 状态：{job.status ?? "-"}
                    </div>
                  </div>
                  {job.hitReasons && Object.keys(job.hitReasons).length > 0 ? (
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer text-blue-600">查看命中解释</summary>
                      <div className="mt-2 space-y-2">
                        {Object.entries(job.hitReasons).map(([key, reason]) => (
                          <div key={key} className="rounded-md bg-gray-50 p-2">
                            <div className="font-medium">{key}</div>
                            <div className="text-gray-600">命中词：{reason.hitToken}</div>
                            <div className="text-gray-600">规则：{reason.rule}</div>
                            <div className="text-gray-600">扩展：{reason.expanded?.join("、")}</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">无命中解释</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
