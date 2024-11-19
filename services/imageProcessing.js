// services/imageProcessing.js
export class ImageProcessor {
  static toGrayscale(imageData) {
    const { width, height, pixels } = imageData;
    const grayscale = new Uint8Array(width * height);

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      grayscale[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }

    return {
      width,
      height,
      data: grayscale,
    };
  }

  static threshold(grayscaleData, threshold = 128) {
    const { width, height, data } = grayscaleData;
    const binary = new Uint8Array(width * height);

    for (let i = 0; i < data.length; i++) {
      binary[i] = data[i] < threshold ? 0 : 255;
    }

    return {
      width,
      height,
      data: binary,
    };
  }
}
