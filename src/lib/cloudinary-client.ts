export const generateCloudinarySignature = async (
  callback: (signature: string) => void,
  paramsToSign: Record<string, any>
) => {
  try {
    const res = await fetch("/api/admin/cloudinary-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paramsToSign }),
    });

    if (!res.ok) {
      console.error("Failed to sign Cloudinary request:", await res.text());
      return;
    }

    const data = await res.json();
    if (data.signature) {
      callback(data.signature);
    } else {
      console.error("No signature returned by server", data);
    }
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
  }
};
