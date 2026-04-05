#!/usr/bin/env node
/**
 * Payload Update Script
 * Checks GitHub for new releases of Hekate and Atmosphere,
 * downloads new payload files, and updates the manifest.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

interface PayloadVersion {
  version: string;
  file: string;
  date: string;
  url: string;
}

interface PayloadEntry {
  name: string;
  repo: string;
  latest: string;
  versions: PayloadVersion[];
}

interface Manifest {
  hekate: PayloadEntry;
  fusee: PayloadEntry;
  lastUpdated: string;
  maxVersionsToKeep: number;
}

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  html_url: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

const PAYLOADS_DIR = path.join(process.cwd(), 'public', 'payloads');
const MANIFEST_PATH = path.join(PAYLOADS_DIR, 'manifest.json');

async function fetchJSON<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'WebRCM-Payload-Updater',
        'Accept': 'application/vnd.github.v3+json',
      },
    };

    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        fetchJSON<T>(res.headers.location!).then(resolve).catch(reject);
        return;
      }

      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e}`));
        }
      });
    }).on('error', reject);
  });
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    const request = (downloadUrl: string) => {
      https.get(downloadUrl, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          request(res.headers.location!);
          return;
        }

        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

function loadManifest(): Manifest {
  const data = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  return JSON.parse(data);
}

function saveManifest(manifest: Manifest): void {
  manifest.lastUpdated = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function parseVersion(tagName: string): string {
  // Remove 'v' prefix if present
  return tagName.replace(/^v/, '');
}

async function checkAndUpdateHekate(manifest: Manifest): Promise<boolean> {
  console.log('Checking Hekate releases...');
  
  const release = await fetchJSON<GitHubRelease>(
    'https://api.github.com/repos/CTCaer/hekate/releases/latest'
  );
  
  const version = parseVersion(release.tag_name);
  
  if (manifest.hekate.latest === version) {
    console.log(`Hekate is up to date (v${version})`);
    return false;
  }
  
  console.log(`New Hekate version found: v${version}`);
  
  // Find the payload binary
  const payloadAsset = release.assets.find(
    (a) => a.name.match(/^hekate_ctcaer_[\d.]+\.bin$/) && !a.name.includes('ram8GB')
  );
  
  if (!payloadAsset) {
    console.error('Could not find Hekate payload binary in release assets');
    return false;
  }
  
  const fileName = `hekate_ctcaer_${version}.bin`;
  const destPath = path.join(PAYLOADS_DIR, 'hekate', fileName);
  
  console.log(`Downloading ${payloadAsset.name}...`);
  await downloadFile(payloadAsset.browser_download_url, destPath);
  
  // Update manifest
  const newVersion: PayloadVersion = {
    version,
    file: fileName,
    date: release.published_at.split('T')[0],
    url: release.html_url,
  };
  
  manifest.hekate.versions.unshift(newVersion);
  manifest.hekate.latest = version;
  
  // Trim old versions
  if (manifest.hekate.versions.length > manifest.maxVersionsToKeep) {
    const removed = manifest.hekate.versions.splice(manifest.maxVersionsToKeep);
    for (const old of removed) {
      const oldPath = path.join(PAYLOADS_DIR, 'hekate', old.file);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log(`Removed old version: ${old.file}`);
      }
    }
  }
  
  console.log(`Hekate updated to v${version}`);
  return true;
}

async function checkAndUpdateFusee(manifest: Manifest): Promise<boolean> {
  console.log('Checking Atmosphere releases...');
  
  const release = await fetchJSON<GitHubRelease>(
    'https://api.github.com/repos/Atmosphere-NX/Atmosphere/releases/latest'
  );
  
  const version = parseVersion(release.tag_name);
  
  if (manifest.fusee.latest === version) {
    console.log(`Fusee is up to date (v${version})`);
    return false;
  }
  
  console.log(`New Atmosphere version found: v${version}`);
  
  // Find fusee.bin
  const payloadAsset = release.assets.find((a) => a.name === 'fusee.bin');
  
  if (!payloadAsset) {
    console.error('Could not find fusee.bin in release assets');
    return false;
  }
  
  const fileName = `fusee_${version}.bin`;
  const destPath = path.join(PAYLOADS_DIR, 'fusee', fileName);
  
  console.log(`Downloading fusee.bin...`);
  await downloadFile(payloadAsset.browser_download_url, destPath);
  
  // Update manifest
  const newVersion: PayloadVersion = {
    version,
    file: fileName,
    date: release.published_at.split('T')[0],
    url: release.html_url,
  };
  
  manifest.fusee.versions.unshift(newVersion);
  manifest.fusee.latest = version;
  
  // Trim old versions
  if (manifest.fusee.versions.length > manifest.maxVersionsToKeep) {
    const removed = manifest.fusee.versions.splice(manifest.maxVersionsToKeep);
    for (const old of removed) {
      const oldPath = path.join(PAYLOADS_DIR, 'fusee', old.file);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log(`Removed old version: ${old.file}`);
      }
    }
  }
  
  console.log(`Fusee updated to v${version}`);
  return true;
}

async function main() {
  console.log('WebRCM Payload Updater\n');
  
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('Manifest not found at:', MANIFEST_PATH);
    process.exit(1);
  }
  
  const manifest = loadManifest();
  let updated = false;
  
  try {
    const hekateUpdated = await checkAndUpdateHekate(manifest);
    const fuseeUpdated = await checkAndUpdateFusee(manifest);
    updated = hekateUpdated || fuseeUpdated;
  } catch (error) {
    console.error('Error during update:', error);
    process.exit(1);
  }
  
  if (updated) {
    saveManifest(manifest);
    console.log('\nManifest updated successfully!');
    // Set output for GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, 'updated=true\n');
    }
  } else {
    console.log('\nNo updates available.');
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, 'updated=false\n');
    }
  }
}

main();
