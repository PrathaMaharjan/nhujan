export const showreelPreviewUrl =
  process.env.NEXT_PUBLIC_SHOWREEL_PREVIEW_URL ||
  "/showreel/showreel_preview.mp4";

export const showreelUrl =
  process.env.NEXT_PUBLIC_SHOWREEL_URL || "/showreel/sample-5s.webm";

export const showreelPreviewIsImage =
  /\.(?:gif|webp|png|jpe?g)(?:$|[?#])/i.test(showreelPreviewUrl);
