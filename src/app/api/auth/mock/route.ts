import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const role = body.role ?? "student";
  const name = body.name ?? null;
  return Response.json({ ok: true, role, name });
}
