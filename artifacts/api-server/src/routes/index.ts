import { Router, type IRouter } from "express";
import healthRouter from "./health";
import animeRouter from "./anime";

const router: IRouter = Router();

router.use(healthRouter);
router.use(animeRouter);

export default router;
