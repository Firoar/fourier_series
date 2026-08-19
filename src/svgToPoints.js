/**
 * Convert an SVG string into an array of sampled [x, y] points.
 *
 * It leverages the browser's built-in SVGPathElement API:
 *   - getTotalLength()  → total arc-length of the path
 *   - getPointAtLength(t) → {x, y} at distance t along the path
 *
 * Each path is sampled at a fixed interval (default 5 px) so the
 * resulting point-cloud is uniform regardless of path complexity.
 */

export function svgStringToPoints(svgString, { sampleEvery = 5 } = {}) {
  // 1. Parse the SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  // 2. Collect every <path> element (handles <path>, <rect>, <circle> etc. –
  //    but PathToPoints only cares about <path>, so we do the same).
  const pathEls = doc.querySelectorAll("path");
  if (pathEls.length === 0) {
    console.warn("svgToPoints: no <path> elements found in the SVG");
    return [];
  }

  // 3. We need a live SVG in the DOM so getPointAtLength works.
  //    Create a hidden <svg> and append each <path> to it one at a time.
  const hiddenSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  hiddenSvg.style.position = "absolute";
  hiddenSvg.style.visibility = "hidden";
  hiddenSvg.style.width = "0";
  hiddenSvg.style.height = "0";
  document.body.appendChild(hiddenSvg);

  const allPoints = [];

  try {
    for (const origPath of pathEls) {
      // Import the path into the live SVG
      const livePath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      livePath.setAttribute("d", origPath.getAttribute("d"));
      hiddenSvg.appendChild(livePath);

      const totalLen = livePath.getTotalLength();
      if (totalLen === 0) continue;

      // Sample at regular intervals
      const steps = Math.max(1, Math.ceil(totalLen / sampleEvery));
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * totalLen;
        const pt = livePath.getPointAtLength(t);
        allPoints.push([pt.x, pt.y]);
      }

      // Remove the path so the next iteration starts clean
      hiddenSvg.removeChild(livePath);
    }
  } finally {
    document.body.removeChild(hiddenSvg);
  }

  return allPoints;
}
