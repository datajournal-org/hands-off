import { existsSync } from '@std/fs/exists';

const folder = 'web/images';

export class Cache {
	readonly cache: Set<string>;

	constructor() {
		this.cache = readCache();
	}

	add(key: string): void {
		if (this.cache.has(key)) throw new Error(`Key already exists: ${key}`);
		this.cache.add(key);
	}

	has(key: string): boolean {
		return this.cache.has(key);
	}

	getFilename(key: string): string {
		if (!this.cache.has(key)) throw new Error(`Key not found: ${key}`);
		return `${folder}/${key}.webp`;
	}
}

function readCache(): Set<string> {
	if (!existsSync(folder)) return new Set();

	const files = Array.from(Deno.readDirSync(folder));
	files.sort((a, b) => a.name.localeCompare(b.name));

	const cache = new Set<string>();
	for (const file of files) {
		if (!file.isFile) continue;
		if (!file.name.endsWith('.webp')) continue;
		const parts = file.name.split('.');
		if (parts.length !== 2) throw Error(`Invalid file name: ${file.name}`);
		const key = parts[0];
		if (cache.has(key)) throw Error(`Duplicate key: ${key}`);
		cache.add(key);
	}
	return cache;
}
