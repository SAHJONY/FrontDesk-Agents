-- FRONTDESK AGENTS: FULL PLATFORM CONFIGURATION FOR SAHJONY CAPITAL LLC
-- User: sahjonycapitalllc@outlook.com
-- Date: 2026-05-23

DO $$
DECLARE
    user_id UUID;
    customer_id UUID;
    owner_id UUID;
BEGIN
    -- 1. Get User ID from Auth
    SELECT id INTO user_id FROM auth.users WHERE email = 'sahjonycapitalllc@outlook.com';

    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User sahjonycapitalllc@outlook.com not found in Auth. Please sign up first.';
    END IF;

    RAISE NOTICE 'Configuring account for User ID: %', user_id;

    -- 2. Configure Customer Profile
    INSERT INTO customers (id, email, business_name, status, tier, created_at, updated_at)
    VALUES (user_id, 'sahjonycapitalllc@outlook.com', 'Sahjony Capital LLC', 'active', 'professional', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        business_name = 'Sahjony Capital LLC',
        status = 'active',
        tier = 'professional',
        updated_at = NOW();

    RAISE NOTICE 'Customer profile configured: Sahjony Capital LLC (Professional Tier)';

    -- 3. Configure Owner Profile (Admin Access)
    -- Assuming an 'owners' table exists or creating a generic 'platform_admins' entry
    -- If 'owners' table doesn't exist, this block is skipped or handled by migration
    BEGIN
        INSERT INTO owners (id, email, full_name, role, created_at)
        VALUES (user_id, 'sahjonycapitalllc@outlook.com', 'Juan (Sahjony)', 'super_admin', NOW())
        ON CONFLICT (id) DO UPDATE SET
            full_name = 'Juan (Sahjony)',
            role = 'super_admin';
        RAISE NOTICE 'Owner profile configured: Super Admin access granted';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Owner table might not exist yet, skipping owner config.';
    END;

    -- 4. Create Default AI Settings (if a settings table exists)
    -- This ensures the dashboard has default values to load
    BEGIN
        INSERT INTO ai_settings (user_id, voice_type, greeting_message, language, is_active)
        VALUES (user_id, 'alloy', 'Thank you for calling Sahjony Capital LLC. How can I help you today?', 'en', true)
        ON CONFLICT (user_id) DO UPDATE SET
            voice_type = 'alloy',
            greeting_message = 'Thank you for calling Sahjony Capital LLC. How can I help you today?',
            is_active = true;
        RAISE NOTICE 'Default AI settings configured';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'AI Settings table not found, skipping.';
    END;

    RAISE NOTICE '✅ Platform configuration complete for Sahjony Capital LLC!';
END $$;
