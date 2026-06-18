#!/bin/bash
# FrontDesk Agents uptime watchdog (runs via launchd every 15 min).
# Double-checks production; on sustained failure, Ava phones the owner.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/.uptime.env.local"
STATE="/tmp/frontdesk-uptime-last-alert"
COOLDOWN=3600

check() {
  curl -s --max-time 20 https://www.frontdeskagents.com/api/health | grep -q '"ok":true' || return 1
  [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://www.frontdeskagents.com/)" = "200" ] || return 1
  return 0
}

if check; then
  echo "$(date '+%F %T') OK" >> /tmp/frontdesk-uptime.log
  exit 0
fi
sleep 45
if check; then
  echo "$(date '+%F %T') RECOVERED-ON-RECHECK" >> /tmp/frontdesk-uptime.log
  exit 0
fi

NOW=$(date +%s)
LAST=$(cat "$STATE" 2>/dev/null || echo 0)
if [ $((NOW - LAST)) -lt $COOLDOWN ]; then
  echo "$(date '+%F %T') DOWN (alert cooling down)" >> /tmp/frontdesk-uptime.log
  exit 1
fi
echo "$NOW" > "$STATE"
echo "$(date '+%F %T') DOWN — calling owner" >> /tmp/frontdesk-uptime.log
curl -s --max-time 30 -X POST https://api.bland.ai/v1/calls \
  -H "authorization: $BLAND_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"phone_number\": \"$ALERT_PHONE\",
    \"from\": \"$ALERT_CALLER_ID\",
    \"task\": \"You are Ava from FrontDeskAgents.com calling with an URGENT production alert. Say exactly this, calmly and clearly: The FrontDesk Agents website is DOWN. Monitoring detected the site is not responding. Please check Vercel and the admin dashboard as soon as possible. Answer briefly if asked, then end the call.\",
    \"voice\": \"maya\",
    \"max_duration\": 3
  }" >> /tmp/frontdesk-uptime.log 2>&1
