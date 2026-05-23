# 🚀 SUPABASE DEPLOYMENT GUIDE

## ✅ **YOUR SUPABASE CREDENTIALS ARE CONFIGURED!**

Your Supabase credentials have been added to `.env.local`:
- **Project URL**: https://btjscudzrtarfommgegw.supabase.co
- **Project ID**: btjscudzrtarfommgegw
- **Service Role Key**: ✅ Configured
- **Anon Key**: ✅ Configured

---

## 📋 **DEPLOY SCHEMA TO SUPABASE**

### **Option 1: Via Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/btjscudzrtarfommgegw/sql-editor

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar

3. **Copy & Paste Schema**
   - Open the file: `frontdesk-agents/SUPABASE_SCHEMA.sql`
   - Copy ALL the SQL code
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)

4. **Verify Tables**
   - Go to **Table Editor** 
   - You should see:
     - ✅ customers
     - ✅ business_metrics
     - ✅ call_records
     - ✅ agents
     - ✅ leads

---

### **Option 2: Via Supabase CLI**

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref btjscudzrtarfommgegw

# Push schema
supabase db push
```

---

### **Option 3: Direct SQL Execution**

```bash
# Get psql connection string from Supabase Dashboard
# Settings → Database → Connection string → URI

psql "postgresql://postgres:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -f SUPABASE_SCHEMA.sql
```

---

## 🔗 **QUICK LINKS**

| Resource | URL |
|----------|-----|
| **Dashboard** | https://supabase.com/dashboard/project/btjscudzrtarfommgegw |
| **SQL Editor** | https://supabase.com/dashboard/project/btjscudzrtarfommgegw/sql |
| **Table Editor** | https://supabase.com/dashboard/project/btjscudzrtarfommgegw/editor |
| **API Settings** | https://supabase.com/dashboard/project/btjscudzrtarfommgegw/settings/api |
| **Auth** | https://supabase.com/dashboard/project/btjscudzrtarfommgegw/auth |

---

## 📊 **DATABASE STRUCTURE**

### **Tables Created:**

1. **customers** - Business accounts
   - id, email, business_name, owner_name, phone, plan, status

2. **business_metrics** - Performance tracking
   - customer_id, total_calls, total_sms, total_revenue, ai_accuracy

3. **call_records** - Individual call logs
   - customer_id, type, duration, status, revenue

4. **agents** - AI agent configs
   - customer_id, name, type, role, status, avatar_url

5. **leads** - Prospect tracking
   - customer_id, name, email, phone, status, source

---

## ✅ **VERIFICATION**

After deploying the schema, verify with:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Should return: customers, business_metrics, call_records, agents, leads
```

---

## 🔐 **SECURITY NOTES**

- ✅ Row Level Security (RLS) is enabled
- ✅ Service role key bypasses RLS (for API)
- ✅ Anon key has limited access
- ✅ All tables have proper policies

**Never commit `.env.local` to Git!**

---

## 🚀 **NEXT STEPS**

1. ✅ Deploy schema using one of the methods above
2. ✅ Verify tables in Supabase Table Editor
3. ✅ Test API endpoints
4. ✅ Create first customer record
5. ✅ Start using FrontDesk Agents!

---

## 🆘 **TROUBLESHOOTING**

### **Connection Issues?**
- Check your internet connection
- Verify project URL is correct
- Ensure service role key is valid

### **Permission Errors?**
- Use service_role key (not anon key) for schema changes
- Check RLS policies in Supabase Dashboard

### **Table Already Exists?**
- The schema uses `IF NOT EXISTS` so it's safe to re-run
- Drop tables manually if needed: `DROP table customers cascade;`

---

**📞 Need Help?** 
- Supabase Docs: https://supabase.com/docs
- FrontDesk Agents Docs: See `BRAIN_INTEGRATION.md`
