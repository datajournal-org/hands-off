import { getPolRevEvents } from './lib/pol-rev-events.ts';
import { loadUserEvents, saveUserEvents, UserEvents } from './lib/user-events.ts';

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
		usrEvents[polEvent.key] = {
			address: polEvent.address,
			coordinates: polEvent.coordinates,
			region: polEvent.region,
			title: polEvent.title,
			sources: [],
		};
	}
}

for (const [key] of Object.entries(usrEvents)) {
	if (!polEvents.some((polEvent) => polEvent.key === key)) {
		console.warn(`Unknown event for ${key}`);
	}
}

saveUserEvents(usrEvents);
