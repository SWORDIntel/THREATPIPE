```markdown
#  _______ _   _ _____  ______  ___   _____ _____ _____ 
# |__   __| \ | |  __ \|  ____|/ _ \ / ____|_   _/ ____|
#    | |  |  \| | |__) | |__  | | | | (___   | || |     
#    | |  | . ` |  ___/|  __| | | | |\___ \  | || |     
#    | |  | |\  | |    | |____| |_| |____) |_| || |____ 
#    |_|  |_| \_|_|    |______|\___/|_____/|_____\_____|
#
# THREATPIPE
### “Because doom-scrolling CVE feeds by hand is soooo 2023.” 🐍🚰 - (23-04-2002)TODO:FIX LOGO
```

> **TL;DR** THREATPIPE slurps raw cyber-intel, squeezes it through a Pythonic pasta-maker, lets Gemini Pro sprinkle AI parmesan on top, and serves the dish in a slick React/Tailwind dashboard—complete with WebSocket-flavoured pop-ups when the sky is falling.
> If you just want to see blinking red badges, run `docker compose up` and grab popcorn.

---

## Features (now with 23 % more snark)

| ✓                                | What it does                                                    | Why you care                                           |
| -------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| **CVEs, ATT\&CK, CISA, MSRC**    | Aggregates the usual alphabet soup                              | Saves you six browser tabs and 40 mg of caffeine       |
| **Exploit-Chain Detector**       | Links boring single CVEs into “Full RCE Voltron” chains         | Patch prioritisation, plus bragging rights in stand-up |
| **Gemini-generated Daily Brief** | AI summarises the mayhem so you can pretend you read everything | Impresses bosses; confuses auditors                    |
| **Live WebSocket Toasts**        | Real-time “OH NO” notifications                                 | Because Slack pings weren’t stressful enough           |
| **Dark-mode Dashboard**          | React + Tailwind, paginated, searchable                         | Looks great at 3 a.m. during incident response         |
| **100 % API-driven**             | FastAPI backend, JWT auth, Celery jobs                          | Swap feeds, extend modules, break things at will       |

---

## Architecture (ASCII-diagram edition)

```
┌──────────┐    Celery   ┌────────┐     REST/WS    ┌────────────┐
│ Feeds    │ ───────────▶│Worker  │ ───────────────▶│FastAPI     │
│  NVD     │             │+Chain  │                │Gateway     │
│  ATT&CK  │  JSON/STIX  │Finder  │                │            │
│  CISA    │             └────────┘                └─────┬──────┘
└────┬─────┘                                        JWT  │
     │ Ingest                                         ▼
┌────▼────┐   Postgres   ┌────────┐           WSS  ┌────────────┐
│raw_intel│◀─────────────┤Timescale│──────────────▶│React SPA   │
│chains   │              │DB       │  Markdown     │(THREATPIPE)│
└─────────┘              └────────┘  Daily Brief   └────────────┘
```

---

## Quick-Start (lazy-bones edition)

```bash
# 0. Dependencies: Docker, Docker-Compose, and a reckless attitude
git clone https://github.com/your-org/threatpipe.git
cd threatpipe

# 1. Copy the sample env and insert your secrets (or live dangerously and don't)
cp .env.sample .env
$EDITOR .env    # JWT_SECRET, GEMINI_API_KEY, etc.

# 2. GO GO GADGET CYBER-PIPE
docker compose up --build -d

# 3. Open the dashboard
xdg-open http://localhost:5173  # or just click the thing

# 4. Stare lovingly at the “Chains” tab and watch your weekend evaporate
```

---

## Folder Vibes

```
backend/          FastAPI app + Celery tasks + Alembic migrations
 ├── api/         Route handlers (REST + WS)
 ├── tasks/       Ingesters, chain_finder.py, Gemini wrappers
 └── utils/       cvss.py, epss.py, unicorns.py

frontend/         React + Vite + Tailwind + Sonner toasts
 ├── components/  Reusable UI widgets (Tabs, Badges, Spinner…)
 ├── views/       NvdView, MitreView, ChainView, etc.
 └── services/    api.ts, geminiService.ts, chainService.ts

docker-compose.yml  One-click entropy

README.md         This sarcasm
```

---

## Configuration Cheat-Sheet

| Variable         | Default                 | Purpose                           |
| ---------------- | ----------------------- | --------------------------------- |
| `API_BASE_URL`   | `http://localhost:8000` | Where the SPA pokes the bear      |
| `JWT_SECRET`     | `INSECURE-CHANGE-ME`    | Signed tokens > signed headshots  |
| `GEMINI_API_KEY` | *unset*                 | Without it, daily brief is an IOU |
| `REDIS_URL`      | `redis://redis:6379/0`  | Celery gossip channel             |
| `NVD_RATE_LIMIT` | `5/s`                   | Because Uncle Sam said so         |

---

## Frequently Avoided Questions


**Q: Will THREATPIPE hack back for me?**

A: No. It’s a dashboard, not a drone strike button. Try EXCALIBUR (beta) instead.

**Q: Why is my risk score 3.14?**</summary>

A: Because pie is *always* a risk during long on-call shifts.

**Q: Does it run on Windows?**

A: *Technically* yes, but so does Notepad. We won’t judge (much).

---

## Contributing

1. Fork, branch, code, PR.
2. Pass the linter. (It’s stricter than your grandma’s Victorian etiquette.)
3. Add unit tests—*even if they mock the apocalypse*.
4. Write commit messages humans can read after three espressos.

---

## License

**MIT** – Use it, abuse it, just don’t blame us when your pager goes **BREEP** at 04:00.

*Proudly built on coffee, sarcasm, and a mild fear of zero-days.* ☕🛡️

```
```
