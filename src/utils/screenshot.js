import { toPng } from "html-to-image";

/**
 * Captures a DOM element and triggers a download as PNG.
 * 
 * @param {HTMLElement} node - The DOM element to capture (phone prototype or screen)
 * @param {Object} options - Customization options
 * @param {string} options.fileName - Output filename without extension
 * @param {number} options.pixelRatio - Pixel density (default: 2 for sharp retina quality)
 * @param {string|null} options.backgroundColor - Optional background color
 * @returns {Promise<string>} Data URL of the generated PNG
 */
export async function downloadElementAsPng(node, options = {}) {
  if (!node) {
    throw new Error("Target prototype element not found.");
  }

  const {
    fileName = "coachnivo-prototype",
    pixelRatio = 2,
    backgroundColor = null,
  } = options;

  const captureOptions = {
    quality: 1,
    pixelRatio: pixelRatio,
    cacheBust: true,
    backgroundColor: backgroundColor,
    width: node.offsetWidth,
    height: node.offsetHeight,
    style: {
      transform: "none",
      margin: "0",
    },
  };

  try {
    // Primary capture attempt
    const dataUrl = await toPng(node, captureOptions);
    triggerDownload(dataUrl, fileName);
    return dataUrl;
  } catch (err) {
    console.warn("Primary screenshot capture failed, retrying with font skip...", err);
    try {
      // Secondary fallback (skips webfont css fetch if CORS/network blocked it)
      const dataUrl = await toPng(node, { ...captureOptions, skipFonts: true });
      triggerDownload(dataUrl, fileName);
      return dataUrl;
    } catch (fallbackErr) {
      console.error("Screenshot capture failed completely:", fallbackErr);
      throw fallbackErr;
    }
  }
}

function triggerDownload(dataUrl, fileName) {
  const cleanName = fileName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const downloadLink = document.createElement("a");
  downloadLink.download = `${cleanName}.png`;
  downloadLink.href = dataUrl;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

