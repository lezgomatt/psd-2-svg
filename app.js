import PSD from 'psd';
import { convertToSvg } from '.';

let outputContainer = document.getElementById('output-container');
let template = document.getElementById('output-template');

document.addEventListener('change', (event) => {
    let fileBrowser = event.target.closest('.file-browser');
    if (fileBrowser == null) {
        return;
    }

    let output = fileBrowser.closest('.output');
    convert(fileBrowser.files[0], output);
});

document.addEventListener('click', (event) => {
    let preview = event.target.closest('.preview');
    if (preview == null) {
        return;
    }

    let output = preview.closest('.output');
    if (output.dataset.converted) {
        output.querySelector('.download-link').click();
    } else {
        output.querySelector('.file-browser').click();
    }
});

document.body.addEventListener('dragover', (event) => {
    event.preventDefault();
});

document.body.addEventListener('drop', (event) => {
    event.preventDefault();
    convert(event.dataTransfer.files[0], document.querySelector('.output'));
});

async function convert(file, output) {
    if (!file.name.endsWith('.psd')) {
        alert(`Expected a Photoshop document (.psd), got "${file.name}" instead.`);
        return;
    }

    let psd = await PSD.fromDroppedFile(file);
    let svg = convertToSvg(psd);
    let svgDataUrl = 'data:image/svg+xml,' + window.encodeURI(svg.toString());

    let preview = output.querySelector('.preview');
    let downloadLink = output.querySelector('.download-link');

    preview.src = svgDataUrl;
    downloadLink.href = svgDataUrl;
    downloadLink.download = file.name + '.svg';
    output.dataset.converted = true;

    addOutput();
}

function addOutput() {
    let copy = template.content.cloneNode(true);
    outputContainer.appendChild(copy);
}

addOutput();
