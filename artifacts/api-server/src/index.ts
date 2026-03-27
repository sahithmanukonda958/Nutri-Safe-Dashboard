import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { sensorReadingsTable, settingsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/api/socket.io",
});

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Client connected");
  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, "Client disconnected");
  });
});

httpServer.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Server listening");
});

// ─── Data Simulator ─────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

async function getOrCreateSettings() {
  const existing = await db.select().from(settingsTable).limit(1);
  if (existing.length > 0) return existing[0];
  const [created] = await db.insert(settingsTable).values({}).returning();
  return created;
}

function determineStatus(
  methane: number,
  ethanol: number,
  temperature: number,
  humidity: number,
  settings: typeof settingsTable.$inferSelect
): "fresh" | "warning" | "spoiled" {
  if (
    methane >= settings.methaneSpoiled ||
    ethanol >= settings.ethanolSpoiled ||
    temperature >= settings.temperatureSpoiled ||
    humidity >= settings.humiditySpoiled
  ) {
    return "spoiled";
  }
  if (
    methane >= settings.methaneWarning ||
    ethanol >= settings.ethanolWarning ||
    temperature >= settings.temperatureWarning ||
    humidity >= settings.humidityWarning
  ) {
    return "warning";
  }
  return "fresh";
}

setInterval(async () => {
  try {
    const methane = rand(200, 600);
    const ethanol = rand(150, 500);
    const temperature = rand(20, 30);
    const humidity = rand(40, 80);

    const settings = await getOrCreateSettings();
    const status = determineStatus(methane, ethanol, temperature, humidity, settings);

    const [reading] = await db
      .insert(sensorReadingsTable)
      .values({ methane, ethanol, temperature, humidity, status, deviceId: "SIMULATOR" })
      .returning();

    io.emit("new-reading", reading);
    logger.info({ methane, ethanol, temperature, humidity, status }, "Simulator emitted new reading");
  } catch (err) {
    logger.error({ err }, "Simulator error");
  }
}, 5000);
