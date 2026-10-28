/**
 * PWA Icon Generator for Charis
 * Generates valid PNG icons (192x192, 512x512, apple-touch-icon) with terracotta background and Chi glyph.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, body, crcBuf]);
}

function generatePng(width, height) {
  // Signature
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image scanlines: filter byte (0) + RGBA per pixel
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;
  const cornerR = width * 0.22;

  // Render rounded squircle with terracotta gradient (#E06D58 to #C24B36) and Chi cross
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Calculate squircle distance
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const maxDist = width * 0.44;
      
      let inCard = false;
      if (dx <= maxDist - cornerR && dy <= maxDist) inCard = true;
      else if (dy <= maxDist - cornerR && dx <= maxDist) inCard = true;
      else {
        const cdx = dx - (maxDist - cornerR);
        const cdy = dy - (maxDist - cornerR);
        if (cdx * cdx + cdy * cdy <= cornerR * cornerR) inCard = true;
      }

      if (!inCard) {
        // Transparent
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // Vertical terracotta gradient
      const gradRatio = y / height;
      const r = Math.round(224 * (1 - gradRatio) + 194 * gradRatio);
      const g = Math.round(109 * (1 - gradRatio) + 75 * gradRatio);
      const b = Math.round(88 * (1 - gradRatio) + 54 * gradRatio);

      // Check if pixel belongs to Greek Chi "X"
      const nx = (x - cx) / (width * 0.28);
      const ny = (y - cy) / (height * 0.28);
      
      const inChiDiag1 = Math.abs(nx - ny) < 0.22 && Math.abs(nx) < 0.85 && Math.abs(ny) < 0.85;
      const inChiDiag2 = Math.abs(nx + ny) < 0.22 && Math.abs(nx) < 0.85 && Math.abs(ny) < 0.85;
      
      // Serif feet on Chi tips
      const isTopLeftFoot = Math.abs(ny - (-0.8)) < 0.08 && Math.abs(nx - (-0.8)) < 0.25;
      const isTopRightFoot = Math.abs(ny - (-0.8)) < 0.08 && Math.abs(nx - 0.8) < 0.25;
      const isBottomLeftFoot = Math.abs(ny - 0.8) < 0.08 && Math.abs(nx - (-0.8)) < 0.25;
      const isBottomRightFoot = Math.abs(ny - 0.8) < 0.08 && Math.abs(nx - 0.8) < 0.25;

      const isChi = inChiDiag1 || inChiDiag2 || isTopLeftFoot || isTopRightFoot || isBottomLeftFoot || isBottomRightFoot;

      if (isChi) {
        // White/warm ivory glyph
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 252;
        rawData[pxOffset + 2] = 247;
        rawData[pxOffset + 3] = 255;
      } else {
        // Terracotta card
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180));
console.log('✅ Generated pwa-192x192.png, pwa-512x512.png, and apple-touch-icon.png');
