import { loadUserEvents } from './lib/user-events.ts';
import { buildWebEntries } from './lib/web-data.ts';


const events = loadUserEvents();
await buildWebEntries(events, 'web/data');


