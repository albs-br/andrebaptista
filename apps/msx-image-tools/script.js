    const fileInput = document.getElementById('fileInput');
	const c = document.getElementById("canvasScreen");
	const ctx = c.getContext("2d");
	const c1 = document.getElementById("canvasPalette");
	const ctxPalette = c1.getContext("2d");
	
	const output = document.getElementById('output');



    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {

		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, 255, 211);
		ctxPalette.fillStyle = "white";
		ctxPalette.fillRect(0, 0, 255, 15);

		const reader = new FileReader();

        reader.onload = (e) => {
          const arrayBuffer = e.target.result;
          // arrayBuffer now contains the binary data of the file
          // You can process the binary data here
          processBinaryData(arrayBuffer);

		  updateOutput();
        };

        reader.onerror = (e) => {
          console.error("Error reading file:", e);
        };

        reader.readAsArrayBuffer(file);
      }
    });

	let palette;
	let pixels;
	let hasHeader;
	let size;

    function processBinaryData(buffer) {

		palette = [];
		pixels = [];

		const dataView = new DataView(buffer);

		size = dataView.byteLength;
		
		let start;

		console.log("Size:", size);
		console.log("First byte:", dataView.getUint8(0));

		// if file starts with 0xFE, ignore first 7 bytes (file header)
		if (dataView.getUint8(0) == 0xFE) {
			hasHeader = true;
			start = 7;
		}
		else {
			hasHeader = false;
			start = 0;
		}




		// get palette from the last 32 bytes 
		let colorIndex = 0;
		for(let i = size-32; i < size; i += 2) {

			// get first byte (red and blue data)
			const byteRead_0 = dataView.getUint8(i);
			
			// get high and low nibbles
			const red = (byteRead_0 & 0xf0) >> 4;
			const blue = byteRead_0 & 0x0f;
			
			
			// get second byte (green data)
			const byteRead_1 = dataView.getUint8(i + 1);
			const green = byteRead_1 & 0x0f;
			
			palette.push({ 
				red, 
				blue, 
				green,
				pixelCount: 0
			});
			
			//console.log(`Color index: ${colorIndex}; red: ${red}, blue: ${blue}, green: ${green}`);

			ctxPalette.fillStyle = `rgb(${red * 32} ${green * 32} ${blue * 32})`;
			ctxPalette.fillRect(colorIndex * 16, 0, 16, 16);

			colorIndex++;
		}

		//console.log(palette);

		//let output = "";
		let x=0, y=0;
		for(let i = start; i < size-32; i++) {

			const byteRead = dataView.getUint8(i);
			//output += byteRead + ", "
			
			const leftPixel = (byteRead & 0xf0) >> 4;
			pixels.push(leftPixel);
			setPixel(x, y, leftPixel);

			palette[leftPixel].pixelCount++;
			
			const rightPixel = byteRead & 0x0f;
			pixels.push(rightPixel);
			setPixel(x + 1, y, rightPixel);
			
			palette[rightPixel].pixelCount++;

			x += 2;
			if(x == 256) {
				x = 0;
				y++;
			}
		}

		//console.log(output);
    }
	
	function setPixel(x, y, colorIndex) {


		const red = palette[colorIndex].red * 32;
		const green = palette[colorIndex].green * 32;
		const blue = palette[colorIndex].blue * 32;

		ctx.fillStyle = `rgb(${red} ${green} ${blue})`;
		ctx.fillRect(x, y, 1, 1);
	}

	const updateOutput = () => {
		output.innerHTML = "";
		output.innerHTML += "Has header: " + hasHeader + "\r";
		output.innerHTML += "Size: " + size + " bytes\r";
		output.innerHTML += "Number of pixels: " + pixels.length + "\r";
		output.innerHTML += "Lines: " + ((pixels.length)/256) + "\r";
		
		let uniqueColors = 0;
		for(let i=0; i<16; i++) {
			const percent = ((palette[i].pixelCount/pixels.length) * 100).toFixed(2);
			output.innerHTML += `Color ${i}: ${palette[i].pixelCount} pixels (${percent}%)\r`;
			if(palette[i].pixelCount) uniqueColors++;
		}

		output.innerHTML += `Unique colors: ${uniqueColors}\r`;
};
