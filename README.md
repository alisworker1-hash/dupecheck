# DupeCheck

A tiny static site that lists **affordable dupes** for makeup, shoes, clothing and appliances —
but only the ones that **pass a real review check**. Dupes that fail are shown in a separate
"Didn't make the cut" section with the reason, so the trust cuts both ways.

**Live:** https://alisworker1-hash.github.io/dupecheck/

## How the vetting works
Each dupe is researched against real reviews from multiple independent sources. A dupe is only
listed as **review-vetted** if it has consistent positive reviews (composite ≈ 4/5 or better,
multiple sources, no major durability or safety red flags). **Counterfeit / fake-branded items
are never listed** — only legitimate lower-cost alternatives. The full methodology and a
disclaimer are in the site footer (and in `data.json` → `meta`).

## Add or edit dupes
All content lives in **`data.json`**. Each entry:

```json
{
  "id": "unique-slug",
  "category": "makeup | shoes | clothing | appliances",
  "verdict": "pass | reject",
  "rating": 4.5,
  "dupe":     { "name": "...", "brand": "...", "price": 14 },
  "original": { "name": "...", "brand": "...", "price": 49 },
  "summary": "one-line why it works",
  "caveat": "honest heads-up",
  "reasons": ["only for rejects: why it failed"],
  "reviews": [ { "source": "Site name", "url": "https://...", "takeaway": "what they said" } ]
}
```
`pass` entries show in the grid; `reject` entries show under "Didn't make the cut". Stats and
category counts update automatically.

## Run locally
`fetch()` needs a server (not `file://`):

```bash
cd dupecheck
python3 -m http.server 8099
# open http://localhost:8099
```

## Stack
Plain HTML + CSS + vanilla JS, no build step, no dependencies — deploys as static files to
GitHub Pages. Prices are approximate; no affiliate links, no sponsorships.
