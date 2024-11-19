// services/imageProcessing.js
export class ImageProcessor {
  static async imageDataToGrayscale(imageData) {
    const grayscale = new Uint8Array(imageData.width * imageData.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];

      // Convert to grayscale using luminance formula
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      grayscale[i / 4] = gray;
    }

    return grayscale;
  }

  static async threshold(grayscaleData, threshold = 128) {
    return grayscaleData.map((value) => (value < threshold ? 0 : 255));
  }

  static async detectHorizontalLines(
    binaryImage,
    width,
    height,
    minLength = 100
  ) {
    const lines = [];
    const runLengths = new Array(height).fill(0);

    // Scan each row
    for (let y = 0; y < height; y++) {
      let currentRun = 0;

      for (let x = 0; x < width; x++) {
        const pixel = binaryImage[y * width + x];

        if (pixel === 0) {
          // Black pixel
          currentRun++;
        } else if (currentRun > 0) {
          if (currentRun >= minLength) {
            runLengths[y]++;
          }
          currentRun = 0;
        }
      }

      // Check end of row
      if (currentRun >= minLength) {
        runLengths[y]++;
      }
    }

    // Find staff lines based on run lengths
    for (let y = 0; y < height; y++) {
      if (runLengths[y] > 0) {
        lines.push({
          y,
          count: runLengths[y],
        });
      }
    }

    return lines;
  }
}
