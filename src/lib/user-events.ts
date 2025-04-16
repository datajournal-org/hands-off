import * as yaml from 'jsr:@std/yaml'
import { date } from '../../config.ts';

export function loadUserEvents() {
	const data = yaml.parse(Deno.readTextFileSync(`data/${date}.yaml`));
	if (!isUserEvents(data)) throw new TypeError('Invalid user events');
	return data;
}

export function saveUserEvents(data: UserEvents) {
	const yamlData = yaml.stringify(data, { lineWidth: -1 });
	Deno.writeTextFileSync(`data/${date}.yaml`, yamlData);
}

export type UserEvents = Record<string, UserEvent>;

interface UserEvent {
	address: string[];
	coordinates: [number, number];
	photos: string[];
	region: string;
	title: string;
}

// typeguard for UserEvents
function isUserEvents(data: unknown): data is UserEvents {
	if (typeof data !== 'object') throw new TypeError('Expected object');
	if (data == null) throw new TypeError('Expected object');

	for (const key in data) {
		if (typeof key !== 'string') throw new TypeError('Expected string');
		if (!/^[a-z0-9_]+\/[a-z0-9_]+$/.test(key)) throw new TypeError('Invalid key');

		try {
			const event = (data as Record<string, unknown>)[key];

			if (typeof event !== 'object') throw new TypeError('Expected object');
			if (event == null) throw new TypeError('Expected object');

			if (!('address' in event)) throw new TypeError('address is missing');
			if (!Array.isArray(event.address)) throw new TypeError('address is not an array');
			if (event.address.some((e: unknown) => typeof e !== 'string')) throw new TypeError('address is not an array of strings');

			if (!('coordinates' in event)) throw new TypeError('coordinates is missing');
			if (!Array.isArray(event.coordinates)) throw new TypeError('coordinates is not an array');
			if (event.coordinates.length !== 2) throw new TypeError('coordinates is not an array of length 2');
			if (event.coordinates.some((e: unknown) => typeof e !== 'number')) throw new TypeError('coordinates is not an array of numbers');

			if (!('photos' in event)) throw new TypeError('photos is missing');
			if (!Array.isArray(event.photos)) throw new TypeError('photos is not an array');
			if (event.photos.some((e: unknown) => typeof e !== 'string')) throw new TypeError('photos is not an array of strings');

			if (!('region' in event)) throw new TypeError('region is missing');
			if (typeof event.region !== 'string') throw new TypeError('region is not a string');

			if (!('title' in event)) throw new TypeError('title is missing');
			if (typeof event.title !== 'string') throw new TypeError('title is not a string');
		} catch (e) {
			throw new TypeError(`Invalid event ${key}: ${(e as TypeError).message}`);
		}
	}
	return true;
}