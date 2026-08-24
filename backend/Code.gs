/**
 * ============================================================================
 * ORBITECH — Google Apps Script backend
 * ============================================================================
 *
 * Receives POSTs from the Orbitech landing page and, for each submission:
 *   1. Appends a row to a Google Sheet (creating the tab + headers if needed)
 *   2. Saves any uploaded CV to a Drive folder and stores the link in the row
 *   3. Sends an email notification
 *
 * Handles two form types, routed on the `formType` field in the payload:
 *   "application" → Join Our Team applications      → Applications tab
 *   "inquiry"     → Client contact form submissions → Inquiries tab
 *
 * Setup: see SETUP-GOOGLE-APPS-SCRIPT.md in this folder.
 *
 * ---------------------------------------------------------------------------
 * A note on how the site calls this script
 * ---------------------------------------------------------------------------
 * The page POSTs with Content-Type: text/plain so the browser treats it as a
 * "simple" CORS request and skips the preflight OPTIONS call, which Apps
 * Script cannot answer. The body is still JSON — we parse it from
 * e.postData.contents below. Do not "fix" the site to send application/json;
 * that will break submissions with a CORS error.
 * ============================================================================
 */


/* ===========================================================================
   ⚙️  CONFIGURATION — edit this block, nothing else
   =========================================================================== */

var CONFIG = {

  /**
   * Google Sheet ID that receives submissions.
   * Grab it from the sheet's URL:
   *   https://docs.google.com/spreadsheets/d/[[[ THIS PART ]]]/edit
   *
   * Leave as "" if you created this script from Extensions ▸ Apps Script
   * INSIDE the sheet — it will bind to the containing spreadsheet on its own.
   */
  SHEET_ID: "",

  /** Tab names. Created automatically on first submission if missing. */
  APPLICATIONS_TAB: "Applications",
  INQUIRIES_TAB: "Inquiries",

  /**
   * Drive folder for uploaded CVs.
   * Either paste a folder ID here, or leave it "" and the script will create
   * (and reuse) a folder called CV_FOLDER_NAME in your Drive root.
   */
  CV_FOLDER_ID: "",
  CV_FOLDER_NAME: "Orbitech — CV Uploads",

  /**
   * Where to send notifications. Comma-separate for multiple recipients.
   * Leave "" to use the email address that owns this script.
   */
  NOTIFY_EMAIL: "",

  /** Set false to turn off notification emails but keep sheet logging. */
  SEND_NOTIFICATIONS: true,

  /**
   * Send an automatic acknowledgement to the person who submitted.
   * Off by default — turn on once you're happy with the wording in
   * buildApplicantAcknowledgement() below.
   */
  SEND_ACKNOWLEDGEMENT: false,

  /** Reject uploads larger than this (megabytes). Keep in step with the site. */
  MAX_UPLOAD_MB: 8,

  /**
   * Optional shared secret. If set to a non-empty string, submissions must
   * include a matching `token` field or they are rejected. Only worth doing
   * if you start getting spam; you would also need to add the token to the
   * payload in assets/js/app.js.
   */
  SHARED_SECRET: ""
};


/* ===========================================================================
   COLUMN DEFINITIONS
   Order here === column order in the sheet. Add a field by adding an entry;
   existing rows keep their data, new rows pick up the new column.
   =========================================================================== */

var APPLICATION_COLUMNS = [
  { header: "Timestamp",        key: "_timestamp" },
  { header: "Full name",        key: "fullName" },
  { header: "Email",            key: "email" },
  { header: "Country",          key: "country" },
  { header: "Skills",           key: "skills" },
  { header: "Languages",        key: "languages" },
  { header: "CV link",          key: "cvUrl" },
  { header: "Uploaded CV",      key: "_fileUrl" },
  { header: "Heard about us",   key: "referral" },
  { header: "Notes",            key: "notes" },
  { header: "Status",           key: "_status" },
  { header: "Source page",      key: "pageUrl" }
];

var INQUIRY_COLUMNS = [
  { header: "Timestamp",    key: "_timestamp" },
  { header: "Type",         key: "inquiryType" },
  { header: "Name",         key: "name" },
  { header: "Email",        key: "email" },
  { header: "Company",      key: "company" },
  { header: "Interest",     key: "interest" },
  { header: "Message",      key: "message" },
  { header: "Status",       key: "_status" },
  { header: "Source page",  key: "pageUrl" }
];


/* ===========================================================================
   ENTRY POINTS
   =========================================================================== */

/**
 * Handles form submissions from the site.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "Empty request body." });
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ ok: false, error: "Body was not valid JSON." });
    }

    if (CONFIG.SHARED_SECRET && payload.token !== CONFIG.SHARED_SECRET) {
      return jsonResponse({ ok: false, error: "Unauthorised." });
    }

    // Honeypot — if a bot filled the hidden field, accept and discard.
    if (payload.company_website) {
      return jsonResponse({ ok: true, discarded: true });
    }

    var formType = String(payload.formType || "application").toLowerCase();

    if (formType === "inquiry") return handleInquiry(payload);
    return handleApplication(payload);

  } catch (err) {
    logError_("doPost", err, e);
    return jsonResponse({
      ok: false,
      error: "Server error: " + (err && err.message ? err.message : String(err))
    });
  }
}

/**
 * Health check. Visit the /exec URL in a browser to confirm the deployment
 * is live and correctly permissioned.
 */
function doGet() {
  return jsonResponse({
    ok: true,
    service: "Orbitech form endpoint",
    deployedAt: new Date().toISOString(),
    accepts: ["application", "inquiry"]
  });
}


/* ===========================================================================
   HANDLERS
   =========================================================================== */

function handleApplication(payload) {
  var required = ["fullName", "email", "country", "skills", "languages"];
  var missing = required.filter(function (k) {
    return !payload[k] || !String(payload[k]).trim();
  });
  if (missing.length) {
    return jsonResponse({ ok: false, error: "Missing fields: " + missing.join(", ") });
  }

  // Store the uploaded CV, if there is one.
  var fileInfo = null;
  if (payload.file && payload.file.data) {
    try {
      fileInfo = saveUpload_(payload.file, payload.fullName);
    } catch (fileErr) {
      logError_("saveUpload_", fileErr, payload.file && payload.file.name);
      // A failed upload must not lose the application — record it and move on.
      fileInfo = { url: "UPLOAD FAILED: " + fileErr.message, name: "" };
    }
  }

  var row = Object.assign({}, payload, {
    _timestamp: new Date(),
    _fileUrl: fileInfo ? fileInfo.url : "",
    _status: "New"
  });

  var rowNumber = appendRow_(CONFIG.APPLICATIONS_TAB, APPLICATION_COLUMNS, row);

  if (CONFIG.SEND_NOTIFICATIONS) {
    safeSend_(function () {
      MailApp.sendEmail({
        to: notifyAddress_(),
        replyTo: String(payload.email),
        subject: "New Orbitech application — " + payload.fullName +
                 " (" + payload.country + ")",
        htmlBody: buildApplicationEmail_(payload, fileInfo, rowNumber)
      });
    });
  }

  if (CONFIG.SEND_ACKNOWLEDGEMENT) {
    safeSend_(function () {
      MailApp.sendEmail({
        to: String(payload.email),
        subject: "We've received your Orbitech application",
        htmlBody: buildApplicantAcknowledgement_(payload)
      });
    });
  }

  return jsonResponse({ ok: true, row: rowNumber, fileStored: !!fileInfo });
}


function handleInquiry(payload) {
  var required = ["name", "email", "message"];
  var missing = required.filter(function (k) {
    return !payload[k] || !String(payload[k]).trim();
  });
  if (missing.length) {
    return jsonResponse({ ok: false, error: "Missing fields: " + missing.join(", ") });
  }

  var row = Object.assign({}, payload, {
    _timestamp: new Date(),
    _status: "New"
  });

  var rowNumber = appendRow_(CONFIG.INQUIRIES_TAB, INQUIRY_COLUMNS, row);

  if (CONFIG.SEND_NOTIFICATIONS) {
    var label = payload.inquiryType === "quote" ? "QUOTE REQUEST" : "General enquiry";
    safeSend_(function () {
      MailApp.sendEmail({
        to: notifyAddress_(),
        replyTo: String(payload.email),
        subject: "[" + label + "] " + payload.name +
                 (payload.company ? " · " + payload.company : ""),
        htmlBody: buildInquiryEmail_(payload, rowNumber)
      });
    });
  }

  return jsonResponse({ ok: true, row: rowNumber });
}


/* ===========================================================================
   SHEET HELPERS
   =========================================================================== */

function getSpreadsheet_() {
  if (CONFIG.SHEET_ID) return SpreadsheetApp.openById(CONFIG.SHEET_ID);

  var bound = SpreadsheetApp.getActiveSpreadsheet();
  if (bound) return bound;

  throw new Error(
    "No spreadsheet available. Set CONFIG.SHEET_ID, or create this script " +
    "from Extensions ▸ Apps Script inside the target sheet."
  );
}

/**
 * Append a row, creating the tab and header row on first use.
 * Returns the 1-based row number that was written.
 */
function appendRow_(tabName, columns, data) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    var headers = columns.map(function (c) { return c.header; });
    sheet.appendRow(headers);

    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange
      .setFontWeight("bold")
      .setBackground("#0c1222")
      .setFontColor("#e9eef8");
    sheet.setFrozenRows(1);

    // Reasonable starting widths — a human still has to read this.
    for (var i = 0; i < columns.length; i++) {
      sheet.setColumnWidth(i + 1, wideColumn_(columns[i].key) ? 320 : 160);
    }
  }

  var values = columns.map(function (c) {
    var v = data[c.key];
    if (v === undefined || v === null) return "";
    return (v instanceof Date) ? v : String(v);
  });

  sheet.appendRow(values);
  return sheet.getLastRow();
}

function wideColumn_(key) {
  return ["skills", "languages", "notes", "message", "cvUrl", "_fileUrl", "pageUrl"]
    .indexOf(key) !== -1;
}


/* ===========================================================================
   DRIVE UPLOAD
   =========================================================================== */

/**
 * Decode a base64 upload and save it to Drive.
 * @param {{name:string, mimeType:string, data:string}} file
 * @param {string} applicantName used to build a readable filename
 * @return {{url:string, name:string, id:string}}
 */
function saveUpload_(file, applicantName) {
  // base64 inflates by ~4/3; check the decoded size against the limit.
  var approxBytes = Math.ceil(String(file.data).length * 0.75);
  var limit = CONFIG.MAX_UPLOAD_MB * 1024 * 1024;
  if (approxBytes > limit) {
    throw new Error("File exceeds the " + CONFIG.MAX_UPLOAD_MB + " MB limit.");
  }

  var folder = getCvFolder_();

  var safeName = String(applicantName || "applicant")
    .replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_").slice(0, 60);
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
  var original = String(file.name || "cv");
  var ext = original.indexOf(".") !== -1 ? original.slice(original.lastIndexOf(".")) : "";
  var filename = safeName + "_" + stamp + ext;

  var blob = Utilities.newBlob(
    Utilities.base64Decode(file.data),
    file.mimeType || "application/octet-stream",
    filename
  );

  var created = folder.createFile(blob);

  /* Access model: the file stays private to your Drive. Anyone you share the
     sheet with must also be given access to the folder (or the file) to open
     a CV. That is the safe default for personal data.

     If you would rather every CV be openable by anyone holding the link,
     uncomment the next line — understand that it makes CVs publicly
     reachable to anyone who obtains the URL. */
  // created.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return { url: created.getUrl(), name: filename, id: created.getId() };
}

function getCvFolder_() {
  if (CONFIG.CV_FOLDER_ID) return DriveApp.getFolderById(CONFIG.CV_FOLDER_ID);

  var existing = DriveApp.getFoldersByName(CONFIG.CV_FOLDER_NAME);
  if (existing.hasNext()) return existing.next();

  return DriveApp.createFolder(CONFIG.CV_FOLDER_NAME);
}


/* ===========================================================================
   EMAIL TEMPLATES
   =========================================================================== */

function notifyAddress_() {
  return CONFIG.NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
}

function buildApplicationEmail_(p, fileInfo, rowNumber) {
  var rows = [
    ["Name", p.fullName],
    ["Email", '<a href="mailto:' + escapeHtml_(p.email) + '">' + escapeHtml_(p.email) + "</a>"],
    ["Country", p.country],
    ["Languages", p.languages],
    ["Skills", p.skills],
    ["CV link", p.cvUrl
      ? '<a href="' + escapeHtml_(p.cvUrl) + '">' + escapeHtml_(p.cvUrl) + "</a>"
      : "—"],
    ["Uploaded CV", fileInfo && fileInfo.url
      ? '<a href="' + escapeHtml_(fileInfo.url) + '">' + escapeHtml_(fileInfo.name) + "</a>"
      : "—"],
    ["Heard about us", p.referral],
    ["Notes", p.notes || "—"]
  ];
  return emailShell_("New application to the Orbitech network", rows, rowNumber);
}

function buildInquiryEmail_(p, rowNumber) {
  var rows = [
    ["Type", p.inquiryType === "quote" ? "Project quote request" : "General enquiry"],
    ["Name", p.name],
    ["Email", '<a href="mailto:' + escapeHtml_(p.email) + '">' + escapeHtml_(p.email) + "</a>"],
    ["Company", p.company || "—"],
    ["Interest", p.interest || "—"],
    ["Message", p.message]
  ];
  return emailShell_("New client enquiry", rows, rowNumber);
}

function emailShell_(title, rows, rowNumber) {
  var body = rows.map(function (r) {
    var value = String(r[1] === undefined || r[1] === null ? "—" : r[1]);
    // Values already containing markup (links) are passed through as-is.
    var safe = value.indexOf("<a href=") === 0 ? value : escapeHtml_(value);
    return '<tr>' +
      '<td style="padding:10px 16px 10px 0;vertical-align:top;color:#5b6b85;' +
        'font-size:13px;white-space:nowrap;">' + escapeHtml_(r[0]) + '</td>' +
      '<td style="padding:10px 0;vertical-align:top;color:#101828;font-size:14px;' +
        'line-height:1.6;white-space:pre-wrap;">' + safe + '</td>' +
    '</tr>';
  }).join("");

  var sheetLink = "";
  try {
    sheetLink = '<p style="margin:24px 0 0;font-size:13px;color:#5b6b85;">' +
      'Logged to row ' + rowNumber + ' — ' +
      '<a href="' + getSpreadsheet_().getUrl() + '" ' +
      'style="color:#0b7285;">open the sheet</a></p>';
  } catch (e) { /* non-fatal */ }

  return '' +
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;' +
      'max-width:640px;margin:0 auto;padding:28px;">' +
      '<div style="border-left:3px solid #0b9fb5;padding-left:16px;margin-bottom:24px;">' +
        '<h1 style="margin:0;font-size:18px;color:#101828;">' + escapeHtml_(title) + '</h1>' +
        '<p style="margin:4px 0 0;font-size:13px;color:#5b6b85;">Orbitech website</p>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;">' + body + '</table>' +
      sheetLink +
    '</div>';
}

function buildApplicantAcknowledgement_(p) {
  return '' +
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;' +
      'max-width:560px;margin:0 auto;padding:28px;font-size:15px;line-height:1.65;' +
      'color:#101828;">' +
      '<p>Hi ' + escapeHtml_(String(p.fullName).split(" ")[0]) + ',</p>' +
      '<p>Thanks for applying to the Orbitech network — your application is in ' +
        'and a real person will read it.</p>' +
      '<p>We keep every application on file and get in touch when a project ' +
        'matches your skills and languages. That can take a little while, so ' +
        'no news is not bad news.</p>' +
      '<p style="margin-top:24px;">— The Orbitech team</p>' +
    '</div>';
}


/* ===========================================================================
   UTILITIES
   =========================================================================== */

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml_(str) {
  return String(str === undefined || str === null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Email quota failures must never lose a submission that's already logged. */
function safeSend_(fn) {
  try { fn(); } catch (err) { logError_("email", err); }
}

function logError_(where, err, extra) {
  console.error("[Orbitech][" + where + "] " +
    (err && err.stack ? err.stack : err) +
    (extra ? " | " + JSON.stringify(extra).slice(0, 500) : ""));
}


/* ===========================================================================
   TEST HARNESS
   Run testApplication() or testInquiry() from the Apps Script editor to
   verify everything works before you point the live site at this endpoint.
   The first run will prompt for authorisation.
   =========================================================================== */

function testApplication() {
  var res = doPost({
    postData: {
      contents: JSON.stringify({
        formType: "application",
        fullName: "Test Applicant",
        email: notifyAddress_(),
        country: "Bangladesh",
        skills: "Image annotation, medical transcription",
        languages: "Bengali (native), English (C2)",
        cvUrl: "https://example.com/cv",
        referral: "LinkedIn",
        notes: "This is a test row — delete it.",
        pageUrl: "local-test"
      })
    }
  });
  console.log(res.getContent());
}

function testInquiry() {
  var res = doPost({
    postData: {
      contents: JSON.stringify({
        formType: "inquiry",
        inquiryType: "quote",
        name: "Test Client",
        email: notifyAddress_(),
        company: "Test Co",
        interest: "Data annotation",
        message: "This is a test row — delete it.",
        pageUrl: "local-test"
      })
    }
  });
  console.log(res.getContent());
}
