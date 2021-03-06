import Psd from 'psd';
import { convertToSvg } from '.';

let fileBrowser = document.querySelector('.file-browser');
let selectButton = document.querySelector('.select-button');
let outputContainer = document.getElementById('output-container');
let template = document.getElementById('output-template');

fileBrowser.addEventListener('change', async () => {
    for (let file of fileBrowser.files) {
        await convert(file);
    }
});

selectButton.addEventListener('click', () => {
    fileBrowser.click();
});

document.addEventListener('click', (event) => {
    let removeButton = event.target.closest('.remove-button');
    if (removeButton == null) {
        return;
    }

    let output = removeButton.closest('.output');
    output.remove();
});

document.body.addEventListener('dragover', (event) => {
    event.preventDefault();
});

document.body.addEventListener('drop', async (event) => {
    event.preventDefault();
    for (let file of event.dataTransfer.files) {
        await convert(file);
    }
});

async function convert(file) {
    if (!file.name.endsWith('.psd')) {
        alert(`Expected a Photoshop document (.psd), got "${file.name}" instead.`);
        return;
    }

    let psd = await Psd.fromDroppedFile(file);
    let svg = convertToSvg(psd);
    let svgDataUrl = 'data:image/svg+xml,' + window.encodeURI(svg.toString());

    let output = template.content.cloneNode(true);

    let preview = output.querySelector('.preview');
    let downloadLink = output.querySelector('.download-link');

    preview.src = svgDataUrl;
    downloadLink.href = svgDataUrl;
    downloadLink.download = file.name + '.svg';

    outputContainer.appendChild(output);
}
