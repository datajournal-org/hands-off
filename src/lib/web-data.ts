import sharp from "sharp";
import { getImages } from './sprites.ts';
import { UserEvents } from './user-events.ts';


interface WebEntry {
	title: string;
	region: string;
	coordinates: [number, number];
	sprites: string[];
}

export async function buildWebEntries(userEntries: UserEvents): Promise<void> {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
	const spriteSize = 64;
	const imageSize = 2048;
	const spriteCount = Math.floor(imageSize / spriteSize);
	if (spriteCount > chars.length) throw new Error(`Too many sprites: ${spriteCount}`);

	const result: WebEntry[] = [];
	for (const event of Object.values(userEntries)) {
		const sprites = await getImages(event.sources);

		result.push({
			title: event.title,
			region: event.region,
			coordinates: event.coordinates,
			sprites,
		})
	}

	const sprites = new Map(result.flatMap(entry => entry.sprites).map(sprite => [sprite, '']));
	if (sprites.size > 1024) throw new Error(`Too many sprites: ${sprites.size}`);

	const spriteJSON: Record<string, unknown> = {};
	const overlays: sharp.OverlayOptions[] = [];
	const cutout = await sharp('data/cutout.png').raw().toBuffer();
	if (cutout.length !== spriteSize * spriteSize * 3) throw new Error(`Invalid cutout size: ${cutout.length}`);;

	let i = 0;
	for (const [sprite, _] of sprites) {
		const col = i % spriteCount;
		const row = Math.floor(i / spriteCount);
		const key = chars[col] + chars[row];

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
		.webp({ quality: 80 })
		.toFile('web/sprites.webp');

	await Deno.writeTextFile('web/sprites.json', JSON.stringify(spriteJSON));

	result.forEach(e => e.sprites = e.sprites.map(sprite => sprites.get(sprite)!));
	await Deno.writeTextFile('web/data.json', JSON.stringify(result));
}
