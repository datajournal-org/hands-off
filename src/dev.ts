import { serveDir } from 'jsr:@std/http';

Deno.serve(
	{ port: 8081 },
	(req) => serveDir(req, { fsRoot: './web', quiet: true }),
);
