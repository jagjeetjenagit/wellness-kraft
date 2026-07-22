# Wellness Kraft — Consultations + Store

A complete website for booking expert consultations and selling wellness
products. Built with Next.js, and powered by free managed services — no
coding needed to run it.

**What's inside:** Home page, expert profiles with live booking calendars
(Cal.com), a product store with cart and secure checkout (Razorpay),
phone-OTP customer login (Clerk), customer dashboard, and a full admin area
for managing products, experts, orders and bookings.

---

## Good to know before you start

- **The site works immediately**, even before you connect anything. It shows
  sample experts and products ("Preview mode"). Each service you connect
  (database, login, payments, email) switches on its feature.
- Every setup step below is **copy, paste, click** — you never need to
  understand the code.
- Free plans of all services are enough to launch.

---

## Part 1 — Run the site on your computer (Windows)

### Step 1: Install Node.js (one time only)

1. Go to https://nodejs.org
2. Click the big green **LTS** download button.
3. Open the downloaded file and click **Next** through the installer
   (keep all default options).
4. Restart your computer after installing.

### Step 2: Install the site

1. Press the **Windows key**, type `powershell`, press Enter.
2. Copy-paste this line and press Enter (change the path if you saved the
   project somewhere else):

   ```
   cd "C:\Client 1"
   ```

3. Then copy-paste this and press Enter (takes a few minutes the first time):

   ```
   npm install
   ```

### Step 3: Create your settings file

1. In the project folder, find the file **`.env.example`**.
2. Copy it, and rename the copy to exactly **`.env`** (nothing before the dot).
   - Tip: if Windows hides file endings, in File Explorer click
     **View → Show → File name extensions** first.
3. You will paste your keys into this file in the steps below. Open it with
   **Notepad** (right-click → Open with → Notepad).

### Step 4: Start the site

In the same PowerShell window:

```
npm run dev
```

Then open your browser at **http://localhost:3000** — your site is running! 🎉

It shows sample data for now. Keep it running while you do the steps below
(refresh the browser to see changes; if a new key doesn't seem to apply,
stop the site with **Ctrl+C** in PowerShell and run `npm run dev` again).

---

## Part 2 — Connect the free services (about 30–40 minutes total)

### 1) Database — Neon (free) — ~5 min

This stores your real products, experts, orders and bookings.

1. Go to https://neon.tech and click **Sign up** (use your Google account —
   fastest).
2. Create a project (any name, e.g. "wellness-kraft"; region: Singapore is
   closest to India).
3. On the project page click **Connect** and copy the **connection string**
   (it starts with `postgresql://`).
4. Open your `.env` file in Notepad and paste it between the quotes of
   `DATABASE_URL`, like:
   ```
   DATABASE_URL="postgresql://user:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require"
   ```
5. Save the file. Back in PowerShell, stop the site (**Ctrl+C**, then `y` if
   asked) and run:
   ```
   npm run db:setup
   ```
   This creates your database tables and loads the sample experts/products
   into them (you can edit everything later in the admin area).
6. Start the site again: `npm run dev`. The yellow "Preview mode" banner is
   now gone — you're on real data.

### 2) Login — Clerk (free) — ~5 min

Gives customers phone-OTP login (perfect for India) and protects your admin
area.

1. Go to https://clerk.com and sign up.
2. Click **Create application**. Name it anything. Under sign-in options,
   switch **ON**: **Phone number**. (You can also leave Email on.)
3. Click **Create**. You land on a page showing two API keys.
4. Copy each one into `.env`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   ```
5. **Make yourself the admin:** in `.env`, put the email or phone number YOU
   will sign in with:
   ```
   ADMIN_EMAILS="youremail@gmail.com"
   ADMIN_PHONES="+919812345678"
   ```
6. Save `.env`, restart the site (**Ctrl+C**, then `npm run dev`).
7. Test it: click **Sign in** on the site, log in with your phone/email,
   then visit **http://localhost:3000/admin** — you're in the admin area.

### 3) Payments — Razorpay — ~10 min

1. Go to https://razorpay.com and sign up (business details needed; you can
   start in **Test Mode** immediately, before verification finishes).
2. In the Razorpay dashboard, make sure the switch at the top says
   **Test Mode**.
3. Go to **Account & Settings → API Keys → Generate Test Key**.
4. Copy the two values into `.env`:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="..."
   ```
5. Save and restart the site.
6. Test a purchase: add a product to the cart → checkout → fill the address →
   pay. In test mode use card number `4111 1111 1111 1111`, any future
   expiry, any CVV, OTP `1234`. Stock reduces automatically and the order
   appears in **/admin/orders**.

> **Going live later:** once Razorpay approves your business, flip the
> dashboard to **Live Mode**, generate LIVE keys, and replace the two values
> in `.env` (and on Vercel — see Part 3). That's all.

### 4) Email confirmations — Resend (free) — ~3 min

Sends order confirmations to customers and "new order" alerts to you.

1. Go to https://resend.com and sign up.
2. Click **API Keys → Create API Key**, copy it into `.env`:
   ```
   RESEND_API_KEY="re_..."
   ```
3. Also fill in where YOUR alert emails should go:
   ```
   ADMIN_NOTIFY_EMAIL="youremail@gmail.com"
   ```
4. Leave `EMAIL_FROM` as `onboarding@resend.dev` for now.
   > Note: on the free plan **without your own domain**, Resend only delivers
   > to the email address you signed up with — perfect for testing. To email
   > real customers, add your domain in Resend (**Domains → Add Domain**,
   > follow their DNS instructions) and change `EMAIL_FROM` to e.g.
   > `orders@yourdomain.com`.

### 5) Bookings — Cal.com (free) — ~10 min

Each expert gets a real calendar customers can book directly on the site.

1. Go to https://cal.com and sign up (one account per expert, or one team
   account you manage).
2. Complete the mini-setup (connect Google Calendar so bookings block real
   availability — recommended).
3. Cal.com gives each account a link like `cal.com/priya-sharma`. Create an
   event type, e.g. **"Consultation — 30 min"** → its link becomes
   `cal.com/priya-sharma/consultation`.
4. On your site, go to **/admin → Experts → Edit** an expert, and in the
   **Cal.com link** box paste only the part after `cal.com/`, e.g.:
   ```
   priya-sharma/consultation
   ```
5. Save. That expert's profile page now shows a live booking calendar.

**Optional (recommended): show bookings inside your site's dashboard**

1. In Cal.com go to **Settings → Developer → Webhooks → New webhook**.
2. Subscriber URL: `https://YOUR-SITE.vercel.app/api/webhooks/cal`
   (use your real address after deploying — webhooks can't reach localhost).
3. Tick the events **Booking Created**, **Booking Rescheduled**,
   **Booking Cancelled**.
4. In the **Secret** box type any long random text, and put the same text in
   `.env` as `CAL_WEBHOOK_SECRET` (and in Vercel). Save.

Now every booking also appears in **/admin/bookings** and in each customer's
dashboard, and confirmation emails go out via Resend.

### 6) Analytics (optional)

- **GA4:** at https://analytics.google.com create a property → Data streams →
  Web → copy the **Measurement ID** (`G-...`) into `NEXT_PUBLIC_GA_ID`.
- **Tag Manager:** at https://tagmanager.google.com copy your container ID
  (`GTM-...`) into `NEXT_PUBLIC_GTM_ID`.

---

## Part 3 — Put the site on the internet (Vercel, free)

### Step 1: Put the code on GitHub (one time)

1. Download **GitHub Desktop** from https://desktop.github.com and install it.
2. Sign up / sign in to GitHub inside the app.
3. In GitHub Desktop: **File → Add local repository** → choose your project
   folder (`C:\Client 1`). If it says "not a git repository", click the
   **create a repository** link it offers, then **Create repository**.
4. Click **Publish repository** (top bar). Keep **"Keep this code private"**
   ticked. Click **Publish**.

### Step 2: Deploy on Vercel

1. Go to https://vercel.com and sign up **with your GitHub account**.
2. Click **Add New → Project**, find your repository, click **Import**.
3. Before clicking Deploy: open the **Environment Variables** section and add
   **every line from your `.env` file** — for each one, paste the name
   (e.g. `DATABASE_URL`) and its value. 
   - For `NEXT_PUBLIC_SITE_URL`, you can set it after the first deploy (step 5).
4. Click **Deploy**. In ~2 minutes you get a live address like
   `https://veda-wellness.vercel.app`.
5. Final touches:
   - In Vercel → your project → **Settings → Environment Variables**, set
     `NEXT_PUBLIC_SITE_URL` to your real address (e.g.
     `https://veda-wellness.vercel.app`), then go to **Deployments** and
     click **⋯ → Redeploy** on the latest one.
   - In **Clerk**: your app currently runs in "test" mode which works fine on
     Vercel. When you buy a custom domain later, Clerk's dashboard will guide
     you through "production instance" setup (5 minutes).
   - In **Cal.com**: set the webhook URL to your real address (Part 2, step 5).

### Making changes later

Any time files change (or I make changes for you): open **GitHub Desktop**,
type a short summary in the box (e.g. "updated products"), click
**Commit to main**, then **Push origin**. Vercel redeploys automatically in
about 2 minutes.

---

## Everyday use (after setup)

| I want to… | Where |
|---|---|
| Add / edit products, prices, stock, photos | `/admin` → Products |
| Add / edit experts and their booking links | `/admin` → Experts |
| See and ship orders (mark Shipped / Delivered) | `/admin` → Orders |
| See upcoming consultations | `/admin` → Bookings (or your Cal.com dashboard) |
| See low-stock warnings | `/admin` (Overview) — red "Low stock" card |

**Product photos:** upload your photo to a free image host like
https://postimages.org, copy the **Direct link**, and paste it into the
product's "Image links" box in the admin (one link per line — the first is
the main photo).

---

## If something looks wrong

| Problem | Fix |
|---|---|
| Yellow "Preview mode" banner on the site | The database isn't connected — do Part 2, step 1, then `npm run db:setup`. |
| "Login isn't switched on yet" on the Sign in page | Add the two Clerk keys to `.env` and restart (`Ctrl+C`, `npm run dev`). |
| Checkout says payment isn't switched on | Add the two Razorpay keys to `.env` and restart. |
| No confirmation emails arriving | Add `RESEND_API_KEY` and `ADMIN_NOTIFY_EMAIL`. On the free plan without a domain, Resend only delivers to your own signup email (see Part 2, step 4). |
| Expert page shows "booking coming soon" | That expert has no Cal.com link yet — add it in `/admin` → Experts. |
| `/admin` says access denied | Put YOUR login email/phone into `ADMIN_EMAILS` / `ADMIN_PHONES` in `.env` (exactly as you sign in with) and restart. |
| Changed `.env` but nothing happened | Always restart: press **Ctrl+C** in PowerShell, then `npm run dev`. On Vercel: update the variable in Settings and Redeploy. |
| `npm` is not recognized | Node.js isn't installed (or you didn't restart after installing) — Part 1, step 1. |

---

## What powers what (for reference)

| Feature | Service | Free plan enough? |
|---|---|---|
| Website hosting | Vercel | Yes |
| Database | Neon Postgres | Yes |
| Customer login (phone OTP) | Clerk | Yes (10k monthly users) |
| Booking calendars | Cal.com | Yes |
| Payments | Razorpay | Pay-per-transaction fee only |
| Emails | Resend | Yes (100/day) |

**Compliance note:** the health disclaimer wording in the site footer and on
product pages is placeholder text — replace it with your own approved wording.
You are responsible for medical claims, product licensing and applicable
regulations.
