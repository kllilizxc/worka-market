# Listing a package

Add or edit one JSON object in `catalog-v4.jsonl`. Include `schemaVersion` (4), `kind` (note, desktop or mascot), `id`, `name`, `author`, `description`, the full HTTPS GitHub repository and `path` (use `.` for its root). Tags, an icon, screenshots and localized display text are optional. A `story` (`title` up to 40 characters, `text` up to 120) puts the listing on the front page as a large card; lines with a story are shown in catalog order, so keep the ones you want first at the top. A mascot pack's folder holds `manifest.json` and `pack.js` (see Worka's 形象工坊 note). Keep a listing ID stable when updating its text.

Run `npm run validate`, `npm test` and `npm run validate:remote`. Validation checks the listing format and the package manifest paths. Check the runnable package in Worka before listing it. Updates to the package itself belong in its source repository.
