import { date, ignoreIds } from '../../config.ts';
import { Calendar } from './pol-rev-types.ts';

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

		const key = cleanup(p.region!) + '/' + cleanup(p.locality!);

		let address = [p.description, p.street, p.postalCode, p.locality, p.region].filter(Boolean).map(s => s!.trim());
		address = address.filter((item, pos) => address.indexOf(item) == pos);
		const region = `${p.locality}, ${p.region}`;
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

