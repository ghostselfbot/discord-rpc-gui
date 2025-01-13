class Presence {
    constructor() {
        this.api = "http://localhost:3000";
        this.clientId = null;
        this.presence = null;
        this.assetData = null;
        this.applicationData = null;

        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
    }

    async fetchJson(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getConfig() {
        const data = await this.fetchJson(`${this.api}/config`);
        this.presence = data.presence || null;
        this.clientId = data.clientId || null;
    }

    async getApplicationData() {
        const url = `https://discord.com/api/v9/oauth2/applications/${this.clientId}/rpc`;
        this.applicationData = await this.fetchJson(url);
    }

    async getAssetData() {
        const url = `https://discord.com/api/v9/oauth2/applications/${this.clientId}/assets`;
        this.assetData = await this.fetchJson(url);
        updateVisualizer();
    }

    getImageUrl = (key) => {
        if (!this.assetData || !Array.isArray(this.assetData)) {
            return "assets/images/placeholder.png";
        }
    
        const asset = this.assetData.find(asset => asset.name === key);
        return asset 
            ? `https://cdn.discordapp.com/app-assets/${this.clientId}/${asset.id}.png?size=160`
            : "assets/images/placeholder.png";
    };
    

    async connect() {
        const data = await this.fetchJson(`${this.api}/connect`);

        if (data) {
            this.clientId = data.clientId || null;
            this.presence = data.presence || null;

            if (this.clientId) {
                await this.getApplicationData();
                await this.getAssetData();
            }
        }

        if (this.clientId) isRunningTimeCounting = true;

        return data.status;
    }

    async disconnect() {
        await this.fetchJson(`${this.api}/disconnect`);

        isRunningTimeCounting = false;
        runningTimeCounter = 0;
    }

    async update(presence) {
        try {
            const response = await fetch(`${this.api}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ presence })
            });

            const data = await response.json();
            if (data.presence) this.presence = data.presence;
        } catch (error) {
            console.error(error);
        }
    }

    async updateConfig(presence) {
        try {
            const response = await fetch(`${this.api}/updateConfig`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ presence })
            });

            const data = await response.json();
            if (data.presence) this.presence = data.presence;
        } catch (error) {
            console.error(error);
        }
    }

    async setClientId(clientId) {
        try {
            const response = await fetch(`${this.api}/clientid`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: clientId })
            });

            const data = await response.json();
            this.clientId = data.clientId || clientId || null;
        } catch (error) {
            console.error(error);
        }
    }
}
