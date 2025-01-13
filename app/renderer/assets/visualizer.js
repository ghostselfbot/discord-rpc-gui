const visualizerElements = {
    details: document.getElementById('visualizer-details'),
    state: document.getElementById('visualizer-state'),
    buttons: document.getElementById('visualizer-buttons'),
    button1: document.getElementById('visualizer-button-1'),
    button2: document.getElementById('visualizer-button-2'),
    image: document.getElementById('visualizer-image'),
    body: document.getElementById('visualizer-body'),
    imageBig: document.getElementById('visualizer-image-big'),
    imageSmall: document.getElementById('visualizer-image-small'),
    clientName: document.getElementById('visualizer-client-name'),
    runningTime: document.getElementById('visualizer-running-time'),
};

let runningTimeCounter = 0;
let isRunningTimeCounting = false;

const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const updateRunningTime = () => {
    if (!isRunningTimeCounting) return;
    visualizerElements.runningTime.textContent = formatTime(runningTimeCounter++);
};

const updateVisualizer = () => {
    const { presence, applicationData, getImageUrl } = rpc;

    visualizerElements.details.value = elements.detailsInput.value || '';
    visualizerElements.state.value = elements.stateInput.value || '';

    visualizerElements.details.style.display = elements.detailsInput.value ? 'block' : 'none';
    visualizerElements.state.style.display = elements.stateInput.value ? 'block' : 'none';

    visualizerElements.body.style.paddingTop = elements.detailsInput.value || elements.stateInput.value ? '' : '10px';
    visualizerElements.image.style.width = elements.detailsInput.value || elements.stateInput.value ? '' : '100px';

    visualizerElements.imageBig.src = elements.largeImageKeyInput.value
        ? getImageUrl(elements.largeImageKeyInput.value)
        : 'assets/images/placeholder.png';

    if (elements.smallImageKeyInput.value) {
        visualizerElements.imageSmall.src = getImageUrl(elements.smallImageKeyInput.value);
        visualizerElements.imageSmall.style.display = '';
    } else {
        visualizerElements.imageSmall.src = 'assets/images/placeholder.png';
        visualizerElements.imageSmall.style.display = 'none';
    }

    if (applicationData) {
        visualizerElements.clientName.textContent = applicationData.name;
    }

    const buttons = getVisualizerButtons();

    visualizerElements.buttons.style.display = buttons.length > 0 ? '' : 'none';

    if (buttons[0]) {
        visualizerElements.button1.style.display = '';
        visualizerElements.button1.value = buttons[0].label;
    } else {
        visualizerElements.button1.style.display = 'none';
    }

    if (buttons[1]) {
        visualizerElements.button2.style.display = '';
        visualizerElements.button2.value = buttons[1].label;
    } else {
        visualizerElements.button2.style.display = 'none';
    }

    if (buttons.length === 1) {
        visualizerElements.button1.style.marginBottom = '0';
    } else {
        visualizerElements.button1.style.marginBottom = '8px';
    }
};

