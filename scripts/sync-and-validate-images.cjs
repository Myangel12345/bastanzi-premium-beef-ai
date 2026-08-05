const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const srcDir = path.join(process.cwd(), 'src/assets/images');
const publicDir = path.join(process.cwd(), 'public/images');
const distDir = path.join(process.cwd(), 'dist/images');

const isVerifyDist = process.argv.includes('--verify-dist');

function computeSha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function validateImageData(filename, buf) {
  if (!buf || buf.length === 0) {
    throw new Error(`File ${filename} is empty (0 bytes).`);
  }

  const hexHeader = buf.slice(0, 4).toString('hex').toUpperCase();

  // Check JPEG format
  if (hexHeader.startsWith('FFD8FF')) {
    // Check EOF marker FFD9
    let hasEoi = false;
    if (buf.length > 2) {
      const tail = buf.slice(-100);
      for (let i = 0; i < tail.length - 1; i++) {
        if (tail[i] === 0xFF && tail[i + 1] === 0xD9) {
          hasEoi = true;
          break;
        }
      }
    }
    if (!hasEoi) {
      throw new Error(`File ${filename} is a corrupted JPEG (missing FFD9 EOI marker).`);
    }
    return 'JPEG';
  }

  // Check PNG format
  if (hexHeader === '89504E47') {
    return 'PNG';
  }

  // Check WebP format
  if (hexHeader === '52494646') {
    return 'WEBP';
  }

  // SVG format check
  const startStr = buf.slice(0, 100).toString('utf8');
  if (startStr.includes('<svg') || startStr.includes('<?xml')) {
    return 'SVG';
  }

  throw new Error(`File ${filename} failed format signature check (Header: 0x${hexHeader}). Corrupted or unsupported binary.`);
}

console.log('--------------------------------------------------');
console.log('📷 BASTANZI ASSETS SYNC & VERIFICATION PIPELINE');
console.log('--------------------------------------------------');

if (!fs.existsSync(srcDir)) {
  console.error(`❌ ERROR: Source image directory not found at ${srcDir}`);
  process.exit(1);
}

const srcFiles = fs.readdirSync(srcDir).filter(f => !f.startsWith('.')).sort();

if (srcFiles.length === 0) {
  console.error(`❌ ERROR: No image assets found in ${srcDir}`);
  process.exit(1);
}

console.log(`1. Validating ${srcFiles.length} original image files in src/assets/images...`);

const srcHashes = {};

for (const file of srcFiles) {
  const filePath = path.join(srcDir, file);
  const buf = fs.readFileSync(filePath); // Raw buffer - binary safe

  const format = validateImageData(file, buf);
  const hash = computeSha256(buf);
  srcHashes[file] = hash;

  console.log(`   ✅ [src/assets] ${file} (${buf.length} bytes, ${format}, SHA-256: ${hash.slice(0, 12)}...)`);
}

if (!isVerifyDist) {
  console.log('\n2. Syncing images to public/images (binary copy from single source of truth)...');

  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicDir, { recursive: true });

  for (const file of srcFiles) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(publicDir, file);

    fs.copyFileSync(srcPath, destPath);

    // Immediate binary integrity check on copied file
    const pubBuf = fs.readFileSync(destPath);
    validateImageData(file, pubBuf);

    const pubHash = computeSha256(pubBuf);
    if (pubHash !== srcHashes[file]) {
      console.error(`❌ FATAL: SHA-256 mismatch after copying ${file} to public/images!`);
      process.exit(1);
    }
  }

  console.log(`   ✅ All ${srcFiles.length} files successfully synchronized to public/images with matching SHA-256 hashes.`);
} else {
  console.log('\n2. Verifying build output in dist/images...');

  if (!fs.existsSync(distDir)) {
    console.error(`❌ FATAL: dist/images does not exist after build!`);
    process.exit(1);
  }

  const distFiles = fs.readdirSync(distDir).filter(f => !f.startsWith('.')).sort();

  for (const file of srcFiles) {
    const distPath = path.join(distDir, file);
    if (!fs.existsSync(distPath)) {
      console.error(`❌ FATAL: Image ${file} is missing from build output dist/images/!`);
      process.exit(1);
    }

    const distBuf = fs.readFileSync(distPath);
    validateImageData(file, distBuf);

    const distHash = computeSha256(distBuf);
    if (distHash !== srcHashes[file]) {
      console.error(`❌ FATAL: SHA-256 mismatch for ${file} in dist/images!`);
      process.exit(1);
    }
  }

  console.log(`   ✅ All ${srcFiles.length} files in dist/images verified valid and bit-for-bit identical to source assets.`);
}

console.log('--------------------------------------------------');
console.log('🎉 IMAGE VERIFICATION PASSED SUCCESSFULLY');
console.log('--------------------------------------------------\n');
