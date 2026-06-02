import { useState, useEffect } from "react";
import { Router as WouterRouter, Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Menu, X, Github, Terminal, Zap, Shield, Database, LayoutTemplate, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { EndpointCard } from "@/components/ui/endpoint-card";


const queryClient = new QueryClient();

const navigation = [
  {
    title: "Getting Started",
    links: [
      { title: "Introduction", href: "#introduction" },
      { title: "Quick Start", href: "#quick-start" },
      { title: "Rate Limiting", href: "#rate-limiting" },
      { title: "Deployment", href: "#deployment" },
    ],
  },
  {
    title: "Endpoints",
    links: [
      { title: "Health Check", href: "#health" },
      { title: "Recent Anime", href: "#recent-anime" },
      { title: "Series Details", href: "#series" },
      { title: "Search", href: "#search" },
      { title: "By Genre", href: "#genre" },
      { title: "By Type", href: "#type" },
      { title: "By Status", href: "#status" },
      { title: "Top Anime", href: "#top" },
      { title: "New Anime", href: "#new" },
      { title: "Updated Anime", href: "#updated" },
    ],
  },
  {
    title: "Schemas",
    links: [
      { title: "Listing Response", href: "#schema-listing" },
      { title: "Error Response", href: "#schema-error" },
    ],
  },
];

const listResponseCode = `{
  "ok": true,
  "page": 1,
  "totalPages": 293,
  "hasNextPage": true,
  "data": [
    {
      "id": 7457,
      "title": "Solo Leveling Season 2: Arise from the Shadow",
      "jpTitle": "Ore dake Level Up na Ken Season 2",
      "slug": "solo-leveling-season-2-arise-from-the-shadow-3eukp",
      "poster": "https://cdn.anipixcdn.co/thumbnail/...",
      "type": "TV",
      "episodes": { "sub": 13, "dub": 13, "total": 13 },
      "genres": ["Action", "Adventure", "Fantasy"],
      "score": "8.87",
      "watchUrl": "https://anikoto.cz/watch/..."
    }
  ]
}`;

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("dark");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    const sections = document.querySelectorAll("h2[id], div[id]");
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-cyan-500/30">
      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden lg:block w-72 shrink-0 border-r border-border bg-[#050608] h-screen sticky top-0 overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-10 text-cyan-400">
            <Database className="h-7 w-7" />
            <span className="text-xl font-bold tracking-tight text-white">Hoshigumi</span>
          </div>

          <nav className="space-y-8">
            {navigation.map((group) => (
              <div key={group.title}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  {group.title}
                </h4>
                <ul className="space-y-1.5 border-l border-border/50 ml-1.5 pl-4">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className={`block text-sm py-1 transition-colors hover:text-cyan-400 \${
                          activeSection === link.href.slice(1) ? "text-cyan-400 font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-[#050608] border-r border-border p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2 text-cyan-400">
                <Database className="h-6 w-6" />
                <span className="text-lg font-bold text-white">Hoshigumi</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-8">
              {navigation.map((group) => (
                <div key={group.title}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    {group.title}
                  </h4>
                  <ul className="space-y-2 border-l border-border/50 ml-1.5 pl-4">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-sm py-1 text-muted-foreground hover:text-cyan-400"
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Database className="h-6 w-6" />
            <span className="font-bold text-white tracking-tight">Hoshigumi</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12 lg:py-20">
          
          <div id="introduction" className="scroll-mt-24 mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-wide border border-cyan-500/20 mb-8">
              <Zap className="h-3.5 w-3.5" />
              <span>v1.0.0 Live</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter text-white mb-6 leading-tight">
              Hoshigumi — <br/>anime data API.
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-3xl leading-relaxed">
              Unofficial REST API by <span className="text-cyan-400 font-semibold">prayag</span>, powered by scraping anikoto.cz. Provides fast access to recent anime, detailed series information, advanced search, and more. No authentication required.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold px-8 h-12" onClick={() => document.getElementById("quick-start")?.scrollIntoView({ behavior: 'smooth' })}>
                <Terminal className="h-4 w-4 mr-2" />
                Read the Docs
              </Button>
              <Button variant="outline" className="border-border hover:bg-white/5 h-12 px-6">
                <Github className="h-4 w-4 mr-2" />
                GitHub Repository
              </Button>
            </div>
          </div>

          <div id="quick-start" className="scroll-mt-24 mb-24">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">Quick Start</h2>
            <p className="text-muted-foreground mb-6">
              The API is designed to be immediately usable. No API keys, no installation. Just construct a URL and make a request.
            </p>
            <div className="bg-[#090b0f] border border-border p-6 rounded-xl">
              <div className="text-sm font-semibold mb-4 text-white">Base URL</div>
              <CodeBlock code="https://your-deployment.vercel.app/api" language="url" />
              <div className="text-sm font-semibold mt-6 mb-4 text-white">Example Request</div>
              <CodeBlock code="curl -X GET https://your-deployment.vercel.app/api/recent-anime" language="bash" />
            </div>
          </div>

          <div id="rate-limiting" className="scroll-mt-24 mb-24 flex gap-6 p-6 rounded-xl border border-orange-500/20 bg-orange-500/5">
            <Shield className="h-8 w-8 text-orange-400 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-orange-400 mb-2">Rate Limiting & Etiquette</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This is an unofficial API that scrapes data directly from the source. Please implement aggressive caching in your application and avoid hammering the endpoints to prevent IP bans. Be respectful of the source website's bandwidth.
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-border my-24" />

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4 tracking-tight flex items-center gap-3">
              <LayoutTemplate className="h-7 w-7 text-cyan-400" />
              Endpoints Reference
            </h2>
            <p className="text-muted-foreground">Detailed documentation for all available REST endpoints.</p>
          </div>

          <EndpointCard
            id="health"
            title="Health Check"
            method="GET"
            path="/api/healthz"
            description="Verify that the API is up and running correctly."
            curlCode="curl -X GET https://your-deployment.vercel.app/api/healthz"
            responseCode={`{
  "status": "ok"
}`}
          />

          <EndpointCard
            id="recent-anime"
            title="Recent Anime"
            method="GET"
            path="/api/recent-anime"
            description="Fetch a list of recently updated anime directly from the homepage. Returns metadata and embed URLs for the latest episodes."
            curlCode="curl -X GET https://your-deployment.vercel.app/api/recent-anime"
            responseCode={listResponseCode}
          />

          <EndpointCard
            id="series"
            title="Series Details"
            method="GET"
            path="/api/series/:id"
            description="Get full, comprehensive details for a specific anime series, including all available episodes and streaming embeds."
            params={[
              { name: "id", type: "integer", required: true, description: "The unique ID of the anime series. E.g., 1642 for One Piece." }
            ]}
            curlCode="curl -X GET https://your-deployment.vercel.app/api/series/1642"
            responseCode={`{
  "ok": true,
  "data": {
    "anime": {
      "id": 1642,
      "title": "One Piece",
      "slug": "one-piece-odmau",
      "poster": "https://...",
      "description": "Gol D. Roger was known as the Pirate King...",
      "status": "Currently Airing",
      "score": "8.73",
      "aired": "Oct 20, 1999 to ?",
      "duration": "24 min",
      "mal_id": "21",
      "ani_id": "21",
      "terms_by_type": {
        "genre": ["Action", "Adventure", "Fantasy"],
        "studios": ["Toei Animation"],
        "type": ["TV"]
      }
    },
    "episodes": [
      {
        "id": 131870,
        "title": "Episode 1",
        "number": 1,
        "embed_url": {
          "sub": "https://megaplay.buzz/stream/s-2/169855/sub"
        }
      }
    ]
  }
}`}
          />

          <EndpointCard
            id="search"
            title="Search Anime"
            method="GET"
            path="/api/search"
            description="Search the entire catalog by title keyword. Returns a paginated list of matching anime."
            params={[
              { name: "keyword", type: "string", required: true, description: "The search term (e.g., 'naruto')." },
              { name: "page", type: "integer", required: false, description: "Page number for pagination. Defaults to 1." }
            ]}
            curlCode="curl -X GET https://your-deployment.vercel.app/api/search?keyword=naruto&page=1"
            responseCode={listResponseCode}
          />

          <EndpointCard
            id="genre"
            title="Browse by Genre"
            method="GET"
            path="/api/genre/:genre"
            description="Discover anime belonging to a specific genre. Supports pagination."
            params={[
              { name: "genre", type: "string", required: true, description: "Valid genres: action, adventure, comedy, drama, fantasy, horror, isekai, mecha, romance, sci-fi, shounen, slice-of-life, sports..." },
              { name: "page", type: "integer", required: false, description: "Page number. Defaults to 1." }
            ]}
            curlCode="curl -X GET https://your-deployment.vercel.app/api/genre/action?page=1"
            responseCode={listResponseCode}
          />

          <EndpointCard
            id="type"
            title="Browse by Type"
            method="GET"
            path="/api/type/:type"
            description="Filter anime by release format (TV, Movie, OVA, etc)."
            params={[
              { name: "type", type: "string", required: true, description: "Valid types: movie, music, ona, ova, special, tv." },
              { name: "page", type: "integer", required: false, description: "Page number. Defaults to 1." }
            ]}
            curlCode="curl -X GET https://your-deployment.vercel.app/api/type/movie"
            responseCode={listResponseCode}
          />

          <EndpointCard
            id="status"
            title="Browse by Status"
            method="GET"
            path="/api/status/:status"
            description="Find anime based on their airing status."
            params={[
              { name: "status", type: "string", required: true, description: "Valid values: currently-airing, finished-airing, not-yet-aired." },
              { name: "page", type: "integer", required: false, description: "Page number. Defaults to 1." }
            ]}
            curlCode="curl -X GET https://your-deployment.vercel.app/api/status/currently-airing"
            responseCode={listResponseCode}
          />

          <EndpointCard
            id="top"
            title="Top Anime"
            method="GET"
            path="/api/top"
            description="Get the most viewed and highest-rated anime on the platform."
            params={[
              { name: "page", type: "integer", required: false, description: "Page number. Defaults to 1." }
            ]}
            curlCode="curl -X GET https://your-deployment.vercel.app/api/top"
            responseCode={listResponseCode}
          />

          <EndpointCard
            id="new"
            title="New Anime"
            method="GET"
            path="/api/new"
            description="Get the latest anime series added to the database."
            params={[
              { name: "page", type: "integer", required: false, description: "Page number. Defaults to 1." }
            ]}
            curlCode="curl -X GET https://your-deployment.vercel.app/api/new"
            responseCode={listResponseCode}
          />

          <EndpointCard
            id="updated"
            title="Updated Anime"
            method="GET"
            path="/api/updated"
            description="Get anime series that have recently had new episodes uploaded."
            params={[
              { name: "page", type: "integer", required: false, description: "Page number. Defaults to 1." }
            ]}
            curlCode="curl -X GET https://your-deployment.vercel.app/api/updated"
            responseCode={listResponseCode}
          />

          <div className="w-full h-px bg-border my-24" />

          <div id="schemas" className="scroll-mt-24 mb-24">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">Response Schemas</h2>
            
            <div id="schema-listing" className="mb-12">
              <h3 className="text-xl font-bold mb-4">Standard Pagination Shape</h3>
              <p className="text-muted-foreground mb-4">All list endpoints (search, genre, type, etc) return this wrapper.</p>
              <CodeBlock language="typescript" code={`interface PaginatedResponse<T> {
  ok: boolean;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  data: T[];
}`} />
            </div>

            <div id="schema-error" className="mb-12">
              <h3 className="text-xl font-bold mb-4">Error Response</h3>
              <p className="text-muted-foreground mb-4">If something goes wrong (invalid ID, scraping failure), the API returns this payload with an appropriate HTTP status code.</p>
              <CodeBlock language="json" code={`{
  "ok": false,
  "error": "Failed to scrape data from target website"
}`} />
            </div>
          </div>

          <div id="deployment" className="scroll-mt-24 mb-24 bg-[#090b0f] border border-border p-8 rounded-xl shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Server className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">Render Deployment Guide</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Hoshigumi is designed to run on <a href="https://render.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Render</a> as a persistent Node.js service — background cache warming, no execution timeouts, no cold starts on paid plans.
            </p>
            <ol className="space-y-4 list-decimal list-inside text-muted-foreground ml-4">
              <li>Fork or clone the repo at <a href="https://github.com/dev-prayag/hoshigumi-api" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">github.com/dev-prayag/hoshigumi-api</a> and push it to your GitHub account.</li>
              <li>Go to <a href="https://render.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">render.com</a> → <strong className="text-white">New</strong> → <strong className="text-white">Blueprint</strong> and connect your repository.</li>
              <li>Render auto-detects <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">render.yaml</code> and creates both the API service and the docs static site.</li>
              <li>Set the two required environment variables on the <strong className="text-white">hoshigumi-api</strong> service:
                <div className="mt-3 space-y-2 ml-4">
                  <div><code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">UPSTASH_REDIS_REST_URL</code> — your Upstash Redis REST URL</div>
                  <div><code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">UPSTASH_REDIS_REST_TOKEN</code> — your Upstash Redis REST token</div>
                </div>
              </li>
              <li>Click <strong className="text-white">Deploy</strong>. The API will be live at <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">https://hoshigumi-api.onrender.com/api</code>.</li>
            </ol>
          </div>

        </div>
        
        <footer className="border-t border-border bg-[#050608] py-10 text-center text-sm text-muted-foreground space-y-2">
          <p className="text-white font-semibold tracking-tight">Hoshigumi API</p>
          <p>Built by <span className="text-cyan-400">prayag</span> · An unofficial project, not affiliated with AniKoto.</p>
          <p>
            Data sourced from{" "}
            <a href="https://anikoto.cz" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
              anikoto.cz
            </a>
            {" "}— all rights belong to their respective owners.
          </p>
        </footer>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/" component={Home} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
