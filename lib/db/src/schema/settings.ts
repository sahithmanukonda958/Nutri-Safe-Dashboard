import { pgTable, serial, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  methaneWarning: real("methane_warning").notNull().default(200),
  methaneSpoiled: real("methane_spoiled").notNull().default(500),
  ethanolWarning: real("ethanol_warning").notNull().default(150),
  ethanolSpoiled: real("ethanol_spoiled").notNull().default(400),
  temperatureWarning: real("temperature_warning").notNull().default(15),
  temperatureSpoiled: real("temperature_spoiled").notNull().default(25),
  humidityWarning: real("humidity_warning").notNull().default(70),
  humiditySpoiled: real("humidity_spoiled").notNull().default(85),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
