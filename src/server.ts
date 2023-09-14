import { Application, Router, Status } from 'https://deno.land/x/oak@v12.6.1/mod.ts';
import { getQuery } from 'https://deno.land/x/oak@v12.6.1/helpers.ts';
import { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts';
import { incHit, listData, reset } from './db.ts';
import { getSVG } from './painter.ts';

const PORT = Deno.env.get('PORT') ?? 8000;
const ALLOW_ORIGIN = Deno.env.get('ALLOW_ORIGIN') ?? '*';

const router = new Router();
router
    .get('/api/hits/reset', async (ctx) => {
        try {
            const { referer: rf } = getQuery(ctx);
            const referer = rf ?? ctx.request.headers.get('referer') ?? '-';
            await reset(referer);
            ctx.response.body = `reset! ${referer}`;
        } catch (err) {
            ctx.response.headers.set('Cache-Control', `no-cache, no-store, must-revalidate`);
            ctx.response.body = err.message;
            ctx.response.status = Status.BadRequest;
            console.error('api error', err);
        }
    })
    .get('/api/hits', async (ctx) => {
        try {
            const { referer: rf } = getQuery(ctx);
            const referer = rf ?? ctx.request.headers.get('referer') ?? '-';
            const ua = ctx.request.headers.get('user-agent') ?? '';
            const ip = ctx.request.ip ?? '';

            const hits = await incHit(referer, ip, ua);
            // const geo = await listData(referer, 'geo');
            const date = await listData(referer, 'date');
            const browser = await listData(referer, 'browser');
            const device = await listData(referer, 'device');
            ctx.response.headers.set('Cache-Control', 'max-age=1, s-maxage=1');
            // ctx.response.body = JSON.stringify({ hits, geo, date, browser, device }, null, 2);
            ctx.response.body = getSVG({ hits, date, browser, device });
            ctx.response.type = 'image/svg+xml; charset=utf-8';
        } catch (err) {
            ctx.response.headers.set('Cache-Control', `no-cache, no-store, must-revalidate`);
            ctx.response.body = err.message;
            ctx.response.status = Status.BadRequest;
            console.error('api error', err);
        }
    });

const app = new Application();
app.use(oakCors({ origin: ALLOW_ORIGIN })); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());
app.use((ctx) => {
    ctx.response.redirect('https://github.com/9am/hits');
});

export const start = () => {
    console.info(`server listening on port ${PORT}, ${ALLOW_ORIGIN}`);
    app.listen({ port: PORT as number });
};
