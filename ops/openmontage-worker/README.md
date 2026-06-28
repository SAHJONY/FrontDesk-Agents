# OpenMontage render worker (for the FrontDesk Agents website builder)

Bridges the website builder (Vercel serverless — **cannot** run OpenMontage) to
OpenMontage (Python/FFmpeg/Remotion). Run it on any host with Node 18+, Python
3.10+ and FFmpeg installed.

## Job contract the builder speaks (`/api/site-video`)

```
POST  /jobs        { "brief": { prompt, business, type, city, durationSec, aspect, heroImage, photos[] } }
                   -> { "jobId": "abc123" }
GET   /jobs/<id>   -> { "state": "queued|running|done|error", "url": "...", "progress": ... }
GET   /videos/<id>.mp4   (served when done)
```

The builder submits a brief, polls `/jobs/<id>` until `state:"done"`, then uses `url`.

## Setup

```bash
# 1. Get OpenMontage (the actual video engine)
git clone https://github.com/calesthio/OpenMontage.git
# install its prerequisites (Python deps, Node, FFmpeg) per its README

# 2. Run this worker
cd ops/openmontage-worker
pip install -r requirements.txt
WORKER_TOKEN=choose-a-secret \
PUBLIC_BASE_URL=https://your-worker.example.com \
OPENMONTAGE_REPO=/path/to/OpenMontage \
PRODUCE_CMD="python produce_openmontage.py" \
uvicorn app:app --host 0.0.0.0 --port 8080
```

Point the builder at it (FrontDesk Agents Vercel env):

```
OPENMONTAGE_URL=https://your-worker.example.com
OPENMONTAGE_TOKEN=choose-a-secret   # must equal WORKER_TOKEN
```

## Producing the video — two modes
1. **Automated (`PRODUCE_CMD` set):** the worker runs `PRODUCE_CMD <brief.json> <output.mp4>`
   from `OPENMONTAGE_REPO`. Write that script to drive OpenMontage's pipelines
   (see its `AGENT_GUIDE.md` / `pipeline_defs/`) and render `<output.mp4>`.
2. **Operator/agent (`PRODUCE_CMD` unset):** jobs sit `queued`. Read
   `jobs/<id>/brief.json`, produce the film with OpenMontage, drop `output.mp4`
   into `jobs/<id>/`. Signal failures via `jobs/<id>/error.txt`, progress via
   `jobs/<id>/progress.txt`.

## Notes
- Auth: every call needs `Authorization: Bearer $WORKER_TOKEN` when set.
- If the worker is down/unset, the builder auto-falls back to a Higgsfield clip —
  video never hard-fails.
- OpenMontage is AGPLv3; keep this worker's source available if you distribute it.
