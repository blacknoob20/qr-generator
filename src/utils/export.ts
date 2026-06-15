import { saveAs } from 'file-saver';

export interface PNGExportOptions {
  width?: number;
  height?: number;
  scale?: number;
  margin?: number;
  quality?: number;
}

export interface SVGExportOptions {
  margin?: number;
}

export async function exportPNG(
  qrCodeStyling: any,
  options: PNGExportOptions = {}
): Promise<Blob> {
  const {
    width = 1024,
    height = 1024,
    margin = 4,
  } = options;

  const blob = await qrCodeStyling.toBlob({
    width,
    height,
    margin,
    image: qrCodeStyling._logoSrc,
    dataUrl: qrCodeStyling._logoSrc ? undefined : undefined,
  }, 'png');

  return blob;
}

export async function exportSVG(
  qrCodeStyling: any,
  options: SVGExportOptions = {}
): Promise<string> {
  const { margin = 4 } = options;

  const svgString = await qrCodeStyling.toDataUrl({
    type: 'svg',
    margin,
  });

  return svgString;
}

export function downloadBlob(blob: Blob, filename: string): void {
  saveAs(blob, filename);
}

export function downloadDataURL(dataURL: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}