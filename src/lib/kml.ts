import console from "node:console";

export interface GoogleMapsEntry {
	id: string;
	coordinates: number[];
	name: string;
	date: string;
	city: string;
	state: string;
	country: string;
	link?: string;
}

export async function downloadKmlEvents(): Promise<GoogleMapsEntry[]> {
	const url = 'https://www.google.com/maps/d/viewer?mid=1NiJprGgrxLL6FBEV0Cg2NtkHlLhc-kA'
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch KML: ${response.statusText}`);
	}
	return extractPoints(await response.text());
}

function extractPoints(html: string): GoogleMapsEntry[] {
	//const folders = xml.kml.Document.Folder.filter((f: any) => f.name.endsWith('April 19-27'));
	//if (folders.length !== 1) throw new Error('Expected exactly one folder');
	//const placemarks = folders[0].Placemark;
	const lines = html.split('\n').filter((line) => line.includes('var _pageData ='));
	if (lines?.length !== 1) throw new Error('Expected exactly one line, but got ' + lines?.length);
	const line = lines[0].replace(/^[^\"]*|;<\/script>.*/g, '');
	console.log(line.slice(0, 100));
	const mapData = JSON.parse(JSON.parse(line))[1];
	const folders = mapData[6];
	const folder = folders.find((f: unknown[]) => String(f[2]).endsWith('April 19-27'));
	const data = folder[12][0];
	if (data[0] !== '4MAvF89D7vQ') throw new Error('Expected first element to be 4MAvF89D7vQ');
	const entries = data[13][0];

	return entries.map(extractPoint);
}

function extractPoint(entry: any[]): GoogleMapsEntry {
	console.log(entry);
	const id = entry[0];
	const coordinates = entry[1][0][0];
	const prop = entry[5];

	const { name } = parseProperties(prop);

	if (!Array.isArray(prop[3])) throw new Error(`Expected prop[3] to be array`);

	const { date, zip, city, state, country, link } = parseProperties(prop[3]);

	const point = {
		id,
		coordinates,
		name,
		date,
		zip,
		city,
		state,
		country,
		link,
	};

	if (!isPoint(point)) throw new Error('Invalid point');

	return point;

	function parseProperties(properties: unknown): Record<string, string | undefined> {
		if (!Array.isArray(properties)) throw new Error(`Expected properties to be array`);

		const result = {} as Record<string, string | undefined>;
		for (const prop of properties) {
			if (!Array.isArray(prop)) continue;
			if (typeof prop[0] !== 'string') continue;

			if (!Array.isArray(prop[1])) throw new Error(`Expected prop[1] to be array`);
			if (prop[1].length !== 1) throw new Error(`Expected prop[1] to have 1 element`);
			if (typeof prop[1][0] !== 'string') throw new Error(`Expected prop[1][0] to be string`);
			if (prop[2] !== 1) throw new Error(`Expected prop[2] to be 1`);

			result[prop[0].toLowerCase()] = prop[1][0];
		}

		return result;
	}
}

// typeguard
function isPoint(entry: unknown): entry is GoogleMapsEntry {
	if (typeof entry !== 'object') throw new TypeError('Expected entry to be an object');
	if (entry === null) throw new TypeError('Entry is null, expected an object');

	if (!('id' in entry)) throw new TypeError('Missing property "id" in entry');
	if (typeof entry.id !== 'string') throw new TypeError('Property "id" must be a string');

	if (!('coordinates' in entry)) throw new TypeError('Missing property "coordinates" in entry');
	if (!Array.isArray(entry.coordinates)) throw new TypeError('Property "coordinates" must be an array');
	if (entry.coordinates.length !== 2) throw new TypeError('Property "coordinates" must have exactly 2 elements');
	if (typeof entry.coordinates[0] !== 'number') throw new TypeError('First element of "coordinates" must be a number');
	if (typeof entry.coordinates[1] !== 'number') throw new TypeError('Second element of "coordinates" must be a number');

	if (!('name' in entry)) throw new TypeError('Missing property "name" in entry');
	if (typeof entry.name !== 'string') throw new TypeError('Property "name" must be a string ');

	if (!('date' in entry)) throw new TypeError('Missing property "date" in entry');
	if (typeof entry.date !== 'string') throw new TypeError('Property "date" must be a string');

	if (!('city' in entry)) throw new TypeError('Missing property "city" in entry');
	if (typeof entry.city !== 'string') throw new TypeError('Property "city" must be a string');

	if (!('state' in entry)) throw new TypeError('Missing property "state" in entry');
	if (typeof entry.state !== 'string') throw new TypeError('Property "state" must be a string');

	if (!('country' in entry)) throw new TypeError('Missing property "country" in entry');
	if (typeof entry.country !== 'string') throw new TypeError('Property "country" must be a string');

	if (!('link' in entry)) throw new TypeError('Missing property "link" in entry');
	if (typeof entry.link !== 'string' && entry.link !== undefined) {
		throw new TypeError('Property "link" must be a string or undefined');
	}

	return true;
}