import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db/schema";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getOrCreateSettings() {
  const existing = await db.select().from(settingsTable).limit(1);
  if (existing.length > 0) return existing[0];
  const [created] = await db.insert(settingsTable).values({}).returning();
  return created;
}

router.get("/", async (_req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

router.put("/", async (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid settings data" });
    return;
  }

  const existing = await getOrCreateSettings();

  const [updated] = await db
    .update(settingsTable)
    .set(parsed.data)
    .where(eq(settingsTable.id, existing.id))
    .returning();

  res.json(updated);
});

export default router;
