import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-client'
import { cookies } from 'next/headers'

// This route creates auth users server-side using the service role key
// Bypasses email rate limits and external API restrictions
export async function POST() {
  try {
    const supabase = await createAdminClient()
    
    // First check if user already exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers?.users?.find(u => u.email === 'mike@techstart.io')
    
    if (existing) {
      // Delete the broken user first
      await supabase.auth.admin.deleteUser(existing.id)
    }
    
    // Create fresh auth user with proper hash via server-side call
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'mike@techstart.io',
      password: 'TechStart456!',
      email_confirmed: true,
      user_metadata: {
        owner_name: 'Mike Johnson',
        business_name: 'TechStart Inc',
        industry: 'SaaS'
      }
    })
    
    if (createError) {
      return NextResponse.json({ success: false, error: createError.message }, { status: 400 })
    }
    
    // Now create customer record matching the auth user's ID
    const { error: customerError } = await supabase
      .from('customers')
      .insert({
        id: newUser.id,
        email: 'mike@techstart.io',
        business_name: 'TechStart Inc',
        owner_name: 'Mike Johnson',
        phone: '+15551100990',
        industry: 'SaaS',
        plan: 'starter',
        status: 'active',
        onboarding_status: 'completed'
      })
    
    if (customerError) {
      return NextResponse.json({ 
        success: false, 
        error: `Auth user created (${newUser.id}) but customer record failed: ${customerError.message}`,
        authUserId: newUser.id
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      userId: newUser.id,
      email: newUser.email 
    })
  } catch (error) {
    console.error('Temp setup error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}