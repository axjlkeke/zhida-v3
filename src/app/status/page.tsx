"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchJson, type ApiResult } from "@/lib/api";

type HealthResponse = {
  ok: boolean;
  service: string;
  version: string;
  time: string;
};

export default function StatusPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const [result, setResult] = useState<ApiResult<HealthResponse> | null>(null);
  const [loading, setLoading] = useState(false);

  const healthUrl = useMemo(() => {
    if (!apiBaseUrl) return "";
    return `${apiBaseUrl.replace(/\/$/, "")}/health`;
  }, [apiBaseUrl]);

  useEffect(() => {
    let active = true;

    async function runCheck() {
      if (!healthUrl) {
        setResult({
          ok: false,
          status: null,
          error: "NEXT_PUBLIC_API_BASE_URL 未配置",
          durationMs: 0,
        });
        return;
      }

      setLoading(true);
      const response = await fetchJson<HealthResponse>(healthUrl, {
        timeoutMs: 8000,
      });

      if (active) {
        setResult(response);
        setLoading(false);
      }
    }

    runCheck();

    return () => {
      active = false;
    };
  }, [healthUrl]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6 rounded-xl border bg-white p-8">
        <div>
          <h1 className="text-2xl font-semibold">系统联通状态</h1>
          <p className="mt-2 text-sm text-gray-600">
            用于验证前端是否能连通后端健康检查。
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">NEXT_PUBLIC_API_BASE_URL</div>
          <div className="mt-1 break-all text-sm font-medium">
            {apiBaseUrl || "未配置"}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">/health 结果</div>
            {loading ? (
              <span className="text-xs text-gray-500">请求中...</span>
            ) : null}
          </div>

          {result ? (
            result.ok ? (
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <span className="font-medium text-green-600">成功</span>
                  <span className="ml-2 text-gray-500">
                    HTTP {result.status} · {result.durationMs}ms
                  </span>
                </div>
                <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-700">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <span className="font-medium text-red-600">失败</span>
                  <span className="ml-2 text-gray-500">
                    HTTP {result.status ?? "N/A"} · {result.durationMs}ms
                  </span>
                </div>
                <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
                  {result.error}
                </div>
              </div>
            )
          ) : (
            <div className="mt-3 text-sm text-gray-500">尚未请求</div>
          )}
        </div>
      </div>
    </div>
  );
}
