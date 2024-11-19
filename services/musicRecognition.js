// services/musicRecognition.js
import * as FileSystem from "expo-file-system";

export class MusicNoteDetector {
  constructor() {
    this.STAFF_LINE_HEIGHT = 8;
    this.NOTE_HEAD_SIZE = { width: 13, height: 10 };
    this.STAFF_HEIGHT = 4 * this.STAFF_LINE_HEIGHT;
    this.NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B"];
    this.MIN_LINE_LENGTH_RATIO = 0.5; // Staff lines should be at least 50% of page width
  }

  async processMusicSheet(fileUrl, dimensions) {
    try {
      console.log("Starting sheet analysis:", { fileUrl, dimensions });

      // Step 1: Get image data from PDF
      const imageData = await this.getImageData(fileUrl);
      console.log("Image data retrieved");

      // Step 2: Convert to grayscale and enhance contrast
      const enhancedImage = await this.enhanceImage(imageData);
      console.log("Image enhanced");

      // Step 3: Detect staff lines
      const staffLines = await this.detectStaffLines(enhancedImage, dimensions);
      console.log("Staff lines detected:", staffLines.length);

      // Step 4: Detect note heads
      const noteHeads = await this.detectNoteHeads(
        enhancedImage,
        staffLines,
        dimensions
      );
      console.log("Note heads detected:", noteHeads.length);

      // Step 5: Convert positions to musical notes
      const notes = this.identifyNotes(noteHeads, staffLines);
      console.log("Notes identified:", notes);

      return notes;
    } catch (error) {
      console.error("Sheet analysis error:", error);
      throw error;
    }
  }

  async getImageData(fileUrl) {
    try {
      // Download the PDF page as an image
      const tempFilePath = FileSystem.cacheDirectory + "temp_sheet.jpg";

      console.log("Downloading file from:", fileUrl);
      const { uri } = await FileSystem.downloadAsync(fileUrl, tempFilePath);
      console.log("File downloaded to:", uri);

      // Read the file as base64
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return base64Data;
    } catch (error) {
      console.error("Error getting image data:", error);
      throw error;
    }
  }

  async enhanceImage(base64Image) {
    try {
      // Convert base64 to array buffer for processing
      const binaryString = atob(base64Image);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create canvas for image processing
      const img = new Image();
      img.src = "data:image/jpeg;base64," + base64Image;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert to grayscale and enhance contrast
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Convert to grayscale
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Enhance contrast using threshold
        const threshold = 128;
        const enhancedValue = gray < threshold ? 0 : 255;

        data[i] = data[i + 1] = data[i + 2] = enhancedValue;
      }

      ctx.putImageData(imageData, 0, 0);
      return imageData;
    } catch (error) {
      console.error("Error enhancing image:", error);
      throw error;
    }
  }

  async detectStaffLines(imageData, dimensions) {
    try {
      const width = dimensions.width;
      const height = dimensions.height;
      const data = imageData.data;
      const staffLines = [];
      const minLineLength = width * this.MIN_LINE_LENGTH_RATIO;

      // Horizontal line detection
      for (let y = 0; y < height; y++) {
        let blackPixelCount = 0;
        let lineStart = -1;

        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const isBlack = data[index] < 128; // Check if pixel is black

          if (isBlack) {
            if (lineStart === -1) lineStart = x;
            blackPixelCount++;
          } else if (lineStart !== -1) {
            // End of line found
            const lineLength = x - lineStart;
            if (lineLength >= minLineLength) {
              staffLines.push({
                y,
                start: lineStart,
                end: x,
                length: lineLength,
              });
            }
            lineStart = -1;
            blackPixelCount = 0;
          }
        }
      }

      // Group lines into staff systems
      return this.groupStaffLines(staffLines);
    } catch (error) {
      console.error("Error detecting staff lines:", error);
      throw error;
    }
  }

  groupStaffLines(lines) {
    // Sort lines by vertical position
    lines.sort((a, b) => a.y - b.y);

    const staffSystems = [];
    let currentSystem = [];

    for (let i = 0; i < lines.length; i++) {
      if (currentSystem.length === 0) {
        currentSystem.push(lines[i]);
      } else {
        const lastLine = currentSystem[currentSystem.length - 1];
        const spacing = lines[i].y - lastLine.y;

        if (spacing <= this.STAFF_LINE_HEIGHT * 1.5) {
          currentSystem.push(lines[i]);
        } else {
          if (currentSystem.length === 5) {
            staffSystems.push([...currentSystem]);
          }
          currentSystem = [lines[i]];
        }
      }
    }

    // Add the last system if complete
    if (currentSystem.length === 5) {
      staffSystems.push(currentSystem);
    }

    return staffSystems;
  }

  // We'll continue with note detection in the next part...
}

// Export the processing function
export const processMusicSheet = async (fileUrl, pageNumber, dimensions) => {
  try {
    const detector = new MusicNoteDetector();
    return await detector.processMusicSheet(fileUrl, dimensions);
  } catch (error) {
    console.error("Music recognition error:", error);
    throw error;
  }
};
