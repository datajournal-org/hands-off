import { date } from '../config.ts';
import { Calendar } from '../data/calendar-type.ts';

Deno.chdir(new URL('..', import.meta.url));

const timeMin = new Date(date + 'T00:00:00-08:00').toISOString(); // Pacific Time
const timeMax = new Date(date + 'T24:00:00-04:00').toISOString(); // Eastern Time

console.log('timeMin', timeMin);
console.log('timeMax', timeMax);

const calendar = JSON.parse(Deno.readTextFileSync('data/calendar.json')) as Calendar;

const events = calendar.data.searchEvents.elements.filter(e => {
	if (e.status !== 'CONFIRMED') return false;
	if (e.beginsOn < timeMin) return false;
	if (e.beginsOn > timeMax) return false;
	if (!e.physicalAddress) return false;
	if (!e.physicalAddress.geom) return false;
	if (!e.physicalAddress.region) return false;
	if (!e.physicalAddress.locality) return false;
	if (e.physicalAddress.country !== 'United States') return false;
	return true
}).map(e => {
	const p = e.physicalAddress!;
	let address = [p.description, p.street, p.postalCode, p.locality, p.region].filter(Boolean).map(s => s!.trim());
	address = address.filter((item, pos) => address.indexOf(item) == pos);
	const region = `${p.locality}, ${p.region}`;
	const key = cleanup(p.region!) + '/' + cleanup(p.locality!);
	return {
		beginsOn: e.beginsOn,
		endsOn: e.endsOn,
		timezone: e.options.timezone,
		title: e.title,
		address,
		key,
		region,
		coordinates: p.geom?.split(';').map(Number),
	}
})

//events.sort();

//console.log(events.map(e => e.beginsOn).join('\n'));
console.log(events);


function cleanup(text: string): string {
	return `${text}`.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
}