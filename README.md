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
- **Interactive Simulation Controls**: One-click toggle simulation triggers for instant evaluation and reset of **Tachycardia**, **Hypoxia**, and **Bradycardia**.
- **Clean & Modern Clinical Interface**: Refined typography, tabular monospace numerals, accessible status indicators, and responsive 3-column layout.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Component architecture & declarative state management |
| **Build Tool** | [Vite 6](https://vite.dev/) | Fast HMR and production bundling |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first design system |
| **Data Visualization** | [Recharts 3](https://recharts.org/) | Responsive SVG time-series charts with custom reference zones |
| **Iconography** | [Lucide React](https://lucide.dev/) | Clean medical & interface icons |
| **Typography** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) & [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) | Crisp clinical typography with tabular numerals |

---

## 📁 Project Structure

```
VitalGuardAI/
├── public/
├── src/
│   ├── components/
│   │   ├── AlertFeed.jsx          # Live clinical alerts feed & triage filter
│   │   ├── PatientProfile.jsx     # Patient clinical metadata & health summary badge
│   │   ├── TrendChart.jsx         # Recharts live multi-vital telemetry visualizer
│   │   └── VitalsCard.jsx         # Telemetry metric cards with animated numbers & trends
│   ├── lib/
│   │   ├── anomalyDetector.js     # Rolling window anomaly evaluation & lifecycle engine
│   │   └── dataSimulator.js       # Biometric telemetry stream generator & state machine
│   ├── App.jsx                    # Dashboard shell, header & anomaly simulation toolbar
│   ├── index.css                  # Tailwind CSS theme tokens & utility styles
│   └── main.jsx                   # React DOM root mounting
├── index.html                     # HTML5 template with Google Fonts
├── package.json                   # Dependencies & npm scripts
├── vite.config.js                 # Vite build configuration
└── README.md                      # Project documentation & setup guide
```

---

## 📊 Data Flow & Architecture

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
    J[Simulation Controls Toolbar] -->|injectAnomaly() / clearAnomaly()| A
```

---

## ⚡ Setup & Installation Instructions

Follow these step-by-step instructions to run VitalGuard AI locally:

### 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (verify with `node -v`)
- **npm**: `v9.0.0` or higher (comes with Node.js, verify with `npm -v`) or **yarn** / **pnpm** / **bun**
- **Git**: (verify with `git -v`)

### 2. Clone the Repository

```bash
git clone https://github.com/sumitpshinde269-oss/Healthcare-Monitering.git
cd Healthcare-Monitering
```

*(Or navigate to your cloned project folder `VitalGuardAI`)*

### 3. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 4. Start the Development Server

Launch the Vite local dev server with hot module replacement (HMR):

```bash
npm run dev
```

Once started, open your browser and navigate to:
```
http://localhost:5173/
```

### 5. Build for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📜 Available NPM Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Starts the local development server at `http://localhost:5173` |
| `npm run build` | `vite build` | Compiles and minifies assets into the `dist/` directory |
| `npm run preview` | `vite preview` | Previews the production build locally |

---

## 🎯 How to Test & Demo the Application

Use the **Simulation Toolbar** located in the top header:

1. 🔥 **Tachycardia**:
   - Spikes Heart Rate to **$170+\text{ BPM}$**.
   - Triggers a **Critical Tachycardia** alert in the Clinical Alerts feed.
   - Highlights the critical anomaly zone in red on the trend chart.
   - Click the button again to clear and restore normal baseline.

2. 💧 **Hypoxia**:
   - Drops oxygen saturation ($\text{SpO}_2$) to **$88\%$**.
   - Triggers a **Critical Hypoxia** desaturation alert.
   - Click the button again to clear and restore normal baseline.

3. 💔 **Bradycardia**:
   - Drops Heart Rate to **$\sim 40\text{ BPM}$**.
   - Triggers a **Critical Bradycardia** pulse alert.
   - Click the button again to clear and restore normal baseline.

4. **Multi-Vital Waveform Filter**:
   - Switch between `Heart Rate`, `SpO2`, or `Both` in the trend chart header to inspect specific physiological waveforms.

5. **Alert Triage Filter**:
   - Filter active alerts by `All`, `Active`, or `Critical` in the Clinical Alerts feed.

---

## ⚖️ Regulatory & Medical Disclaimer

> **Disclaimer**: *VitalGuard AI is developed solely for demonstration, educational, and research simulation purposes. It is not a certified medical device and should not be used for diagnostic or clinical treatment decisions.*

