import PSD from 'psd';
import { convertToSvg } from '.';

let output = document.getElementById('output');
let preview = document.getElementById('preview');
let downloadLink = document.getElementById('download-link');

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
        output.hidden = false;
    });
});
