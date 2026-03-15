import { NextRequest, NextResponse } from "next/server";
import { getUiMessages } from "@/lib/ui-messages.server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale");
  const payload = await getUiMessages(locale);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}