const RPC = require('discord-rpc');
const fs = require('fs');
const config = require('../data/config.json');

class Presence {
    constructor() {
        this.startTimestamp = new Date();
        this.clientId = config.client_id;
        this.buttons = this.filterButtons(config.presence.buttons);
        this.rpc = new RPC.Client({ transport: 'ipc' });
        this.presence = {
            details: config.presence.details,
            state: config.presence.state,
            startTimestamp: this.startTimestamp,
            largeImageKey: config.presence.images.large.key,
            largeImageText: config.presence.images.large.text,
            smallImageKey: config.presence.images.small.key,
            smallImageText: config.presence.images.small.text,
            buttons: this.buttons
        }

        this.rpc.on('ready', () => {
            this.setPresence();
        });
    }

    saveConfig() {
        let configPresence = {
            details: this.presence.details || "",
            state: this.presence.state || "",
            images: {
                large: {
                    key: this.presence.largeImageKey || "",
                    text: this.presence.largeImageText || ""
                },
                small: {
                    key: this.presence.smallImageKey || "",
                    text: this.presence.smallImageText || ""
                }
            },
            buttons: this.presence.buttons || []
        }

        config.presence = configPresence;
        if (config.client_id !== this.clientId) config.client_id = this.clientId;
        fs.writeFileSync('app/data/config.json', JSON.stringify(config, null, 2));
    }

    filterButtons(buttons) {
        let filteredButtons = [];
        if (buttons) {
            buttons.forEach(button => {
                if (button.label && button.url) filteredButtons.push(button);
            });
        }
        return filteredButtons;
    }

    async changeClientId(clientId) {
        this.clientId = clientId;
        this.saveConfig();
    }

    async updatePresence(presence) {
        for (const key in this.presence) {
            if (presence[key] === null) presence[key] = this.presence[key];
        }

        this.presence = presence;
        await this.setPresence();
    }

    async setPresence() {
        let presence = this.presence;

        for (const key in presence) {
            if (presence[key] == null || presence[key] == '') presence[key] = null;
        }

        presence.buttons = this.filterButtons(presence.buttons);

        presence.startTimestamp = this.startTimestamp;
        this.saveConfig();
        await this.rpc.setActivity(presence);
    }

    async login() {
        await this.rpc.login({ clientId: this.clientId }).catch(console.error);
    }

    async destroy() {
        await this.rpc.destroy().catch(console.error);
    }
}

module.exports = Presence;