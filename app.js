import PSD from 'psd';
import { convertToSvg } from '.';

let fileBrowser = document.getElementById('file-browser');
let output = document.getElementById('output');
let preview = document.getElementById('preview');
let downloadLink = document.getElementById('download-link');
let converted = false;

fileBrowser.addEventListener('change', () => {
    convert(fileBrowser.files[0]);
});

preview.addEventListener('click', () => {
    if (converted) {
        downloadLink.click();
    } else {
        fileBrowser.click();
    }
});

document.body.addEventListener('dragover', (event) => {
    event.preventDefault();
});

document.body.addEventListener('drop', (event) => {
    event.preventDefault();
    convert(event.dataTransfer.files[0]);
});

async function convert(file) {
    if (!file.name.endsWith('.psd')) {
        alert(`Expected a Photoshop document (.psd), got "${file.name}" instead.`);
        return;
    }

    let psd = await PSD.fromDroppedFile(file);
    let svg = convertToSvg(psd);
    let svgDataUrl = 'data:image/svg+xml,' + window.encodeURI(svg.toString());

    preview.src = svgDataUrl;
    downloadLink.href = svgDataUrl;
    downloadLink.download = file.name + '.svg';
    converted = true;
}
