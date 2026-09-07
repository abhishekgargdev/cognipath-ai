import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase } from '../src/lib/db/mongoose';
import { UserProfile } from '../src/lib/db/models/UserProfile';

async function runFinalQAPwaAudit() {
  console.log('=== Starting CogniPath AI Final QA & PWA Comprehensive Audit ===\n');

  // 1. Check database connection
  await connectToDatabase();
  console.log('✓ 1. MongoDB Atlas connection verified');

  // 2. Audit PWA Public Assets
  const publicDir = path.join(process.cwd(), 'public');
  const requiredAssets = [
    'manifest.json',
    'favicon.ico',
    'favicon.png',
    'apple-touch-icon.png',
    'icon-192.png',
    'icon-512.png',
    'icon-192-maskable.png',
    'icon-512-maskable.png',
  ];

  console.log('\n--- Auditing PWA Asset Directory (/public) ---');
  for (const asset of requiredAssets) {
    const filePath = path.join(publicDir, asset);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing required PWA asset: ${asset}`);
    }
    const stat = fs.statSync(filePath);
    console.log(`✓ Asset found: ${asset} (${stat.size} bytes)`);
  }

  // 3. Audit manifest.json schema
  console.log('\n--- Auditing manifest.json Schema ---');
  const manifestRaw = fs.readFileSync(path.join(publicDir, 'manifest.json'), 'utf-8');
  const manifest = JSON.parse(manifestRaw);

  if (manifest.name !== 'CogniPath AI') throw new Error(`Invalid manifest name: ${manifest.name}`);
  if (manifest.short_name !== 'CogniPath') throw new Error(`Invalid manifest short_name: ${manifest.short_name}`);
  if (manifest.display !== 'standalone') throw new Error(`Invalid display mode: ${manifest.display}`);
  if (manifest.background_color !== '#F9F7F2') throw new Error(`Invalid background_color: ${manifest.background_color}`);
  if (manifest.theme_color !== '#8B2635') throw new Error(`Invalid theme_color: ${manifest.theme_color}`);

  if (!Array.isArray(manifest.icons) || manifest.icons.length < 4) {
    throw new Error('manifest.json icons array is incomplete');
  }

  const hasAnyIcon = manifest.icons.some((i: any) => i.purpose === 'any');
  const hasMaskableIcon = manifest.icons.some((i: any) => i.purpose === 'maskable');

  if (!hasAnyIcon || !hasMaskableIcon) {
    throw new Error('manifest.json must contain both "any" and "maskable" purpose icon entries');
  }

  console.log('✓ manifest.json schema, background/theme colors, and adaptive icons array verified');

  // 4. Audit Offline Page Fallback
  const offlinePagePath = path.join(process.cwd(), 'src', 'app', 'offline', 'page.tsx');
  if (!fs.existsSync(offlinePagePath)) {
    throw new Error('Missing offline fallback page at src/app/offline/page.tsx');
  }
  console.log('✓ Offline fallback route at src/app/offline/page.tsx verified');

  // 5. Audit Route Metadata Exports
  console.log('\n--- Auditing App Page Metadata & Title Templates ---');
  const routes = [
    'src/app/(public)/page.tsx',
    'src/app/(app)/dashboard/page.tsx',
    'src/app/(app)/roadmap/page.tsx',
    'src/app/(app)/practice/page.tsx',
    'src/app/(app)/progress/page.tsx',
    'src/app/(app)/recommendations/page.tsx',
    'src/app/(app)/skills/page.tsx',
    'src/app/(app)/settings/page.tsx',
    'src/app/(app)/onboarding/page.tsx',
    'src/app/(app)/learn/[topicId]/page.tsx',
  ];

  for (const r of routes) {
    const fullPath = path.join(process.cwd(), r);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing page route: ${r}`);
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const hasMetadata = content.includes('metadata') || content.includes('generateMetadata');
    if (!hasMetadata) {
      throw new Error(`Route ${r} is missing metadata export!`);
    }
    console.log(`✓ Route metadata verified: ${r}`);
  }

  console.log('\n==================================================');
  console.log('🎉 COMPREHENSIVE FINAL QA & PWA AUDIT PASSED CLEAN!');
  console.log('==================================================');
  process.exit(0);
}

runFinalQAPwaAudit().catch((err) => {
  console.error('❌ QA / PWA Audit Failed:', err);
  process.exit(1);
});
