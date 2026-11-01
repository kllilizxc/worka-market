# Listing a package

Add or edit one JSON object in `catalog-v4.jsonl`. Include `schemaVersion` (4), `kind` (note or desktop), `id`, `name`, `author`, `description`, the full HTTPS GitHub repository and `path` (use `.` for its root). Tags, an icon, screenshots and localized display text are optional. Keep a listing ID stable when updating its text.

Run `npm run validate`, `npm test` and `npm run validate:remote`. Validation checks the listing format and the package manifest paths. Check the runnable package in Worka before listing it. Updates to the package itself belong in its source repository.
