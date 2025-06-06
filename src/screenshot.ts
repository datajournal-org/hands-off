import { firefox } from 'playwright';


const cp = new Deno.Command('deno', { args: ['task', 'dev'] }).spawn();

await wait(1);

const scale = 2;
const width = 1280 / scale;
const height = 720 / scale;

const browser = await firefox.launch();
const context = await browser.newContext({
	colorScheme: 'light',
	deviceScaleFactor: scale,
	locale: 'de-DE',
	viewport: { width, height },
});

const page = await context.newPage();

console.log('navigating map');
await page.goto('http://127.0.0.1:8081/map.html');
await wait(5);

const controls = page.locator('.maplibregl-control-container');
await controls.evaluate(e => e.remove());

await wait(1);

console.log(`capturing`);
await page.screenshot({ path: 'web/preview.png' });

console.log(`killing server`);
cp.kill('SIGHUP');
await wait(1);

console.log(`closing browser`);
await browser.close();

console.log(`done`);
Deno.exit(0);



function wait(sec: number) {
	return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}