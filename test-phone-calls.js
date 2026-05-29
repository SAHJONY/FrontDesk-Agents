// Test script to make Bland.ai phone calls
// Usage: node test-phone-calls.js

// Load env from .env.local (pulled from Vercel)
const fs = require('fs');
const path = require('path');
const envFile = path.join(__dirname, '.env.local');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const BLANDAI_API_KEY = process.env.BLANDAI_API_KEY || ''
const BLAND_BASE_URL = 'https://api.bland.ai/v1'

async function makeCall(phoneNumber, task) {
  console.log(`\n📞 Making call to: ${phoneNumber}`)
  
  try {
    const response = await fetch(`${BLAND_BASE_URL}/calls`, {
      method: 'POST',
      headers: {
        'Authorization': `${BLANDAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        task: task,
        model: 'enhanced',
        voice: 'rachel',
        max_duration: 120,
        language: 'en'
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error(`❌ Call failed: ${data.message || response.statusText}`)
      return null
    }

    console.log(`✅ Call initiated!`)
    console.log(`   Call ID: ${data.id}`)
    console.log(`   Status: ${data.status || 'initiated'}`)
    return data.id
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    return null
  }
}

async function getCallStatus(callId) {
  try {
    const response = await fetch(`${BLAND_BASE_URL}/calls/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `${BLANDAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    console.log(`\n📊 Call Status: ${data.status}`)
    console.log(`   Duration: ${data.duration || 0} seconds`)
    if (data.transcript) {
      console.log(`   Transcript: ${data.transcript.substring(0, 100)}...`)
    }
    return data
  } catch (error) {
    console.error(`❌ Status error: ${error.message}`)
    return null
  }
}

async function searchNYNumbers(areaCode = '212') {
  console.log(`\n🔍 Searching for available phone numbers in (${areaCode})...`)
  
  try {
    const response = await fetch(`${BLAND_BASE_URL}/phone-numbers/search?area_code=${areaCode}&country=US`, {
      method: 'GET',
      headers: {
        'Authorization': `${BLANDAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error(`❌ Search failed: ${data.message || response.statusText}`)
      return []
    }

    const numbers = data.phone_numbers || []
    console.log(`✅ Found ${numbers.length} available numbers:`)
    numbers.slice(0, 5).forEach((num, i) => {
      console.log(`   ${i + 1}. ${num.phone_number || num.e164} (${num.type || 'local'})`)
    })
    
    return numbers
  } catch (error) {
    console.error(`❌ Search error: ${error.message}`)
    return []
  }
}

async function main() {
  console.log('==========================================')
  console.log('   BLAND.AI PHONE TEST - CEO MODE')
  console.log('==========================================')
  
  if (!BLANDAI_API_KEY) {
    console.error('❌ BLANDAI_API_KEY is not set!')
    console.error('   Set it in .env.production or Vercel environment variables')
    process.exit(1)
  }
  
  console.log(`✅ API Key configured: ${BLANDAI_API_KEY.substring(0, 10)}...`)

  // Test 1: Make a call to a test number
  const testNumber = process.argv[2] || '+13475551234' // Replace with actual number to call
  
  console.log(`\n📞 TEST CALL 1: Outbound AI Call`)
  console.log(`   Target: ${testNumber}`)
  
  const callId = await makeCall(
    testNumber,
    'Hello, this is a test call from FrontDesk Agents. This is an AI-powered receptionist calling to test our phone system. How are you today?'
  )
  
  if (callId) {
    // Wait a bit and check status
    console.log('\n⏳ Waiting 10 seconds to check call status...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    await getCallStatus(callId)
  }

  // Test 2: Search for NY numbers
  console.log('\n==========================================')
  console.log('📞 TEST CALL 2: Search NY Numbers')
  console.log('==========================================')
  
  const nyNumbers = await searchNYNumbers('212')
  if (nyNumbers.length > 0) {
    console.log('\n💡 To provision a NY number, use:')
    console.log('   POST /api/phone/onboard with desiredAreaCode: 212')
  }
  
  console.log('\n==========================================')
  console.log('   TEST COMPLETE')
  console.log('==========================================')
}

main().catch(console.error)