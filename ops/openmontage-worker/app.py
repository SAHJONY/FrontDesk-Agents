"""OpenMontage render worker for the FrontDesk Agents website builder.

A tiny FastAPI service that lets the (serverless) website builder commission full
OpenMontage videos. OpenMontage is Python/FFmpeg/Remotion and agent-driven, so it
can't run inside a Vercel function — this worker runs on a real host (a VM,
Fly.io, Render, your Mac) and speaks the async job contract the builder expects:

    POST  /jobs        { "brief": {...} }  -> { "jobId": "..." }
    GET   /jobs/<id>                       -> { "state": "...", "url": "...", "progress": ... }
    GET   /videos/<id>.mp4                  -> the finished file (served statically)

States: queued -> running -> done | error.

Set OPENMONTAGE_REPO to your OpenMontage checkout (https://github.com/calesthio/OpenMontage)
so PRODUCE_CMD runs from there. See README.md for full setup.
"""
from __future__ import annotations

import json
import os
import subprocess
import uuid
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse

JOBS_DIR = Path(os.environ.get("JOBS_DIR", "./jobs")).resolve()
PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL", "").rstrip("/")
WORKER_TOKEN = os.environ.get("WORKER_TOKEN", "")
PRODUCE_CMD = os.environ.get("PRODUCE_CMD", "")  # e.g. "python produce_openmontage.py"
# Where OpenMontage is checked out (PRODUCE_CMD runs here). Defaults to the repo
# root when this worker lives inside the OpenMontage repo; override otherwise.
OPENMONTAGE_REPO = os.environ.get("OPENMONTAGE_REPO") or str(Path(__file__).resolve().parent.parent)

JOBS_DIR.mkdir(parents=True, exist_ok=True)
app = FastAPI(title="OpenMontage render worker")


def _auth(authorization: str | None) -> None:
    if WORKER_TOKEN and authorization != f"Bearer {WORKER_TOKEN}":
        raise HTTPException(status_code=401, detail="unauthorized")


def _job_dir(job_id: str) -> Path:
    safe = "".join(c for c in job_id if c.isalnum() or c in "-_")
    return JOBS_DIR / safe


def _state(job_id: str) -> dict:
    d = _job_dir(job_id)
    if not d.exists():
        raise HTTPException(status_code=404, detail="job not found")
    out = d / "output.mp4"
    err = d / "error.txt"
    if out.exists():
        url = f"{PUBLIC_BASE_URL}/videos/{job_id}.mp4" if PUBLIC_BASE_URL else f"/videos/{job_id}.mp4"
        return {"state": "done", "url": url, "progress": "complete"}
    if err.exists():
        return {"state": "error", "error": err.read_text()[:500], "url": ""}
    progress = ""
    p = d / "progress.txt"
    if p.exists():
        progress = p.read_text()[:200]
    started = (d / "started").exists()
    return {"state": "running" if started else "queued", "url": "", "progress": progress}


@app.post("/jobs")
async def create_job(request: Request, authorization: str | None = Header(default=None)):
    _auth(authorization)
    payload = await request.json()
    brief = payload.get("brief") or payload
    job_id = uuid.uuid4().hex[:16]
    d = _job_dir(job_id)
    d.mkdir(parents=True, exist_ok=True)
    (d / "brief.json").write_text(json.dumps(brief, indent=2))

    if PRODUCE_CMD:
        (d / "started").write_text("1")
        cmd = PRODUCE_CMD.split() + [str(d / "brief.json"), str(d / "output.mp4")]
        try:
            subprocess.Popen(cmd, cwd=OPENMONTAGE_REPO,
                             stdout=open(d / "produce.log", "w"), stderr=subprocess.STDOUT)
        except Exception as e:  # noqa: BLE001
            (d / "error.txt").write_text(f"failed to spawn PRODUCE_CMD: {e}")

    return {"jobId": job_id, "state": "queued"}


@app.get("/jobs/{job_id}")
async def get_job(job_id: str, authorization: str | None = Header(default=None)):
    _auth(authorization)
    return JSONResponse(_state(job_id))


@app.get("/videos/{name}")
async def get_video(name: str):
    job_id = name[:-4] if name.endswith(".mp4") else name
    out = _job_dir(job_id) / "output.mp4"
    if not out.exists():
        raise HTTPException(status_code=404, detail="not ready")
    return FileResponse(str(out), media_type="video/mp4")


@app.get("/health")
async def health():
    return {"ok": True, "produce_cmd": bool(PRODUCE_CMD), "repo": OPENMONTAGE_REPO}
