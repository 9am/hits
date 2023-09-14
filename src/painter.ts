export const getSVG = (hits = 0, geo, date, browser, device) => {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <text x="0" y="1em">hits: ${hits}</text>
            <text x="0" y="2em">geo: ${JSON.stringify(geo)}</text>
            <text x="0" y="3em">date: ${JSON.stringify(date)}</text>
            <text x="0" y="4em">browser: ${JSON.stringify(browser)}</text>
            <text x="0" y="5em">device: ${JSON.stringify(device)}</text>
        </svg>
    `;
};
