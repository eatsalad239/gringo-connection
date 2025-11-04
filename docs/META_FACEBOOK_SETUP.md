# 📘 Meta/Facebook Graph API Setup Guide

## 🎯 **Getting Your Meta Page Access Token**

Once you're admin on the Gringo Connection Facebook page, follow these steps:

### **Step 1: Create Facebook App**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Business"** as app type
4. Fill in:
   - **App Name**: Gringo Connection
   - **App Contact Email**: info@gringoconnection.com
   - **Business Account**: (select or create)

### **Step 2: Add Facebook Login & Pages**

1. In your app dashboard, click **"Add Product"**
2. Add **"Facebook Login"**
3. Add **"Pages"** product

### **Step 3: Get Page Access Token**

**Option A: Graph API Explorer (Easiest)**

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app in the dropdown
3. Click **"Generate Access Token"**
4. Select permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
5. Copy the token

**Option B: Using Meta Business Suite**

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Settings → **System Users** → Create System User
3. Assign permissions:
   - Manage pages
   - Create content
4. Generate token for your page

### **Step 4: Get Page ID**

1. Go to your [Gringo Connection Facebook Page](https://www.facebook.com/gringoconnection)
2. Click **"About"** section
3. Scroll to **"Page ID"** (or check URL)
4. Copy the Page ID number

### **Step 5: Add to Environment**

Add to your `.env` file:

```bash
META_PAGE_ACCESS_TOKEN=your_long_lived_token_here
META_PAGE_ID=your_page_id_here
```

**For GitHub Actions**, add as secrets:
- `META_PAGE_ACCESS_TOKEN`
- `META_PAGE_ID`

### **Step 6: Make Token Long-Lived**

Short-lived tokens expire in 1 hour. To make it long-lived:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

Or use [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/) to extend.

---

## ✅ **Verification**

Test your setup:

```bash
# Test page access
curl "https://graph.facebook.com/v18.0/me?access_token=YOUR_TOKEN"

# Test posting (dry run - won't actually post)
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PAGE_ID/feed?message=Test&access_token=YOUR_TOKEN"
```

---

## 🔐 **Security Best Practices**

1. **Never commit tokens** to git
2. **Use environment variables** only
3. **Rotate tokens** every 60-90 days
4. **Use system users** for production (not personal accounts)
5. **Restrict IPs** in Facebook App settings if possible

---

## 📝 **Current Implementation**

Your system will automatically:
- ✅ Schedule posts via Meta Graph API
- ✅ Post to Facebook page
- ✅ Include images/media
- ✅ Schedule for future times
- ✅ Fall back to Buffer if Meta fails
- ✅ Fall back to manual pack if both fail

---

## 🚀 **Ready to Use**

Once tokens are added, your daily scheduler will automatically post to Facebook!

Check `automation/scheduler.ts` for the implementation.

