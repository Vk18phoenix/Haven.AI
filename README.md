# 🌸 Haven.AI — Your Empathetic AI Companion

Haven.AI is a **full-stack, AI-powered emotional companion** that creates a **secure, private, and supportive** space for meaningful conversations.  
Built with **custom prompt engineering**, it ensures empathetic, validating, and non-judgmental interactions — while keeping user privacy and safety as top priorities.

With **positive reinforcement 🤝, active listening 👂, and empathy ❤️**, Haven.AI connects users with an AI that feels genuinely caring.

---

## ✨ Core Features

### 🔒 Secure User Authentication
- Email/password sign-up & login via **Firebase Authentication**.
- Persistent user sessions for seamless re-entry.
- Encrypted profile picture storage with **Firebase Storage**.

### 🧍 Personalized User Experience
- Greets users by chosen display name.
- Customizable profile with:
  - Avatar upload from device (auto-compressed for performance)
  - Emoji-based avatar generation.

![User Profile DP](https://raw.githubusercontent.com/Vk18phoenix/Haven.AI/main/User-profile-DP.png)

---

### 🧠 AI Prompt Engineering & Personality Design
- **Custom `AIResponse.jsx` module** defines how the AI responds.
- Inbuilt rules for:
  - Empathy, validation, and encouragement.
  - Avoidance of judgmental/dismissive language.
  - Calm, consistent tone across sessions.
  - Gently guiding users toward professional help for serious issues.
- Integrated with **Google Gemini API (gemini-1.5-flash)** for real-time empathetic responses.

![AI Responses](https://raw.githubusercontent.com/Vk18phoenix/Haven.AI/main/AI-responses.png)

---

### 📜 Persistent & Interactive Chat History
- Conversations stored in **Firebase Firestore**.
- Sidebar with all past sessions — click to resume instantly.
- Context menu for **Pin / Unpin**, **Rename**, **Share**, **Delete**.

![Sidebar History](https://raw.githubusercontent.com/Vk18phoenix/Haven.AI/main/Sidebar-history.png)

---

### 🎙 Full Voice Integration
- **Speech-to-Text**: Speak to AI via **SpeechRecognition API**.
- **Text-to-Speech**: Hear AI responses via **SpeechSynthesis API**.
- Voice Assistant settings: choose **Male**, **Female**, or disable voice.

---

### ⚙ Comprehensive Settings & Feedback
- **Theme Switcher**: Light/Dark mode across the app.
- **Location Services**: Auto-detect city/country with manual refresh.
- **Feedback Form**: Send suggestions directly via **EmailJS**.

![Settings](https://github.com/Vk18phoenix/Haven.AI/blob/main/Settings%20box.png)  
![Send Feedback](https://github.com/Vk18phoenix/Haven.AI/blob/main/Send%20feedback%20form.png)

---

### 🖥 Main UI – A Calm, Supportive Space
- Soft colors, generous spacing, and friendly typography for a soothing experience.
- Sticky header & chat input for smooth scrolling.

![Haven UI](https://raw.githubusercontent.com/Vk18phoenix/Haven.AI/main/Haven-UI.png)

---

### 🔐 Secure Signup & Login
- Simple, privacy-focused onboarding.
- Strong security powered by Firebase Authentication.

![Signup Login](https://raw.githubusercontent.com/Vk18phoenix/Haven.AI/main/Signup-Login.png)

---

## 🛠 Tech Stack

| Layer           | Technology |
|-----------------|------------|
| **Frontend**    | React + Vite ⚡ |
| **Backend**     | Firebase Authentication 🔐 + Firestore 📂 + Storage 🖼 |
| **AI Engine**   | Google Gemini API 🤖 |
| **Hosting**     | Vercel 🚀 |
| **Third-Party** | EmailJS 📧 |
| **Browser APIs**| SpeechRecognition 🎙, SpeechSynthesis 🔊, Geolocation 📍 |

---


## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Vk18phoenix/Haven.AI.git

# Navigate to the project folder
cd Haven.AI

# Install dependencies
npm install

# Start development server
npm run dev

📌 Links

LinkedIn: https://www.linkedin.com/in/vk18phoenix/  
Live Demo: https://haven-ai-twgz.vercel.app/
Contact Email: vkalyan782@gmail.com

