import { NextResponse } from "next/server";

import { api, withAuthHeader } from "@/lib/axios";
import { getSessionToken } from "@/lib/session";
import { API_ENDPOINTS } from "@/utils/constants";

export async function POST(request) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const { data } = await api.post(API_ENDPOINTS.TRANSACTIONS_BULK_DELETE, body, withAuthHeader(token));
    return NextResponse.json(data);
  } catch (err) {
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.message || "Unable to delete transactions";

    return NextResponse.json({ success: false, message }, { status });
  }
}
