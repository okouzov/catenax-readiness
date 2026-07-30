import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("exports both GitHub Pages routes with the repository base path", async () => {
  const [landing, submissions] = await Promise.all([
    readFile(new URL("out/index.html", root), "utf8"),
    readFile(new URL("out/submissions/index.html", root), "utf8"),
  ]);

  assert.match(landing, /Your route into Europe/i);
  assert.match(landing, /\/catenax-readiness\/_next\//);
  assert.match(landing, /\/catenax-readiness\/gate-official-linkedin\.jpg/);
  assert.match(landing, /\/catenax-readiness\/catena-x-official\.jpg/);
  assert.match(landing, /\/catenax-readiness\/submissions/);
  assert.match(
    landing,
    /https:\/\/okouzov\.github\.io\/catenax-readiness\/og\.png/,
  );

  assert.match(submissions, /Review submitted interest/i);
  assert.match(submissions, /\/catenax-readiness\/gate-official-linkedin\.jpg/);
  assert.match(submissions, /\/catenax-readiness\/catena-x-official\.jpg/);
  assert.match(submissions, /\/catenax-readiness\/_next\//);
});
