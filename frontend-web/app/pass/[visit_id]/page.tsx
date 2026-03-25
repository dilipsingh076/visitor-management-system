"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface PassData {
  visit_id: string;
  visitor_name: string;
  purpose?: string;
  host_name?: string;
  status: string;
  expected_arrival?: string;
  qr_code?: string;
}

export default function VisitPassPage() {
  const params = useParams();
  const visitId = params.visit_id as string;

  const [pass, setPass] = useState<PassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visitId) return;

    fetch(`${API_BASE_URL}/public/pass/${visitId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.detail || "Failed to load pass");
        }
        return res.json();
      })
      .then((data) => setPass(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load pass")
      )
      .finally(() => setLoading(false));
  }, [visitId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your pass...</p>
        </div>
      </div>
    );
  }

  if (error || !pass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">!</div>
          <h1 className="text-lg font-semibold text-gray-900 mb-1">
            Pass Not Found
          </h1>
          <p className="text-sm text-gray-500">
            {error || "This pass link may be invalid or expired."}
          </p>
        </div>
      </div>
    );
  }

  const isCheckedIn = pass.status === "checked_in";
  const isCheckedOut = pass.status === "checked_out";

  const statusColors: Record<string, string> = {
    approved: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    checked_in: "bg-blue-100 text-blue-800",
    checked_out: "bg-gray-100 text-gray-600",
    rejected: "bg-red-100 text-red-800",
  };
  const statusLabel: Record<string, string> = {
    approved: "Approved",
    pending: "Pending Approval",
    checked_in: "Checked In",
    checked_out: "Completed",
    rejected: "Rejected",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 text-center">
          <h1 className="text-lg font-semibold">Visitor Pass</h1>
          <p className="text-blue-100 text-xs mt-0.5">
            Show this at the gate for entry
          </p>
        </div>

        <div className="p-6">
          {/* Status badge */}
          <div className="flex justify-center mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                statusColors[pass.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {statusLabel[pass.status] || pass.status}
            </span>
          </div>

          {/* Status messages */}
          {isCheckedIn && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-center">
              <p className="text-blue-800 text-sm font-medium">
                Already checked in
              </p>
            </div>
          )}
          {isCheckedOut && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-center">
              <p className="text-gray-600 text-sm font-medium">
                Visit completed
              </p>
            </div>
          )}

          {/* QR Code */}
          {pass.qr_code && !isCheckedOut && (
            <div className="flex flex-col items-center mb-5">
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <QRCodeSVG value={pass.qr_code} size={250} level="M" />
              </div>
              {!isCheckedIn && (
                <p className="text-gray-400 text-xs mt-2">
                  Show this QR code at the gate
                </p>
              )}
            </div>
          )}

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Visitor</span>
              <span className="font-medium text-gray-900">
                {pass.visitor_name}
              </span>
            </div>
            {pass.purpose && (
              <div className="flex justify-between">
                <span className="text-gray-500">Purpose</span>
                <span className="text-gray-900">{pass.purpose}</span>
              </div>
            )}
            {pass.host_name && (
              <div className="flex justify-between">
                <span className="text-gray-500">Host</span>
                <span className="text-gray-900">{pass.host_name}</span>
              </div>
            )}
            {pass.expected_arrival && (
              <div className="flex justify-between">
                <span className="text-gray-500">Expected</span>
                <span className="text-gray-900">
                  {new Date(pass.expected_arrival).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
