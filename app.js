import PSD from 'psd';
import { convertToSvg } from '.';

let fileBrowser = document.getElementById('file-browser');
let output = document.getElementById('output');
let preview = document.getElementById('preview');
let downloadLink = document.getElementById('download-link');
let converted = false;

fileBrowser.addEventListener('change', (event) => {
    let file = fileBrowser.files[0];
    let filename = file.name;

    PSD.fromDroppedFile(file).then(function (psd) {
        let svg = convertToSvg(psd);
        let svgDataUrl = 'data:image/svg+xml,' + window.encodeURI(svg.toString());

        preview.src = svgDataUrl;
        downloadLink.href = svgDataUrl;
        downloadLink.download = filename + '.svg';
        converted = true;
    });
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
    let filename = event.dataTransfer.items[0].getAsFile().name;

    PSD.fromEvent(event).then(function (psd) {
        let svg = convertToSvg(psd);
        let svgDataUrl = 'data:image/svg+xml,' + window.encodeURI(svg.toString());

        preview.src = svgDataUrl;
        downloadLink.href = svgDataUrl;
        downloadLink.download = filename + '.svg';
        converted = true;
    });
});
