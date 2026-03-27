import { pgTable, serial, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sensorReadingsTable = pgTable("sensor_readings", {
  id: serial("id").primaryKey(),
  methane: real("methane").notNull(),
  ethanol: real("ethanol").notNull(),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  status: text("status").notNull().default("fresh"),
  deviceId: text("device_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertSensorReadingSchema = createInsertSchema(sensorReadingsTable).omit({
  id: true,
  timestamp: true,
  status: true,
});

export type InsertSensorReading = z.infer<typeof insertSensorReadingSchema>;
export type SensorReading = typeof sensorReadingsTable.$inferSelect;
