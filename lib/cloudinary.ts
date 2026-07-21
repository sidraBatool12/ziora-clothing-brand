import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadedImage { url: string; publicId: string; }

export async function uploadImage(file: string, folder = "ziora/products"): Promise<UploadedImage> {
  const result = await cloudinary.uploader.upload(file, {
    folder, resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}
export async function deleteImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}
export default cloudinary;
