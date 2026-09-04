const cloudflarePreviewUrl = "https://nhujandongol.com.np/showreel_preview.mp4";
const cloudflareShowreelUrl = "https://nhujandongol.com.np/EditorsShowreel.mp4";

const isUsableMediaUrl = (value: string | undefined) =>
  Boolean(value && !value.includes(".private.blob.vercel-storage.com"));

export const showreelPreviewUrl = isUsableMediaUrl(
  process.env.NEXT_PUBLIC_SHOWREEL_PREVIEW_URL,
)
  ? process.env.NEXT_PUBLIC_SHOWREEL_PREVIEW_URL!
  : cloudflarePreviewUrl;

export const showreelUrl = isUsableMediaUrl(
  process.env.NEXT_PUBLIC_SHOWREEL_URL,
)
  ? process.env.NEXT_PUBLIC_SHOWREEL_URL!
  : cloudflareShowreelUrl;

export const showreelPreviewIsImage =
  /\.(?:gif|webp|png|jpe?g)(?:$|[?#])/i.test(showreelPreviewUrl);
