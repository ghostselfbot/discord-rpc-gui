const express = require('express');
const presence = require('./presence');
const { stat } = require('original-fs');
const app = express();
const port = 3000;
let rpc = new presence();

app.use(express.json());

app.get('/connect', async (req, res) => {
    try {
        if (!rpc.clientId) {
            return res.status(400).json({ error: 'Client ID is required, set one with /clientid', status: 400 });
        }
        if (!rpc) {
            rpc = new presence();
        }
        await rpc.login();
        res.json({ 
            message: 'Connected to Discord',
            clientId: rpc.clientId,
            presence: rpc.presence
        });
    } catch (error) {
        console.error('Failed to connect to Discord:', error);
        res.status(500).json({ error: 'Failed to connect to Discord', status: 500});
    }
})

app.get('/disconnect', async (req, res) => {
    try {
        await rpc.destroy();
        rpc = new presence();
        res.json({ message: 'Disconnected from Discord' });
    } catch (error) {
        console.error('Failed to disconnect from Discord:', error);
        res.status(500).json({ error: 'Failed to disconnect from Discord', status: 500 });
    }
})

app.post('/update', async (req, res) => {
    try {
        await rpc.updatePresence(req.body.presence);
        res.json({
            message: 'Presence updated',
            presence: rpc.presence
        });
    } catch (error) {
        console.error('Failed to update presence:', error);
        res.status(500).json({ error: 'Failed to update presence', status: 500 });
    }
})

app.get('/config', (req, res) => {
    try {
        res.json({
            presence: rpc.presence,
            clientId: rpc.clientId
        });
    } catch (error) {
        console.error('Failed to get config:', error);
        res.status(500).json({ error: 'Failed to get config', status: 500 });
    }
})

app.post('/updateConfig', (req, res) => {
    try {
        rpc.presence = req.body.presence;
        rpc.saveConfig();
        res.json({
            message: 'Config updated',
            presence: rpc.presence
        });
    } catch (error) {
        console.error('Failed to update config:', error);
        res.status(500).json({ error: 'Failed to update config', status: 500 });
    }
})

app.put('/clientid', async (req, res) => {
    try {
        await rpc.changeClientId(req.body.clientId);
        await rpc.destroy();
        rpc = new presence();
        res.json({
            message: 'Client ID updated, you will need to reconnect',
            clientId: rpc.clientId,
        });
    } catch (error) {
        console.error('Failed to update client ID:', error);
        res.status(500).json({ error: 'Failed to update client ID', status: 500 });
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})