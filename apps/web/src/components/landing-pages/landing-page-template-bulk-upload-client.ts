/** Match the bulk API limit; reserve HTTP/multipart overhead at the proxy. */
export const TEMPLATE_BULK_UPLOAD_MAX_BYTES = 256 * 1024 * 1024;
export function planTemplateBulkUploadBatches<T extends { name: string; size: number }>(files: readonly T[]): T[][] {
  const batches: T[][] = [];
  let batch: T[] = [], bytes = 0;
  for (const file of files) {
    if (file.size > TEMPLATE_BULK_UPLOAD_MAX_BYTES) throw new Error(`File "${file.name}" có dung lượng ${(file.size / 1048576).toFixed(1)} MiB, vượt mức 256 MiB cho ZIP tổng. Chọn file nhỏ hơn hoặc chia bộ mẫu thành nhiều ZIP.`);
    if (batch.length && (bytes + file.size > TEMPLATE_BULK_UPLOAD_MAX_BYTES || batch.length === 300)) {
      batches.push(batch); batch = []; bytes = 0;
    }
    batch.push(file); bytes += file.size;
  }
  if (batch.length) batches.push(batch);
  return batches;
}
