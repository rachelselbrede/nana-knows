# Security

Nana Knows is a static page. There is no server, no database, no account and
no analytics, so there is nothing to break into and nothing of anyone's to
steal from us: a visitor's numbers live in her own browser, or in a link she
chose to share. That narrows what can go wrong, and it is worth saying what
is left.

## What would count

- **A shared link that does more than fill in the form.** Everything in the
  URL is untrusted input. It is validated and capped in `src/lib/share.js`
  and only ever placed into form fields as text. A link that could run
  script, or put words on the page that look like Nana's advice, is a bug
  worth reporting.
- **The notebook.** Saved projects are read back from `localStorage` through
  `src/lib/notebook.js`, which trusts nothing it reads. Stored data that can
  crash the page or escape a form field is the same kind of bug.
- **The offline copy.** The site installs a service worker so it works in a
  yarn shop with no signal. Anything that lets stale or foreign content be
  served from that cache counts.
- **The build.** The dependencies run at build time, not in the visitor's
  browser, apart from React itself. A compromised or vulnerable dependency
  that affects what gets published counts.

A wrong size or a wrong yardage is not a security problem, but Nana would
very much like to hear about it: use "Tell Nana what to learn next" in the
footer.

## How to report

Please do not put the details in a public issue.

If the repository's **Security** tab offers "Report a vulnerability", use
that; it opens a private conversation with the maintainer. If it does not,
open an ordinary issue that says only that you have something to report
privately, with no details, and the maintainer will arrange a private
channel with you.

## What to expect

This is a small project kept in spare hours, so there is no bounty and no
guaranteed response time, but a real report will be read, answered, and
credited in the fix if you would like to be. Only the live site, built from
`main`, is supported; there are no older versions to patch.
