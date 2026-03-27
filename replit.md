# NutriSafe Workspace

## Overview

NutriSafe is an IoT food spoilage detection dashboard. An ESP32 with MQ-series gas sensor and DHT11 sends readings via HTTP POST to the API. The dashboard shows real-time status, charts, and safety tips.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **Frontend**: React + Vite, Recharts, TanStack Query, Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (ESP32 endpoint + dashboard APIs)
│   └── nutrisafe/          # React + Vite dashboard frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
└── package.json            # Root package
```

## Database Schema

- **sensor_readings** — stores ESP32 sensor readings (methane, ethanol, temperature, humidity, status, deviceId, timestamp)
- **settings** — calibration thresholds for all sensors (warning/spoiled levels)

## API Endpoints

All endpoints are under `/api`:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Health check |
| POST | `/api/sensor/reading` | Receive reading from ESP32 |
| GET | `/api/sensor/latest` | Get most recent reading |
| GET | `/api/sensor/history?hours=24` | Get historical readings |
| GET | `/api/settings` | Get threshold settings |
| PUT | `/api/settings` | Update thresholds |

## ESP32 Integration

Send readings via HTTP POST to `/api/sensor/reading`:

```json
{
  "methane": 120.5,
  "ethanol": 85.2,
  "temperature": 14.3,
  "humidity": 62.1,
  "deviceId": "ESP32-001"
}
```

The server auto-computes the status (`fresh`, `warning`, `spoiled`) based on the calibrated thresholds.

## Dashboard Pages

- **Dashboard** (/) — Real-time readouts, status indicator, mini charts, safety tips
- **History** (/history) — 24h trend charts for gas levels and temperature/humidity
- **Settings** (/settings) — Calibrate warning/spoiled thresholds for all sensors

## Status Logic

- **Fresh** (green): all readings below warning thresholds
- **Warning** (amber): any reading at/above warning threshold
- **Spoiled** (red): any reading at/above spoiled threshold
