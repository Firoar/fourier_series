import Complex from "complex.js";
import { ExtraTheCoord } from "./extractCoord.js";
// import "./slideShow.js"

document.addEventListener("DOMContentLoaded", async () => {
  const start = Date.now();
  console.log(start);

  const canvas = document.getElementsByTagName("canvas")[0];
  const WIDTH = 1000;
  const HEIGHT = 700;
  const xCircleX = 150;
  const xCircleY = 450;
  const yCircleX = 550;
  const yCircleY = 70;

  let TIME = 0;
  let STOP = false;
  let amplitude;
  let frequency;

  canvas.height = HEIGHT;
  canvas.width = WIDTH;

  const c = canvas.getContext("2d");

  const drawCircle = (c, centerX, centerY, radius) => {
    c.beginPath();
    c.arc(centerX, centerY, radius, 0, Math.PI * 2);
    c.strokeStyle = "silver";
    c.lineWidth = 1;
    c.stroke();

    // center of circle
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

  const drawMiniScreen = (c, startX, startY) => {
    // c.fillStyle = "red";
    c.lineWidth = 1;
    c.strokeRect(startX, startY, WIDTH - startX, HEIGHT - startY);
  };

  const drawXAxis = (c, startX, startY) => {
    c.moveTo(startX, startY);
    c.lineTo(startX + 900, startY);
    c.strokeStyle = "black";
    c.lineWidth = 1;
    c.stroke();
  };
  const drawYAxis = (c, startX, startY) => {
    c.moveTo(startX, startY);
    c.lineTo(startX, startY + 800);
    c.strokeStyle = "black";
    c.lineWidth = 1;
    c.stroke();
  };
  const markXAxis = (c, pointX, pointY) => {
    for (let i = pointX; i <= 1000; i += 50) {
      drawPoint(c, i, pointY, "green");
    }
    for (let i = pointX; i >= 100; i -= 50) {
      drawPoint(c, i, pointY, "green");
    }
  };
  const markYAxis = (c, pointX, pointY) => {
    for (let i = pointY; i <= 900; i += 50) {
      drawPoint(c, pointX, i, "green");
    }
    for (let i = pointY; i >= 100; i -= 50) {
      drawPoint(c, pointX, i, "green");
    }
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

  const rectanglePoints = await ExtraTheCoord();
  // console.log(rectanglePoints);
  // rectanglePoints.push(...getSmileyCurvePoints());

  // for (let i = 450; i <= 650; i++) {
  //   rectanglePoints.push({ x: i, y: 350 });
  // }
  // for (let i = 351; i <= 550; i++) {
  //   rectanglePoints.push({ x: 650, y: i });
  // }
  // for (let i = 649; i >= 450; i--) {
  //   rectanglePoints.push({ x: i, y: 550 });
  // }
  // for (let i = 549; i >= 351; i--) {
  //   rectanglePoints.push({ x: 450, y: i });
  // }

  // const step = Math.PI / 180;
  // for (let theta = 0; theta < 2 * Math.PI; theta += step) {
  //   const x = 550 + 50 * Math.cos(theta);
  //   const y = 450 + 50 * Math.sin(theta);
  //   rectanglePoints.push({ x, y });
  // }

  // for (let i = 350; i <= 550; i++) {
  //   rectanglePoints.push({ x: 550, y: i });
  // }
  // rectanglePoints.push({ x: 550, y: 450 });

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

  const trace = [];
  const ratio = 50;
  // now i have both parts of each x and y, now find magnitude and phase

  const animate = () => {
    if (STOP) return;
    requestAnimationFrame(animate);
    clearScreen(c);
    // drawMiniScreen(c, 100, 100);
    // drawXAxis(c, 100, 450);
    // drawYAxis(c, 550, 100);

    // markXAxis(c, 550, 450);
    // markYAxis(c, 550, 450);

    // drawPoint(c, 550, 450, "blue");
    let [xCenterX, xCenterY, yCenterX, yCenterY] = [
      xCircleX,
      xCircleY,
      yCircleX,
      yCircleY,
    ];

    // for (let element of rectanglePoints) {
    //   drawPoint(c, element.x, element.y, "red");
    // }

    for (let i = 0; i < N; i++) {
      amplitude = X[i].mag / N;
      frequency =
        (Math.PI * 2 * (TIME % (1 * N)) * i) / N +
        X[i].phase +
        (-1 * Math.PI) / 2;
      drawCircle(c, xCenterX, xCenterY, ratio * amplitude);
      [xCenterX, xCenterY] = drawCircumferencePoint(
        c,
        ratio * amplitude,
        frequency,
        xCenterX,
        xCenterY
      );

      amplitude = Y[i].mag / N;
      frequency =
        (Math.PI * 2 * i * (TIME % (1 * N))) / N + Y[i].phase + 2 * Math.PI;
      drawCircle(c, yCenterX, yCenterY, ratio * amplitude);
      [yCenterX, yCenterY] = drawCircumferencePoint(
        c,
        ratio * amplitude,
        frequency,
        yCenterX,
        yCenterY
      );
    }

    // drawPoint(c, 1000, xCenterY, "pink");
    drawPoint(c, 0, xCenterY, "black");
    // drawPoint(c, yCenterX, 800, "pink");
    drawPoint(c, yCenterX, 0, "black");

    drawLineBtw2Points(c, WIDTH, xCenterY, xCenterX, xCenterY);
    drawLineBtw2Points(c, yCenterX, HEIGHT, yCenterX, yCenterY);

    trace.push(
      findIntersection(
        WIDTH,
        xCenterY,
        0,
        xCenterY,
        yCenterX,
        HEIGHT,
        yCenterX,
        0
      )
    );

    for (let element of trace) {
      drawPoint(c, element.x, element.y, "purple");
    }
    TIME += 1;

    if (TIME >= N) {
      const end = Date.now();
      const diff = end - start; // Difference in milliseconds

      const minutes = Math.floor(diff / 60000); // 1 minute = 60000 ms
      const seconds = Math.floor((diff % 60000) / 1000); // Remaining seconds

      console.log(minutes);
      console.log(seconds);

      STOP = true;
      clearScreen(c);
      for (let element of trace) {
        drawPoint(c, element.x, element.y, "purple");
      }
    }
  };
  animate();
});

const dft = (array) => {
  const N = array.length;
  const x = new Array(N).fill(0);
  const y = new Array(N).fill(0);

  for (let i = 0; i < N; i++) {
    x[i] = array[i].x;
    y[i] = array[i].y;
  }

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
  const N = real.length;
  const array = [];

  for (let i = 0; i < N; i++) {
    const c = new Complex({ re: real[i], im: imag[i] });
    array.push({ mag: c.abs(), phase: c.arg() });
  }
  return array;
};

function findIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (denominator === 0) {
    return null;
  }
  const Px =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
    denominator;
  const Py =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
    denominator;

  return { x: Px, y: Py };
}

function getSmileyCurvePoints(step = 1) {
  const cx = 550;
  const cy = 450;
  const h = 550;
  const k = 480;
  const a = 0.005;
  const points = [];

  // Increase resolution by decreasing step size
  for (let x = cx - 50; x <= cx + 50; x += step) {
    const y = a * Math.pow(x - h, 2) + k;
    points.push({ x: x, y: parseFloat(y.toFixed(2)) });
  }

  return points;
}
