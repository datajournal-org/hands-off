import { date, ignoreIds } from '../../config.ts';
import { Calendar, PhysicalAddress } from './pol-rev-types.ts';

const usStates = new Set('Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming'.split(','));

export interface Event {
	beginsOn: string;
	endsOn: string;
	id: number;
	timezone: string;
	title: string;
	address: string[];
	key: string;
	region: string;
	coordinates: [number, number];
}

export function getPolRevEvents(): Event[] {
	const timeMin = new Date(date + 'T00:00:00-08:00').toISOString(); // Pacific Time
	const timeMax = new Date(date + 'T24:00:00-04:00').toISOString(); // Eastern Time

	const calendar = JSON.parse(Deno.readTextFileSync('data/calendar.json')) as Calendar;


	const events = new Map<string, Event>();

	calendar.data.searchEvents.elements.filter(e => {
		if (e.status !== 'CONFIRMED') return false;
		if (e.beginsOn < timeMin) return false;
		if (e.beginsOn > timeMax) return false;
		if (!e.physicalAddress) return false;
		if (!e.physicalAddress.geom) return false;
		if (!e.physicalAddress.region) return false;
		if (!e.physicalAddress.locality) return false;
		if (e.physicalAddress.country !== 'United States') return false;
		return true
	}).forEach(e => {
		const id = parseInt(e.id, 10);
		if (ignoreIds.includes(id)) return;

		const p = e.physicalAddress!;

		const polRevRegion = getRegion(p);
		const polRevLocality = getLocality(p);

		const key = cleanup(polRevRegion) + '/' + cleanup(polRevLocality);

		let address = [p.description, p.street, p.postalCode, polRevLocality, polRevRegion].filter(Boolean).map(s => s!.trim());
		address = address.filter((item, pos) => address.indexOf(item) == pos);
		const region = `${polRevLocality}, ${polRevRegion}`;
		const coordinates = p.geom?.split(';').map(Number);
		if (!coordinates || coordinates.length !== 2) {
			throw new Error(`Invalid coordinates: ${p.geom}`);
		}

		const event: Event = {
			id,
			beginsOn: e.beginsOn,
			endsOn: e.endsOn,
			timezone: e.options.timezone || '',
			title: e.title,
			address,
			key,
			region,
			coordinates: coordinates as [number, number],
		};

		if (events.has(key)) {
			console.error(events.get(key));
			console.error(event);
			throw new Error(`Duplicate event key: ${key}`);
		}

		events.set(key, event)
	})

	const eventsArray = Array.from(events.values());
	eventsArray.sort((a, b) => a.key.localeCompare(b.key));
	return eventsArray;
}


function cleanup(text: string): string {
	return `${text}`.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
}

function getRegion(p: PhysicalAddress): string {
	if (!p.region) {
		console.log(p);
		throw Error();
	}
	if (usStates.has(p.region)) return p.region;
	switch (p.region.toLowerCase()) {
		case 'ca': return 'California';
		case 'co': return 'Colorado';
		case 'dc': return 'Washington';
		case 'district of columbia': return 'Washington';
		case 'fl': return 'Florida';
		case 'ga': return 'Georgia';
		case 'il': return 'Illinois';
		case 'in': return 'Indiana';
		case 'ma': return 'Massachusetts';
		case 'md': return 'Maryland';
		case 'ny': return 'New York';
		case 'tn': return 'Tennessee';
		case 'tx': return 'Texas';
		case 'va': return 'Virginia';
		case 'wa': return 'Washington';
	}
	console.log(p);
	throw Error();
}

function getLocality(p: PhysicalAddress): string {
	if (p.locality) return p.locality;
	console.log(p);
	throw Error();
}

