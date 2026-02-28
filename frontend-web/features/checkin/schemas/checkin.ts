import { z } from "zod";

/** OTP check-in request validation */
export const checkInOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be digits only"),
  consent_given: z.boolean().refine((v) => v === true, { message: "Consent is required for check-in (DPDP Act 2023)" }),
});

export type CheckInOtpInput = z.infer<typeof checkInOtpSchema>;

/** QR check-in request validation */
export const checkInQrSchema = z.object({
  qr_code: z.string().min(1, "QR code is required"),
  consent_given: z.boolean().refine((v) => v === true, { message: "Consent is required for check-in (DPDP Act 2023)" }),
});

export type CheckInQrInput = z.infer<typeof checkInQrSchema>;
