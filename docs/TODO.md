# TODO

Pending work only, `- [ ]`, grouped by category, what and why.
Delete an item when it is done — git history is the record.

### fh-fuelhunt

- [ ] Check the shell against the corrected [MOBILE_APP_SHELL.md](implementations/MOBILE_APP_SHELL.md). It is named as the pattern's reference implementation, and the document it is the reference for changed after it was written: the desktop AI-drawer crossover moved from 1200px to 1400px (the old rule overlaps the column into the drawer at 1280px and 1366px), a modal opened from inside a drawer now needs its own backdrop at 40 rather than reusing the drawer's at 28, and modals/menus should move to `<dialog showModal()>` and `popover` so the top layer replaces the portal machinery. Whether any of these are live there is unverified from this repo — check before changing anything.
