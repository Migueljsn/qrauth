import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCode } from "@/lib/verify";
import { extractCode } from "@/lib/qr";
import { clientIp } from "@/lib/ip";
import { rateLimit } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";

const Body = z.object({ code: z.string().min(6).max(300), token: z.string().max(4096).optional() });
const noStore = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  // bloqueia POST cross-site (CSRF/abuso a partir de outras origens)
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host"))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const ip = await clientIp();
  if (!rateLimit(`verify:${ip}`, 20, 60_000))
    return NextResponse.json({ result: "rate_limited" }, { status: 429, headers: noStore });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  const code = parsed.success ? extractCode(parsed.data.code) : null;
  if (!parsed.success || !code) return NextResponse.json({ result: "not_found" }, { status: 400, headers: noStore });

  if (!(await verifyTurnstile(parsed.data.token, ip)))
    return NextResponse.json({ error: "captcha" }, { status: 403, headers: noStore });

  try {
    const res = await verifyCode(code);
    return NextResponse.json(res, { status: res.result === "rate_limited" ? 429 : 200, headers: noStore });
  } catch {
    return NextResponse.json({ error: "internal" }, { status: 500, headers: noStore });
  }
}
