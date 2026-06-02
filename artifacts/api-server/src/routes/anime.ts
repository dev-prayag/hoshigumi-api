import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";
import {
  scrapeSearch,
  scrapeGenre,
  scrapeType,
  scrapeStatus,
  scrapeTop,
  scrapeNew,
  scrapeUpdated,
  fetchRecentAnime,
  fetchSeries,
} from "../lib/scraper";
import { withCache, cacheKey, registerWarmer } from "../lib/cache";

const router: IRouter = Router();

function getPage(q: unknown): number {
  const n = parseInt(String(q ?? "1"), 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

function setCacheHeader(res: Response, hit: boolean): void {
  res.setHeader("X-Cache", hit ? "HIT" : "MISS");
  res.setHeader("X-Cache-Version", "v1");
}

const VALID_STATUSES = new Set([
  "currently-airing",
  "finished-airing",
  "not-yet-aired",
]);

const VALID_GENRES = new Set([
  "action",
  "adventure",
  "cars",
  "comedy",
  "dementia",
  "demons",
  "drama",
  "ecchi",
  "fantasy",
  "game",
  "harem",
  "historical",
  "horror",
  "isekai",
  "josei",
  "kids",
  "magic",
  "mahou-shoujo",
  "martial-arts",
  "mecha",
  "military",
  "music",
  "mystery",
  "parody",
  "police",
  "psychological",
  "romance",
  "samurai",
  "school",
  "sci-fi",
  "seinen",
  "shoujo",
  "shoujo-ai",
  "shounen",
  "shounen-ai",
  "slice-of-life",
  "space",
  "sports",
  "super-power",
  "supernatural",
  "thriller",
  "vampire",
]);

const VALID_TYPES = new Set(["movie", "music", "ona", "ova", "special", "tv"]);

const TTL = {
  RECENT: 5 * 60,          // 5 min — changes every episode drop
  HOT_LIST: 30 * 60,       // 30 min — top / new / updated
  BROWSE: 30 * 60,         // 30 min — genre / type / status / search
  BROWSE_PAGE: 2 * 60 * 60, // 2 h   — paginated results beyond page 1
  SERIES: 6 * 60 * 60,     // 6 h   — series detail is very stable
} as const;

const WARM_INTERVAL = {
  HOT: 4 * 60 * 1000,   // refresh recent/updated every 4 min
  LIST: 14 * 60 * 1000, // refresh top/new every 14 min
} as const;

registerWarmer({
  key: cacheKey("recent-anime"),
  ttl: TTL.RECENT,
  fn: fetchRecentAnime,
  intervalMs: WARM_INTERVAL.HOT,
});

registerWarmer({
  key: cacheKey("updated", 1),
  ttl: TTL.RECENT,
  fn: () => scrapeUpdated(1),
  intervalMs: WARM_INTERVAL.HOT,
});

registerWarmer({
  key: cacheKey("top", 1),
  ttl: TTL.HOT_LIST,
  fn: () => scrapeTop(1),
  intervalMs: WARM_INTERVAL.LIST,
});

registerWarmer({
  key: cacheKey("new", 1),
  ttl: TTL.HOT_LIST,
  fn: () => scrapeNew(1),
  intervalMs: WARM_INTERVAL.LIST,
});

router.get("/recent-anime", async (_req: Request, res: Response) => {
  try {
    const { data, hit } = await withCache(
      cacheKey("recent-anime"),
      TTL.RECENT,
      fetchRecentAnime,
    );
    setCacheHeader(res, hit);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "recent-anime failed");
    res.status(502).json({ ok: false, error: "Upstream API unavailable" });
  }
});

router.get("/series/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!/^\d+$/.test(id)) {
    res.status(400).json({ ok: false, error: "id must be a positive integer" });
    return;
  }
  try {
    const { data, hit } = await withCache(
      cacheKey("series", id),
      TTL.SERIES,
      () => fetchSeries(id),
    );
    setCacheHeader(res, hit);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "series fetch failed");
    res.status(502).json({ ok: false, error: "Upstream API unavailable" });
  }
});

router.get("/search", async (req: Request, res: Response) => {
  const { keyword } = req.query;
  if (!keyword || typeof keyword !== "string" || !keyword.trim()) {
    res.status(400).json({ ok: false, error: "keyword query parameter is required" });
    return;
  }
  const kw = keyword.trim().toLowerCase();
  const page = getPage(req.query.page);
  try {
    const ttl = page === 1 ? TTL.BROWSE : TTL.BROWSE_PAGE;
    const { data, hit } = await withCache(
      cacheKey("search", kw, page),
      ttl,
      () => scrapeSearch(kw, page),
    );
    setCacheHeader(res, hit);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "search scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/genre/:genre", async (req: Request, res: Response) => {
  const genre = String(req.params.genre);
  if (!VALID_GENRES.has(genre)) {
    res.status(400).json({
      ok: false,
      error: "Invalid genre",
      validGenres: Array.from(VALID_GENRES),
    });
    return;
  }
  const page = getPage(req.query.page);
  try {
    const ttl = page === 1 ? TTL.BROWSE : TTL.BROWSE_PAGE;
    const { data, hit } = await withCache(
      cacheKey("genre", genre, page),
      ttl,
      () => scrapeGenre(genre, page),
    );
    setCacheHeader(res, hit);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "genre scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/type/:type", async (req: Request, res: Response) => {
  const type = String(req.params.type);
  if (!VALID_TYPES.has(type.toLowerCase())) {
    res.status(400).json({
      ok: false,
      error: "Invalid type",
      validTypes: Array.from(VALID_TYPES),
    });
    return;
  }
  const page = getPage(req.query.page);
  try {
    const ttl = page === 1 ? TTL.BROWSE : TTL.BROWSE_PAGE;
    const { data, hit } = await withCache(
      cacheKey("type", type.toLowerCase(), page),
      ttl,
      () => scrapeType(type, page),
    );
    setCacheHeader(res, hit);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "type scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/status/:status", async (req: Request, res: Response) => {
  const status = String(req.params.status);
  if (!VALID_STATUSES.has(status)) {
    res.status(400).json({
      ok: false,
      error: "Invalid status",
      validStatuses: Array.from(VALID_STATUSES),
    });
    return;
  }
  const page = getPage(req.query.page);
  try {
    const ttl = page === 1 ? TTL.BROWSE : TTL.BROWSE_PAGE;
    const { data, hit } = await withCache(
      cacheKey("status", status, page),
      ttl,
      () => scrapeStatus(status, page),
    );
    setCacheHeader(res, hit);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "status scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/top", async (req: Request, res: Response) => {
  const page = getPage(req.query.page);
  try {
    const ttl = page === 1 ? TTL.HOT_LIST : TTL.BROWSE_PAGE;
    const { data, hit } = await withCache(
      cacheKey("top", page),
      ttl,
      () => scrapeTop(page),
    );
    setCacheHeader(res, hit);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "top scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/new", async (req: Request, res: Response) => {
  const page = getPage(req.query.page);
  try {
    const ttl = page === 1 ? TTL.HOT_LIST : TTL.BROWSE_PAGE;
    const { data, hit } = await withCache(
      cacheKey("new", page),
      ttl,
      () => scrapeNew(page),
    );
    setCacheHeader(res, hit);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "new scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/updated", async (req: Request, res: Response) => {
  const page = getPage(req.query.page);
  try {
    const ttl = page === 1 ? TTL.RECENT : TTL.BROWSE_PAGE;
    const { data, hit } = await withCache(
      cacheKey("updated", page),
      ttl,
      () => scrapeUpdated(page),
    );
    setCacheHeader(res, hit);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "updated scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

export default router;
