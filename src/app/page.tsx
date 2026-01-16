import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl rounded-xl border bg-white p-8">
        <h1 className="text-2xl font-semibold">职达教育 · 央国企求职 SaaS</h1>
        <p className="mt-2 text-sm text-gray-600">
          M0：登录/权限骨架 + 文档 SSOT + Postgres 接入占位
        </p>
        <div className="mt-6 flex gap-3">
          <Link className="rounded-md bg-black px-4 py-2 text-white" href="/login">
            进入登录
          </Link>
          <Link className="rounded-md border px-4 py-2" href="/dashboard">
            控制台
          </Link>
        </div>
      </div>
    </div>
  );
}
