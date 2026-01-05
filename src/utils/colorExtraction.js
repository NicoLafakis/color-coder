/**
 * Color Extraction Utilities
 * Uses k-means clustering to extract dominant colors from images
 */

/**
 * Convert RGB to Hex
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convert Hex to RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate Euclidean distance between two RGB colors
 */
function colorDistance(color1, color2) {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
}

/**
 * Check if a color is too close to white or black
 */
function isNeutral(color, threshold = 30) {
  const isNearWhite = color.r > 255 - threshold && color.g > 255 - threshold && color.b > 255 - threshold;
  const isNearBlack = color.r < threshold && color.g < threshold && color.b < threshold;
  return isNearWhite || isNearBlack;
}

/**
 * Check if a color is too gray/desaturated
 */
function isGray(color, threshold = 20) {
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);
  return (max - min) < threshold;
}

/**
 * Get pixels from an image
 */
export function getImagePixels(imageData, sampleRate = 10) {
  const pixels = [];
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip fully transparent pixels
    if (a < 128) continue;

    pixels.push({ r, g, b });
  }

  return pixels;
}

/**
 * K-means clustering initialization using k-means++ algorithm
 */
function initializeCentroids(pixels, k) {
  const centroids = [];

  // First centroid is random
  centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);

  // Remaining centroids chosen with probability proportional to distance squared
  for (let i = 1; i < k; i++) {
    const distances = pixels.map(pixel => {
      const minDist = Math.min(...centroids.map(c => colorDistance(pixel, c)));
      return minDist * minDist;
    });

    const totalDist = distances.reduce((sum, d) => sum + d, 0);
    let random = Math.random() * totalDist;

    for (let j = 0; j < pixels.length; j++) {
      random -= distances[j];
      if (random <= 0) {
        centroids.push(pixels[j]);
        break;
      }
    }
  }

  return centroids;
}

/**
 * Assign pixels to nearest centroid
 */
function assignToClusters(pixels, centroids) {
  const clusters = centroids.map(() => []);

  pixels.forEach(pixel => {
    let minDist = Infinity;
    let nearestCluster = 0;

    centroids.forEach((centroid, i) => {
      const dist = colorDistance(pixel, centroid);
      if (dist < minDist) {
        minDist = dist;
        nearestCluster = i;
      }
    });

    clusters[nearestCluster].push(pixel);
  });

  return clusters;
}

/**
 * Calculate new centroid from cluster
 */
function calculateCentroid(cluster) {
  if (cluster.length === 0) return null;

  const sum = cluster.reduce((acc, pixel) => ({
    r: acc.r + pixel.r,
    g: acc.g + pixel.g,
    b: acc.b + pixel.b
  }), { r: 0, g: 0, b: 0 });

  return {
    r: sum.r / cluster.length,
    g: sum.g / cluster.length,
    b: sum.b / cluster.length
  };
}

/**
 * K-means clustering algorithm
 */
export function kMeansClustering(pixels, k, maxIterations = 20) {
  if (pixels.length === 0) return [];
  if (pixels.length < k) k = pixels.length;

  let centroids = initializeCentroids(pixels, k);
  let previousCentroids = [];
  let iterations = 0;

  while (iterations < maxIterations) {
    const clusters = assignToClusters(pixels, centroids);
    const newCentroids = clusters.map((cluster, i) =>
      calculateCentroid(cluster) || centroids[i]
    );

    // Check for convergence
    let converged = true;
    for (let i = 0; i < centroids.length; i++) {
      if (colorDistance(centroids[i], newCentroids[i]) > 1) {
        converged = false;
        break;
      }
    }

    if (converged) break;

    previousCentroids = centroids;
    centroids = newCentroids;
    iterations++;
  }

  // Return centroids with cluster sizes
  const clusters = assignToClusters(pixels, centroids);
  return centroids.map((centroid, i) => ({
    color: centroid,
    count: clusters[i].length,
    percentage: (clusters[i].length / pixels.length) * 100
  }));
}

/**
 * Extract dominant colors from image data
 */
export function extractDominantColors(imageData, options = {}) {
  const {
    colorCount = 6,
    sampleRate = 5,
    ignoreWhite = true,
    ignoreBlack = true,
    ignoreGray = false,
    minColorDistance = 30
  } = options;

  // Get sampled pixels
  let pixels = getImagePixels(imageData, sampleRate);

  // Filter out unwanted colors
  if (ignoreWhite || ignoreBlack) {
    pixels = pixels.filter(p => !isNeutral(p, ignoreWhite && ignoreBlack ? 30 : 15));
  }

  if (ignoreGray) {
    pixels = pixels.filter(p => !isGray(p));
  }

  if (pixels.length === 0) {
    return [];
  }

  // Run k-means with extra clusters, then filter
  const extraClusters = Math.min(colorCount * 2, 12);
  let results = kMeansClustering(pixels, extraClusters);

  // Sort by frequency
  results.sort((a, b) => b.count - a.count);

  // Filter out colors that are too similar
  const filteredResults = [];
  for (const result of results) {
    const isTooSimilar = filteredResults.some(existing =>
      colorDistance(existing.color, result.color) < minColorDistance
    );

    if (!isTooSimilar) {
      filteredResults.push(result);
    }

    if (filteredResults.length >= colorCount) break;
  }

  // Convert to hex
  return filteredResults.map(result => ({
    hex: rgbToHex(result.color.r, result.color.g, result.color.b),
    percentage: result.percentage.toFixed(1)
  }));
}

/**
 * Load image and extract colors
 */
export function extractColorsFromImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Scale down large images for performance
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);

        // Extract colors
        const colors = extractDominantColors(imageData);

        resolve({
          colors,
          imageUrl: e.target.result,
          width: img.width,
          height: img.height
        });
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get color at specific pixel coordinates
 */
export function getColorAtPixel(imageData, x, y) {
  const index = (y * imageData.width + x) * 4;
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2],
    hex: rgbToHex(
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2]
    )
  };
}
