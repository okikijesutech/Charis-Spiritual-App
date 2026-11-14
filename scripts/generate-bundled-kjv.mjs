import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOK_ORDER = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI',
  '1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER',
  'LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP',
  'HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL',
  'EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE',
  '2PE','1JN','2JN','3JN','JUD','REV'
];

const NT_RED_BOOKS = {
  'MAT': 'matthew',
  'MRK': 'mark',
  'LUK': 'luke',
  'JHN': 'john',
  'ACT': 'acts',
  '1CO': '1_corinthians',
  '2CO': '2_corinthians',
  'REV': 'revelation'
};

const TARGET_DIR = path.resolve(__dirname, '../public/bible');
const TARGET_FILE = path.join(TARGET_DIR, 'kjv.json');

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: HTTP ${res.statusCode}`));
        return;
      }
      let buffer = '';
      res.on('data', chunk => buffer += chunk);
      res.on('end', () => resolve(buffer));
    }).on('error', reject);
  });
}

async function downloadKjv() {
  if (fs.existsSync(TARGET_FILE) && fs.statSync(TARGET_FILE).size > 3000000) {
    const existing = fs.readFileSync(TARGET_FILE, 'utf8');
    if (existing.includes('{For God so loved the world')) {
      console.log('[bundle-kjv] public/bible/kjv.json with Red Letter text is already healthy.');
      return;
    }
  }

  console.log('[bundle-kjv] Downloading canonical KJV Bible dataset...');
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  const url = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json';
  const rawJson = await fetchBuffer(url);

  const parsed = JSON.parse(rawJson);
  if (!Array.isArray(parsed) || parsed.length !== 66) {
    throw new Error(`Expected 66 books in KJV, received ${parsed?.length}`);
  }

  const compact = {};
  let totalVerses = 0;

  parsed.forEach((b, bIdx) => {
    const bookId = BOOK_ORDER[bIdx];
    b.chapters.forEach((verses, cIdx) => {
      const key = `${bookId}:${cIdx + 1}`;
      compact[key] = verses;
      totalVerses += verses.length;
    });
  });

  // Overlay Red Letter Words of Jesus for New Testament
  console.log('[bundle-kjv] Overlaying Words of Christ in Red tags...');
  for (const [code, file] of Object.entries(NT_RED_BOOKS)) {
    try {
      const rawBook = await fetchBuffer(`https://raw.githubusercontent.com/nolanbaxter/kjv-bible/master/${file}.json`);
      const bookData = JSON.parse(rawBook);
      for (const chNum in bookData.chapters) {
        const key = `${code}:${chNum}`;
        const versesObj = bookData.chapters[chNum];
        const versesArray = [];
        const vKeys = Object.keys(versesObj).map(Number).sort((a,b) => a - b);
        for (const vNum of vKeys) {
          versesArray.push(versesObj[String(vNum)]);
        }
        compact[key] = versesArray;
      }
    } catch (err) {
      console.warn(`[bundle-kjv] Warning: failed to overlay red letters for ${code}:`, err.message);
    }
  }

  const output = JSON.stringify(compact);
  fs.writeFileSync(TARGET_FILE, output, 'utf-8');

  console.log(`[bundle-kjv] Successfully packaged KJV Bible with Red Letters:`);
  console.log(` - Chapters: ${Object.keys(compact).length}`);
  console.log(` - File Size: ${(output.length / (1024 * 1024)).toFixed(2)} MB`);
}

downloadKjv().catch(err => {
  console.error('[bundle-kjv] Error:', err);
  process.exit(1);
});
