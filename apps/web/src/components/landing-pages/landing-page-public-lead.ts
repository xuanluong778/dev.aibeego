/** Decide whether a public lead response may show the success banner. */
export function interpretPublicLeadResponse(
  status: number,
  body: { ok?: boolean; message?: string } | null,
): { ok: boolean; message: string } {
  if (status < 200 || status >= 300 || !body || body.ok === false) {
    return { ok: false, message: body?.message || 'Không gửi được. Thử lại.' };
  }
  return { ok: true, message: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm.' };
}
