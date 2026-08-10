import { NextResponse } from "next/server";

import { api, withAuthHeader } from "@/lib/axios";
import { getSessionToken } from "@/lib/session";
import { API_ENDPOINTS } from "@/utils/constants";

export async function GET(request) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get("search");
  const status = request.nextUrl.searchParams.get("status");
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  try {
    const { data } = await api.get(API_ENDPOINTS.MEMBERS_BREAKDOWN, {
      ...withAuthHeader(token),
      params: { search, status, from, to },
    });
    return NextResponse.json(data);
  } catch (err) {
    const responseStatus = err?.response?.status || 500;
    const message = err?.response?.data?.message || "Unable to fetch member breakdown";

    return NextResponse.json({ success: false, message }, { status: responseStatus });
  }
}
