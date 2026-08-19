import Complex from "complex.js";
import { ExtraTheCoord, svgFileToPoints } from "./extractCoord.js";
// import "./slideShow.js"

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const uploadArea = document.getElementById("upload-area");
  const svgInput = document.getElementById("svg-input");
  const controls = document.getElementById("controls");
  const btnNew = document.getElementById("btn-new");
  const btnDownload = document.getElementById("btn-download");
  const presets = document.getElementById("presets");
  const loading = document.getElementById("loading");
  const WIDTH = 1000;
  const HEIGHT = 700;
  const xCircleX = 150;
  const xCircleY = 450;
  const yCircleX = 550;
  const yCircleY = 70;

  canvas.height = HEIGHT;
  canvas.width = WIDTH;

  const c = canvas.getContext("2d");

  // ── Drawing helpers ──────────────────────────────────────────
  const drawCircle = (c, centerX, centerY, radius) => {
    c.beginPath();
    c.arc(centerX, centerY, radius, 0, Math.PI * 2);
    c.strokeStyle = "silver";
    c.lineWidth = 1;
    c.stroke();
    drawPoint(c, centerX, centerY);
  };

  const drawPoint = (c, pointX, pointY, color = "silver") => {
    c.fillStyle = color;
    c.beginPath();
    c.arc(pointX, pointY, 1.5, 0, Math.PI * 2);
    c.fill();
  };

  const clearScreen = (c) => {
    c.fillStyle = "palegreen";
    c.fillRect(0, 0, WIDTH, HEIGHT);
  };

  const drawLineBtw2Points = (c, x1, y1, x2, y2) => {
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.strokeStyle = "black";
    c.lineWidth = 1;
    c.stroke();
  };

  const drawCircumferencePoint = (c, radius, frequency, centerX, centerY) => {
    const radian = frequency;
    const x = centerX + radius * Math.cos(radian);
    const y = centerY + radius * Math.sin(radian);
    drawPoint(c, x, y, "purple");
    drawLineBtw2Points(c, centerX, centerY, x, y);
    return [x, y];
  };

  // ── Fourier helpers ──────────────────────────────────────────
  const dft = (array) => {
    const N = array.length;
    const x = array.map((p) => p.x);
    const y = array.map((p) => p.y);

    const realX = new Array(N).fill(0);
    const imagX = new Array(N).fill(0);
    const realY = new Array(N).fill(0);
    const imagY = new Array(N).fill(0);

    for (let k = 0; k < N; k++) {
      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N;
        realX[k] += x[n] * Math.cos(angle);
        imagX[k] -= x[n] * Math.sin(angle);
        realY[k] += y[n] * Math.cos(angle);
        imagY[k] -= y[n] * Math.sin(angle);
      }
    }
    return { realX, imagX, realY, imagY };
  };

  const phaseAndMag = (real, imag) => {
    return real.map((re, i) => {
      const c = new Complex({ re, im: imag[i] });
      return { mag: c.abs(), phase: c.arg() };
    });
  };

  function findIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return null;
    const Px =
      ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
      denom;
    const Py =
      ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
      denom;
    return { x: Px, y: Py };
  }

  // ── Reset back to upload screen ──────────────────────────────
  const resetToUpload = () => {
    canvas.classList.add("hidden");
    controls.classList.add("hidden");
    uploadArea.classList.remove("hidden");
    presets.classList.remove("hidden");
    svgInput.value = ""; // allow re-uploading the same file
  };

  // ── Show loading / hide loading ──────────────────────────────
  const showLoading = () => loading.classList.remove("hidden");
  const hideLoading = () => loading.classList.add("hidden");

  // ── Validate file is SVG ─────────────────────────────────────
  const isSvgFile = (file) => {
    if (file.type && file.type !== "image/svg+xml") return false;
    return file.name.endsWith(".svg");
  };

  // ── Download canvas as PNG ───────────────────────────────────
  const downloadCanvas = () => {
    const link = document.createElement("a");
    link.download = "fourier-drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ── Button handlers ──────────────────────────────────────────
  btnNew.addEventListener("click", resetToUpload);
  btnDownload.addEventListener("click", downloadCanvas);

  // ── Main animation ───────────────────────────────────────────
  const startAnimation = (rectanglePoints) => {
    const start = Date.now();

    // Hide upload + presets, show canvas
    uploadArea.classList.add("hidden");
    presets.classList.add("hidden");
    canvas.classList.remove("hidden");
    controls.classList.add("hidden"); // keep hidden during drawing

    console.log(rectanglePoints);
    const correctCoordinates = [];
    for (let element of rectanglePoints) {
      let x = (element.x - 550) / 50;
      let y = -(element.y - 450) / 50;
      correctCoordinates.push({ x: y, y: x });
    }

    const { realX, imagX, realY, imagY } = dft(correctCoordinates);
    const X = phaseAndMag(realX, imagX);
    const Y = phaseAndMag(realY, imagY);
    const N = X.length;

    let TIME = 0;
    let STOP = false;
    const trace = [];
    const ratio = 50;

    const animate = () => {
      if (STOP) return;
      requestAnimationFrame(animate);
      clearScreen(c);

      let [xCenterX, xCenterY, yCenterX, yCenterY] = [
        xCircleX, xCircleY, yCircleX, yCircleY,
      ];

      for (let i = 0; i < N; i++) {
        let amplitude = X[i].mag / N;
        let frequency =
          (Math.PI * 2 * (TIME % N) * i) / N + X[i].phase + (-Math.PI) / 2;
        drawCircle(c, xCenterX, xCenterY, ratio * amplitude);
        [xCenterX, xCenterY] = drawCircumferencePoint(
          c, ratio * amplitude, frequency, xCenterX, xCenterY
        );

        amplitude = Y[i].mag / N;
        frequency =
          (Math.PI * 2 * i * (TIME % N)) / N + Y[i].phase + 2 * Math.PI;
        drawCircle(c, yCenterX, yCenterY, ratio * amplitude);
        [yCenterX, yCenterY] = drawCircumferencePoint(
          c, ratio * amplitude, frequency, yCenterX, yCenterY
        );
      }

      drawPoint(c, 0, xCenterY, "black");
      drawPoint(c, yCenterX, 0, "black");

      drawLineBtw2Points(c, WIDTH, xCenterY, xCenterX, xCenterY);
      drawLineBtw2Points(c, yCenterX, HEIGHT, yCenterX, yCenterY);

      trace.push(
        findIntersection(WIDTH, xCenterY, 0, xCenterY, yCenterX, HEIGHT, yCenterX, 0)
      );

      for (let element of trace) {
        drawPoint(c, element.x, element.y, "purple");
      }
      TIME += 1;

      if (TIME >= N) {
        const end = Date.now();
        const diff = end - start;
        console.log(Math.floor(diff / 60000), Math.floor((diff % 60000) / 1000));
        STOP = true;
        clearScreen(c);
        for (let element of trace) {
          drawPoint(c, element.x, element.y, "purple");
        }
        // Show post-drawing controls
        controls.classList.remove("hidden");
      }
    };
    animate();
  };

  // ── SVG upload handling ──────────────────────────────────────
  const handleFile = async (file) => {
    if (!isSvgFile(file)) {
      alert("Please upload an SVG file only.");
      return;
    }
    showLoading();
    try {
      console.log("Processing SVG:", file.name);
      const points = await svgFileToPoints(file, { sampleEvery: 5 });
      console.log(`Extracted ${points.length} points from SVG`);
      startAnimation(points);
    } catch (err) {
      console.error(err);
      alert("Failed to process SVG file.");
    } finally {
      hideLoading();
    }
  };

  svgInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await handleFile(file);
  });

  // ── Click to upload ─────────────────────────────────────────
  uploadArea.addEventListener("click", () => {
    svgInput.click();
  });

  // ── Drag & drop support ──────────────────────────────────────
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", async (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await handleFile(file);
  });

  // ── Preset buttons ───────────────────────────────────────────
  document.querySelectorAll(".btn-preset").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const fileName = btn.dataset.file;
      showLoading();
      try {
        const response = await fetch(`./${fileName}`);
        if (!response.ok) throw new Error("Failed to fetch preset");
        const arr = await response.json();
        // Normalise: handle both [[x,y], ...] and [[[x,y], ...], ...]
        const pairs = arr[0][0] instanceof Array ? arr.flat(1) : arr;
        const points = pairs.map((ele) => ({
          x: ele[0] + 240,
          y: ele[1] + 70,
        }));
        startAnimation(points);
      } catch (err) {
        console.error(err);
        alert("Failed to load preset.");
      } finally {
        hideLoading();
      }
    });
  });
});
