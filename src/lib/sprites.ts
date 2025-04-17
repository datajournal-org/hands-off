
import { crypto } from 'jsr:@std/crypto';
import { UserSource } from './user-events.ts';
import sharp from 'npm:sharp';

export interface Sprite {
	filename: string
}

const cache = readCache();

function readCache(): Map<string, string> {
	const files = Array.from(Deno.readDirSync('cache'));
	files.sort((a, b) => a.name.localeCompare(b.name));

	const cache = new Map<string, string>();
	for (const file of files) {
		if (!file.isFile) continue;
		if (!file.name.endsWith('.webp')) continue;
		const parts = file.name.split('.');
		if (parts.length !== 2) throw Error(`Invalid file name: ${file.name}`);
		const key = parts[0];
		if (cache.has(key)) throw Error(`Duplicate key: ${key}`);
		cache.set(key, `cache/${file.name}`);
	}
	return cache;
}

export async function getImages(sources: UserSource[]): Promise<string[]> {
	const images: string[] = [];
	for (const { url, photos } of sources) {
		if (url === '...') continue;

		for (const photo of photos) {
			if (photo === '...') continue;
			const key = md5(photo);

			if (!cache.has(key)) await downloadPhoto(key, photo);

			images.push(cache.get(key)!);
		}
	}

	if (images.length > 7) images.length = 7;
	return images;
}

async function downloadPhoto(key: string, url: string) {
	if (cache.has(key)) return cache.get(key)!;
	const response = await fetch(url, {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/png,image/jpeg;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
			"priority": "u=0, i",
			"sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"macOS\"",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "none",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
		},
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET"
	});

	if (!response.ok) throw new TypeError(`Failed to fetch ${url}: ${response.statusText}`);
	const bytes = await response.bytes();

	const filename = `cache/${key}.webp`;
	cache.set(key, filename);
	await sharp(bytes).resize(512, 512).webp({ quality: 100 }).toFile(filename);
}

function md5(text: string): string {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = crypto.subtle.digestSync('MD5', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return hashHex;
}
