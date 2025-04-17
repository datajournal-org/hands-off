import { getPolRevEvents } from './lib/pol-rev-events.ts';
import { getUserEventAsYaml, loadUserEvents, UserEvents } from "./lib/user-events.ts";

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
		console.log(getUserEventAsYaml(polEvent.key, {
			address: polEvent.address,
			coordinates: polEvent.coordinates,
			region: polEvent.region,
			title: polEvent.title,
			sources: [
				{
					url: '... # source url, like a news article or a post on social media',
					photos: ['... # url of a jpeg, webp or png image', '... # select only good photos'],
				},
			],
		}));
	}
}
