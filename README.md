# 🌟 Haven.AI – Your Empathetic AI Companion

Haven.AI is a **full-stack, AI-powered web application** designed to serve as an empathetic and supportive emotional companion.  
It provides users with a **safe, private, and judgment-free space** to engage in meaningful conversations with an AI fine-tuned for **active listening, emotional awareness, and positive reinforcement**.  

Built with **React, Firebase, and Google Gemini API**, Haven.AI seamlessly combines **cutting-edge AI capabilities** with a **clean, modern user interface**, ensuring a deeply personal and reliable experience.

---

## ✨ Core Features

### 🧠 1. Empathetic AI Conversations  
Haven.AI leverages **Google’s Gemini API** with custom prompt engineering to generate responses that are **emotionally intelligent, contextually aware, and user-focused**.  
The AI actively listens, remembers conversation flow, and responds in a way that promotes comfort, trust, and encouragement.  
![AI Responses](assets/screenshots/AI%20responses.png)

---

### 📜 2. Persistent Chat History  
Every conversation matters — which is why Haven.AI securely stores **user-specific chat histories** in Firebase.  
The **side navigation panel** allows quick access to past conversations, helping users revisit and reflect on their emotional journey.  
![Sidebar with History Viewing](assets/screenshots/Sidebar%20with%20history%20viewing.png)

---

### 🖼 3. Personalized Profiles  
Haven.AI enables **deep customization of the user experience** with profile uploads and emoji-based avatars.  
Users can set their own profile picture, creating a familiar, human-like connection while interacting with the AI.  
![User Profile DP](assets/screenshots/User%20profile%20DP.png)

---

### 🔐 4. Secure & Private Authentication  
Privacy is a priority. The application integrates **Firebase Authentication** for seamless signup/login while safeguarding all sensitive information.  
Only authenticated users can access their personal data and conversations, ensuring **complete confidentiality**.  
![Signup cum Login Page](assets/screenshots/Signup%20cum%20Login%20page.png)

---

### 💬 5. Clean & Responsive Interface  
The application’s interface has been designed for **maximum clarity and emotional comfort**.  
A soft color palette, clean layouts, and intuitive navigation make it suitable for prolonged use without fatigue — whether on desktop or mobile.  
![Haven UI Page](assets/screenshots/Haven%20UI%20page.png)

---

## 🛠 Technology Stack
- **Frontend:** React (Vite), Tailwind CSS, React Icons  
- **Backend & Cloud:** Firebase Authentication, Firestore Database, Firebase Storage  
- **AI Engine:** Google Gemini API  
- **Deployment:** Vercel  

---

## 🚀 Live Demo
🔗 **[Explore Haven.AI Live](https://your-vercel-link.vercel.app)**

---

## ⚙️ Local Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/Haven.AI.git

# Navigate into the project folder
cd Haven.AI

# Install dependencies
npm install

# Create your environment file
touch .env.local
# Add Firebase and Gemini API keys in the format:
# VITE_FIREBASE_API_KEY=your_key
# VITE_GEMINI_API_KEY=your_key

# Run the development server
npm run dev
