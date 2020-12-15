import PSD from 'psd';
import { convertToSvg } from '.';

document.body.addEventListener('dragover', (event) => {
    event.preventDefault();
});

document.body.addEventListener('drop', (event) => {
    event.preventDefault();
    let filename = event.dataTransfer.items[0].getAsFile().name;

    PSD.fromEvent(event).then(function (psd) {
        let svg = convertToSvg(psd);
        let svgDataUrl = 'data:image/svg+xml,' + window.encodeURI(svg.toString());

        let preview = document.createElement('img');
        preview.src = svgDataUrl;
        document.body.appendChild(preview);

        let downloadLink = document.createElement('a');
        downloadLink.innerText = 'download';
        downloadLink.href = svgDataUrl;
        downloadLink.download = filename + '.svg';
        document.body.appendChild(downloadLink);
    });
});
