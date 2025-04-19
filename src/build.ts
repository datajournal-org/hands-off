import { ensureDirSync } from '@std/fs';
import { loadUserEvents } from './lib/user-events.ts';
import { buildWebEntries } from './lib/web-data.ts';


const events = loadUserEvents();

ensureDirSync('web/data');
ensureDirSync('web/images');

await buildWebEntries(events, 'web/data');


