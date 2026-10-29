# Example publication contract

Example views use the shared note kit and current UI locale. Fixed interface copy can be translated; note names and user-authored content retain their identity. Catalog listing translations are presentation metadata and do not rename installed notes.

The active catalog remains pinned to the published 1.0.1 examples. Unreleased bilingual source changes do not update those installed views or add English listing text. English listing metadata belongs to a separately authorized new-version publication, not an in-place edit of the active 1.0.1 entries.

Source changes and published artifacts are separate revisions. Changing a view in this repository does not replace an immutable artifact already referenced by the catalog.

The updated sources require a host whose shared React SDK exports `NoteHeader`. Install that host before validating or publishing these sources; this additive export does not require a new note ABI.

For an authorized example release:
1. Verify compact/expanded layouts, light/dark themes and narrow screens in a disposable host.
2. Assign a new version and build new artifacts through the current Worka publication flow.
3. Validate executable contracts, pin the source commit, and record the new artifact URL, integrity and byte count. Add the new version’s English listing name and description at that point.
4. Verify installation and update behavior for those exact artifacts before publishing the catalog.

Never overwrite a published version or reuse old artifact hashes for changed content.

The existing `catalog.schema.json` and validator target the older v2 catalog. They are not v3 artifact validators. Use the host's current catalog checker for a v3 release.
