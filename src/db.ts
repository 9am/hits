import ipParser from 'npm:geoip-lite';
import usParser from 'npm:ua-parser-js';

const db = await Deno.openKv();

export const reset = async (referer: string = '') => {
    const iter = await db.list({ prefix: ['hit', referer] });
    for await (const res of iter) {
        db.delete(res.key);
    }
};

export const incHit = async (referer: string = '', ip: string, ua: string): Promise<number> => {
    let ipResult = {};
    try {
        ipResult = ipParser.lookup(ip);
    } catch (err) {}
    let uaResult = {};
    try {
        uaResult = usParser(ua);
    } catch (err) {}
    console.log(uaResult);

    const commonKey = ['hit', referer];
    const totalKey = [...commonKey, 't'];
    const geoKey = [...commonKey, 'geo', ipResult?.country ?? 'others'];
    const dateKey = [...commonKey, 'date', new Date().toISOString().slice(0, 10)];
    const browserKey = [...commonKey, 'browser', uaResult?.browser?.name ?? 'others'];
    const deviceKey = [...commonKey, 'device', uaResult?.device?.vendor ?? 'others'];

    const { value: total = 0 } = await db.get(totalKey);
    const { value: geo = 0 } = await db.get(geoKey);
    const { value: date = 0 } = await db.get(dateKey);
    const { value: browser = 0 } = await db.get(browserKey);
    const { value: device = 0 } = await db.get(deviceKey);

    await db.atomic()
        .set(totalKey, total + 1)
        .set(geoKey, geo + 1)
        .set(dateKey, date + 1)
        .set(browserKey, browser + 1)
        .set(deviceKey, device + 1)
        .commit();

    return total + 1;
};

export const listData = async (referer: string = '', key: string) => {
    const iter = await db.list({ prefix: ['hit', referer, key] });
    const list = [];
    for await (const res of iter) {
        list.push(res);
    }
    return list.map(({ key, value }) => [key.slice(-1)[0], value]).sort(([, a], [, b]) => b - a);
};
