const fs = require('fs')
const Stripe = require('stripe')

// Read key from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8')
const keyMatch = envContent.match(/STRIPE_SECRET_KEY=(.+)/)
if (!keyMatch) {
  console.error('STRIPE_SECRET_KEY not found in .env.local')
  process.exit(1)
}
const stripe = new Stripe(keyMatch[1].trim())

;(async () => {
  try {
    const coupon = await stripe.coupons.create({
      id: 'earlybird10',
      percent_off: 10,
      duration: 'repeating',
      duration_in_months: 3,
      name: 'Early Bird - 10% off first 3 months',
    })
    console.log('Coupon created:', coupon.id)
    console.log('Set this env var in Vercel: STRIPE_EARLYBIRD_COUPON_ID=' + coupon.id)
  } catch (e) {
    if (e.code === 'resource_already_exists') {
      console.log('Coupon already exists: earlybird10')
      console.log('Set this env var in Vercel: STRIPE_EARLYBIRD_COUPON_ID=earlybird10')
    } else {
      console.error('Error:', e.message)
      process.exit(1)
    }
  }
})()
