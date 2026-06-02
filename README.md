# 🐳 Docker Desktop Portfolio — Divvyansh Kudesiaa

> **`status: running`** | **`uptime: 4+ years of growth`** | **`base-image: student-developer-cse`**

Welcome to my personal portfolio, built and styled to replicate the interface of **Docker Desktop**. 

This portfolio isn't just a showcase of code; it is a live reflection of my developer philosophy. As someone obsessed with systems thinking, AI engineering, and autonomous multi-agent swarms, I view my projects, skills, and memories as self-contained, isolated, and reproducible blocks of effort. 

---

## 🌟 The Philosophy: Why "Docker"? (The Emotional Side)

In software, **Docker** brings deterministic order to chaotic environments. It encapsulates code, dependencies, and configurations so they run identically anywhere. 

For me, building this was deeply personal. My journey through computer science has often felt like managing a complex microservices architecture. There are layers of academic pressure (maintaining a **9.2 CGPA**), the chaotic and high-adrenaline rush of 36-hour hackathons, the trial-and-error of teaching myself ML libraries, and the quiet late nights debugging multi-agent coordination.

By mapping my life into **containers, volumes, and images**:
- **Containers** represent my active focus areas: my bio, my code, and my contact channels.
- **Volumes** represent my persistent memories: the milestones, the failures turned into learning, and the hours of focus.
- **Images** represent my foundational skills: immutable layers of knowledge (C++, Python, OCI, Machine Learning) stacked on top of each other, ready to be spun up at a moment's notice.

This portfolio is my way of packaging my chaotic passion for technology into a clean, interactive, and deterministic experience for you.

---

## 🚀 Key Features of the App

- **Interactive Docker Desktop UI**: Switch between Containers (Pages), Images (Skills), and Volumes (Timeline).
- **Embedded Terminal Control**: A simulated bash terminal at the bottom of the container views. You can run commands like `ls`, `pwd`, `whoami`, `cat contact.txt`, `docker ps`, and even trigger a secret ASCII animation by typing `hire me`.
- **Micro-Animations & Audio feedback**: Built with custom HSL color palettes, high-tech glassmorphism, responsive hover states, and retro sound cues.
- **Base64 Obfuscation**: Personal details (email/phone) are protected from web scrapers using `atob()` encoding, but decode seamlessly on user interaction.

---

## 📦 Container Registry (Featured Projects)

### 🚨 `crisis-connect` (`port 8080`)
* **Disaster Command Center**
* Built with 5 specialized ML pipelines achieving **94% displacement forecasting accuracy**. Utilizes DBSCAN clustering for hot-spot identification, NetworkX for route optimization, and OpenStreetMap APIs to map out emergency infrastructure. Deployed to help make decisions before crises escalate.

### 🛡️ `sentinel` (`port 8081`)
* **Climate-Aware Autonomous Investing System**
* A **7-agent autonomous pipeline** utilizing CrewAI/AutoGen concepts, fusing ESG climate scores with quantitative finance. Runs 10,000 Monte Carlo simulations per run and enforces risk policies via a custom guardrail layer, achieving 93-95% accuracy in paper trading simulations.

---

## 🏆 Persistent Volumes (Achievements & Milestones)

- **🥇 1st Place** – SRM Hackathon 10.0 (Competing against 500+ teams) | *2026*
- **🥇 1st Place** – Inn-Ing 2.0 (Competing against 250+ teams) | *2025*
- **🥈 2nd Place** – Shaastra Aerial Robotics, IIT Madras (Top finalist) | *2025*

---

## 🛠️ Stack Layers (`docker image inspect`)

```
FROM ubuntu:latest

# Core Languages
RUN apt-get install -y cpp python3 openjdk-17-jdk

# AI/ML & Autonomous Swarms
RUN pip install scikit-learn xgboost dbscan opencv-python crewai autogen

# Web & Database Services
RUN npm install fastify postgresql supabase express socket.io

# Cloud Infrastructure
LABEL cloud_certifications="OCI AI Foundations, OCI Foundations Associate, Oracle Fusion Agent Studio"
```

---

## 🌐 Local Development & Deployment

This project is a single-page app (SPA) crafted with pure, highly optimized **HTML5, Vanilla CSS, and JavaScript**.

### Run Locally
Simply clone this repository and open `index.html` in any web browser:
```bash
git clone https://github.com/naakaarafr/Portfolio.git
cd Portfolio
# Double-click index.html or run:
npx serve .
```

### Deploying to Vercel
This project is fully ready for zero-config Vercel hosting:
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import the `Portfolio` GitHub repository.
3. Click **Deploy**. Vercel will serve `index.html` at your root automatically.

---

*“We are all containers trying to find our perfect host environment. Thank you for visiting mine.”*  
— **Divvyansh Kudesiaa**