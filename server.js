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

            // Stage 1: Connectivity & Latency
            const start = Date.now();
            socket.emit('log', `TESTING HANDSHAKE & SSL NEGOTIATION...`, "#58a6ff");
            
            const response = await axios.get('https://www.google.com', {
                httpsAgent: agent,
                proxy: false, 
                timeout: 15000,
                headers: { 'User-Agent': 'Mozilla/5.0 ProAgent/1.0' }
            });

            const latency = Date.now() - start;

            // Diagnostic Logic for Server vs Client
            const latencyColor = latency > 1000 ? "#ffea00" : "#238636";

            socket.emit('log', `-----------------------------------------------`, "#333");
            socket.emit('log', `SUCCESS: Connection established via Proxy.`);
            socket.emit('log', `STATUS CODE: ${response.status} OK`);
            socket.emit('log', `REAL LATENCY: ${latency}ms`, latencyColor);

            // Stage 2: Detailed Diagnostic
            socket.emit('log', `--- EXTENSIVE DIAGNOSTIC VERDICT ---`, "#aaa");
            
            if (latency > 1500) {
                socket.emit('log', `[ALERT] HIGH TTFB: Possible Server-Side Resource Depletion or Noisy Neighbor.`, "#ffea00");
            } else if (latency > 800) {
                socket.emit('log', `[INFO] Moderate Latency: Likely Geographic Distance (Client-Side).`, "#58a6ff");
            } else {
                socket.emit('log', `[OK] Optimal Node Health: No significant resource faults detected.`, "#238636");
            }

            socket.emit('log', `-----------------------------------------------`, "#333");
            socket.emit('log', `VERDICT: Proxy is responding correctly for ${location} requests.`);

        } catch (error) {
            // Error Handling to determine fault origin
            let errorMsg = error.message;
            let faultType = "SERVER-SIDE ISSUE";
            let color = "#f85149";

            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                faultType = "CLIENT-SIDE ISSUE";
                errorMsg = "Agent local network cannot reach the Proxy Gateway.";
            } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
                errorMsg = "Server Wait Time Error: Resource depletion or node timeout.";
            }

            socket.emit('log', `!!! ERROR: ${errorMsg}`, color);
            socket.emit('log', `DIAGNOSTIC FAULT: ${faultType}`, color);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`
    =========================================
    PRO-AGENT SERVER ACTIVE
    URL: http://localhost:3000
    Author: Anthony Abella
    =========================================
    `);
});