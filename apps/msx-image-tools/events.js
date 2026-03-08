const fileInputImage = document.getElementById('fileInputImage');
const c = document.getElementById("canvasScreen");
const ctxImage = c.getContext("2d");
const c1 = document.getElementById("canvasPalette");
const ctxPalette = c1.getContext("2d");
const fileInputPalette = document.getElementById("fileInputPalette");
const rdoPaletteSource_Image = document.getElementById("rdoPaletteSource_Image");
const rdoPaletteSource_Palette = document.getElementById("rdoPaletteSource_Palette");
const btnExecuteCommand = document.getElementById("btnExecuteCommand");
const comboColorFrom = document.getElementById("comboColorFrom");
const comboColorTo = document.getElementById("comboColorTo");
const btnSaveFile = document.getElementById("btnSaveFile");
const div_Cmd_ReplaceColor = document.getElementById("div_Cmd_ReplaceColor");
const div_Cmd_ConvertToSprites = document.getElementById("div_Cmd_ConvertToSprites");
const txt_ConvertToSprites_X = document.getElementById("txt_ConvertToSprites_X");
const txt_ConvertToSprites_Y = document.getElementById("txt_ConvertToSprites_Y");
const combo_ConvertToSprites_TransparentColor = document.getElementById("combo_ConvertToSprites_TransparentColor");


const btnReset = document.getElementById("btnReset");

const output = document.getElementById('output');

rdoPaletteSource_Image.addEventListener('click', (event) => {
    fileInputPalette.hidden = true;
    processImageRawData();
});

rdoPaletteSource_Palette.addEventListener('click', (event) => {
    fileInputPalette.hidden = false;
    processImageRawData();
});

fileInputImage.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {

        const reader = new FileReader();

        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            // arrayBuffer now contains the binary data of the file
            // You can process the binary data here
            
            //processBinaryData(arrayBuffer);
            rawData = [];
            const dataView = new DataView(arrayBuffer);
            for(let i = 0; i < dataView.byteLength; i++) {
                const byteRead = dataView.getUint8(i);
                rawData.push(byteRead);
            }

            processImageRawData();
        };

        reader.onerror = (e) => {
            console.error("Error reading file:", e);
        };

        reader.readAsArrayBuffer(file);
    }
});

btnExecuteCommand.addEventListener('click', (event) => {
    try {
        if(comboCommand.value == 0) {
            const colorFrom = comboColorFrom.value;
            const colorTo = comboColorTo.value;
            
            replaceColor(colorFrom, colorTo);
        }
        else if(comboCommand.value == 1) {
            const x = parseInt(txt_ConvertToSprites_X.value);
            const y = parseInt(txt_ConvertToSprites_Y.value);
            const transparentColor = parseInt(combo_ConvertToSprites_TransparentColor.value);

            convertSC5toSprites(x, y, transparentColor);
        }
    }
    catch(e) {
        alert('Error ' + e);
    }
});

fileInputPalette.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {

        palette = [];
        byteArrayPalette = [];
        
        const reader = new FileReader();

        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            // arrayBuffer now contains the binary data of the file
            // You can process the binary data here

            const dataView = new DataView(arrayBuffer);

            // if file starts with 0xFE, ignore first 7 bytes (file header)
            let start;
            if (dataView.getUint8(0) == 0xFE) {
                start = 7;
            }
            else {
                start = 0;
            }
            
            //console.log("palette file size: " + dataView.byteLength);
            if(dataView.byteLength != start + 32) {
                throw new Error("Palette file must be 32 bytes long (or 39 with header).");
            }


            for(let i = start; i < start + 32; i++) {
                byteArrayPalette.push(dataView.getUint8(i));
            }
            
            loadPalette(byteArrayPalette, palette);

            processImageRawData();
        };

        reader.onerror = (e) => {
            console.error("Error reading file:", e);
        };

        reader.readAsArrayBuffer(file);
    }
});

btnSaveFile.addEventListener('click', (event) => {

    try {
        if(pixels) {
            const binaryArray = [];
            for(let i=0; i < pixels.length; i += 2) {
                const leftPixel = pixels[i] << 4;
                const rightPixel = pixels[i+1];

                binaryArray.push(leftPixel | rightPixel);
            }

            const binaryData = new Uint8Array(binaryArray);

            const blob = new Blob([binaryData], { type: 'application/octet-stream' });
            saveFile(blob, 'image.sc5');
        }
    }
    catch {
        alert('Error saving file');
    }
});

btnReset.addEventListener('click', reset);

comboCommand.addEventListener('change', (event) => {
    if(comboCommand.value == 0) {
        div_Cmd_ReplaceColor.hidden = false;
        div_Cmd_ConvertToSprites.hidden = true;
    }
    else if(comboCommand.value == 1) {
        div_Cmd_ReplaceColor.hidden = true;
        div_Cmd_ConvertToSprites.hidden = false;
    }
});
