import { apiClient } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import type { CheckInOtpRequest, CheckInQrRequest, CheckInResponse } from "@/types";

export async function checkInOtp(payload: CheckInOtpRequest): Promise<CheckInResponse> {
  const res = await apiClient.post<CheckInResponse>(API.checkin.otp, payload);
  if (res.error || !res.data) throw new Error(res.error || "Check-in failed");
  return res.data;
}

export async function checkInQr(payload: CheckInQrRequest): Promise<CheckInResponse> {
  const res = await apiClient.post<CheckInResponse>(API.checkin.qr, payload);
  if (res.error || !res.data) throw new Error(res.error || "Check-in failed");
  return res.data;
}
