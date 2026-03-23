import QRCode from "qrcode";

export async function generateQRPng(url: string, size = 512): Promise<string> {
  return QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: { dark: "#0a0a0f", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}

export async function generateQRSvg(url: string, size = 512): Promise<string> {
  return QRCode.toString(url, {
    width: size,
    margin: 2,
    color: { dark: "#0a0a0f", light: "#ffffff" },
    type: "svg",
    errorCorrectionLevel: "M",
  });
}

export function downloadFile(data: string, filename: string, type: "png" | "svg") {
  const link = document.createElement("a");
  if (type === "svg") {
    const blob = new Blob([data], { type: "image/svg+xml" });
    link.href = URL.createObjectURL(blob);
  } else {
    link.href = data; // data URL for PNG
  }
  link.download = `${filename}.${type}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
