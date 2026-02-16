<h1 align="center" style="font-weight: bold;">Shakiri Ayui 🤖</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

<p align="center">A feature-rich, high-performance Discord bot designed for entertainment, music, and server management.</p>

<hr />

## ✨ Features

Shakiri Ayui comes packed with a variety of modules to enhance your Discord server experience:

### 🎵 Music System

Powered by `discord-player` and `youtubei.js` for high-quality audio streaming.

- **Sources**: YouTube, SoundCloud, and more.
- **Controls**: Play, pause, skip, stop, loop, shuffle, and volume adjustment.
- **Advanced**: Lyrics lookup, queue management, seeking, and jump to specific tracks.
- **Interaction**: Full button-based player controls.

### 🎮 Economy & Mini-Games

Engage your community with interactive games and a robust economy system.

- **Wordle**: Play the classic daily word game directly in Discord.
- **Daily Rewards**: Claim daily currency to build your balance.
- **Transactions**: Deposit, withdraw, and transfer currency between users.
- **Leaderboards**: Track the richest users in your server.

### 🕹️ Temporary Voice Channels

Dynamic voice channel management.

- **Customizable**: Rename your temporary channel.
- **Privacy**: Block/unblock specific users or set member limits.
- **Automation**: Channels are automatically created and deleted as users join/leave.

### 🛡️ Moderation

Essential tools for server administrators.

- **Enforcement**: Ban, kick, and mute unruly members.
- **Role Management**: Easily add or remove roles from users.
- **Cleanup**: Purge messages efficiently.

### 🤖 AI Integration

Integrated with **Google Gemini AI** for smart interactions.

- Chat with the bot using advanced LLM capabilities.
- Configurable model settings (defaults to `gemini-3-pro-preview`).

### 🛠️ Utility & Info

Quick access to server and user information.

- **Info**: Detailed server and user profiles.
- **Interaction**: Say command for bot announcements.
- **Configuration**: Prefix and status rotation management.

<hr />

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v20+ recommended)
- [pnpm](https://pnpm.io/) (used for package management)
- [MongoDB](https://www.mongodb.com/) (Atlas or local instance)
- [Discord Bot Token](https://discord.com/developers/applications)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Nekitori17/Shakiri-Ayui.git
   cd Shakiri-Ayui
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Use `.env.example` as a template. Create `.env.development` for local testing and `.env.production` for deployment.

   ```env
   BOT_TOKEN = "your_bot_token"
   CLIENT_ID = "your_client_id"
   GEMINI_AI_TOKEN = "your_gemini_api_key"
   MONGODB_CONNECTION_URI = "your_mongodb_uri"
   DEVELOPER_ACCOUNT_IDS = "['id1', 'id2']"
   WEBHOOK_LOG_ERROR_URL = "your_webhook_url"
   ```

### Running the Bot

- **Development Mode** (with auto-reload):

  ```bash
  pnpm run dev
  ```

- **Production Build & Start**:
  ```bash
  pnpm start
  ```

<hr />

## 💻 Powered By

- **Framework**: [Discord.js v14](https://discord.js.org/)
- **Music**: [discord-player](https://discord-player.js.org/)
- **Database**: [Mongoose](https://mongoosejs.com/)
- **AI**: [Google Gemini Pro](https://ai.google.dev/)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/) & [Node-Vibrant](https://github.com/akira-cn/node-vibrant)

<hr />

## 📫 Contribute

Contributions are welcome! Follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

<p align="center">Made with ❤️ by <a href="https://github.com/Nekitori17">Nekitori17</a></p>
