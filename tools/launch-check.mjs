import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html')).sort();
const assetAttrs = /\b(?:href|src)=["']([^"']+)["']/gi;
const idAttr = /\bid=["']([^"']+)["']/gi;
const jsonLdBlock = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
const issues = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function existsLocal(ref) {
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) return true;
  return fs.existsSync(path.join(root, clean));
}

function isExternal(ref) {
  return /^(https?:|mailto:|tel:|sms:|whatsapp:)/i.test(ref);
}

function collectIds(html) {
  const ids = new Map();
  let match;
  while ((match = idAttr.exec(html))) {
    const id = match[1];
    ids.set(id, (ids.get(id) || 0) + 1);
  }
  return ids;
}

for (const file of htmlFiles) {
  const html = read(file);
  const ids = collectIds(html);

  if (!/<title>[^<]{10,}<\/title>/i.test(html)) issues.push(`${file}: missing or very short <title>`);
  if (!/<meta\s+content=["'][^"']{40,}["']\s+name=["']description["']/i.test(html)) {
    issues.push(`${file}: missing or very short meta description`);
  }
  if (!/<link\s+href=["']https:\/\/amkcare\.co\.uk\/[^"']*["']\s+rel=["']canonical["']/i.test(html)) {
    issues.push(`${file}: missing canonical URL`);
  }

  for (const [id, count] of ids) {
    if (count > 1) issues.push(`${file}: duplicate id "${id}"`);
  }

  if (/<img\b(?![^>]*\balt=)/i.test(html)) issues.push(`${file}: image without alt attribute`);

  let jsonMatch;
  while ((jsonMatch = jsonLdBlock.exec(html))) {
    try {
      JSON.parse(jsonMatch[1]);
    } catch (error) {
      issues.push(`${file}: invalid JSON-LD (${error.message})`);
    }
  }

  const lower = html.toLowerCase();
  for (const phrase of ['to be confirmed', 'before final public launch', 'regulatory wording should be updated']) {
    if (lower.includes(phrase)) issues.push(`${file}: public placeholder copy remains: "${phrase}"`);
  }

  let refMatch;
  while ((refMatch = assetAttrs.exec(html))) {
    const ref = refMatch[1];
    if (isExternal(ref) || ref.startsWith('data:')) continue;

    const [localPath, hash] = ref.split('#');
    if (localPath && !existsLocal(localPath)) {
      issues.push(`${file}: missing local reference "${ref}"`);
    }
    if ((!localPath || localPath === file) && hash && !ids.has(hash)) {
      issues.push(`${file}: missing same-page anchor "#${hash}"`);
    }
  }
}

const sitemapPath = path.join(root, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const locs = [...sitemap.matchAll(/<loc>https:\/\/amkcare\.co\.uk\/([^<]*)<\/loc>/g)].map((match) => match[1] || 'index.html');
  for (const loc of locs) {
    const file = loc === '' ? 'index.html' : loc;
    if (!htmlFiles.includes(file)) issues.push(`sitemap.xml: references missing page "${loc || '/'}"`);
  }
  if (sitemap.includes('/thank-you.html')) issues.push('sitemap.xml: thank-you page should not be indexed');
}

const thankYou = htmlFiles.includes('thank-you.html') ? read('thank-you.html') : '';
if (thankYou && !/<meta\s+name=["']robots["']\s+content=["']noindex/i.test(thankYou)) {
  issues.push('thank-you.html: missing noindex robots meta');
}

const manifestPath = path.join(root, 'site.webmanifest');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const icon of manifest.icons || []) {
      if (icon.src && !existsLocal(icon.src)) issues.push(`site.webmanifest: missing icon "${icon.src}"`);
    }
  } catch (error) {
    issues.push(`site.webmanifest: invalid JSON (${error.message})`);
  }
}

if (issues.length) {
  console.error(`Launch check found ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Launch check passed for ${htmlFiles.length} HTML pages.`);
