import { getPolRevEvents } from './lib/pol-rev-events.ts';
import { loadUserEvents, UserEvents } from "./lib/user-events.ts";

Deno.chdir(new URL('..', import.meta.url));


const polEvents = getPolRevEvents();
let usrEvents: UserEvents = {};
try {
	usrEvents = loadUserEvents();
} catch (e) {
	console.error((e as Error).message);
}

for (const polEvent of polEvents) {
	const usrEvent = usrEvents[polEvent.key];
	if (!usrEvent) {
		console.error(`Missing user event for ${polEvent.key}`);
		console.log([
			`${polEvent.key}:`,
			`  title: ${JSON.stringify(polEvent.title)}`,
			`  region: ${JSON.stringify(polEvent.region)}`,
			`  address: ${JSON.stringify(polEvent.address)}`,
			`  coordinates: ${JSON.stringify(polEvent.coordinates)}`,
			`  photos:`,
			`    - ... # add verified social media links here`,
			``,
		].join('\n'));
	}
}
