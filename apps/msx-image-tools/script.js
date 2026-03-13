let rawData;
let palette;
let paletteOnImage;
let pixels;
let hasHeader;
let size;
let byteArrayPalette;

const processImageRawData = () => {

    palette = [];
    pixels = [];

    // const dataView = new DataView(buffer);

    if(!rawData) return;

    size = rawData.length;
    
    let start;

    console.log("Size:", size);
    console.log("First byte:", rawData[0]);

    // if file starts with 0xFE, ignore first 7 bytes (file header)
    if (rawData[0] == 0xFE) {
        hasHeader = true;
        start = 7;
    }
    else {
        hasHeader = false;
        start = 0;
    }

    const radioValue = document.querySelector("input[name=rdoPaletteSource]:checked").value;

    if(radioValue == "image") {
        // get palette from the last 32 bytes of image
        byteArrayPalette = [];
        for(let i = size-32; i < size; i++) {
            byteArrayPalette.push(rawData[i]);
        }
        paletteOnImage = true;
    }
    else if(radioValue == "palette") {
        // get palette from palette file
        paletteOnImage = false;
    }
    else {
        throw new Error("Palette source must be chosen.");
    }
    
    loadPalette(byteArrayPalette, palette);

    let endOfPixels = (paletteOnImage) ? size - 32 : size;

    // populate pixels array
    for(let i = start; i < endOfPixels; i++) {

        const byteRead = rawData[i];
        
        const leftPixel = (byteRead & 0xf0) >> 4;
        pixels.push(leftPixel);

        palette[leftPixel].pixelCount++;
        
        const rightPixel = byteRead & 0x0f;
        pixels.push(rightPixel);
        
        palette[rightPixel].pixelCount++;
    }

    drawImage();

    updateOutput();
};

const replaceColor = (colorFrom, colorTo) => {

    if(pixels) {
        for(let i = 0; i < pixels.length; i++) {
            if(pixels[i] == colorFrom) { 
                pixels[i] = colorTo;
            }
        }

        drawImage();

        updateOutput();
    }
};

const drawImage = () => {
    ctxImage.fillStyle = "white";
    ctxImage.fillRect(0, 0, 255, 211);

    let x=0, y=0;
    if(pixels) {
        for(let i=0; i<pixels.length; i++) {

            setPixel(x, y, pixels[i], ctxImage);

            x++;
            if(x == 256) {
                x = 0;
                y++;
            }
        }
    }
};

const drawSprite = () => {
    const zoom = 2;

    ctxSprite.fillStyle = "white";
    ctxSprite.fillRect(0, 0, 16 * zoom, 16 * zoom);

    if(patterns_0 && colors_0) {
        for(let y=0; y<16; y++) {
            for(let x=0; x<16; x++) {
                if(patterns_0[y].substring(x, x+1) == "1") {
                    setPixel(x, y, colors_0[y], ctxSprite, zoom);
                }
            }
        }
    }

    if(patterns_1 && colors_1) {
        for(let y=0; y<16; y++) {
            for(let x=0; x<16; x++) {
                if(patterns_1[y].substring(x, x+1) == "1") {
                    setPixel(x, y, colors_1[y], ctxSprite, zoom);
                }
            }
        }
    }
};

const setPixel = (x, y, colorIndex, ctx, zoom) => {

    if(!zoom) zoom = 1;

    const red = palette[colorIndex].red * 32;
    const green = palette[colorIndex].green * 32;
    const blue = palette[colorIndex].blue * 32;

    ctx.fillStyle = `rgb(${red} ${green} ${blue})`;
    ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
};

const updateOutput = () => {
    output.innerHTML = "";
    output.innerHTML += "Has header: " + hasHeader + "\r";
    output.innerHTML += "Size: " + size + " bytes\r";
    output.innerHTML += "Number of pixels: " + pixels.length + "\r";
    output.innerHTML += "Lines: " + ((pixels.length)/256) + "\r";
    
    let uniqueColors = 0;
    if(pixels) {
        for(let i=0; i<16; i++) {
            const percent = ((palette[i].pixelCount/pixels.length) * 100).toFixed(2);
            output.innerHTML += `Color ${i}: ${palette[i].pixelCount} pixels (${percent}%)\r`;
            if(palette[i].pixelCount) uniqueColors++;
        }
    }

    output.innerHTML += `Unique colors: ${uniqueColors}\r`;
};

const loadPalette = (byteArrayPalette, palette) => {
    // ctxPalette.fillStyle = "white";
    // ctxPalette.fillRect(0, 0, 512, 64);

    let colorIndex = 0;
    for(let i = 0; i < 32; i += 2) {

        // get first byte (red and blue data)
        const byteRead_0 = byteArrayPalette[i];
        
        // get high and low nibbles
        const red = (byteRead_0 & 0xf0) >> 4;
        const blue = byteRead_0 & 0x0f;
        
        
        // get second byte (green data)
        const byteRead_1 = byteArrayPalette[i + 1];
        const green = byteRead_1 & 0x0f;
        
        palette.push({ 
            index: i/2,
            red, 
            blue, 
            green,
            pixelCount: 0,
            mostSimilar: null
        });
        
        //console.log(`Color index: ${colorIndex}; red: ${red}, blue: ${blue}, green: ${green}`);

        ctxPalette.font = "12px Arial";
        ctxPalette.fillStyle = "#000000";
        ctxPalette.textAlign = "center";
        ctxPalette.fillText(colorIndex, (colorIndex * 32) + 16, 16 + 12);

        ctxPalette.fillStyle = `rgb(${red * 32} ${green * 32} ${blue * 32})`;
        ctxPalette.fillRect(colorIndex * 32, 32, 32, 32);

        colorIndex++;
    }


    // find replacement color of each color (most similar)
    for(let i=0; i<16; i++) {
        let currentMostSimilarIndex = null;
        let currentMostSimilarDistance = null;
        for(let j=0; j<16; j++) {
            if(j != i) {
                // euclidean distance (no need to square root, as it is only for comparison between distances)
                let distance = distanceBetweenTwoColors(palette[i], palette[j]);
                    
                if(distance < currentMostSimilarDistance || currentMostSimilarDistance == null) {
                    currentMostSimilarDistance = distance;
                    currentMostSimilarIndex = j;
                }
                //console.log(distance);
            }
        }
        palette[i].mostSimilar = currentMostSimilarIndex;
        console.log(palette[i]);
    }
};

const distanceBetweenTwoColors = (color1, color2) => {
    // Weights based on SC8 pixel format (gggrrrbb)
    const weightRed = 3;
    const weightGreen = 3;
    const weightBlue = 2;

    let distance = 
        (((color1.red   - color2.red) * weightRed) ** 2) +
        (((color1.green - color2.green) * weightGreen) ** 2) +
        (((color1.blue  - color2.blue) * weightBlue) ** 2);

    return distance;
};

const saveFile = async (blob, suggestedName) => {
  // Feature detection
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      console.error(err.name, err.message);
    }
  }
  // Fallback for unsupported browsers
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = suggestedName;
  link.click();
  URL.revokeObjectURL(link.href);
};

let patterns_0 = [];
let patterns_1 = [];
let colors_0 = [];
let colors_1 = [];

// Convert a 32x32 area of a SC5 image to sprites (two layers, 8 sprites of size 16x16)
const convertSC5toSprites = (xBase, yBase, transparentColor) => {
    outputSprites_Patterns.innerHTML = "";
    outputSprites_Colors.innerHTML = "";

    convertSC5toSprites_16x16(xBase, yBase, transparentColor);
    convertSC5toSprites_16x16(xBase, yBase + 16, transparentColor);
    convertSC5toSprites_16x16(xBase + 16, yBase, transparentColor);
    convertSC5toSprites_16x16(xBase + 16, yBase + 16, transparentColor);
};

const convertSC5toSprites_16x16 = (xBase, yBase, transparentColor) => {

    let colorsCount = [];
    let line = 0;
    for(let y=yBase; y < yBase + 16; y++) {
        for(let i=0; i<16; i++) {
            colorsCount[i] = {
                index: i,
                count: 0
            };
        }
        for(let x=xBase; x < xBase + 16; x++) {
            const color = parseInt(pixels[(y*256) + x]);
            if(color != transparentColor) {
                colorsCount[color].count++;
            }
        }

        colorsCount.sort((a, b) => b.count - a.count);

        let strColor = "Colors: ";
        for(let i=0; i<16; i++) {
            strColor += `[index: ${colorsCount[i].index}, count: ${colorsCount[i].count}], `;
        }
        console.log(strColor);


        colors_0[line] = colorsCount[0].index;
        colors_1[line] = (colorsCount[1].count > 0) ? colorsCount[1].index : colorsCount[0].index;

        patterns_0[line] = "";
        patterns_1[line] = "";
        for(let x=xBase; x < xBase + 16; x++) {
            const color = parseInt(pixels[(y*256) + x]);
            if(color == transparentColor) {
                patterns_0[line] += "0";
                patterns_1[line] += "0";
            }
            else if(color == colors_0[line]) { 
                patterns_0[line] += "1";
                patterns_1[line] += "0";
            }
            else if(color == colors_1[line]) { 
                patterns_0[line] += "0";
                patterns_1[line] += "1";
            }
            else {
                // Change this color by the most similar (between color 0 and 1)
                
                const distToColor0 = distanceBetweenTwoColors(palette[color], palette[colors_0[line]]);
                const distToColor1 = distanceBetweenTwoColors(palette[color], palette[colors_1[line]]);

                if(distToColor1 < distToColor0) {
                    patterns_0[line] += "0";
                    patterns_1[line] += "1";
                }
                else {
                    patterns_0[line] += "1";
                    patterns_1[line] += "0";
                }
            }
        }
        console.log(`${patterns_0[line]} ${colors_0[line]}`);
        console.log(`${patterns_1[line]} ${colors_1[line]}`);


        line++;
    }

    drawSprite();

    // write sprite src code to textarea
    let txtPatterns = "";
    let txtColors = "";
    const newLine = "&#13;&#10";
    
    txtPatterns += ` ; Pattern 0` + newLine;
    for(let i=0; i<16; i++) {
        txtPatterns += `\tdb\t${patterns_0[i].substring(0, 8)} b` + newLine;
    }
    for(let i=0; i<16; i++) {
        txtPatterns += `\tdb\t${patterns_0[i].substring(8, 16)} b` + newLine;
    }

    txtPatterns += ` ; Pattern 1` + newLine;
    for(let i=0; i<16; i++) {
        txtPatterns += `\tdb\t${patterns_1[i].substring(0, 8)} b` + newLine;
    }
    for(let i=0; i<16; i++) {
        txtPatterns += `\tdb\t${patterns_1[i].substring(8, 16)} b` + newLine;
    }
    
    txtColors += ` ; Color 0` + newLine;
    for(let i=0; i<16; i++) {
        txtColors += `\tdb\t${colors_0[i]}` + newLine;
    }
    txtColors += ` ; Color 1` + newLine;
    for(let i=0; i<16; i++) {
        txtColors += `\tdb\t${colors_1[i]}` + newLine;
    }

    outputSprites_Patterns.innerHTML += txtPatterns;
    outputSprites_Colors.innerHTML += txtColors;
};

const reset = () => {

    div_Cmd_ReplaceColor.hidden = false;
    div_Cmd_ConvertToSprites.hidden = true;

    rdoPaletteSource_Image.click();

    // TODO: clear both canvas
};

// initialization
reset();