const rpc = new Presence();

const elements = {
    clientIdInput: document.getElementById('client-id-input'),
    detailsInput: document.getElementById('details-input'),
    stateInput: document.getElementById('state-input'),
    largeImageKeyInput: document.getElementById('large-image-key-input'),
    largeImageText: document.getElementById('large-image-text-input'),
    smallImageKeyInput: document.getElementById('small-image-key-input'),
    smallImageText: document.getElementById('small-image-text-input'),
    buttonsWrapperHeader: document.getElementById('buttons-wrapper-header'),
    buttonsWrapper: document.getElementById('buttons-wrapper'),
    button1Wrapper: document.getElementById('button-1'),
    button1Label: document.getElementById('button-1-text-input'),
    button1Url: document.getElementById('button-1-url-input'),
    button2Wrapper: document.getElementById('button-2'),
    button2Label: document.getElementById('button-2-text-input'),
    button2Url: document.getElementById('button-2-url-input'),
    togglePresenceButton: document.getElementById('toggle-presence-button'),
};

let buttonsVisible = [];

const updateButtonVisibility = () => {
    elements.button1Wrapper.classList.toggle('hide', !buttonsVisible.includes(1));
    elements.button2Wrapper.classList.toggle('hide', !buttonsVisible.includes(2));

    if (buttonsVisible.length > 0) {
        elements.buttonsWrapperHeader.classList.add('no-bottom-border');
    } else {
        elements.buttonsWrapperHeader.classList.remove('no-bottom-border');
    }

    if (buttonsVisible.length === 1 && buttonsVisible.includes(1)) {
        elements.button1Wrapper.style.paddingBottom = '16px';
        elements.button1Wrapper.style.borderBottomLeftRadius = '5px';
        elements.button1Wrapper.style.borderBottomRightRadius = '5px';
    } else {
        elements.button1Wrapper.style.paddingBottom = '';
        elements.button1Wrapper.style.borderBottomLeftRadius = '0';
        elements.button1Wrapper.style.borderBottomRightRadius = '0';
    }
};

const addButton = (givenButton) => {
    if (buttonsVisible.length >= 2) return console.log('No more buttons available');
    const button = givenButton || [1, 2].find(b => !buttonsVisible.includes(b));

    if (button && !buttonsVisible.includes(button)) {
        buttonsVisible.push(button);

        // Make the button wrapper visible
        elements[`button${button}Wrapper`].classList.remove('hide');

        // Ensure the button inputs are initialized
        elements[`button${button}Label`].value = elements[`button${button}Label`].value || '';
        elements[`button${button}Url`].value = elements[`button${button}Url`].value || '';

        updateButtonVisibility();
    }

    updateVisualizer();
};

const removeButton = (button) => {
    if (buttonsVisible.includes(button)) {
        buttonsVisible = buttonsVisible.filter(b => b !== button);

        elements[`button${button}Label`].value = '';
        elements[`button${button}Url`].value = '';
        elements[`button${button}Wrapper`].classList.add('hide');

        updateButtonVisibility();
    }

    updateVisualizer();
};

const getButtons = () => {
    return buttonsVisible.map(button => ({
        label: elements[`button${button}Label`].value,
        url: elements[`button${button}Url`].value,
    })).filter(button => button.label && button.url);
};

const getVisualizerButtons = () => {
    let buttons = [];

    if (elements.button1Label.value || buttonsVisible.includes(1)) {
        buttons.push({ label: elements.button1Label.value });
    }

    if (elements.button2Label.value || buttonsVisible.includes(2)) {
        buttons.push({ label: elements.button2Label.value });
    }

    return buttons;
};

const updateInputs = () => {
    elements.clientIdInput.value = rpc.clientId;
    elements.detailsInput.value = rpc.presence.details;
    elements.stateInput.value = rpc.presence.state;
    elements.largeImageKeyInput.value = rpc.presence.largeImageKey;
    elements.largeImageText.value = rpc.presence.largeImageText;
    elements.smallImageKeyInput.value = rpc.presence.smallImageKey;
    elements.smallImageText.value = rpc.presence.smallImageText;

    const buttons = rpc.presence.buttons || [];

    buttons.forEach((button, index) => {
        const buttonIndex = index + 1;

        if (!buttonsVisible.includes(buttonIndex)) {
            buttonsVisible.push(buttonIndex);
            elements[`button${buttonIndex}Wrapper`].classList.remove('hide');
        }

        elements[`button${buttonIndex}Label`].value = button.label || '';
        elements[`button${buttonIndex}Url`].value = button.url || '';
    });

    updateButtonVisibility();
};

const updatePresence = () => {
    let newPresence = {
        details: elements.detailsInput.value,
        state: elements.stateInput.value,
        largeImageKey: elements.largeImageKeyInput.value,
        largeImageText: elements.largeImageText.value,
        smallImageKey: elements.smallImageKeyInput.value,
        smallImageText: elements.smallImageText.value,
        buttons: getButtons(),
    };

    rpc.updateConfig(newPresence);

    if (String(elements.clientIdInput.value) !== String(rpc.clientId)) {
        if (elements.clientIdInput.value !== "") disconnectPresence();
        if (rpc.clientId != null) {
            try {
                rpc.setClientId(elements.clientIdInput.value);
            } catch (error) {
                return console.error(error);
            }
            let interval = setInterval(() => {
                if (rpc.clientId) {
                    clearInterval(interval);
                    alert('Client ID updated, please reconnect');
                }
            }, 10);
        }
    } else {
        rpc.update(newPresence);
    }

    updateVisualizer();
};

const connectPresence = async () => {
    let status = await rpc.connect();
    if (status == 400) {
        let clientId = elements.clientIdInput.value;
        if (!clientId) {
            alert('Client ID is required');
            return;
        }

        await rpc.setClientId(clientId);
        status = await rpc.connect();
    }
    updatePresence();

    let interval = setInterval(() => {
        if (rpc.presence && rpc.clientId) {
            clearInterval(interval);
            updateInputs();

            elements.togglePresenceButton.innerText = 'Disconnect';
            elements.togglePresenceButton.classList.add('disconnect');
            elements.togglePresenceButton.classList.remove('connect');
            elements.togglePresenceButton.onclick = disconnectPresence;
        }
    }, 10);
};

const disconnectPresence = () => {
    rpc.disconnect();

    elements.togglePresenceButton.innerText = 'Connect';
    elements.togglePresenceButton.classList.add('connect');
    elements.togglePresenceButton.classList.remove('disconnect');
    elements.togglePresenceButton.onclick = connectPresence;
};

window.onload = async () => {
    setInterval(updateRunningTime, 1000);
    updateVisualizer();

    try {
        await rpc.getConfig();
        if (rpc.presence != null) {
            updateInputs();
        }
    } catch (error) {
        console.error(error);
    }

    try {
        connectPresence();
    } catch (error) {
        console.error(error);
    }
};

elements.detailsInput.oninput = () => updateVisualizer();
elements.stateInput.oninput = () => updateVisualizer();
elements.largeImageKeyInput.oninput = () => updateVisualizer();
elements.smallImageKeyInput.oninput = () => updateVisualizer();
elements.largeImageText.oninput = () => updateVisualizer();
elements.smallImageText.oninput = () => updateVisualizer();
elements.button1Label.oninput = () => updateVisualizer();
elements.button2Label.oninput = () => updateVisualizer();