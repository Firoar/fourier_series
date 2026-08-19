import { svgStringToPoints } from "./svgToPoints.js";

/**
 * Normalise any JSON path format into a flat list of [x, y] pairs.
 * Handles both [[x,y], ...] (depth 2) and [[[x,y], ...], ...] (depth 3).
 */
const normalisePaths = (arr) => {
  // Depth 2: arr[0][0] is a number → already pairs
  if (arr[0] && typeof arr[0][0] === "number") return arr;
  // Depth 3+: arr[0][0] is an array → need to flatten one level
  return arr.flat(1);
};

export const ExtraTheCoord = async () => {
  try {
    const response = await fetch("./mouse.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const arr = await response.json();
    const pairs = normalisePaths(arr);
    const newArr = pairs.map((ele) => {
      return { x: ele[0] + 240, y: ele[1] + 70 };
    });
    return newArr;
  } catch (error) {
    console.error("Error:", error);
  }
};

/**
 * Convert an uploaded SVG file into the coordinate array
 * that the rest of the app expects.
 */
export const svgFileToPoints = (file, { sampleEvery = 5 } = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = svgStringToPoints(e.target.result, { sampleEvery });
      const pts = raw.map((ele) => ({ x: ele[0] + 240, y: ele[1] + 70 }));
      resolve(pts);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
