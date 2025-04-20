import { getPolRevEvents } from './lib/pol-rev-events.ts';
import { loadUserEvents, saveUserEvents } from './lib/user-events.ts';

Deno.chdir(new URL('..', import.meta.url));


const polEvents = getPolRevEvents();
const usrEvents = loadUserEvents();

for (const polEvent of polEvents) {
	const usrEvent = usrEvents[polEvent.key];
	if (!usrEvent) {
		console.error(`Missing user event for ${polEvent.key}`);
		usrEvents[polEvent.key] = {
			coordinates: polEvent.coordinates,
			region: polEvent.region,
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
