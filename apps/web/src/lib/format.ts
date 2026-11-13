export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** 1000000 → 1.000.000đ */
export function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))}đ`;
}

/** Ngày ngắn trên thẻ công việc: `12 thg 11` */
export function formatWorkCardDay(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} thg ${d.getMonth() + 1}`;
}

/** Khoảng ngày bắt đầu – hạn trên thẻ Kanban */
export function formatWorkTaskDateRange(
  start?: string | null,
  deadline?: string | null,
): string | null {
  if (start && deadline) return `${formatWorkCardDay(start)} - ${formatWorkCardDay(deadline)}`;
  if (deadline) return formatWorkCardDay(deadline);
  if (start) return `Từ ${formatWorkCardDay(start)}`;
  return null;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function formatCredit(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 2,
  }).format(amount);
}
