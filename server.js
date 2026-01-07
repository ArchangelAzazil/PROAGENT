const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('run_test', async (data) => {
        const { proxy, location } = data;
        
        try {
            const proxyUri = `http://${proxy}`; 
            const agent = new HttpsProxyAgent(proxyUri);

            socket.emit('log', `INITIATING REAL-TIME TRAFFIC ANALYSIS FROM ${location.toUpperCase()}...`);
            socket.emit('log', `TARGET GATEWAY: ${proxy.split('@')[1]}`);

            // --- STAGE 1: LATENCY & HANDSHAKE ---
            const start = Date.now();
            socket.emit('log', `TESTING HANDSHAKE & SSL NEGOTIATION...`, "#58a6ff");
            
            const handshake = await axios.get('https://www.google.com', {
                httpsAgent: agent,
                proxy: false, 
                timeout: 10000,
                headers: { 'User-Agent': 'Mozilla/5.0 ProAgent/1.0' }
            });

            const latency = Date.now() - start;
            socket.emit('log', `SUCCESS: Connection established via Proxy.`);
            socket.emit('log', `REAL LATENCY: ${latency}ms`, latency > 1000 ? "#ffea00" : "#238636");

            // --- STAGE 2: BANDWIDTH & THROUGHPUT (DOWNLOAD TEST) ---
            socket.emit('log', `INITIATING 1MB DOWNLOAD TEST THROUGH NODE...`, "#58a6ff");
            
            const dlStart = Date.now();
            // Fetching 1MB of random bytes from a reliable test endpoint
            await axios.get('https://httpbin.org/bytes/1048576', { 
                httpsAgent: agent,
                proxy: false,
                timeout: 30000 // 30s timeout for slow proxies
            });
            
            const dlDuration = (Date.now() - dlStart) / 1000; // in seconds
            const mbps = (8 / dlDuration).toFixed(2); // (1MB * 8 bits) / seconds

            socket.emit('log', `DOWNLOAD SPEED: ${mbps} Mbps`, mbps < 2 ? "#ffea00" : "#238636");

            // --- STAGE 3: EXTENSIVE DIAGNOSTIC VERDICT ---
            socket.emit('log', `-----------------------------------------------`, "#333");
            
            if (mbps < 1.5) {
                socket.emit('log', `[ALERT] RESOURCE DEPLETION: Proxy node bandwidth is severely limited.`, "#f85149");
                socket.emit('log', `[ADVICE] Rotate IP immediately to avoid behavioral detection flags.`, "#f85149");
            } else if (latency > 1500) {
                socket.emit('log', `[WARN] NOISY NEIGHBOR: High wait time detected. Node is likely congested.`, "#ffea00");
            } else {
                socket.emit('log', `[VERDICT] PROXY OPTIMAL: Healthy for ${location} requests.`, "#238636");
            }
            socket.emit('log', `-----------------------------------------------`, "#333");

        } catch (error) {
            let errorMsg = error.message;
            let faultType = "SERVER-SIDE ISSUE";

            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                faultType = "CLIENT-SIDE ISSUE";
                errorMsg = "Agent local network cannot reach the Proxy Gateway.";
            } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
                errorMsg = "Node Timeout: The proxy server failed to deliver data in time.";
            }

            socket.emit('log', `!!! ERROR: ${errorMsg}`, "#f85149");
            socket.emit('log', `DIAGNOSTIC FAULT: ${faultType}`, "#f85149");
        }
    });
});

// Use Render's assigned port or default to 3000 for local testing
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
    =========================================
    PRO-AGENT SERVER ACTIVE ON PORT ${PORT}
    URL: http://localhost:${PORT}
    Author: Anthony Abella
    =========================================
    `);
});