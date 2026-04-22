# 💬 Chat App (React + Supabase + Capacitor)

A real-time chat application built using **React (Vite)**, **Supabase (Auth + Database + Realtime)** and **Capacitor (Android APK)**.

---

## 🚀 Features

* 🔐 User Authentication (Login)
* 💬 Real-time Messaging (Supabase Realtime)
* 📃 Chat List with Latest Message
* ⬆️ Latest Chat appears on top
* 🔄 Auto updates without refresh
* 📱 Android APK support using Capacitor

---

## 🛠️ Tech Stack

* React (Vite)
* Supabase (Auth, Database, Realtime)
* Tailwind CSS
* Capacitor (Android)

---

## ⚙️ Supabase Setup

1. Go to https://supabase.com
2. Create a new project

### 📌 Create Tables

#### `conversations`

* id (int8, primary key)
* created_at (timestamp)

#### `conversation_participants`

* conversation_id (int8)
* user_id (uuid)

#### `messages`

* id (int8, primary key)
* conversation_id (int8)
* sender_id (uuid)
* content (text)
* created_at (timestamp)

---

### 🔐 Enable Realtime

Go to:

```
Database → Replication → Enable Realtime for "messages" table
```

---

### 🔑 Environment Variables

Create a `.env` file in frontend:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 💻 Run Locally

```bash
npm install
npm run dev
```

App will run on:

```
http://localhost:5173
```

---

## 📱 Build Android APK

### Step 1: Build React App

```bash
npm run build
```

---

### Step 2: Copy to Android

```bash
npx cap copy android
```

---

### Step 3: Open Android Studio

```bash
npx cap open android
```

---

### Step 4: Run App

* Connect emulator / device
* Click ▶️ Run

---

## 📦 Generate APK

In Android Studio:

```
Build → Build APK(s)
```

APK location:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📁 Project Structure

```
frontend/
  src/
    components/
      ChatList.jsx
      ChatScreen.jsx
      Login.jsx
    superbase.js
```

---

## ⚠️ Important Notes

* Do NOT upload `.env` file (already in `.gitignore`)
* Use `.env.example` for reference
* Make sure Realtime is enabled in Supabase

---

## 👨‍💻 Author

**Satyam Verma**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
