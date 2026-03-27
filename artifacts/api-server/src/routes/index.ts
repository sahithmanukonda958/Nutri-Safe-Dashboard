import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sensorRouter from "./sensor";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/sensor", sensorRouter);
router.use("/settings", settingsRouter);

export default router;
