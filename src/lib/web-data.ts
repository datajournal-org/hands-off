import sharp from 'npm:sharp';
import { getImages } from './sprites.ts';
import { UserEvents } from './user-events.ts';
import * as Path from 'node:path';


interface WebEntry {
	region: string;
	notes?: string;
	coordinates: [number, number];
	sprite?: string;
	sources: WebSource[];
}

export interface WebSource {
	url: string;
	images: string[];
}

export async function buildWebEntries(userEntries: UserEvents, targetDir: string): Promise<void> {
	const resolve = (path: string) => Path.resolve(targetDir, path);

	const result: WebEntry[] = [];
	for (const event of Object.values(userEntries)) {
		if (!event.sources) continue;

		const { sprite, sources } = await getImages(event.sources);

		const entry: WebEntry = {
			region: event.region,
			coordinates: event.coordinates.map(v => Math.round(v * 1e4) / 1e4) as [number, number],
			sprite,
			sources
		};

		if (event.region == 'Heard Island') entry.notes = 'Of course this is meant as a joke!';

		result.push(entry)
	}

	const spriteList = result.map(e => e.sprite).filter(e => e != null);
	const spriteLookup = await buildSprites(spriteList);

	result.forEach(e => e.sprite = e.sprite && spriteLookup.get(e.sprite));
	await Deno.writeTextFile(resolve('data.json'), JSON.stringify(result));


	async function buildSprites(spriteList: string[]): Promise<Map<string, string>> {
		const spriteSize = 64;
		const spriteCount = Math.ceil(Math.sqrt(spriteList.length));
		const imageSize = spriteSize * spriteCount;

		if (spriteList.length > spriteCount ** 2) throw new Error(`Too many sprites: ${spriteList.length}`);


		const spriteJSON: Record<string, unknown> = {};
		const overlays: sharp.OverlayOptions[] = [];
		const cutout = await sharp(`data/cutout${spriteSize}.png`).raw().toBuffer();
		if (cutout.length !== spriteSize * spriteSize * 3) throw new Error(`Invalid cutout size: ${cutout.length}`);;

		const spriteLookup = new Map<string, string>();
		for (let i = 0; i < spriteList.length; i++) {
			const col = i % spriteCount;
			const row = Math.floor(i / spriteCount);
			const key = numberToIndex(i);
			const spriteFilename = spriteList[i];

			const spriteBuffer = await sharp(spriteFilename)
				.resize(spriteSize, spriteSize)
				.ensureAlpha()
				.raw()
				.toBuffer();

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

			spriteLookup.set(spriteFilename, key);
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

		return spriteLookup;
	}
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