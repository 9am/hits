import { Application, Router, Status } from 'jsr:@oak/oak';
import { incHit, listData, reset } from './db.ts';
import { renderBasic } from './painter.ts';

const PORT = Deno.env.get('PORT') ?? 8000;
const ALLOW_ORIGIN = Deno.env.get('ALLOW_ORIGIN') ?? '*';
const ALLOW_REFERER = Deno.env.get('ALLOW_REFERER') ?? 'http://localhost';
const NOT_FOUND = Deno.env.get('NOT_FOUND') ?? '/';
const allowReferer = ALLOW_REFERER.split(',').map((ref) => new RegExp(`^${ref}`)) ?? [];

const router = new Router();
router
    .get('/api', async (ctx) => {
        try {
            const q = ctx.request.url.searchParams;
            const rf = q.get('referer') ?? undefined;
            const theme = q.get('theme') ?? undefined;
            const prefix = q.get('prefix') ?? undefined;
            const charts = q.get('charts') ?? '';
            const last_n_days = q.get('last_n_days') ?? 7;
            const referer = rf ?? ctx.request.headers.get('referer') ?? '-';
            if (allowReferer.every((pattern) => !pattern.test(referer))) {
                throw new Error(`referer {${referer}} not allowed!`);
            }
            const ua = ctx.request.headers.get('user-agent') ?? '';
            const ip = ctx.request.ip ?? '';
            const types = charts.split(',') ?? [];
            const raw = await Promise.all(types.map(async (chart) => {
                const list = await listData(referer, chart, { last_n_days });
                return { [chart]: list };
            }));
            const data = raw.reduce((memo, val) => ({...memo, ...val}), {});

            const hits = await incHit(referer, ip, ua);

            ctx.response.headers.set('Cache-Control', 'max-age=1, s-maxage=1');
            ctx.response.body = renderBasic({ hits, theme, prefix, ...data });
            ctx.response.type = 'image/svg+xml; charset=utf-8';
        } catch (err) {
            ctx.response.headers.set('Cache-Control', `no-cache, no-store, must-revalidate`);
            ctx.response.body = err.message;
            ctx.response.status = Status.BadRequest;
            console.error('[api error]', err);
        }
    });

const app = new Application();
app.use(async (ctx, next) => {
    ctx.response.headers.set('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    await next();
});
app.use(router.routes());
app.use(router.allowedMethods());
app.use((ctx) => {
    ctx.response.redirect(NOT_FOUND);
});

export const start = () => {
    console.info(`server listening on port ${PORT}, ${ALLOW_ORIGIN}, ${ALLOW_REFERER}, ${NOT_FOUND}`);
    app.listen({ port: PORT as number });
};
