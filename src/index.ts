import Canvas from "@napi-rs/canvas";

import path from "node:path";
import url from "node:url";
import fs from "node:fs";


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

function generateRandomRed(): string {
    const r = 255                           .toString(16).padStart(2, "0");
    const g = Math.floor(Math.random() * 96).toString(16).padStart(2, "0");
    const b = Math.floor(Math.random() * 96).toString(16).padStart(2, "0");

    return `#${r}${g}${b}`;
};



async function createFlag() {
    // determine random flag dimensions
    const [widthFt, lengthFt] = validCanvasDimensionsFt[Math.floor(Math.random() * validCanvasDimensionsFt.length)];

    // conv ft->px
    const length = Math.round(lengthFt * 1152);
    const width = Math.round(widthFt * 1152);


    // create a blank canvas
    const canvas = Canvas.createCanvas(length, width);
    const flag = canvas.getContext("2d");

    // fill the canvas with white
    flag.fillStyle = "white";
    flag.fillRect(0, 0, canvas.width, canvas.height);


    // functions
    function drawStripes(count: number) {
        flag.fillStyle = generateRandomRed();
        let yPos = 0; // first stripe starts at y=0

        for (let i = 0; i < count; i++) {
            // determine the height of the stripe (do I really need to comment this?)
            const stripeHeight = (Math.random() * (canvas.height - yPos)) / 3;

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

    
    // The flag of the United States shall be thirteen horizontal stripes, alternate
    // red and white; and the union of the flag shall be forty-eight stars, white in
    // a blue field. (4 U.S.C. § 1 (2024))
    drawStripes(13);





    // export canvas as image
    const pngData = await canvas.encode("png");
    await fs.promises.writeFile(
        path.join(
            path.dirname(url.fileURLToPath(import.meta.url)),
            "output.png"
        ),
        pngData
    );
};


await createFlag();