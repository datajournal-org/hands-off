import sharp from 'npm:sharp';
import { getImages } from './sprites.ts';
import { UserEvents } from './user-events.ts';
import * as Path from 'node:path';


interface WebEntry {
	region: string;
	coordinates: [number, number];
	sprites: string[];
	sources: WebSource[];
}

export interface WebSource {
	url: string;
	images: string[];
}

export async function buildWebEntries(userEntries: UserEvents, targetDir: string): Promise<void> {
	const resolve = (path: string) => Path.resolve(targetDir, path);

	const spriteSize = 64;
	const imageSize = 2048;
	const spriteCount = Math.floor(imageSize / spriteSize);

	const result: WebEntry[] = [];
	for (const event of Object.values(userEntries)) {
		const { sprites, sources } = await getImages(event.sources);

		result.push({
			region: event.region,
			coordinates: event.coordinates.map(v => Math.round(v * 1e4) / 1e4) as [number, number],
			sprites,
			sources
		})
	}

	const sprites = new Map(result.flatMap(entry => entry.sprites).map(sprite => [sprite, '']));
	if (sprites.size > 1024) throw new Error(`Too many sprites: ${sprites.size}`);

	const spriteJSON: Record<string, unknown> = {};
	const overlays: sharp.OverlayOptions[] = [];
	const cutout = await sharp(`data/cutout${spriteSize}.png`).raw().toBuffer();
	if (cutout.length !== spriteSize * spriteSize * 3) throw new Error(`Invalid cutout size: ${cutout.length}`);;

	let i = 0;
	for (const [sprite, _] of sprites) {
		const col = i % spriteCount;
		const row = Math.floor(i / spriteCount);
		const key = numberToIndex(i);

		const spriteBuffer = await sharp(sprite).resize(spriteSize, spriteSize).ensureAlpha().raw().toBuffer();
		if (spriteBuffer.length !== spriteSize * spriteSize * 4) throw new Error(`Invalid sprite size: ${spriteBuffer.length}`);

		for (let j = 0; j < cutout.length; j++) spriteBuffer[j * 4 + 3] *= cutout[j * 3] / 255;

		overlays.push({
			input: spriteBuffer,
			raw: { width: spriteSize, height: spriteSize, channels: 4 },
			left: col * spriteSize,
			top: row * spriteSize,
		});

		spriteJSON[key] = {
			width: spriteSize,
			height: spriteSize,
			x: col * spriteSize,
			y: row * spriteSize,
			pixelRatio: 1,
		};

		sprites.set(sprite, key);

		i++;
	}


	await sharp({
		create: {
			width: imageSize,
			height: imageSize,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 }
		}
	}).composite(overlays)
		.png({
			compressionLevel: 9,
			palette: true,
		})
		.toFile(resolve('sprites.png'));

	await Deno.writeTextFile(resolve('sprites.json'), JSON.stringify(spriteJSON));

	duplicateFile(resolve('sprites.png'), resolve('sprites@2x.png'));
	duplicateFile(resolve('sprites.json'), resolve('sprites@2x.json'));

	result.forEach(e => e.sprites = e.sprites.map(sprite => sprites.get(sprite)!));
	await Deno.writeTextFile(resolve('data.json'), JSON.stringify(result));
}

function duplicateFile(src: string, dest: string): void {
	const srcFile = Deno.readFileSync(src);
	Deno.writeFileSync(dest, srcFile);
}

function numberToIndex(num: number): string {
	let t = '';
	do {
		t = String.fromCharCode(num % 26 + 65) + t;
		num = Math.floor(num / 26);
	} while (num > 0);
	return t;
}