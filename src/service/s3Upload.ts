import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mime from "mime-types";
// import { bucketName, s3Client, s3Url } from "@/config/aws.config";

const credential = {
	accessKeyId: process.env.AWS_ACCESS_KEY_ID || "your-aws-access-key-here",
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "your-aws-secret-key-here",
};

export const s3Client = new S3Client({
	region: "ap-south-1",
	credentials: credential,
});


export const uploadFileToS3Service = async (
  key: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string | null> => {
  // Basic validation and helpful logging for common misconfiguration
  if (!fileBuffer) {
    console.error("S3 upload: no fileBuffer provided.");
    return null;
  }

  const ext = mime.extension(mimeType) || "bin";
  const keyName = `${key}/${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: "ingents",
    Key: keyName,
    Body: fileBuffer,
    ACL: "public-read",
    ContentType: mimeType,
  });

  try {
    // Log minimal context to help debugging but avoid leaking secrets
    console.log(`S3 upload: bucket=ingents key=${keyName} contentType=${mimeType}`);
    const response = await s3Client.send(command);
    console.log("S3 upload response metadata:", response?.$metadata || response);
    if (response) {
      // Prefer provided s3Url, otherwise build standard S3 URL
      const base = "https://ingents.s3.ap-south-1.amazonaws.com";
      const url = `${base}/${keyName}`;
      console.log("S3 uploaded file URL:", url);
      return url;
    }
    console.error("S3 upload: empty response from s3Client.send");
    return null;
  } catch (err) {
    // Provide extra hints for common errors
    const hasCreds = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    console.error("S3 upload failed:", err, {
      bucket: "ingents",
      
    });
    return null;
  }
};

export default uploadFileToS3Service;
