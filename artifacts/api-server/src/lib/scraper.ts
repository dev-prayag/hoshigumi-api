import * as cheerio from "cheerio";

const BASE_URL = "https://anikoto.cz";
const API_BASE = "https://anikotoapi.site";

export interface AnimeItem {
  id: number;
  title: string;
  jpTitle: string | null;
  slug: string;
  poster: string;
  type: string;
  episodes: {
    sub: number | null;
    dub: number | null;
    total: number | null;
  };
  genres: string[];
  score: string | null;
  watchUrl: string;
}

export interface ListingResult {
  ok: boolean;
  page: number;
  totalPages: number | null;
  hasNextPage: boolean;
  data: AnimeItem[];
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AnikotoAPIWrapper/1.0)",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

function parseEpisodeCount(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed === "?" || trimmed === "~") return null;
  const n = parseInt(trimmed, 10);
  return isNaN(n) ? null : n;
}

function parseListingPage(html: string, page: number): ListingResult {
  const $ = cheerio.load(html);
  const items: AnimeItem[] = [];

  $(".item").each((_, el) => {
    const $el = $(el);
    const poster = $el.find(".ani.poster.tip");
    const id = parseInt(poster.attr("data-tip") || "0", 10);
    if (!id) return;

    const link = poster.find("a");
    const watchUrl = link.attr("href") || "";
    const slugMatch = watchUrl.match(/\/watch\/([^/]+)/);
    const slug = slugMatch ? slugMatch[1] : "";

    const img = poster.find("img");
    const title = img.attr("alt") || "";
    const posterUrl = img.attr("src") || "";

    const subEps = parseEpisodeCount(
      $el.find(".ep-status.sub span").first().text(),
    );
    const dubEps = parseEpisodeCount(
      $el.find(".ep-status.dub span").first().text(),
    );
    const totalEps = parseEpisodeCount(
      $el.find(".ep-status.total span").first().text(),
    );
    const type = $el.find(".ani .meta .right").text().trim();

    const info = $el.find(".info");
    const nameEl = info.find(".name.d-title");
    const jpTitle = nameEl.attr("data-jp") || null;

    const genres: string[] = [];
    info.find(".genre a").each((_, a) => {
      const g = $(a).text().trim();
      if (g) genres.push(g);
    });

    const scoreEl = info.find(".m-item.rated span");
    const scoreText = scoreEl.text().trim();
    const score =
      scoreText && scoreText !== "--" && scoreText !== "?"
        ? scoreText
        : null;

    items.push({
      id,
      title,
      jpTitle,
      slug,
      poster: posterUrl,
      type,
      episodes: { sub: subEps, dub: dubEps, total: totalEps },
      genres,
      score,
      watchUrl,
    });
  });

  let totalPages: number | null = null;
  let hasNextPage = false;

  const pageNumbers: number[] = [];
  $(".pagination a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const match = href.match(/page=(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n)) pageNumbers.push(n);
    }
  });

  const activeText = $(".pagination .page-item.active").text().trim();
  const activePage = parseInt(activeText, 10) || page;

  if (pageNumbers.length > 0) {
    totalPages = Math.max(...pageNumbers);
    hasNextPage = activePage < totalPages;
  }

  return { ok: true, page: activePage, totalPages, hasNextPage, data: items };
}

export async function scrapeSearch(
  keyword: string,
  page = 1,
): Promise<ListingResult> {
  const url = `${BASE_URL}/filter?keyword=${encodeURIComponent(keyword)}&page=${page}`;
  const html = await fetchPage(url);
  return parseListingPage(html, page);
}

export async function scrapeGenre(
  genre: string,
  page = 1,
): Promise<ListingResult> {
  const url = `${BASE_URL}/genre/${encodeURIComponent(genre)}?page=${page}`;
  const html = await fetchPage(url);
  return parseListingPage(html, page);
}

export async function scrapeType(
  type: string,
  page = 1,
): Promise<ListingResult> {
  const url = `${BASE_URL}/type/${encodeURIComponent(type)}?page=${page}`;
  const html = await fetchPage(url);
  return parseListingPage(html, page);
}

export async function scrapeStatus(
  status: string,
  page = 1,
): Promise<ListingResult> {
  const url = `${BASE_URL}/status/${encodeURIComponent(status)}?page=${page}`;
  const html = await fetchPage(url);
  return parseListingPage(html, page);
}

export async function scrapeTop(page = 1): Promise<ListingResult> {
  const url = `${BASE_URL}/most-viewed?page=${page}`;
  const html = await fetchPage(url);
  return parseListingPage(html, page);
}

export async function scrapeNew(page = 1): Promise<ListingResult> {
  const url = `${BASE_URL}/new-release?page=${page}`;
  const html = await fetchPage(url);
  return parseListingPage(html, page);
}

export async function scrapeUpdated(page = 1): Promise<ListingResult> {
  const url = `${BASE_URL}/latest-updated?page=${page}`;
  const html = await fetchPage(url);
  return parseListingPage(html, page);
}

export async function fetchRecentAnime(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/recent-anime`);
  if (!res.ok) throw new Error(`Upstream API error: HTTP ${res.status}`);
  return res.json();
}

export async function fetchSeries(id: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/series/${id}`);
  if (!res.ok) throw new Error(`Upstream API error: HTTP ${res.status}`);
  return res.json();
}
