#!/usr/bin/env node
import { readdir, stat, copyFile, access } from "node:fs/promises";
import { join, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = join(ROOT, "public");

const TARGETS = [
  { dir: "cases", maxWidth: 1920, quality: 78 },
  { dir: "process", maxWidth: 1920, quality: 78 },
  { dir: "textures", maxWidth: 1920, quality: 80 },
];

const EXT = new Set([".jpg", ".jpeg", ".png"]);

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (EXT.has(extname(e.name).toLowerCase()) && !e.name.includes(".orig.")) {
      out.push(full);
    }
  }
  return out;
}

async function processFile(file, { maxWidth, quality }) {
  const ext = extname(file);
  const base = basename(file, ext);
  const dir = dirname(file);
  const origBackup = join(dir, `${base}.orig${ext}`);

  if (!(await exists(origBackup))) {
    await copyFile(file, origBackup);
  }

  const before = (await stat(origBackup)).size;

  const img = sharp(origBackup, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  const targetWidth = meta.width && meta.width > maxWidth ? maxWidth : meta.width;

  await img
    .resize({ width: targetWidth, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toFile(file + ".tmp");

  const { rename } = await import("node:fs/promises");
  await rename(file + ".tmp", file);

  const after = (await stat(file)).size;
  const savedKB = ((before - after) / 1024).toFixed(0);
  const pct = (((before - after) / before) * 100).toFixed(0);
  console.log(`  ${basename(file).padEnd(32)} ${(before/1024).toFixed(0).padStart(5)}KB -> ${(after/1024).toFixed(0).padStart(5)}KB  (-${pct}%, -${savedKB}KB)`);

  return { before, after };
}

async function main() {
  console.log("[optimize-images] Starting...");
  let totalBefore = 0;
  let totalAfter = 0;

  for (const target of TARGETS) {
    const targetPath = join(PUBLIC_DIR, target.dir);
    if (!(await exists(targetPath))) {
      console.log(`[skip] ${target.dir} (not found)`);
      continue;
    }
    console.log(`\n[${target.dir}] maxWidth=${target.maxWidth} quality=${target.quality}`);
    const files = await walk(targetPath);
    for (const file of files) {
      try {
        const { before, after } = await processFile(file, target);
        totalBefore += before;
        totalAfter += after;
      } catch (err) {
        console.error(`  ERROR ${file}: ${err.message}`);
      }
    }
  }

  const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(2);
  const pct = totalBefore > 0 ? (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0) : "0";
  console.log(`\n[optimize-images] Done.`);
  console.log(`  Before: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  After:  ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Saved:  ${savedMB} MB (-${pct}%)`);
  console.log(`\n  Originals backed up as *.orig.<ext> (git-ignored recommended).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
