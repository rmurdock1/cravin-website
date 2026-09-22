// Site photos as static imports. next/image then serves each one from a
// content-hashed /_next/static/media URL, which Netlify caches for a year
// (immutable), and its image CDN passes that caching on to every resized copy.
// Plain /img/... paths get Netlify's default max-age=0, so browsers re-check
// every image on every visit. A static import also gives next/image the real
// width/height and a tiny inline blurDataURL for placeholder="blur".
//
// Keep the /img/... string paths only where a plain URL is required (Open
// Graph image, JSON-LD). Run scripts/optimize-images.mjs after replacing a
// photo.
import type { StaticImageData } from 'next/image';

import foodSpread from '@/public/img/food-spread.jpeg';
import jerkChickenClose from '@/public/img/jerk-chicken-close.jpg';
import jerkChickenPlate from '@/public/img/jerk-chicken-plate.jpg';
import ackeeSaltfish from '@/public/img/ackee-saltfish.jpg';
import jerkChickenCombo from '@/public/img/food/CravinJamaican_JerkChickenCombo.jpeg';
import oxtailCombo from '@/public/img/food/CravinJamaican_OxTailCombo.jpeg';
import storefrontOssining from '@/public/img/storefront-ossining.jpg';
import storefrontWhitePlains from '@/public/img/storefront-white-plains.jpg';
import storefrontMountVernon from '@/public/img/storefront-mount-vernon.jpg';
import grandOpeningCrowd from '@/public/img/our_story/grand-opening-crowd.jpg';
import wpGrandOpeningStorefront from '@/public/img/our_story/wp-grand-opening-storefront.jpg';
import proclamations from '@/public/img/our_story/proclamations.jpg';

export const photos = {
  foodSpread,
  jerkChickenClose,
  jerkChickenPlate,
  ackeeSaltfish,
  jerkChickenCombo,
  oxtailCombo,
  grandOpeningCrowd,
  wpGrandOpeningStorefront,
  proclamations,
};

/** Storefront photo for each open location, keyed by location id. */
export const storefrontPhotos: Record<string, StaticImageData> = {
  ossining: storefrontOssining,
  'white-plains': storefrontWhitePlains,
  'mount-vernon': storefrontMountVernon,
};
