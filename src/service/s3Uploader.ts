import fs from 'fs';

// Lightweight wrapper: for video generator we expect a function uploadToS3(filePath, key)
// If the project already has an S3 uploader at another path, adapt this to call it.
export async function uploadToS3(filePath: string, key: string): Promise<string> {
  // Simple implementation: prefer existing uploadFileToS3Service if available
  try {
    // dynamic import to avoid circular deps
    const mod = await import('./s3Upload').catch(() => null as any);
    if (mod && typeof mod.uploadFileToS3Service === 'function') {
      const buffer = fs.readFileSync(filePath);
      const mimeType = 'video/mp4';
      const url = await mod.uploadFileToS3Service(key, buffer, mimeType);
      return url;
    }
  } catch (e) {
    console.warn('uploadToS3 delegator failed:', e);
  }

  throw new Error('No S3 upload implementation available');
}
