/// <reference lib="deno.unstable" />

// import ipParser from 'npm:geoip-lite';
// import usParser from 'npm:ua-parser-js';

const db = await Deno.openKv();

export const reset = async (referer = '') => {
    const iter = await db.list({ prefix: ['hit', referer] });
    for await (const res of iter) {
        db.delete(res.key);
    }
};

export const incHit = async (referer = '', ip: string, ua: string): Promise<number> => {
    // let ipResult = {};
    // try {
    //     ipResult = ipParser.lookup(ip);
    // } catch (err) {}
    // let uaResult = {};
    // try {
    //     uaResult = usParser(ua);
    // } catch (err) {}
    // console.log(uaResult);

    const commonKey = ['hit', referer];
    const totalKey = [...commonKey, 't'];
    const dateKey = [
        ...commonKey,
        'date',
        new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    ];
    // const geoKey = [...commonKey, 'geo', ipResult?.country ?? 'others'];
    // const browserKey = [...commonKey, 'browser', uaResult?.browser?.name ?? 'others'];
    // const deviceKey = [...commonKey, 'device', uaResult?.device?.vendor ?? 'others'];

    const val = new Deno.KvU64(1n);
    await db.atomic()
        .mutate({
            type: 'sum',
            key: totalKey,
            value: val,
        })
        .mutate({
            type: 'sum',
            key: dateKey,
            value: val,
        })
        .commit();

    const { value } = await db.get<number>(totalKey);
    return value as number;
};

export const listData = async (referer = '', key: string, filter = {}) => {
    const selector = key === 'date' ? {
        start: ['hit', referer, key, new Date(Date.now() - filter.last_n_days * 24 * 3600 * 1000).toISOString().slice(0, 10)]
    } : {};
    const iter = await db.list({ prefix: ['hit', referer, key], ...selector });
    const list = [];
    for await (const res of iter) {
        list.push(res);
    }
    return list.map(({ key, value }) => [key.slice(-1)[0], value]).sort(([, a], [, b]) =>
        Number(b) - Number(a)
    );
};
