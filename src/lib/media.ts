export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v") ||
    cleanUrl.endsWith(".ogv") ||
    cleanUrl.includes("/video/upload/")
  );
}

export function parseYouTubeId(input?: string | null): string | null {
  if (!input || !input.trim()) return null;
  const str = input.trim();

  // YouTube match: standard watch URL, embed, shorts, youtu.be
  const ytMatch = str.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return ytMatch[1];
  }

  // Pure 11-char YouTube ID (e.g. dQw4w9WgXcQ)
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  return null;
}

export function getOptimizedImageUrl(
  url?: string | null,
  options?: {
    width?: number;
    quality?: number | "auto";
    format?: string;
  }
): string {
  if (!url) return "";
  if (
    !url.includes("res.cloudinary.com") ||
    url.includes("/f_auto") ||
    url.includes("/q_auto")
  ) {
    return url;
  }

  const { width, quality = "auto", format = "auto" } = options || {};
  const transforms: string[] = [`f_${format}`, `q_${quality}`];
  if (width) {
    transforms.push(`w_${width}`);
    transforms.push("c_limit");
  }

  const transformStr = transforms.join(",");

  if (url.includes("/image/upload/")) {
    return url.replace("/image/upload/", `/image/upload/${transformStr}/`);
  }
  if (url.includes("/video/upload/")) {
    return url.replace("/video/upload/", `/video/upload/${transformStr}/`);
  }

  return url;
}

export function getOptimizedVideoUrl(
  url?: string | null,
  options?: {
    width?: number;
    quality?: number | "auto";
  }
): string {
  if (!url) return "";
  if (
    !url.includes("res.cloudinary.com") ||
    url.includes("/q_auto") ||
    url.includes("/vc_auto")
  ) {
    return url;
  }

  const { width = 1280, quality = "auto" } = options || {};
  const transforms: string[] = [`q_${quality}`, "vc_auto", "f_auto"];
  if (width) {
    transforms.push(`w_${width}`);
    transforms.push("c_limit");
  }

  const transformStr = transforms.join(",");

  if (url.includes("/video/upload/")) {
    return url.replace("/video/upload/", `/video/upload/${transformStr}/`);
  }
  if (url.includes("/image/upload/")) {
    return url.replace("/image/upload/", `/video/upload/${transformStr}/`);
  }

  return url;
}
