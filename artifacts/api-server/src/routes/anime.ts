import { Router, type IRouter } from "express";
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

const router: IRouter = Router();

function getPage(q: unknown): number {
  const n = parseInt(String(q ?? "1"), 10);
  return isNaN(n) || n < 1 ? 1 : n;
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

router.get("/recent-anime", async (_req, res) => {
  try {
    const data = await fetchRecentAnime();
    res.json(data);
  } catch (err) {
    logger.error({ err }, "recent-anime failed");
    res.status(502).json({ ok: false, error: "Upstream API unavailable" });
  }
});

router.get("/series/:id", async (req, res) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    res.status(400).json({ ok: false, error: "id must be a positive integer" });
    return;
  }
  try {
    const data = await fetchSeries(id);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "series fetch failed");
    res.status(502).json({ ok: false, error: "Upstream API unavailable" });
  }
});

router.get("/search", async (req, res) => {
  const { keyword } = req.query;
  if (!keyword || typeof keyword !== "string" || !keyword.trim()) {
    res
      .status(400)
      .json({ ok: false, error: "keyword query parameter is required" });
    return;
  }
  const page = getPage(req.query.page);
  try {
    const data = await scrapeSearch(keyword.trim(), page);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "search scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/genre/:genre", async (req, res) => {
  const { genre } = req.params;
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
    const data = await scrapeGenre(genre, page);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "genre scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/type/:type", async (req, res) => {
  const { type } = req.params;
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
    const data = await scrapeType(type, page);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "type scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/status/:status", async (req, res) => {
  const { status } = req.params;
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
    const data = await scrapeStatus(status, page);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "status scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/top", async (req, res) => {
  const page = getPage(req.query.page);
  try {
    const data = await scrapeTop(page);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "top scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/new", async (req, res) => {
  const page = getPage(req.query.page);
  try {
    const data = await scrapeNew(page);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "new scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

router.get("/updated", async (req, res) => {
  const page = getPage(req.query.page);
  try {
    const data = await scrapeUpdated(page);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "updated scrape failed");
    res.status(502).json({ ok: false, error: "Scraping failed" });
  }
});

export default router;
