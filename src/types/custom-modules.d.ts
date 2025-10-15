declare module 'dotenv' {
  const config: any;
  export default { config };
}

declare module 'uuid' {
  export function v4(): string;
  const _default: { v4: typeof v4 };
  export default _default;
}

declare module './s3Uploader' {
  export function uploadToS3(filePath: string, key: string): Promise<string>;
}

declare module './s3Uploader.js' {
  export function uploadToS3(filePath: string, key: string): Promise<string>;
}

declare module '*.s3Uploader' {
  const anything: any;
  export default anything;
}

declare module '@/service/s3Uploader' {
  export function uploadToS3(filePath: string, key: string): Promise<string>;
}

declare module 'node-fetch' {
  const fetch: any;
  export default fetch;
}
declare module 'dotenv' {
  const config: any;
  export default { config };
}

declare module 'uuid' {
  export function v4(): string;
  const _default: { v4: typeof v4 };
  export default _default;
}

declare module './s3Uploader' {
  export function uploadToS3(filePath: string, key: string): Promise<string>;
}
