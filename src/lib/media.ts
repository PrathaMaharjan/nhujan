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
