# 📞 Bland.ai Integration Guide - AI Voice Calls

## Overview

**Bland.ai** powers your AI receptionist phone calls, enabling automated appointment scheduling, call handling, and customer service.

**Website:** https://www.bland.ai  
**Documentation:** https://docs.bland.ai

---

## Step 1: Get Your Bland.ai API Key

1. **Sign Up:**
   - Go to: https://app.bland.ai
   - Create an account (free tier available)

2. **Get API Key:**
   - Navigate to: Settings → API Keys
   - Click "Create New API Key"
   - Copy your API key (starts with `sk-`)

3. **Add Phone Number:**
   - Go to: Phone Numbers
   - Click "Buy Number" or "Port Number"
   - Choose a local or toll-free number
   - Configure forwarding if needed

---

## Step 2: Configure Environment Variables

In your **Owner Dashboard → Environment Vars**, add:

```bash
# Bland.ai Configuration
BLAND_API_KEY=sk_YOUR_BLAND_API_KEY_HERE
BLAND_PHONE_NUMBER=+1XXXXXXXXXX

# Optional: Voice Settings
BLAND_DEFAULT_VOICE=Rachel
BLAND_DEFAULT_MODEL=enhanced
BLAND_DEFAULT_LANGUAGE=en
```

---

## Step 3: Test Bland.ai Integration

### Test via Owner Dashboard:

1. Go to: **Owner Dashboard → AI Receptionist**
2. Enter a test phone number
3. Click "Test Call"
4. Answer the call to hear your AI receptionist

### Test via API:

```bash
curl -X POST https://www.frontdeskagents.com/api/bland/call \
  -H "Content-Type: application/json" \
  -d '{
    "action": "initiate",
    "phoneNumber": "+1234567890",
    "message": "Hello! This is a test call from your AI receptionist."
  }'
```

---

## Step 4: Configure Industry-Specific Prompts

Your platform includes pre-configured prompts for:

### Real Estate AI
- Property inquiries
- Viewing appointments
- Buyer qualification
- Listing information

### Legal AI
- Case intake
- Consultation scheduling
- Practice area information
- Urgent matter handling

### Medical AI
- Appointment scheduling
- Patient intake
- Office hours
- Prescription refills (non-medical advice)

### Default (General Business)
- General inquiries
- Appointment scheduling
- Message taking
- Call transfers

---

## Step 5: Customize Your AI Receptionist

### Voice Options:
- Rachel (default)
- Joanna
- Matthew
- Ivy
- Joey
- Kendra
- Kimberly
- Salli

### Model Options:
- `base` - Standard quality
- `enhanced` - Higher quality (recommended)
- `turbo` - Faster response time

### Language Options:
- `en` - English (default)
- `es` - Spanish
- `fr` - French
- And more...

---

## Pricing (as of 2026)

**Bland.ai Pricing:**
- **Free Tier:** 1,000 minutes/month
- **Pro:** $0.12/minute after free tier
- **Enterprise:** Custom pricing

**Your Platform Usage:**
- Average call: 3-5 minutes
- Free tier covers ~200-300 calls/month
- Pro tier for higher volume

---

## API Endpoints

### Initiate Call
```javascript
POST /api/bland/call
{
  "action": "initiate",
  "phoneNumber": "+1234567890",
  "message": "Hello! This is your AI receptionist..."
}
```

### Get Call Status
```javascript
POST /api/bland/call
{
  "action": "status",
  "callId": "call_abc123"
}
```

### Hangup Call
```javascript
POST /api/bland/call
{
  "action": "hangup",
  "callId": "call_abc123"
}
```

### Send Message During Call
```javascript
POST /api/bland/call
{
  "action": "send",
  "callId": "call_abc123",
  "message": "Please hold while I transfer you..."
}
```

---

## Use Cases by Industry

### Real Estate
```
Prompt: "You are a professional AI receptionist for a real estate agency..."
Use: Property inquiries, viewing appointments, buyer qualification
```

### Legal Services
```
Prompt: "You are a professional AI receptionist for a law firm..."
Use: Case intake, consultation scheduling, urgent matters
```

### Medical Practices
```
Prompt: "You are a professional AI receptionist for a medical practice..."
Use: Appointments, patient intake, office information (HIPAA-compliant)
```

### General Business
```
Prompt: "You are a professional AI receptionist..."
Use: General inquiries, scheduling, message taking
```

---

## Troubleshooting

### Issue: "BLAND_API_KEY is not configured"
**Solution:** Add `BLAND_API_KEY` to environment variables

### Issue: Call not connecting
**Solution:** 
1. Verify phone number format (+1234567890)
2. Check Bland.ai account balance
3. Verify API key is correct

### Issue: Poor voice quality
**Solution:** 
1. Use `enhanced` model
2. Check internet connection
3. Try different voice option

### Issue: High latency
**Solution:**
1. Use `turbo` model for faster response
2. Optimize prompt length
3. Check network conditions

---

## Best Practices

1. **Keep prompts concise** - 2-3 sentences max per response
2. **Use industry-specific prompts** - Improves relevance
3. **Test before deploying** - Always test with real phone
4. **Monitor call quality** - Check transcripts regularly
5. **Set up call forwarding** - For urgent matters
6. **Configure voicemail** - For after-hours calls

---

## Integration Examples

### Schedule Appointment
```javascript
const response = await fetch('/api/bland/call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'initiate',
    phoneNumber: '+1234567890',
    message: 'Hello! This is your AI receptionist calling to confirm your appointment tomorrow at 2 PM. Press 1 to confirm or 2 to reschedule.'
  })
})
```

### Follow-up Call
```javascript
const response = await fetch('/api/bland/call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'initiate',
    phoneNumber: '+1234567890',
    message: 'Hi! This is a follow-up call from our team. How are you doing with your recent purchase?'
  })
})
```

---

## Next Steps

1. ✅ Get Bland.ai API key
2. ✅ Add to environment variables
3. ✅ Test with sample call
4. ✅ Customize prompt for your industry
5. ✅ Configure in production
6. ✅ Monitor call quality and transcripts

**Your AI receptionist is now ready to handle calls 24/7!** 📞✨
