import { S3Client } from "@aws-sdk/client-s3";

// AWS S3 configuration. Provide these via environment variables in production:
// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME, S3_URL (optional)
export const bucketName = "ingents";
export const s3Url = "https://ingents.s3.ap-south-1.amazonaws.com";

// Prefer environment variables, fallback to placeholder for development
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "your-aws-access-key-here";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "your-aws-secret-key-here";

export const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export default s3Client;
