import PSD from 'psd';
import { convertToSvg } from '.';

document.body.addEventListener('dragover', (event) => {
    event.preventDefault();
});

document.body.addEventListener('drop', (event) => {
    event.preventDefault();

    PSD.fromEvent(event).then(function (psd) {
        let svg = convertToSvg(psd);
        let img = new Image();
        img.src = 'data:image/svg+xml,' + window.encodeURI(svg.toString());
        document.body.appendChild(img);
    });
});
