import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://readiness.example/", {
      headers: { accept: "text/html", host: "readiness.example" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete readiness landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Catena-X Readiness Service \| GATE Institute/i);
  assert.match(html, /Your route into Europe/i);
  assert.match(html, /Six work packages\. One usable outcome\./i);
  assert.match(html, /Expression of interest/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
  assert.match(html, /https:\/\/readiness\.example\/og\.png/i);
});

test("keeps every proposal work package and a secured Firebase handoff", async () => {
  const [page, adminPage, rules, firebase, packageJson] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/submissions/page.tsx", root), "utf8"),
    readFile(new URL("firestore.rules", root), "utf8"),
    readFile(new URL("lib/firebase.ts", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);

  for (const title of [
    "Eligibility & Opportunity",
    "Use Case Match",
    "Data Quality & Gaps",
    "Action Roadmap",
    "Application Pack",
    "Use Case Execution",
  ]) {
    assert.match(page, new RegExp(title.replace("&", "\\&")));
  }

  assert.match(page, /emailPattern\.test\(email\)/);
  assert.match(page, /collection\(db, "leads"\)/);
  assert.match(adminPage, /signInWithEmailAndPassword/);
  assert.match(adminPage, /catenax-review@gate\.local/);
  assert.match(adminPage, /Export CSV/);
  assert.match(rules, /allow read: if isSharedReviewer\(\)/);
  assert.match(rules, /request\.auth\.token\.email == 'catenax-review@gate\.local'/);
  assert.match(rules, /allow update, delete: if false/);
  assert.match(rules, /request\.resource\.data\.createdAt == request\.time/);
  assert.match(firebase, /NEXT_PUBLIC_FIREBASE_PROJECT_ID/);
  assert.match(packageJson, /"firebase":/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton|drizzle/);
});
