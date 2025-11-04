# 📧 Send Update Email to Eddy

## ✅ **Email Script Created**

A script has been created to send Eddy an update about the email forwarding setup.

## 🚀 **To Send the Email**

Run this command:

```bash
pnpm email:eddy-update
```

**OR** if pnpm isn't available:

```bash
npx tsx scripts/email-eddy-update.ts
```

## ⚙️ **Requirements**

Make sure you have `RESEND_API_KEY` set in your `.env` file:

```bash
RESEND_API_KEY=re_xxxxx
```

## 📧 **What the Email Contains**

- Confirmation that email forwarding is set up
- List of all email types Eddy will receive
- Explanation of how it works
- Status confirmation

## ✅ **Status**

Script is ready - just run it when you're ready to send!

The email will be sent to: **Eddy@doorknockingsucks.com**

