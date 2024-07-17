import Canvas from "@napi-rs/canvas";

import path from "node:path";
import url from "node:url";
import fs from "node:fs";

import cliArgs from "command-line-args";
const cliOptions = cliArgs([
    { name: "count", alias: "c", type: Number, defaultOption: 1 }
])


const validCanvasDimensionsFt = [
    // The following sizes of flags are authorized for executive agencies: (EX.
    // ORD. NO. 10834. PART II, SEC. 21)
    [20.00, 38.00],
    [10.00, 19.00],
    [8.95,  17.00],
    [7.00,  11.00],
    [5.00,  9.50],
    [4.33,  5.50],
    [3.50,  6.65],
    [3.00,  4.00],
    [3.00,  5.70],
    [2.37,  4.50],
    [1.32,  2.50]
];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const dirname = path.dirname(url.fileURLToPath(import.meta.url));

function generateRandomRed(): string {
    const r = 255                           .toString(16).padStart(2, "0");
    const g = Math.floor(Math.random() * 96).toString(16).padStart(2, "0");
    const b = Math.floor(Math.random() * 96).toString(16).padStart(2, "0");

    return `#${r}${g}${b}`;
};

function generateRandomBlue(): string {
    const r = Math.floor(Math.random() * 96).toString(16).padStart(2, "0");
    const g = Math.floor(Math.random() * 96).toString(16).padStart(2, "0");
    const b = 255                           .toString(16).padStart(2, "0");

    return `#${r}${g}${b}`;
};



async function createFlag(outputNum: number) {
    // determine random flag dimensions
    const [widthFt, lengthFt] = validCanvasDimensionsFt[Math.floor(Math.random() * validCanvasDimensionsFt.length)];

    // conv ft->px
    const length = Math.round(lengthFt * 1152);
    const width = Math.round(widthFt * 1152);


    // create a blank canvas
    const canvas = Canvas.createCanvas(length, width);
    const flag = canvas.getContext("2d");


    // functions
    function drawStripes(count: number) {
        flag.fillStyle = Math.random() < 0.5 ? "white" : generateRandomRed(); // randomly choose to start at either red or white
        let yPos = 0; // first stripe starts at y=0

        for (let i = 0; i < count; i++) {
            // determine the height of the stripe (do I really need to comment this?)
            let stripeHeight;
            if (i + 1 == count)
                stripeHeight = canvas.height - yPos
            else
                stripeHeight = (Math.random() * (canvas.height - yPos)) / 3;

            // fill the stripe
            flag.fillRect(0, yPos, canvas.width, stripeHeight);

            // increment pointer so we know where to start the next stripe
            yPos += stripeHeight;
            
            // switch the next stripe's colour
            if (flag.fillStyle == "white")
                flag.fillStyle = generateRandomRed();
            else
                flag.fillStyle = "white";
        };
    };

    function drawStarField(): [number, number, number, number] {
        const padTop    = getRandomInt(10, canvas.height / 4);
        const padRight  = getRandomInt(10, canvas.width  / 4);
        const padBottom = getRandomInt(10, canvas.height / 4);
        const padLeft   = getRandomInt(10, canvas.width  / 4);

        const width = canvas.width - padLeft - padRight;
        const height = canvas.height - padTop - padBottom;

        flag.fillStyle = generateRandomBlue();
        flag.fillRect(padLeft, padTop, width, height);
        
        return [padLeft, padTop, width, height];
    };

    async function drawStars(numStars: number, startX: number, startY: number, boundaryWidth: number, boundaryHeight: number) {
        // load the star image
        const starImg = await Canvas.loadImage(path.join(dirname, "../res/star.png"));

        for (let i = 0; i < numStars; i++) {

            const starPosX = getRandomInt(startX, startX + boundaryWidth  - (canvas.width  / 4));
            const starPosY = getRandomInt(startY, startY + boundaryHeight - (canvas.height / 4));

            const starWidth  = getRandomInt(50, boundaryWidth  - starPosX);
            const starHeight = getRandomInt(50, boundaryHeight - starPosY);
            
            flag.drawImage(starImg, starPosX, starPosY, starWidth, starHeight);

        };
    };



    
    // The flag of the United States shall be thirteen horizontal stripes, alternate
    // red and white; ... (4 U.S.C. § 1 (2024))
    drawStripes(13);

    // ... and the union of the flag shall be forty-eight stars, white in a blue
    // field. (4 U.S.C. § 1 (2024)); On the admission of a new State into the
    // Union one star shall be added to the union of the flag ... (4 U.S.C. § 1
    // (2024))
    const [sfPadLeft, sfPadTop, sfWidth, sfHeight] = drawStarField();
    await drawStars(50, sfPadLeft, sfPadTop, sfWidth, sfHeight);




    // export canvas as image
    const b = canvas.toBuffer('image/png');
    await fs.writeFileSync(path.join(dirname, `output${outputNum}.png`), b);
};


(async function(){
    for (let i = 0; i < cliOptions.count; i++) {
        await createFlag(i);
    }
})();