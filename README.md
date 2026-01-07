# PRO-AGENT | Engineering Diagnostic Suite v1.0
**Developed by:** Anthony Abella  
**Role:** Tier 2 Support Engineer  

## 🚀 Overview
PRO-AGENT is a full-stack proxy diagnostic tool designed to help Tier 1 & Tier 2 support teams identify the root cause of proxy performance issues. Moving beyond a simple 'ping,' this tool performs real-time traffic analysis to distinguish between Client-Side network lag and Server-Side resource faults.

## 🛠️ Key Engineering Features

### 1. Real-Time Terminal Emulation
Utilizes WebSockets (Socket.io) to stream live network data from a Node.js engine directly to a stylized terminal UI. This allows agents to witness the handshake and SSL negotiation phases as they happen.

### 2. Intelligent Fault Detection
The diagnostic engine analyzes **Time to First Byte (TTFB)** and **Handshake Latency** to categorize errors:
* **Client-Side Issue:** Detected when the agent's local environment cannot reach the Proxy Gateway (DNS or TCP timeout).
* **Server-Side Issue:** Identifies **Resource Depletion** or **Noisy Neighbors** when connection is established but data transfer times out or lags significantly.
* **Geographic Consistency:** A mandatory location-check module ensures agents are verifying proxies against the client's physical location to prevent "Impossible Travel" flags on social accounts.

### 3. Status LED Logic
A visual "Status LED" provides immediate feedback for non-tech savvy colleagues:
* 🟢 **PASS:** Optimal connection and stability.
* 🟡 **WARNING:** High latency (>1000ms). Risk of timeout or behavioral detection.
* 🔴 **FAIL:** Authentication error or node depletion.

## 💻 Tech Stack
* **Backend:** Node.js, Express, Axios
* **Networking:** Https-Proxy-Agent (SSL/TLS Tunneling)
* **Frontend:** HTML5, CSS3 (Glassmorphism Dark Theme), JavaScript (Vanilla)
* **Real-Time:** Socket.io

## 📦 Installation & Setup
1. Clone the repository:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/PROAGENT.git](https://github.com/YOUR_USERNAME/PROAGENT.git)

2. Install dependencies
   npm install

3. Launch the tool
   node server.js

4. Access the dashboard at http://localhost:3000