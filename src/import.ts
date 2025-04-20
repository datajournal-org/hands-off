import { loadUserEvents, saveUserEvents, type UserSource } from './lib/user-events.ts';



const args = Deno.args;

const key = args.shift();
if (!key) {
	console.error("Missing key");
	Deno.exit(1);
}

const usrEvents = loadUserEvents();

if (!usrEvents[key]) {
	console.error(`Missing user event for ${key}`);
	Deno.exit(1);
}
const usrEvent = usrEvents[key];

let source: UserSource | undefined = undefined;
for (const url of args) {
	if (/^https:\/\/bsky.app\/profile\/.*\/post\/.*/.test(url)) {
		source = { url, photos: [] };
		usrEvent.sources.push(source);
		continue;
	}
	if (/^https:\/\/cdn.bsky.app\/img\/feed_thumbnail\/plain\/.*@jpeg/.test(url)) {
		if (!source) throw new Error(`Missing source for ${url}`);
		source.photos.push(url);
		continue;
	}
	throw new Error(`Invalid URL: ${url}`);
}

saveUserEvents(usrEvents);
