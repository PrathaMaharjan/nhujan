import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
  secure: true,
});

/**
 * Delete a single resource from Cloudinary by its public ID.
 */
export async function deleteCloudinaryResource(
  publicId: string | null | undefined,
  resourceType: "image" | "video" | "raw" = "image"
) {
  if (!publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.error(`Failed to delete Cloudinary resource [${publicId}]:`, error);
    return null;
  }
}

/**
 * Delete multiple resources from Cloudinary by their public IDs.
 */
export async function deleteCloudinaryResources(
  publicIds: (string | null | undefined)[],
  resourceType: "image" | "video" | "raw" = "image"
) {
  const validIds = publicIds.filter((id): id is string => Boolean(id && id.trim()));
  if (validIds.length === 0) return null;
  try {
    const result = await cloudinary.api.delete_resources(validIds, {
      resource_type: resourceType,
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.error(`Failed to bulk delete Cloudinary resources:`, error);
    return null;
  }
}

export { cloudinary };
