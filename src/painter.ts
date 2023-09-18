import { font, size } from './font.ts';

const [hSize, vSize] = size;
const gapDot = 0.1;
const gap = 0.8;

const themeConfig = new Map([
    [
        'grayscale',
        `
        .bg { fill: lightgrey }
        .on { fill: darkslategrey }
        .off { fill: whitesmoke }
        .date { fill: darkslategrey }
    `,
    ],
    [
        'liquid-crystal',
        `
        .bg { fill: #DEE100 }
        .on { fill: #4D6B00 }
        .off { fill: #DADE16 }
        .date { fill: #4D6B00 }
    `,
    ],
]);

export const renderBasic = ({ hits = 0, date = [], prefix = 'hits: ', theme = 'liquid-crystal' }) => {
    const str = `${prefix}${hits}`;
    const chars = Array.from(str);

    const column = chars.length;
    const row = date.length > 1 ? 2 : 1;
    const width = column * (hSize + gap) - gap;
    const height = row * (vSize + gap) - gap;
    const vw = width + 2 * gap;
    const vh = height + 2 * gap;

    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" role="img" aria-labelledby="title">
            <title id="title" />
            <style>
                ${themeConfig.get(themeConfig.has(theme) ? theme : 'liquid-crystal')}
                * {
                    transform-box: fill-box;
                    transform-origin: center;
                }
                .dot {
                    transform: scale(${1 - gapDot});
                }
                @media (prefers-color-scheme: dark) {
                    svg {
                        filter: invert(1) hue-rotate(.5turn);
                    }
                }
            </style>
            <defs>
                <text x="0" y="1em">hits: ${hits}</text>
                ${chars.map((input) => renderCharDef(input)).join('')}
                ${renderLineChartMask(date)}
            </defs>
            <rect class="bg" width="100%" height="100%" />
            <g class="root" transform="translate(${gap}, ${gap})">
                <g class="row">
                    ${chars.map((input, i) => renderChar(input, i)).join('')}
                </g>
                <g class="row" transform="translate(0, ${vSize + gap})">
                    ${date.length > 1 ? `<rect class="date" width="${width}" height="${vSize}" mask="url(#line)" />` : ''}
                </g>
            </g>
        </svg>
    `;
};

const renderCharDef = (name = ''): string => {
    const id = `c-${name.charCodeAt(0)}`;
    const key = font.has(name) ? name : '⍰';
    const value = font.get(key)!;

    const dots = value.reduce((memo, num, j) => {
        let input = num;
        let output = '';
        let i = hSize - 1;
        while (i > -1) {
            const next = `<rect class="dot ${
                input & 1 ? 'on' : 'off'
            }" rx="0.2" ry="0.2" x="${i}" y="${j}" width="1" height="1" />`;
            output += next;
            input = input >> 1;
            i -= 1;
        }
        return `${memo}${output}`;
    }, '');

    return `<g id="${id}">${dots}</g>`;
};

const renderChar = (name = '', index = 0): string => {
    const id = `c-${name.charCodeAt(0)}`;
    return `<use class="char" href="#${id}" x="${(hSize + gap) * index}" />`;
};

const renderLineChartMask = (list = []): string => {
    if (list.length < 2) {
        return '';
    }
    const data = list.sort(([a]: [number], [b]: [number]) => {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        } else {
            return 0;
        }
    }).map(([, val]: [number, number]) => Number(val));
    const max = Math.max(...data);
    const min = Math.min(...data);
    const offset = max === min ? max : max - min;
    const values = data
        .map((val, index) => [
            precision(index / (data.length - 1)),
            precision(1 - (val - min) / offset),
        ]);

    return `
        <mask id="line" maskContentUnits="objectBoundingBox">
            <polygon points="${values.join(' ')} 1,1 0,1" fill="white" />
        </mask>
    `;
};

const precision = (num: number, precision = 2): number => {
    const val = Math.pow(10, precision);
    return Math.trunc(num * val) / val;
};
