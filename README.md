# VitalGuard AI 🩺⚡

> **AI-Powered Continuous Clinical Telemetry & Health Anomaly Detection Platform**

VitalGuard AI is a real-time, responsive clinical monitoring dashboard designed to simulate wearable biometric telemetry, perform continuous rolling-window anomaly triage, and provide healthcare professionals with high-fidelity physiological insights.

---

## 🚀 Key Features

- **Continuous Biometric Telemetry**: Realistic simulated stream cycling through patient activity states (*Resting*, *Light Activity*, *Exertion*) with natural baseline variance and mean-reverting walks.
- **Intelligent Anomaly Detection Engine**:
  - **Tachycardia**: Sustained $>100\text{ BPM}$ (Warning) / $>140\text{ BPM}$ (Critical).
  - **Bradycardia**: Sustained $<50\text{ BPM}$ (Critical).
  - **Hypoxia**: Sustained $\text{SpO}_2 < 92\%$ (Critical) / $94-95\%$ (Warning).
  - **Irregular Rhythm**: Acute rate fluctuation ($>30\text{ BPM}$ shift across 3 consecutive ticks).
- **Interactive Recharts Telemetry Canvas**: Rolling 60-readings history visualization with multi-vital toggles (Heart Rate, $\text{SpO}_2$, Combined) and dynamic **Critical/Warning timeline background shading**.
- **Real-Time Clinical Alert Triage Feed**: Severity-coded notifications, relative event timestamps, and automated state resolution upon vitals normalization.
- **Interactive Judge Demo Controls**: One-click simulation triggers for instant evaluation of **Tachycardia**, **Hypoxia**, and **Bradycardia**.
- **Smooth Micro-Interactions**: Eased numeric counters, alert slide-in transitions, and ambient glowing alert indicators.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Component architecture & declarative state management |
| **Build Tool** | [Vite 6](https://vite.dev/) | Ultra-fast HMR and production bundling |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first design system with health-tech palette |
| **Data Visualization** | [Recharts](https://recharts.org/) | Responsive SVG time-series charts with custom reference zones |
| **Iconography** | [Lucide React](https://lucide.dev/) | Clean, accessible medical & interface icons |
| **Typography** | [Inter (Google Fonts)](https://fonts.google.com/specimen/Inter) | Crisp clinical typography with tabular numerals |

---

## 📁 Project Structure

```
VitalGuardAI/
├── public/
├── src/
│   ├── components/
│   │   ├── AlertFeed.jsx          # Live clinical alerts feed & triage
│   │   ├── PatientProfile.jsx     # Patient metadata & overall health summary badge
│   │   ├── TrendChart.jsx         # Recharts live multi-vital telemetry visualizer
│   │   └── VitalsCard.jsx         # Animated telemetry metric cards with trend indicators
│   ├── lib/
│   │   ├── anomalyDetector.js     # Rolling window anomaly evaluation & lifecycle engine
│   │   └── dataSimulator.js       # Biometric telemetry stream generator & state machine
│   ├── App.jsx                    # 3-column responsive dashboard shell & demo controls
│   ├── index.css                  # Tailwind CSS import & micro-animation keyframes
│   └── main.jsx                   # React DOM root mounting
├── index.html                     # HTML5 template with Inter font & favicon
├── package.json                   # Dependencies & scripts
└── vite.config.js                 # Vite build & Tailwind plugin configuration
```

---

## 📊 Project Flow & Data Architecture

```mermaid
flowchart TD
    A[VitalsSimulator State Machine] -->|Generates tick every 2s| B[Rolling History Buffer (60 Readings)]
    B --> C[App.jsx Reactive State]
    C -->|Telemetry stream| D[VitalsCard.jsx (HR, SpO2, Steps)]
    C -->|Historical window| E[TrendChart.jsx (Recharts)]
    B --> F[AnomalyDetector Engine]
    F -->|Evaluates thresholds & rate of change| G[Active / Resolved Alerts]
    G --> H[AlertFeed.jsx Component]
    G --> I[PatientProfile.jsx Status Badge]
    J[Judge Demo Controls] -->|injectAnomaly()| A
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/sumitpshinde269-oss/Healthcare-Monitering.git
cd Healthcare-Monitering
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🎯 How to Demo the Application

Click any of the **Judge Demo Controls** in the header:
1. 🔥 **Tachycardia**: Spikes Heart Rate to **$170+\text{ BPM}$**, triggers a critical alert, and turns the chart area red.
2. 💧 **Hypoxia**: Drops $\text{SpO}_2$ to **$88\%$**, causing oxygen saturation warnings and risk escalation.
3. 💔 **Bradycardia**: Drops Heart Rate to **$\sim 40\text{ BPM}$**, demonstrating severe low pulse triage.
4. **Auto-Resolution**: After 10 ticks, vitals return to normal baseline, and active alerts transition to `Resolved`.

---

## ⚖️ Regulatory & Medical Disclaimer

> **Disclaimer**: *VitalGuard AI is developed solely for demonstration, educational, and research simulation purposes. It is not a certified medical device and should not be used for diagnostic or clinical treatment decisions.*
