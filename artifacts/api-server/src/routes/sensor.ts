import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sensorReadingsTable, settingsTable } from "@workspace/db/schema";
import { PostSensorReadingBody } from "@workspace/api-zod";
import { desc, gte } from "drizzle-orm";

const router: IRouter = Router();

function computeStatus(
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

async function getOrCreateSettings() {
  const existing = await db.select().from(settingsTable).limit(1);
  if (existing.length > 0) return existing[0];
  const [created] = await db.insert(settingsTable).values({}).returning();
  return created;
}

router.post("/reading", async (req, res) => {
  const parsed = PostSensorReadingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid sensor data" });
    return;
  }

  const { methane, ethanol, temperature, humidity, deviceId } = parsed.data;
  const settings = await getOrCreateSettings();
  const status = computeStatus(methane, ethanol, temperature, humidity, settings);

  const [reading] = await db
    .insert(sensorReadingsTable)
    .values({ methane, ethanol, temperature, humidity, status, deviceId })
    .returning();

  res.status(201).json(reading);
});

router.get("/latest", async (_req, res) => {
  const readings = await db
    .select()
    .from(sensorReadingsTable)
    .orderBy(desc(sensorReadingsTable.timestamp))
    .limit(1);

  if (readings.length === 0) {
    res.status(404).json({ error: "No readings found" });
    return;
  }

  res.json(readings[0]);
});

router.get("/history", async (req, res) => {
  const hours = Number(req.query.hours) || 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const readings = await db
    .select()
    .from(sensorReadingsTable)
    .where(gte(sensorReadingsTable.timestamp, since))
    .orderBy(sensorReadingsTable.timestamp);

  res.json(readings);
});

export default router;
