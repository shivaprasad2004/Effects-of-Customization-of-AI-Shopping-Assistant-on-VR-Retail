# AI-Powered VR Shopping Assistant

A research-grade full-stack web application designed to study user behavior in customized virtual retail environments.

![Landing Page Mockup](https://via.placeholder.com/1200x600?text=AI+VR+Shopping+Assistant+Dashboard)

## 🚀 Overview
This project integrates real-time **AI Emotion Recognition**, **GPT-4 Conversational Assistance**, and **Blockchain Verification** into a 3D VR store built with React Three Fiber. Developed for experimental research (A/B testing), it tracks how AI personalization affects metrics like trust, immersion, and conversion.

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Redux Toolkit, Framer Motion, Three.js (R3F)
- **Backend**: Node.js, Express.js, Socket.io, Mongoose, PostgreSQL, Redis
- **AI Service**: Python FastAPI, TensorFlow (CNN), Scikit-learn, TextBlob/VADER
- **Blockchain**: Solidity (Hardhat), Ethers.js, Sepolia Testnet, MetaMask
- **Infrastructure**: Docker, Nginx, AWS S3

## 🔑 Key Features
### 1. 3D VR Store
- Interactive first-person shopping in 4 specialized zones.
- Real-time navigation triggered by AI chatbot commands.
- 360° product exploration and AR clothing try-on simulations.

### 2. AI & Emotion Engine
- **Emotion Recognition**: Predicts user sentiment (7 classes) via webcam to trigger dynamic discounts and assistant personality shifts.
- **ShopBot AI**: Personalized shopping concierge using GPT-4 with real-time intent detection.
- **Hybrid Recommendations**: Collaborative (SVD) + Content-based filtering.

### 3. Blockchain & Loyalty
- **Authenticity Certificates**: Every premium product is verified via a Solidity smart contract and stored as an IPFS hash.
- **VRPayment**: Integrated crypto-checkout using MetaMask on Sepolia.
- **$SHOP Token**: ERC-20 loyalty system rewarding users for purchases and positive behavior.

### 4. Researcher Dashboard
- **A/B Experimentation**: Automatic group assignment (Control vs. Experimental).
- **Behavioral Analytics**: Heatmaps, conversion funnels, and emotion distribution charts using Recharts.
- **Session Replay**: Tracking product views, chatbot logs, and spatial dwell time.

## ⚙️ Installation
1. **Clone the repo**:
   ```bash
   git clone https://github.com/shiva/vr-shopping-assistant.git
   cd vr-shopping-assistant
   ```
2. **Setup Env**:
   Copy `.env.example` to `.env` and fill in your API keys (OpenAI, AWS, Infura).
3. **Launch with Docker**:
   ```bash
   docker-compose up --build
   ```
4. **Access Applications**:
   - Frontend: `http://localhost:3000`
   - API Docs: `http://localhost:5000/api-docs`
   - AI Service: `http://localhost:8000/docs`

## 🧠 Research Goals
This tool is built to answer:
- *Does real-time emotional awareness in AI assistants increase user trust in product recommendations?*
- *How do blockchain authenticity seals affect perceived risk in VR high-ticket retail?*

## 📜 License
MIT - Created by Shiva for Major Project Research.
