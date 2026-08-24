# Setting up the Join Our Team form backend

This connects the application form on the site to **your** Google account, so
submissions land in a Google Sheet and you get an email each time.

You have to do this yourself — it runs on your Google account and nobody else
can create it for you. It takes about ten minutes, once.

**What you'll end up with:** a URL that looks like
`https://script.google.com/macros/s/AKfyc.../exec`, which you paste into one
line of the site config.

---

## 1. Create the Google Sheet

1. Go to [sheets.new](https://sheets.new) — a blank spreadsheet opens.
2. Rename it something you'll recognise, e.g. **Orbitech — Website Submissions**.

That's all. Don't add headers or tabs; the script creates the `Applications`
and `Inquiries` tabs with the right columns the first time each form is used.

---

## 2. Open the script editor

1. In that same spreadsheet, click **Extensions ▸ Apps Script**.
2. A new tab opens with a file called `Code.gs` containing a stub
   `function myFunction() {}`.
3. Select everything in that editor and delete it.
4. Open `backend/Code.gs` from this project, copy the **whole file**, and paste
   it in.
5. Click the **save** icon (or `Ctrl`/`Cmd` + `S`).

> Creating the script from inside the sheet matters — it binds the script to
> that spreadsheet, so you can leave `SHEET_ID` empty in the config.

---

## 3. Set your options

At the top of the pasted code there's a `CONFIG` block. The defaults work as-is,
but check these two:

| Setting | Leave as-is if… | Change it if… |
|---|---|---|
| `NOTIFY_EMAIL` | you want notifications at the Google account you're using now | you want them somewhere else — put the address in quotes, comma-separate for several |
| `CV_FOLDER_NAME` | you're happy with a Drive folder called *Orbitech — CV Uploads* | you want a different name, or paste an existing folder's ID into `CV_FOLDER_ID` |

Save again after any edit.

---

## 4. Test it before deploying

1. In the toolbar's function dropdown, pick **`testApplication`**.
2. Click **Run**.
3. Google will ask for authorisation the first time:
   - **Review permissions** → pick your account
   - You'll see *"Google hasn't verified this app"*. This is expected — it's
     your own script, and Google shows this for anything not published to their
     marketplace. Click **Advanced ▸ Go to [project name] (unsafe)**.
   - **Allow**.
4. Check the results:
   - The spreadsheet now has an **Applications** tab with one test row.
   - You've received a notification email.
5. Run **`testInquiry`** too, to create the **Inquiries** tab.
6. Delete both test rows.

If this step works, everything downstream will work. If it doesn't, fix it here
— debugging is far easier in the editor than through the live site.

---

## 5. Deploy as a Web App

1. Top right: **Deploy ▸ New deployment**.
2. Click the gear icon beside *Select type* and choose **Web app**.
3. Fill in:

   | Field | Value |
   |---|---|
   | Description | `Orbitech website forms v1` |
   | Execute as | **Me (your@email.com)** |
   | Who has access | **Anyone** |

   > **"Anyone" is required and is not a mistake.** Visitors to your site aren't
   > signed into Google, so the endpoint has to accept anonymous requests. The
   > script still runs *as you* — it can only touch the sheet and folder in your
   > account, and it never returns your data to the caller. "Anyone with a Google
   > account" will silently break the form for most of your visitors.

4. Click **Deploy**, authorise if prompted.
5. Copy the **Web app URL**. It ends in `/exec`.

Sanity check: paste that URL into a browser tab. You should see
`{"ok":true,"service":"Orbitech form endpoint",...}`. If you get an error page,
the access setting in step 3 is wrong.

---

## 6. Wire it into the site

Open `assets/js/content.config.js` and find the `integrations` block near the
top:

```js
integrations: {
  GOOGLE_SCRIPT_URL: "REPLACE_ME",
  CONTACT_ENDPOINT:  "REPLACE_ME",
```

Paste your `/exec` URL into **both**:

```js
integrations: {
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfyc.../exec",
  CONTACT_ENDPOINT:  "https://script.google.com/macros/s/AKfyc.../exec",
```

The same script handles both forms — it routes on the `formType` field and
writes to different tabs. If you'd rather send client enquiries somewhere else
(a CRM, a different script), just point `CONTACT_ENDPOINT` at that instead.

Save, upload the site, and submit a real test through the live form.

> Until you replace these, both forms run in **demo mode**: they validate and
> show a success message but send nothing, and log the payload to the browser
> console. That's deliberate, so the site is fully demonstrable before the
> backend exists.

---

## Updating the script later

When you edit `Code.gs`, the live URL does **not** pick up your changes until
you redeploy — and you must redeploy in a way that keeps the same URL:

**Deploy ▸ Manage deployments ▸** (pencil icon) **▸ Version: New version ▸ Deploy**

If you use *New deployment* instead, you get a brand-new URL and the site keeps
posting to the old code.

---

## Troubleshooting

**Form says "Something went wrong" every time**
Open the browser console (F12). A CORS error usually means the deployment's
*Who has access* isn't set to **Anyone** — fix it in Manage deployments. Check
too that the URL in the config ends in `/exec`, not `/dev`.

**Submissions work but no email arrives**
Check spam. Then check your Apps Script quota — consumer Gmail accounts get
100 emails/day, Workspace accounts 1,500. In the editor, **Executions** in the
left sidebar shows every run and its errors. Note that a failed email never
loses a submission: the row is written to the sheet first.

**CVs upload but you can't open them from the sheet**
By design, uploaded files stay private to your Drive. Share the
*Orbitech — CV Uploads* folder with anyone who needs to read applications.
(If you'd rather every CV be link-accessible, there's a commented-out
`setSharing` line in `saveUpload_` — but that makes CVs reachable by anyone who
gets the URL, which is worth thinking about for personal data.)

**Large CVs fail**
The limit is 8 MB, set in two places that must agree: `MAX_UPLOAD_MB` in
`Code.gs` and `maxUploadMB` in `content.config.js`. Applicants over the limit
are told to use the link field instead.

**Nothing at all in Executions when you submit**
The request isn't reaching Google. Check the URL in the config for typos, and
confirm the site is served over `https://` — a page on `http://` posting to
`https://` can be blocked as mixed content.

---

## What this costs and what it can handle

Free, on both consumer and Workspace Google accounts. The relevant daily quotas
are roughly 20,000 URL-fetch-free script executions, 100 emails (consumer) or
1,500 (Workspace), and your normal Drive storage for CVs. For a careers form
this is comfortably more headroom than you'll need — if you ever outgrow it,
the migration path is to swap the endpoint URL for a real backend and leave the
site code untouched.
