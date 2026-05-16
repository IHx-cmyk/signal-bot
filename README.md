# 🌟 Shiny Signal Bot

<div align="center">

<div align="center">
  <img src="./Signal-Lockup-Ultramarine.svg" alt="Signal Messenger Logo" width="120" height="120" style="margin-bottom: 20px;">
</div>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![WebSocket](https://img.shields.io/badge/WebSocket-ws-090909?style=for-the-badge)](https://github.com/websockets/ws)
[![REST API](https://img.shields.io/badge/REST%20API-axios-FF6B6B?style=for-the-badge)](https://axios-http.com/)

**A powerful, modular TypeScript bot for Signal Messenger built on top of [`bbernhard/signal-cli-rest-api`](https://github.com/bbernhard/signal-cli-rest-api)**

[Installation](#-installation--setup-step-by-step) • [Features](#-features) • [Configuration](#-configuration) • [Commands](#-commands) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

**Shiny Signal Bot** is a sophisticated, production-ready automation framework for Signal Messenger. It seamlessly integrates WebSocket event streaming with REST API interactions, enabling real-time command processing, terminal execution, and dynamic group management—all directly from your Signal client.

Built with **TypeScript** and **Node.js**, this bot leverages the exceptional [`signal-cli-rest-api`](https://github.com/bbernhard/signal-cli-rest-api) by [bbernhard](https://github.com/bbernhard) to provide a clean abstraction layer for Signal's core functionalities. Whether you're running it on a VPS, Docker container, or a panel-based hosting solution (Pterodactyl, etc.), Shiny Signal Bot offers security-first design with strict owner authorization and modular extensibility.

---

## ✨ Features

- **🔌 Universal API Wrapper** – Complete TypeScript wrapper for `signal-cli-rest-api` endpoints with type safety and error handling
- **⚡ No-Prefix Commands** – Commands triggered by exact first word matching (e.g., `ping`, `echo`, `react`) with zero prefix overhead
- **🔐 Owner Authorization** – Strict access control via configurable `OWNERS` array; sensitive operations restricted to authorized users only
- **💻 Terminal Execution** – Execute VPS/server shell commands directly from Signal using the `$` prefix (owner-only)
- **📱 Sync Message Handling** – Intelligently processes commands from linked devices and Note to Self, routing replies to the correct destination
- **⏱️ Disappearing Messages** – Send self-destructing messages with customizable timers
- **📝 Rich Message Features** – Reactions, typing indicators, message edits, profile updates, and more
- **👥 Group Management** – Create and manage groups programmatically with granular control
- **🔄 Concurrent WebSocket & REST** – Handles simultaneous event streaming and API calls without blocking
- **🎯 Modular Architecture** – Clean separation of concerns with extensible config, API wrapper, and event handler patterns
- **🛡️ Production-Ready** – Error handling, graceful shutdowns, and logging for real-world deployment

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed and configured:

| Component | Version | Purpose |
|-----------|---------|---------|
| **Docker** | Latest | Run `bbernhard/signal-cli-rest-api` container |
| **Node.js** | 18.x or higher | Runtime environment |
| **npm** or **yarn** | Latest | Dependency management |
| **VPS/Hosting** | — | Linux server (Ubuntu 20.04+, Debian, CentOS) or Panel (Pterodactyl) |
| **Signal App** | Latest | On your personal phone for device linking |

### System Requirements

- **OS**: Linux (Ubuntu 20.04+, Debian 10+, CentOS 7+), or panel-based hosting
- **RAM**: Minimum 512MB (1GB+ recommended for multiple bots)
- **Disk Space**: 500MB+ for Signal data and dependencies
- **Network**: Stable internet connection with reliable WebSocket support
- **Ports**: Access to ports `9999` (Signal API) and your application port

---

## 🚀 Installation & Setup (Step-by-Step)

Follow these detailed instructions carefully. Each step has been designed to avoid common pitfalls and ensure a smooth setup experience.

### ⚠️ Important Pre-Setup Notes

- **Phone Number Format**: Ensure your Signal account phone number uses the full international format, including country code (e.g., `+62812345678` for Indonesia, `+1234567890` for USA)
- **Time Synchronization**: Your VPS system clock must be accurate. Signal requires proper time synchronization. Verify with: `date` command
- **Firewall**: Ensure port `9999` is open (or your chosen port) on your VPS firewall
- **Device Linking**: You must have Signal installed on your personal phone to link the bot as a device

---

### Step 1: Start the Signal CLI REST API Docker Container

The bot communicates with Signal through the `signal-cli-rest-api` Docker container running in JSON-RPC mode. Follow this exactly to avoid port conflicts and data loss.

#### 1.1 Create a data directory on your VPS (optional but recommended)

```bash
mkdir -p /root/signal-data
chmod 755 /root/signal-data
```

This directory will store Signal's data persistently. If you skip this, your device linking will be lost if the container restarts.

#### 1.2 Start the Docker container with the exact command below

```bash
docker run -d \
  --name signal-api \
  -p 9999:8080 \
  -v /root/signal-data:/home/.local/share/signal-cli \
  -e MODE=json-rpc \
  --restart unless-stopped \
  bbernhard/signal-cli-rest-api:latest
```

**Explanation of flags:**
- `-d` – Run in detached mode (background)
- `--name signal-api` – Name the container `signal-api` for easy reference
- `-p 9999:8080` – Map port `9999` on your VPS to port `8080` inside the container (use `9999` to avoid conflicts)
- `-v /root/signal-data:/home/.local/share/signal-cli` – Mount the `/root/signal-data` directory to persist Signal data across container restarts
- `-e MODE=json-rpc` – Enable JSON-RPC mode (required for this bot)
- `--restart unless-stopped` – Auto-restart the container if the VPS reboots
- `bbernhard/signal-cli-rest-api:latest` – The Docker image (pulls latest version automatically)

#### 1.3 Verify the container is running

```bash
docker ps | grep signal-api
```

You should see a line with `signal-api` and status `Up ...`. Example output:

```
CONTAINER ID   IMAGE                                      STATUS      PORTS
a1b2c3d4e5f6   bbernhard/signal-cli-rest-api:latest      Up 2 mins   0.0.0.0:9999->8080/tcp
```

#### 1.4 Test the API endpoint

Wait **10-15 seconds** for the container to fully initialize, then test the API:

```bash
curl http://localhost:9999/v1/about
```

Expected response (your version may differ):

```json
{
  "versions": ["v1"],
  "implementations": {
    "v1": {
      "version": "0.28.0"
    }
  }
}
```

If you get a `connection refused` error, wait another 5-10 seconds and try again. The container needs time to start.

**For remote VPS access (not localhost):**

If you're accessing from your local computer, replace `localhost` with your VPS IP:

```bash
curl http://<YOUR_VPS_IP>:9999/v1/about
```

---

### Step 2: Link Your Signal Device via QR Code

The bot operates as a **linked device** on your Signal account. You must link it using a QR code on your personal phone.

#### 2.1 Generate the QR code link

Wait **10 seconds** after Step 1.4, then open your web browser and visit this URL:

```
http://<YOUR_VPS_IP>:9999/v1/qrcodelink?device_name=ShinyBot
```

**Replace `<YOUR_VPS_IP>` with your actual VPS IP address.**

Examples:
- If your VPS IP is `192.168.1.100`: `http://192.168.1.100:9999/v1/qrcodelink?device_name=ShinyBot`
- If testing locally: `http://localhost:9999/v1/qrcodelink?device_name=ShinyBot`

#### 2.2 You should see a page with a QR code displayed

The page should show:
- A large QR code (black and white squares)
- Text saying "Scan this QR code from Signal on your phone"

**⚠️ IMPORTANT: Do NOT try to use `curl` or terminal commands. You MUST open this URL in a web browser.**

#### 2.3 Scan the QR code with Signal on your phone

1. **Open the Signal app** on your personal phone
2. Navigate to: **Settings** → **Linked devices**
3. Tap **+ Link a new device**
4. **Point your phone's camera at the QR code** displayed in your browser
5. A dialog will appear asking to confirm device linking
6. Tap **Confirm** to complete the linking

The device will be named `ShinyBot` as specified in the URL.

#### 2.4 Verify device linking

After linking, the Docker container will automatically sync your Signal account. Wait **5-10 seconds**, then run:

```bash
curl http://<YOUR_VPS_IP>:9999/v1/profiles
```

You should see a JSON response with your Signal account profile information. If you get an error, the linking may not have completed. Try the QR code scan again.

**Common Issues:**
- **"QR code expired"** – The QR code is valid for ~5 minutes. If it expires, refresh the browser page to generate a new one.
- **"Device linking failed"** – Ensure Signal on your phone is updated to the latest version.
- **"No response from API"** – Check that port `9999` is not blocked by your firewall.

---

### Step 3: Clone the Shiny Signal Bot Repository

Clone the repository to your VPS:

```bash
git clone https://github.com/IHx-cmyk/signal-bot.git
cd signal-bot
```

If `git` is not installed, install it first:

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install git -y

# CentOS/RHEL
sudo yum install git -y
```

---

### Step 4: Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

This will read `package.json` and install all dependencies including `axios`, `ws`, TypeScript, and type definitions.

**If npm is not installed**, install Node.js first:

```bash
# Ubuntu/Debian
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install nodejs -y

# CentOS/RHEL
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs -y
```

Verify the installation:

```bash
node --version
npm --version
```

Expected output: `v18.x.x` or higher for Node.js.

---

### Step 5: Configure the Bot

Edit the configuration file with your VPS details and Signal information:

```bash
nano src/config.ts
```

Update the following values:

```typescript
/**
 * Signal API REST endpoint
 * Replace <YOUR_VPS_IP> with your actual VPS IP address
 * Example: http://192.168.1.100:9999
 */
export const API_URL = "http://<YOUR_VPS_IP>:9999";

/**
 * WebSocket endpoint for real-time event streaming
 * Must match your API_URL host and port
 * Example: ws://192.168.1.100:9999
 */
export const WEBSOCKET_URL = "ws://<YOUR_VPS_IP>:9999";

/**
 * Your bot's Signal phone number (the linked device number)
 * This is the SAME number as your personal Signal account
 * Format: +<country_code><number>
 * Examples:
 *   - +62812345678 (Indonesia)
 *   - +1234567890 (USA)
 *   - +441234567890 (UK)
 */
export const BOT_NUMBER = "+62812345678";

/**
 * Array of owner phone numbers with admin privileges
 * Only numbers in this array can execute restricted commands ($ terminal, setname, block, etc.)
 * Format: ["+number1", "+number2", ...]
 * Example: ["+62812345678", "+62887654321"]
 */
export const OWNERS = ["+62812345678"];

/**
 * Optional: Message timeout in milliseconds
 */
export const MESSAGE_TIMEOUT = 30000;

/**
 * Optional: WebSocket reconnection interval
 */
export const RECONNECT_INTERVAL = 5000;
export const MAX_RECONNECT_ATTEMPTS = 10;
```

**After editing, save with:** `Ctrl+O` → `Enter` → `Ctrl+X`

**Verification:**
- Your phone number should be the SAME as the one you used to link the device in Step 2
- Replace `<YOUR_VPS_IP>` with your actual VPS IP address (e.g., `192.168.1.100`)
- The `OWNERS` array should contain your phone number to execute owner-only commands

---

### Step 6: Build and Run the Bot

#### 6.1 Development mode (with live TypeScript compilation)

```bash
npm run dev
```

You should see console output like:

```
🤖 Shiny Signal Bot starting...
✅ Connected to Signal API
📡 WebSocket connected
🎯 Listening for commands...
```

#### 6.2 Production mode (compiled JavaScript)

```bash
npm run build
npm start
```

Or use **PM2** for process management (recommended for VPS):

```bash
npm install -g pm2
pm2 start npm --name "shiny-signal-bot" -- start
pm2 logs shiny-signal-bot
```

#### 6.3 Test the bot

Send a message to yourself (or have someone else send to your linked device number) with the text:

```
ping
```

The bot should respond with:

```
pong
```

If it works, congratulations! Your bot is running successfully. 🎉

---

## ⚙️ Configuration

### Configuration File: `src/config.ts`

All bot settings are centralized in `src/config.ts`. Here's a detailed breakdown:

```typescript
/**
 * Signal API Endpoints
 * 
 * API_URL: REST endpoint for sending messages, updating profiles, etc.
 * WEBSOCKET_URL: WebSocket endpoint for receiving events in real-time
 * 
 * For localhost: API_URL = "http://localhost:9999"
 * For remote VPS: API_URL = "http://<VPS_IP>:9999"
 */
export const API_URL = "http://localhost:9999";
export const WEBSOCKET_URL = "ws://localhost:9999";

/**
 * Bot's Phone Number (Linked Device)
 * 
 * This MUST be the same phone number you used to link the device via QR code.
 * The number must include the country code.
 * 
 * Format: +<country_code><number>
 * Country code examples:
 *   - 1: USA, Canada
 *   - 44: UK
 *   - 49: Germany
 *   - 62: Indonesia
 *   - 86: China
 *   - 91: India
 *
 * Do NOT include spaces or dashes: +62812345678 ✅ | +62 8123 4567 8 ❌
 */
export const BOT_NUMBER = "+62812345678";

/**
 * Owner Authorization
 * 
 * Only phone numbers in this array can execute restricted commands:
 *   - $ (terminal execution)
 *   - setname (profile name update)
 *   - block/unblock (contact management)
 *   - creategroup (group creation)
 * 
 * Public commands (ping, echo, react, bomb, sysinfo) can be used by anyone.
 * 
 * Format: Array of phone numbers with country code
 * Examples:
 *   - Single owner: ["+62812345678"]
 *   - Multiple owners: ["+62812345678", "+62887654321"]
 */
export const OWNERS = ["+62812345678"];

/**
 * Advanced Settings (Optional)
 */

// Timeout for message delivery confirmation (milliseconds)
export const MESSAGE_TIMEOUT = 30000; // 30 seconds

// WebSocket reconnection settings
export const RECONNECT_INTERVAL = 5000; // 5 seconds between attempts
export const MAX_RECONNECT_ATTEMPTS = 10; // Try 10 times before giving up

// Enable/disable debug logging
export const DEBUG_MODE = false;
```

### Environment Variables (Optional)

For enhanced security (especially in production), use environment variables instead of hardcoding values:

#### Create a `.env` file:

```bash
touch .env
nano .env
```

Add your configuration:

```env
API_URL=http://192.168.1.100:9999
WEBSOCKET_URL=ws://192.168.1.100:9999
BOT_NUMBER=+62812345678
OWNERS=+62812345678,+62887654321
MESSAGE_TIMEOUT=30000
RECONNECT_INTERVAL=5000
```

#### Update `src/config.ts` to read from `.env`:

```typescript
import dotenv from "dotenv";
dotenv.config();

export const API_URL = process.env.API_URL || "http://localhost:9999";
export const WEBSOCKET_URL = process.env.WEBSOCKET_URL || "ws://localhost:9999";
export const BOT_NUMBER = process.env.BOT_NUMBER || "";
export const OWNERS = (process.env.OWNERS || "").split(",").map((n) => n.trim());
export const MESSAGE_TIMEOUT = parseInt(process.env.MESSAGE_TIMEOUT || "30000");
export const RECONNECT_INTERVAL = parseInt(process.env.RECONNECT_INTERVAL || "5000");
export const MAX_RECONNECT_ATTEMPTS = parseInt(process.env.MAX_RECONNECT_ATTEMPTS || "10");
```

#### Install `dotenv`:

```bash
npm install dotenv
```

---

## 📊 Project Structure

```
signal-bot/
├── src/
│   ├── api.ts             # Signal API wrapper with type definitions
│   ├── config.ts          # Configuration & environment settings
│   └── index.ts           # Main entry point & event handler
├── dist/                  # Compiled JavaScript output (generated by build)
├── node_modules/          # Installed dependencies (generated by npm install)
├── package.json           # Project metadata & npm scripts
├── tsconfig.json          # TypeScript compiler configuration
└── README.md              # This file
```

### Key Files Explained

**`src/config.ts`**
- Central configuration hub for API URLs, bot credentials, and owner authorization
- No hardcoded sensitive data (use environment variables in production)
- Single source of truth for all configuration

**`src/api.ts`**
- Complete TypeScript wrapper for `signal-cli-rest-api` endpoints
- Handles all message operations (send, react, edit, disappearing)
- Contact management (block, unblock, profile updates)
- Group operations (create, update, leave)
- All functions include error handling, logging, and retry logic

**`src/index.ts`**
- Entry point that establishes WebSocket connection
- Listens for `dataMessage` (from others) and `syncMessage` (from owner's devices)
- Parses commands using switch-case pattern (no prefix required)
- Routes replies to correct recipient
- Implements graceful startup and shutdown

**`package.json`**
- Lists all dependencies and dev dependencies
- Contains npm scripts: `dev` (development), `build` (compile), `start` (run)

**`tsconfig.json`**
- TypeScript compiler configuration
- Enables strict type checking and ES module support

---

## 💬 Commands

### Command Execution Overview

Commands are triggered by their **exact first word** with **no prefix required**. The bot automatically:

1. Listens for incoming messages (from others) and sync messages (from owner's linked devices)
2. Extracts the first word as the command name
3. Checks if the sender is authorized (for owner-only commands)
4. Executes the command and sends a response

### All Available Commands

| Command | Parameters | Description | Permission | Example |
|---------|-----------|-------------|-----------|---------|
| `ping` | — | Responds with `pong`; useful for latency checks and bot health verification | All | `ping` |
| `echo` | `<text>` | Echoes back the provided text; useful for testing message delivery | All | `echo Hello World` |
| `react` | — | Sends a 🔥 emoji reaction to your message; fun & lightweight | All | `react` |
| `bomb` | `<text>` | Sends a disappearing message that self-destructs after 10 seconds | All | `bomb Secret message` |
| `sysinfo` | — | Displays system information (OS, total RAM, CPU cores, uptime) | All | `sysinfo` |
| `menu` / `help` | — | Shows a list of all available commands and their descriptions | All | `menu` |
| `$` | `<shell command>` | **[OWNER ONLY]** Executes a terminal command on your VPS (e.g., `$ ls -la`, `$ pm2 restart bot`) | Owner Only | `$ df -h` |
| `setname` | `<name>` | **[OWNER ONLY]** Updates the bot's Signal profile display name | Owner Only | `setname Shiny Bot v2` |
| `block` | `<phone_number>` | **[OWNER ONLY]** Blocks a Signal contact (they won't see your profile or messages) | Owner Only | `block +62812345678` |
| `unblock` | `<phone_number>` | **[OWNER ONLY]** Unblocks a previously blocked contact | Owner Only | `unblock +62812345678` |
| `creategroup` | `<group_name>` | **[OWNER ONLY]** Creates a new Signal group with you as the owner/admin | Owner Only | `creategroup MyGroup` |

### Command Examples & Usage

#### Public Commands

```
👤 User: ping
🤖 Bot: pong

👤 User: echo Hello from Signal!
🤖 Bot: Hello from Signal!

👤 User: react
🤖 Bot: [Sends 🔥 reaction to your message]

👤 User: bomb This message will vanish in 10 seconds
🤖 Bot: [Sends disappearing message]

👤 User: sysinfo
🤖 Bot: OS: Linux (Ubuntu 22.04)
        RAM: 2048 MB
        CPU Cores: 4
        Uptime: 45 days 3 hours

👤 User: menu
🤖 Bot: 📋 Available Commands:
        ⚡ ping - Check bot status
        📝 echo - Echo your message
        🔥 react - Send reaction
        💣 bomb - Disappearing message
        ℹ️  sysinfo - System information
        📚 menu/help - Show this menu
        [Owner-Only Commands]
        💻 $ - Execute terminal command
        👤 setname - Update bot name
        🚫 block/unblock - Manage contacts
        👥 creategroup - Create group
```

#### Owner-Only Commands

```
👤 Owner: $ ls -la
🤖 Bot: total 48
        drwxr-xr-x 12 root root  4096 Dec 15 10:30 .
        drwxr-xr-x 20 root root  4096 Dec 10 08:15 ..
        -rw-r--r--  1 root root   345 Dec 15 09:45 package.json
        ...

👤 Owner: $ pm2 status
🤖 Bot: ┌─────────────────────┬─────┬─────────┐
        │ App name            │ PID │ Status  │
        ├─────────────────────┼─────┼─────────┤
        │ shiny-signal-bot    │ 123 │ online  │
        └─────────────────────┴─────┴─────────┘

👤 Owner: setname Shiny Bot v2
🤖 Bot: ✅ Profile name updated successfully

👤 Owner: block +62812345678
🤖 Bot: ✅ Contact blocked

👤 Owner: creategroup DevTeam
🤖 Bot: ✅ Group 'DevTeam' created successfully
```

---

## 🏗️ Architecture & Design Patterns

### Dual-Channel Communication Model

Shiny Signal Bot operates with two concurrent, non-blocking communication channels:

#### 1. **WebSocket Stream** (Real-Time Event Ingestion)
- Maintains persistent WebSocket connection to `signal-cli-rest-api`
- Receives all events in real-time: `dataMessage`, `syncMessage`, `receiptMessage`, typing indicators
- Non-blocking async event listeners via `ws.on('message', ...)`
- Automatically handles reconnection with exponential backoff
- Events are parsed and routed to appropriate handlers

#### 2. **REST API** (Action Execution)
- Asynchronous HTTP requests via `axios` for sending messages, reactions, profile updates
- All operations (`sendMessage`, `block`, `updateProfile`, etc.) are non-blocking
- Does not interfere with WebSocket event listening
- Implements error handling, retries, and timeout management
- Responses are logged and returned to the caller

### Sync Message Handling (Advanced Feature)

The bot uniquely handles `syncMessage` events—messages sent by the owner from their primary Signal device or linked devices:

```typescript
// Pseudocode illustration
if (message.source === BOT_NUMBER) {
  // This is a syncMessage: the owner is controlling the bot from their phone
  // Parse the command and determine the reply recipient
  // Send response to: message.dataMessage.groupId || message.dataMessage.contact
} else {
  // This is a dataMessage: someone else is talking to the bot
  // Reply directly to the sender
}
```

This allows seamless remote control of the bot directly from the owner's Signal app—commands typed from the owner's phone are instantly recognized and executed.

### Command Dispatcher (Switch-Case Pattern)

The command system uses a fast, O(1) lookup pattern:

```typescript
const firstWord = message.text.split(" ")[0].toLowerCase();
const restOfMessage = message.text.substring(firstWord.length).trim();

switch (firstWord) {
  case "ping":
    // Handle ping command
    break;
  case "echo":
    // Handle echo with parameters
    break;
  case "$":
    // Handle terminal execution (owner-only)
    break;
  // ... more cases
  default:
    // Unknown command
    break;
}
```

**Advantages:**
- ✅ **O(1) Performance** – Constant time lookup regardless of command count
- ✅ **Scalable** – Add new commands without performance degradation
- ✅ **Maintainable** – Clear, isolated logic per command
- ✅ **Safe** – No regex execution or dynamic code evaluation (prevents injection attacks)

---

## 🔗 API Reference

The `src/api.ts` module exposes the following core functions:

### Messaging Functions

```typescript
/**
 * Send a text message
 * @param recipient Phone number or group ID
 * @param text Message content
 * @param isGroup Whether this is a group message
 */
export async function sendMessage(
  recipient: string,
  text: string,
  isGroup?: boolean
): Promise<void>

/**
 * Send a reaction (emoji) to a message
 * @param recipient Phone number or group ID
 * @param emoji Emoji character (e.g., "🔥", "👍")
 * @param targetUUID UUID of the message to react to
 */
export async function sendReaction(
  recipient: string,
  emoji: string,
  targetUUID: string
): Promise<void>

/**
 * Send a typing indicator
 * @param recipient Phone number or group ID
 * @param isGroup Whether this is a group message
 */
export async function sendTypingIndicator(
  recipient: string,
  isGroup?: boolean
): Promise<void>
```

### Advanced Message Features

```typescript
/**
 * Send a message that automatically disappears
 * @param recipient Phone number or group ID
 * @param text Message content
 * @param expiresInSeconds How long before message self-destructs (e.g., 10 for 10 seconds)
 */
export async function sendDisappearingMessage(
  recipient: string,
  text: string,
  expiresInSeconds: number
): Promise<void>

/**
 * Edit a previously sent message (requires UUID of original message)
 * @param recipient Phone number or group ID
 * @param messageBody New message content
 * @param targetTimestamp Timestamp of message to edit
 */
export async function editMessage(
  recipient: string,
  messageBody: string,
  targetTimestamp: number
): Promise<void>
```

### Group Management

```typescript
/**
 * Create a new Signal group
 * @param groupName Display name for the group
 * @param members Array of phone numbers to add (owner is automatically added)
 * @returns Group ID for future reference
 */
export async function createGroup(
  groupName: string,
  members: string[]
): Promise<string>

/**
 * Update group information
 * @param groupId Group ID
 * @param groupName New group name
 */
export async function updateGroup(
  groupId: string,
  groupName: string
): Promise<void>

/**
 * Leave a group
 * @param groupId Group ID
 */
export async function leaveGroup(groupId: string): Promise<void>
```

### Contact Management

```typescript
/**
 * Block a contact
 * @param phoneNumber Contact's phone number
 */
export async function block(phoneNumber: string): Promise<void>

/**
 * Unblock a contact
 * @param phoneNumber Contact's phone number
 */
export async function unblock(phoneNumber: string): Promise<void>

/**
 * Update bot's profile
 * @param newName New display name
 */
export async function updateProfile(newName: string): Promise<void>
```

All functions include error handling, logging, and automatic retry logic.

---

## 🧩 Extending the Bot

### Adding a Custom Command

#### Step 1: Open `src/index.ts`

Locate the command switch statement in the WebSocket message handler.

#### Step 2: Add a new case

```typescript
case "mycommand":
  try {
    const response = await myCustomFunction(restOfMessage);
    await sendMessage(recipient, response, isGroup);
  } catch (error) {
    logger.error(`Command 'mycommand' failed: ${error}`);
    await sendMessage(recipient, "❌ Command failed", isGroup);
  }
  break;
```

#### Step 3: Implement your function

Create the logic in `src/api.ts` or a dedicated utility file:

```typescript
export async function myCustomFunction(args: string): Promise<string> {
  // Validate input
  if (!args || args.trim().length === 0) {
    return "❌ Please provide input";
  }

  // Your logic here
  const result = await someAsyncOperation(args);
  
  return `✅ Result: ${result}`;
}
```

#### Step 4: Rebuild and test

```bash
npm run build
npm run start
```

Send the command from Signal:

```
mycommand test input
```

### Integrating External APIs

Example: Fetch weather data from a weather API

```typescript
import axios from "axios";

export async function fetchWeather(city: string): Promise<string> {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_API_KEY,
          units: "metric"
        }
      }
    );

    const { main, weather, wind } = response.data;
    return `
🌍 ${city.toUpperCase()}
🌡️  Temperature: ${main.temp}°C
☁️  Condition: ${weather[0].description}
💨 Wind: ${wind.speed} m/s
    `.trim();
  } catch (error) {
    return `❌ Could not fetch weather for ${city}`;
  }
}
```

Then add the command:

```typescript
case "weather":
  const weather = await fetchWeather(restOfMessage);
  await sendMessage(recipient, weather, isGroup);
  break;
```

---

## 🐳 Docker Deployment (Multi-Container Setup)

For production environments, run both Signal API and the bot in Docker:

### docker-compose.yml

```yaml
version: "3.8"

services:
  signal-cli:
    image: bbernhard/signal-cli-rest-api:latest
    container_name: signal-api
    ports:
      - "9999:8080"
    volumes:
      - signal_data:/home/.local/share/signal-cli
    environment:
      - MODE=json-rpc
    restart: unless-stopped
    networks:
      - signal-network

  shiny-bot:
    build: .
    container_name: shiny-signal-bot
    depends_on:
      - signal-cli
    environment:
      - API_URL=http://signal-cli:8080
      - WEBSOCKET_URL=ws://signal-cli:8080
      - BOT_NUMBER=${BOT_NUMBER}
      - OWNERS=${OWNERS}
    restart: unless-stopped
    networks:
      - signal-network

volumes:
  signal_data:

networks:
  signal-network:
    driver: bridge
```

### .env file

```env
BOT_NUMBER=+62812345678
OWNERS=+62812345678
```

### Deploy

```bash
docker-compose up -d
docker-compose logs -f shiny-bot
```

---

## 📝 Logging & Debugging

### Enable Debug Logging

Edit `src/index.ts`:

```typescript
const DEBUG = true;

if (DEBUG) {
  console.log(`📥 Received event:`, event.type);
  console.log(`💬 Message text:`, message.text);
  console.log(`🎯 Target recipient:`, recipient);
  console.log(`⚙️  Command parsed:`, firstWord);
}
```

### View Logs

#### Development Mode
```bash
npm run dev
# Logs appear in console
```

#### PM2
```bash
pm2 logs shiny-signal-bot
pm2 logs shiny-signal-bot --tail 100  # Last 100 lines
```

#### Docker
```bash
docker logs shiny-signal-bot
docker logs -f shiny-signal-bot  # Follow logs in real-time
```

#### Systemd (if installed as service)
```bash
journalctl -u shiny-signal-bot -f
```

---

## 🤝 Contributing

We enthusiastically welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or optimizing performance, your work is valued and appreciated.

### How to Contribute

1. **Fork the repository** on GitHub
2. **Create a feature branch** with a descriptive name:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** with clear, descriptive commit messages:
   ```bash
   git commit -m "Add amazing feature that does XYZ"
   ```
4. **Test thoroughly**:
   ```bash
   npm run build
   npm run dev
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request** on GitHub with a detailed description of changes

### Code Standards

- **TypeScript**: Use strict type checking; no `any` types without justification
- **Error Handling**: Always include try-catch blocks for async operations
- **Logging**: Add meaningful console logs for debugging
- **Comments**: Document complex logic with JSDoc comments
- **Testing**: Test edge cases and error scenarios before submitting
- **Performance**: Avoid blocking operations; use async/await
- **Security**: Never log sensitive data (API keys, phone numbers, etc.)

### Reporting Issues

Found a bug? Have a feature idea? Please open an [Issue](https://github.com/IHx-cmyk/signal-bot/issues) with:

- **Clear title** and detailed description
- **Steps to reproduce** (for bugs)
- **Expected behavior** vs actual behavior
- **Environment**: OS, Node.js version, VPS type
- **Logs** or error messages (if applicable)

---

## 🙏 Credits & Acknowledgements

**Shiny Signal Bot** is built upon the exceptional work of the open-source community. We extend our deepest gratitude to:

### [bbernhard/signal-cli-rest-api](https://github.com/bbernhard/signal-cli-rest-api)

**This project would not exist without the incredible work of [bbernhard](https://github.com/bbernhard) and their team.**

The `signal-cli-rest-api` is a masterpiece of open-source engineering—providing a clean, reliable, and well-maintained REST and JSON-RPC interface to the Signal protocol.

**Why we're grateful:**
- ✨ Exceptional code quality and thoughtful API design
- 🔒 Dedicated focus on privacy and security
- 🚀 Continuous improvements and active maintenance
- 📚 Comprehensive documentation and examples
- 🤝 Responsive to community feedback and issues
- 💪 Enables projects like Shiny Signal Bot to exist

Every core feature in Shiny Signal Bot relies directly on bbernhard's foundation:
- ✅ WebSocket real-time event streaming
- ✅ JSON-RPC request/response handling
- ✅ Message sending with full feature parity
- ✅ Contact and group management
- ✅ Profile customization and updates
- ✅ Reliable Docker containerization and deployment

**We highly recommend:**
1. ⭐ **Star the [signal-cli-rest-api repository](https://github.com/bbernhard/signal-cli-rest-api)** to show appreciation
2. 🔗 **Check out their documentation** for API details and advanced features
3. 💬 **Engage with their community** and contribute back
4. 🐛 **Report issues** you encounter to help improve the project

---

### Additional Open Source Projects

Thank you to the maintainers and contributors of:

- **[Node.js](https://nodejs.org/)** – Powering server-side JavaScript
- **[TypeScript](https://www.typescriptlang.org/)** – Static typing for safer, more maintainable code
- **[ws](https://github.com/websockets/ws)** – The most popular WebSocket library for Node.js
- **[axios](https://axios-http.com/)** – Promise-based HTTP client with excellent error handling
- **[Signal Foundation](https://signal.org/)** – Building privacy-first communication tools
- **[signal-cli](https://github.com/AsamK/signal-cli)** – The underlying CLI that powers the REST API

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for full details.

### MIT License Summary

You are free to:
- ✅ Use this software for any purpose (commercial, personal, educational)
- ✅ Modify and distribute copies
- ✅ Include it in proprietary applications

With the condition:
- ⚠️ Include a copy of the license and copyright notice

---

## 🚀 Getting Started Now

Ready to launch your Signal automation journey?

```bash
# Step 1: Clone the repository
git clone https://github.com/IHx-cmyk/signal-bot.git
cd signal-bot

# Step 2: Install dependencies
npm install

# Step 3: Configure your settings
nano src/config.ts
# Update API_URL, BOT_NUMBER, OWNERS with your information

# Step 4: Run the bot
npm run dev
```

**Troubleshooting:**
- ❌ **"Cannot connect to Signal API"** – Check that Docker container is running: `docker ps`
- ❌ **"Bot not responding"** – Verify bot number and owners in config: `cat src/config.ts`
- ❌ **"Port 9999 already in use"** – Change port in docker run command: `-p 8888:8080`
- ❌ **"Device not linked"** – Complete Step 2 of installation: Scan QR code with Signal app

---

## 📚 Additional Resources

- **Signal Messenger**: https://signal.org/
- **Signal Protocol Documentation**: https://signal.org/docs/
- **signal-cli Project**: https://github.com/AsamK/signal-cli
- **signal-cli-rest-api Wiki**: https://github.com/bbernhard/signal-cli-rest-api/wiki
- **Node.js Documentation**: https://nodejs.org/docs/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---


**Built with ❤️ by [Shiny -Dev (Ihsann)](https://github.com/IHx-cmyk)**

If you find Shiny Signal Bot helpful, please consider:
- ⭐ **Starring** this repository
- 🐛 **Reporting bugs** and suggesting features
- 🤝 **Contributing** code and documentation
- 📢 **Sharing** with the community

**Special Thanks:** 🙏 To [bbernhard](https://github.com/bbernhard) for the amazing `signal-cli-rest-api`

---

*Last Updated: May 2026*
*Version: 0.1.8*

</div>
