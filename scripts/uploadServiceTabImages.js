#!/usr/bin/env node
/**
 * Upload Tab-1 local images to Firebase Storage (`images/serviceImg`), write the
 * public download URLs into `scripts/data/serviceTabContent.json`, then (with
 * `--seed`) push image / subheading / description (en + hi) into `servicesoffereds`.
 *
 *   node scripts/uploadServiceTabImages.js
 *   node scripts/uploadServiceTabImages.js --apply
 *   node scripts/uploadServiceTabImages.js --apply --seed --backup=/tmp/tab1-backup.json
 *   node scripts/uploadServiceTabImages.js --apply --seed --env=production --backup=/tmp/tab1-prod.json
 *
 * Dry-run by default. Does not delete local files under public/images/.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { randomUUID } = require("crypto");

const REPO_ROOT = path.resolve(__dirname, "..");
const SEED_FILE = path.join(__dirname, "data", "serviceTabContent.json");
const BUCKET_NAME = "iatrichealthcare-998f5.appspot.com";

const USAGE = `Usage: node scripts/uploadServiceTabImages.js [options]

  --apply              upload to Firebase and rewrite serviceTabContent.json
  --seed               after upload, run scripts/seedServiceOfferedContent.js
  --force              re-upload even when image is already a Firebase URL
  --env=production     load .env.production (IATRIC) instead of .env (IATRIC_test)
  --backup=PATH        forwarded to the seed script
  --uri=URI            forwarded to the seed script
  -h, --help           show this help
`;

function parseArgs(argv) {
  const options = {
    apply: false,
    seed: false,
    force: false,
    env: "development",
    backup: null,
    uri: null,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--apply") options.apply = true;
    else if (arg === "--seed") options.seed = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg.startsWith("--env=")) options.env = arg.slice("--env=".length);
    else if (arg.startsWith("--backup=")) options.backup = arg.slice("--backup=".length);
    else if (arg.startsWith("--uri=")) options.uri = arg.slice("--uri=".length);
    else {
      console.error(`Unknown option: ${arg}\n`);
      console.error(USAGE);
      process.exit(1);
    }
  }

  return options;
}

function loadEnvFile(file, { override = false } = {}) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    if (!override && process.env[match[1]] !== undefined) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

const slugify = (value) =>
  String(value || "service")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "service";

const isRemote = (value) => /^(https?:)?\/\//i.test(String(value || ""));

function localFileFor(service) {
  const relative = String(service.localImage || (!isRemote(service.image) ? service.image : "") || "")
    .trim()
    .replace(/^\//, "");
  if (!relative) return null;
  return path.join(REPO_ROOT, "public", relative);
}

function folderRoot() {
  return String(process.env.NEXT_PUBLIC_IMAGES_FOLDER || "images")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "") || "images";
}

async function optimizeToWebp(filePath) {
  const sharp = require(require.resolve("sharp", { paths: [REPO_ROOT] }));
  const image = sharp(filePath);
  const meta = await image.metadata();
  const width = meta.width || 1600;
  const height = meta.height || 1600;
  const scale = Math.min(1, 1600 / width, 1600 / height);
  return image
    .resize(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)), {
      fit: "inside",
    })
    .webp({ quality: 85 })
    .toBuffer();
}

function initAdmin() {
  const admin = require(require.resolve("firebase-admin", { paths: [REPO_ROOT] }));
  if (!admin.apps.length) {
    const privateKey = String(process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error("FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY missing.");
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID.replace(/"/g, ""),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      storageBucket: BUCKET_NAME,
    });
  }
  return admin.storage().bucket(BUCKET_NAME);
}

async function uploadBuffer(bucket, destination, buffer, token) {
  const file = bucket.file(destination);
  await file.save(buffer, {
    resumable: false,
    metadata: {
      contentType: "image/webp",
      cacheControl: "public, max-age=31536000",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(
    destination
  )}?alt=media&token=${token}`;
}

function runSeed(options) {
  const args = [path.join(REPO_ROOT, "scripts", "seedServiceOfferedContent.js")];
  if (options.apply) args.push("--apply");
  if (options.backup) args.push(`--backup=${options.backup}`);
  if (options.uri) args.push(`--uri=${options.uri}`);
  const env = { ...process.env };
  const result = spawnSync(process.execPath, args, {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env,
  });
  if (result.status !== 0) {
    throw new Error(`seedServiceOfferedContent.js exited with ${result.status}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(USAGE);
    return;
  }

  loadEnvFile(path.join(REPO_ROOT, ".env"));
  if (options.env === "production") {
    loadEnvFile(path.join(REPO_ROOT, ".env.production"), { override: true });
  }

  const seed = JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));
  const services = Array.isArray(seed.services) ? seed.services : [];
  const folder = `${folderRoot()}/serviceImg`;
  const mode = options.apply ? "APPLY" : "DRY RUN (nothing is uploaded or written)";

  console.log("HealthPath - upload Tab-1 service images");
  console.log(`env: ${options.env} | folder: ${folder} | mode: ${mode}`);

  const plan = [];
  for (const service of services) {
    const localPath = localFileFor(service);
    const skip = isRemote(service.image) && !options.force;
    plan.push({
      name: service.dbName,
      localPath,
      current: service.image,
      skip,
      destination: `${folder}/${slugify(service.dbName)}.webp`,
    });
  }

  for (const item of plan) {
    const exists = item.localPath && fs.existsSync(item.localPath);
    const size = exists ? fs.statSync(item.localPath).size : 0;
    console.log(
      `  - ${item.name}: ${item.skip ? "already remote, skip" : exists ? `${item.localPath} (${size} bytes) -> ${item.destination}` : `MISSING ${item.localPath}`}`
    );
  }

  const missing = plan.filter((item) => !item.skip && (!item.localPath || !fs.existsSync(item.localPath)));
  if (missing.length) {
    throw new Error(`Missing local files: ${missing.map((item) => item.name).join(", ")}`);
  }

  if (!options.apply) {
    console.log("Nothing uploaded. Re-run with --apply to upload and rewrite the seed JSON.");
    if (options.seed) {
      console.log("Also running seed dry-run…");
      runSeed({ ...options, apply: false });
    }
    return;
  }

  const bucket = initAdmin();
  const nextServices = [];

  for (let index = 0; index < services.length; index += 1) {
    const service = services[index];
    const item = plan[index];
    if (item.skip) {
      nextServices.push(service);
      continue;
    }

    const buffer = await optimizeToWebp(item.localPath);
    const token = randomUUID();
    const url = await uploadBuffer(bucket, item.destination, buffer, token);
    console.log(`  uploaded ${item.name} (${buffer.length} bytes) -> ${item.destination}`);
    nextServices.push({
      ...service,
      localImage: service.localImage || (!isRemote(service.image) ? service.image : service.localImage),
      image: url,
    });
  }

  fs.writeFileSync(
    SEED_FILE,
    `${JSON.stringify({ ...seed, services: nextServices }, null, 2)}\n`
  );
  console.log(`seed JSON updated: ${SEED_FILE}`);

  if (options.seed) runSeed(options);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
