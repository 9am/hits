import { font, size } from './font.ts';

const [hSize, vSize] = size;
const gapDot = 0.1;
const gapChar = 0.8;

const themeConfig = new Map([
    [
        'grayscale',
        `
        .bg { fill: lightgrey }
        .on { fill: darkslategrey }
        .off { fill: whitesmoke }
    `,
    ],
    [
        'liquid-crystal',
        `
        .bg { fill: #DEE100 }
        .on { fill: #4D6B00 }
        .off { fill: #DADE16 }
    `,
    ],
]);

export const renderBasic = ({ hits = 0, theme, prefix = 'hits: ' }) => {
    const str = `${prefix}${hits}`;
    const chars = Array.from(str);

    const column = chars.length;
    const row = 1;
    const width = column * (hSize + gapChar) + gapChar;
    const height = row * (vSize + gapChar) + gapChar;

    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
            <style>
                ${themeConfig.get(themeConfig.has(theme) ? theme : 'liquid-crystal')}
                .dot {
                    transform-box: fill-box;
                    transform-origin: center;
                    transform: scale(${1 - gapDot});
                }
                @media (prefers-color-scheme: dark) {
                    svg {
                        filter: invert(1) hue-rotate(.5turn);
                    }
                }
            </style>
            <rect class="bg" width="100%" height="100%" />
            <defs>
                <text x="0" y="1em">hits: ${hits}</text>
                ${chars.map((input) => renderCharDef(input)).join('')}
            </defs>
            <g class="row" transform="translate(${gapChar}, ${gapChar})">
                ${chars.map((input, i) => renderChar(input, i)).join('')}
            </g>
        </svg>
    `;
};

const renderCharDef = (name = '') => {
    const id = `c-${name.charCodeAt(0)}`;
    const key = font.has(name) ? name : '⍰';
    const value = font.get(key);

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

const renderChar = (name = '', index = 0) => {
    const id = `c-${name.charCodeAt(0)}`;
    return `<use class="char" href="#${id}" x="${(hSize + gapChar) * index}" />`;
};
