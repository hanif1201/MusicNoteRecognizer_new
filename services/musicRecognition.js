// services/musicRecognition.js
import { ImageProcessor } from "./imageProcessing";

class MusicSheetAnalyzer {
  constructor() {
    this.LINE_SPACING = 8;
    this.STAFF_HEIGHT = 4 * this.LINE_SPACING;
    this.NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B"];
    this.MIN_LINE_LENGTH = 0.6;
    this.STEM_LENGTH = this.LINE_SPACING * 3;
    this.STEM_SEARCH_WIDTH = 5;
  }

  async analyzePage(imageData) {
    try {
      console.log("Starting sheet analysis...");

      // Convert RGB data to grayscale
      const grayscale = ImageProcessor.toGrayscale(imageData);
      console.log("Converted to grayscale");

      // Apply threshold to get binary image
      const binary = ImageProcessor.threshold(grayscale, 128);
      console.log("Applied threshold");

      // Detect staff lines
      const staffLines = this.detectStaffLines(binary);
      console.log("Detected staff lines:", staffLines.length);

      // Detect note heads
      const noteHeads = this.detectNoteHeads(binary, staffLines);
      console.log("Detected note heads:", noteHeads.length);

      // Detect stems
      const stems = this.detectStems(binary, noteHeads);
      console.log("Detected stems:", stems.length);

      // Convert to musical notes
      const notes = this.identifyNotes(noteHeads, staffLines, stems);
      console.log("Identified notes:", notes);

      return notes;
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    }
  }

  detectStaffLines(binaryImage) {
    const staffLines = [];
    const { width, height, data } = binaryImage;
    const minLineLength = width * this.MIN_LINE_LENGTH;

    for (let y = 0; y < height; y++) {
      let blackPixelCount = 0;
      let startX = -1;

      for (let x = 0; x < width; x++) {
        const isBlack = data[y * width + x] === 0;

        if (isBlack) {
          if (startX === -1) startX = x;
          blackPixelCount++;
        } else if (startX !== -1) {
          const lineLength = x - startX;
          if (lineLength >= minLineLength) {
            staffLines.push({
              y,
              start: startX,
              end: x,
              length: lineLength,
            });
          }
          startX = -1;
          blackPixelCount = 0;
        }
      }
    }

    return this.groupStaffLines(staffLines);
  }

  groupStaffLines(lines) {
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

  detectStems(binaryImage, noteHeads) {
    const stems = [];
    const { width, height, data } = binaryImage;

    for (const noteHead of noteHeads) {
      const stemUp = this.findStem(
        data,
        width,
        noteHead.x - this.STEM_SEARCH_WIDTH,
        noteHead.x + this.STEM_SEARCH_WIDTH,
        noteHead.y - this.STEM_LENGTH,
        noteHead.y,
        "up"
      );

      const stemDown = this.findStem(
        data,
        width,
        noteHead.x - this.STEM_SEARCH_WIDTH,
        noteHead.x + this.STEM_SEARCH_WIDTH,
        noteHead.y,
        noteHead.y + this.STEM_LENGTH,
        "down"
      );

      if (stemUp || stemDown) {
        stems.push({
          noteHead,
          direction: stemUp ? "up" : "down",
          length: stemUp ? stemUp.length : stemDown.length,
        });
      }
    }

    return stems;
  }

  findStem(imageData, width, startX, endX, startY, endY, direction) {
    const minStemLength = this.LINE_SPACING * 2;
    let longestStem = null;

    for (let x = startX; x <= endX; x++) {
      let currentLength = 0;
      let maxLength = 0;

      const yStart = Math.max(0, startY);
      const yEnd = Math.min(endY, imageData.length / width);

      for (let y = yStart; y <= yEnd; y++) {
        const isBlack = imageData[y * width + x] === 0;

        if (isBlack) {
          currentLength++;
          maxLength = Math.max(maxLength, currentLength);
        } else {
          currentLength = 0;
        }
      }

      if (maxLength >= minStemLength) {
        if (!longestStem || maxLength > longestStem.length) {
          longestStem = {
            x,
            length: maxLength,
            direction,
          };
        }
      }
    }

    return longestStem;
  }

  detectNoteHeads(binaryImage, staves) {
    const noteHeads = [];
    const { width, height, data } = binaryImage;

    for (const staff of staves) {
      const staffTop = staff[0].y;
      const staffBottom = staff[4].y;
      const searchArea = {
        top: staffTop - this.STAFF_HEIGHT,
        bottom: staffBottom + this.STAFF_HEIGHT,
        left: staff[0].start,
        right: staff[0].end,
      };

      const noteTemplate = [
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
      ];

      for (let y = searchArea.top; y < searchArea.bottom; y++) {
        for (let x = searchArea.left; x < searchArea.right; x++) {
          const match = this.matchTemplate(data, x, y, width, noteTemplate);

          if (match > 0.8) {
            noteHeads.push({
              x,
              y,
              confidence: match,
            });
          }
        }
      }
    }

    return this.removeOverlappingNotes(noteHeads);
  }

  matchTemplate(imageData, x, y, width, template) {
    let matches = 0;
    let total = 0;

    for (let ty = 0; ty < template.length; ty++) {
      for (let tx = 0; tx < template[0].length; tx++) {
        const ix = x + tx;
        const iy = y + ty;
        const pixelValue = imageData[iy * width + ix] === 0 ? 1 : 0;

        if (template[ty][tx] === pixelValue) {
          matches++;
        }
        total++;
      }
    }

    return matches / total;
  }

  removeOverlappingNotes(notes) {
    return notes.reduce((unique, note) => {
      const overlap = unique.find(
        (existingNote) =>
          Math.abs(existingNote.x - note.x) < 10 &&
          Math.abs(existingNote.y - note.y) < 10
      );

      if (!overlap || note.confidence > overlap.confidence) {
        if (overlap) {
          const index = unique.indexOf(overlap);
          unique[index] = note;
        } else {
          unique.push(note);
        }
      }

      return unique;
    }, []);
  }

  identifyNotes(noteHeads, staves, stems) {
    return noteHeads.map((head, index) => {
      const staff = this.findClosestStaff(head.y, staves);
      const noteInfo = this.getNoteFromPosition(head, staff);
      const stem = stems.find((s) => s.noteHead === head);
      const duration = stem ? this.getDuration(stem) : "quarter";

      return {
        id: `note-${index}`,
        type: "note",
        position: {
          x: head.x,
          y: head.y,
        },
        value: `${noteInfo.noteName}${noteInfo.octave}`,
        duration: duration,
        confidence: head.confidence,
      };
    });
  }

  getDuration(stem) {
    const normalizedLength = stem.length / this.LINE_SPACING;

    if (normalizedLength > 4) {
      return "whole";
    } else if (normalizedLength > 3) {
      return "half";
    } else {
      return "quarter";
    }
  }

  findClosestStaff(y, staves) {
    return staves.reduce((closest, staff) => {
      const staffMiddle = (staff[0].y + staff[4].y) / 2;
      const currentDistance = Math.abs(y - staffMiddle);
      const closestDistance = Math.abs(y - (closest[0].y + closest[4].y) / 2);

      return currentDistance < closestDistance ? staff : closest;
    });
  }

  getNoteFromPosition(noteHead, staff) {
    const staffTop = staff[0].y;
    const staffSpacing = (staff[4].y - staffTop) / 4;
    const position = (noteHead.y - staffTop) / staffSpacing;

    const noteIndex = Math.round(position);
    const octave = Math.floor(noteIndex / 7) + 4;
    const noteName = this.NOTE_NAMES[((noteIndex % 7) + 7) % 7];

    return {
      noteName,
      octave,
    };
  }
}

export const processMusicSheet = async (fileUrl, pageNumber, imageData) => {
  try {
    const analyzer = new MusicSheetAnalyzer();
    return await analyzer.analyzePage(imageData);
  } catch (error) {
    console.error("Music recognition error:", error);
    throw error;
  }
};
