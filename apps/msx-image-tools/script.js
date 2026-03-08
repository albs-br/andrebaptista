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
    // console.log(radioValue);

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
        //console.error("Palette source must be chosen.");
        //return;
        throw new Error("Palette source must be chosen.");
    }
    
    loadPalette(byteArrayPalette, palette);

    //console.log(palette);
    let endOfPixels = (paletteOnImage) ? size - 32 : size;

    // populate pixels array
    for(let i = start; i < endOfPixels; i++) {

        const byteRead = rawData[i];
        //output += byteRead + ", "
        
        const leftPixel = (byteRead & 0xf0) >> 4;
        pixels.push(leftPixel);
        // setPixel(x, y, leftPixel);

        palette[leftPixel].pixelCount++;
        
        const rightPixel = byteRead & 0x0f;
        pixels.push(rightPixel);
        // setPixel(x + 1, y, rightPixel);
        
        palette[rightPixel].pixelCount++;
    }

    drawImage();

    updateOutput();

    //console.log(output);
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

            setPixel(x, y, pixels[i]);

            x++;
            if(x == 256) {
                x = 0;
                y++;
            }
        }
    }
};

const setPixel = (x, y, colorIndex) => {


    const red = palette[colorIndex].red * 32;
    const green = palette[colorIndex].green * 32;
    const blue = palette[colorIndex].blue * 32;

    ctxImage.fillStyle = `rgb(${red} ${green} ${blue})`;
    ctxImage.fillRect(x, y, 1, 1);
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
            red, 
            blue, 
            green,
            pixelCount: 0
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

// Convert a 32x32 area of a SC5 image to sprites (two layers, 8 sprites of size 16x16)
const convertSC5toSprites = (xBase, yBase, transparentColor) => {
    let colors = [];
    for(let y=yBase; y < yBase + 16; y++) {
        for(let i=0; i<16; i++) {
            colors[i] = {
                index: i,
                count: 0
            };
        }
        let sprPat = "";
        for(let x=xBase; x < xBase + 16; x++) {
            const color = parseInt(pixels[(y*256) + x]);
            if(color != transparentColor) {
                colors[color].count++;
            }
            // if(color != transparentColor) {
            //     sprPat += "1";
            // }
            // else {
            //     sprPat += "0";
            // }
        }
        //sprPat += " b\n";
        
        //console.log("Pattern: " + sprPat);

        // colors = colors
        //     .filter(item => item.index != transparentColor);

        colors.sort((a, b) => b.count - a.count);

        let color_0 = colors[0].index;
        let color_1 = colors[1].index;

        let strColor = "Colors: ";
        for(let i=0; i<16; i++) {
            strColor += `[index: ${colors[i].index}, count: ${colors[i].count}], `;
        }
        console.log(strColor);

    }

};

const reset = () => {

    div_Cmd_ReplaceColor.hidden = false;
    div_Cmd_ConvertToSprites.hidden = true;

    rdoPaletteSource_Image.click();

    // TODO: clear both canvas
};

// initialization
reset();