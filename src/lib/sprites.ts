
import { crypto } from 'jsr:@std/crypto';
import { UserSource } from './user-events.ts';
import sharp from 'npm:sharp';
import { WebSource } from "./web-data.ts";
import { Cache } from "./cache.ts";

export interface Sprite {
	filename: string
}

const cache = new Cache();

export async function getImages(userSources: UserSource[]): Promise<{ sprites: string[], sources: WebSource[] }> {
	const sprites: string[] = [];
	const sources: WebSource[] = [];
	for (const { url, photos } of userSources) {
		if (url === '...') continue;

		const images: string[] = [];
		for (const photo of photos) {
			if (photo === '...') continue;
			const key = hash(photo);

			if (!cache.has(key)) await downloadPhoto(key, photo);

			sprites.push(cache.getFilename(key));
			images.push(key);
		}
		if (images.length > 0) {
			sources.push({ url, images });
		}
	}

	if (sprites.length > 7) sprites.length = 7;

	return { sprites, sources };
}

async function downloadPhoto(key: string, url: string) {
	if (cache.has(key)) return;

	const response = await fetch(url, {
		"headers": {
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/png,image/jpeg;q=0.8,application/signed-exchange;v=b3;q=0.7',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'priority': 'u=0, i',
			'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"macOS"',
			'sec-fetch-dest': 'document',
			'sec-fetch-mode': 'navigate',
			'sec-fetch-site': 'none',
			'sec-fetch-user': '?1',
			'upgrade-insecure-requests': '1',
		},
		'referrerPolicy': 'strict-origin-when-cross-origin',
		'method': 'GET'
	});

	if (!response.ok) throw new TypeError(`Failed to fetch ${url}: ${response.statusText}`);
	const bytes = await response.bytes();

	cache.add(key);
	const filename = cache.getFilename(key);

	await sharp(bytes).resize(512, 512).webp({ quality: 90 }).toFile(filename);
}

function hash(text: string): string {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = crypto.subtle.digestSync('MD5', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 8);
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return hashHex;
}
