import { ensureDir } from '@std/fs';
import { loadUserEvents } from './lib/user-events.ts';
import { buildWebEntries } from './lib/web-data.ts';


const events = loadUserEvents();

ensureDir('web/data');
ensureDir('web/images');
await buildWebEntries(events, 'web/data');


