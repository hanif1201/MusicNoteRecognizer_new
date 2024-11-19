// services/musicRecognition.js
import { ImageProcessor } from "./imageProcessing";

class MusicSheetAnalyzer {
  constructor() {
    this.LINE_SPACING = 8;
    this.STAFF_HEIGHT = 4 * this.LINE_SPACING;
    this.NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B"];
    this.MIN_LINE_LENGTH = 0.6; // 60% of page width
  }

  async analyzePage(imageData) {
    try {
      console.log("Starting sheet analysis...");

      // Convert to grayscale
      const grayscale = await ImageProcessor.imageDataToGrayscale(imageData);
      console.log("Converted to grayscale");

      // Apply threshold
      const binary = await ImageProcessor.threshold(grayscale);
      console.log("Applied threshold");

      // Detect staff lines
      const horizontalLines = await ImageProcessor.detectHorizontalLines(
        binary,
        imageData.width,
        imageData.height,
        Math.floor(imageData.width * this.MIN_LINE_LENGTH)
      );

      // Group lines into staves
      const staffLines = this.groupIntoStaves(horizontalLines);
      console.log("Detected staff lines:", staffLines.length);

      // Detect notes
      const notes = await this.detectNotes(
        binary,
        imageData.width,
        imageData.height,
        staffLines
      );
      console.log("Detected notes:", notes.length);

      return {
        staffLines,
        notes,
      };
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    }
  }

  groupIntoStaves(lines) {
    const staves = [];
    let currentStaff = [];

    lines.sort((a, b) => a.y - b.y);

    for (let i = 0; i < lines.length; i++) {
      if (currentStaff.length === 0) {
        currentStaff.push(lines[i]);
      } else {
        const lastLine = currentStaff[currentStaff.length - 1];
        const spacing = lines[i].y - lastLine.y;

        if (spacing <= this.LINE_SPACING * 1.5) {
          currentStaff.push(lines[i]);
        } else {
          if (currentStaff.length === 5) {
            staves.push([...currentStaff]);
          }
          currentStaff = [lines[i]];
        }
      }
    }

    if (currentStaff.length === 5) {
      staves.push(currentStaff);
    }

    return staves;
  }

  async detectNotes(binaryImage, width, height, staffLines) {
    const notes = [];
    const noteHeadTemplate = this.createNoteHeadTemplate();

    for (const staff of staffLines) {
      const staffTop = staff[0].y;
      const staffBottom = staff[4].y;
      const searchArea = {
        top: staffTop - this.STAFF_HEIGHT,
        bottom: staffBottom + this.STAFF_HEIGHT,
      };

      // Template matching in staff area
      for (let y = searchArea.top; y < searchArea.bottom; y++) {
        for (let x = 0; x < width; x++) {
          const match = this.matchTemplate(
            binaryImage,
            x,
            y,
            width,
            noteHeadTemplate
          );

          if (match > 0.8) {
            // 80% confidence threshold
            notes.push({
              x,
              y,
              confidence: match,
            });
          }
        }
      }
    }

    return this.convertToMusicalNotes(notes, staffLines);
  }

  createNoteHeadTemplate() {
    return [
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
    ];
  }

  matchTemplate(image, x, y, width, template) {
    let matches = 0;
    let total = 0;

    for (let ty = 0; ty < template.length; ty++) {
      for (let tx = 0; tx < template[0].length; tx++) {
        const ix = x + tx;
        const iy = y + ty;
        const imagePixel = image[iy * width + ix] === 0 ? 1 : 0;

        if (template[ty][tx] === imagePixel) {
          matches++;
        }
        total++;
      }
    }

    return matches / total;
  }

  convertToMusicalNotes(notePositions, staffLines) {
    return notePositions.map((pos, index) => {
      const noteInfo = this.getNoteFromPosition(pos, staffLines);
      return {
        id: `note-${index}`,
        type: "note",
        position: {
          x: pos.x,
          y: pos.y,
        },
        value: noteInfo.noteName + noteInfo.octave,
        confidence: pos.confidence,
      };
    });
  }

  getNoteFromPosition(position, staffLines) {
    const staff = this.findClosestStaff(position.y, staffLines);
    const staffTop = staff[0].y;
    const staffSpacing = (staff[4].y - staffTop) / 4;

    const relativePosition = (position.y - staffTop) / staffSpacing;
    const noteIndex = Math.round(relativePosition);

    const octave = Math.floor(noteIndex / 7) + 4;
    const noteNameIndex = ((noteIndex % 7) + 7) % 7;

    return {
      noteName: this.NOTE_NAMES[noteNameIndex],
      octave,
      confidence: position.confidence,
    };
  }

  findClosestStaff(y, staffLines) {
    return staffLines.reduce((closest, staff) => {
      const staffMiddle = (staff[0].y + staff[4].y) / 2;
      const currentDistance = Math.abs(y - staffMiddle);
      const closestDistance = Math.abs(y - (closest[0].y + closest[4].y) / 2);

      return currentDistance < closestDistance ? staff : closest;
    });
  }
}

export const processMusicSheet = async (fileUrl, pageNumber, dimensions) => {
  try {
    const analyzer = new MusicSheetAnalyzer();
    const analysis = await analyzer.analyzePage({
      width: dimensions?.width || 595,
      height: dimensions?.height || 842,
      data: new Uint8Array(
        dimensions?.width * dimensions?.height * 4 || 595 * 842 * 4
      ),
    });

    return analysis.notes;
  } catch (error) {
    console.error("Music recognition error:", error);
    throw error;
  }
};
