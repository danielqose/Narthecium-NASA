import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const framesDir = path.join(root, 'demo-out', 'frames');
const outFile = path.join(root, 'demo-out', 'narthecium-demo.mp4');
await mkdir(framesDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const client = await page.context().newCDPSession(page);
const frames = [];
client.on('Page.screencastFrame', async (frame) => {
  frames.push(Buffer.from(frame.data, 'base64'));
  await client.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {});
});
await client.send('Page.startScreencast', {
  format: 'jpeg',
  quality: 70,
  maxWidth: 1440,
  maxHeight: 900,
  everyNthFrame: 2,
});

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await page.getByRole('button', { name: '40 · Solar event' }).click();
await page.waitForTimeout(4500);
await page.getByRole('button', { name: '121 · Cabin air' }).click();
await page.waitForTimeout(4500);
await page.getByRole('button', { name: '102 · Sleep drift' }).click();
await page.waitForTimeout(4000);
await page.getByRole('button', { name: 'Treatments' }).click();
await page.waitForTimeout(5000);
await client.send('Page.stopScreencast').catch(() => {});
await browser.close();

const step = Math.max(1, Math.ceil(frames.length / 240));
let kept = 0;
for (let i = 0; i < frames.length; i += step) {
  kept += 1;
  await writeFile(path.join(framesDir, `f${String(kept).padStart(4, '0')}.jpg`), frames[i]);
}
const fps = Math.max(8, Math.round(kept / 28));
await new Promise((resolve, reject) => {
  const child = spawn('ffmpeg', [
    '-y',
    '-framerate', String(fps),
    '-i', path.join(framesDir, 'f%04d.jpg'),
    '-t', '30',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    outFile,
  ], { stdio: 'inherit' });
  child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`))));
});
console.log(outFile, 'frames', frames.length, 'kept', kept, 'fps', fps);
