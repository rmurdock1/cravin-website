// Resize and re-encode the site's photos in public/img, in place.
//
// Netlify's image CDN resizes from these files on every cache miss, so a
// 4608px original makes each new size slow to generate. This keeps each photo
// at about twice the largest size it's shown at, saves it as a real
// progressive JPEG in sRGB, and strips EXIF (camera data, GPS). Filenames
// don't change: .gitignore whitelists the our_story photos by name.
//
// Run from the repo root after adding or replacing a photo:
//   node scripts/optimize-images.mjs            # every photo listed below
//   node scripts/optimize-images.mjs food-spread.jpeg
// Uses the sharp that Next.js already installs.
import sharp from 'sharp';
import { renameSync, statSync } from 'node:fs';
import { join } from 'node:path';

const IMG_DIR = join(process.cwd(), 'public/img');

// Longest edge in px. Full-bleed backgrounds get 2560; everything else is
// capped at twice its largest display size.
const PHOTOS = {
  'food-spread.jpeg': 2560,
  'jerk-chicken-close.jpg': 2560,
  'jerk-chicken-plate.jpg': 2048,
  'ackee-saltfish.jpg': 2048,
  'storefront-ossining.jpg': 1600,
  'storefront-white-plains.jpg': 2000,
  'storefront-mount-vernon.jpg': 1600,
  'our_story/grand-opening-crowd.jpg': 2560,
  'our_story/wp-grand-opening-storefront.jpg': 2000,
  'our_story/proclamations.jpg': 2048,
};

const only = process.argv.slice(2);
const targets = only.length ? only : Object.keys(PHOTOS);

for (const name of targets) {
  const maxEdge = PHOTOS[name];
  if (!maxEdge) {
    console.error(`skip ${name}: add it to PHOTOS with a max edge first`);
    continue;
  }
  const file = join(IMG_DIR, name);
  const before = statSync(file).size;
  const meta = await sharp(file).metadata();
  const tmp = `${file}.tmp`;
  await sharp(file)
    .rotate() // apply EXIF orientation before the EXIF is dropped
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
    .withIccProfile('srgb') // convert to sRGB and tag it; all other metadata is dropped
    .jpeg({ quality: 82, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0' })
    .toFile(tmp);
  const out = await sharp(tmp).metadata();
  renameSync(tmp, file);
  const after = statSync(file).size;
  console.log(
    `${name}: ${meta.format} ${meta.width}x${meta.height} ${Math.round(before / 1024)}KB -> jpeg ${out.width}x${out.height} ${Math.round(after / 1024)}KB`,
  );
}
