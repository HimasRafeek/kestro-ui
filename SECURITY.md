# Security policy

## Supported versions

Only the latest published version of `kestro-ui` receives security fixes.

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub's
[security advisory form](https://github.com/HimasRafeek/kestro-ui/security/advisories/new).
Don't open a public issue.

Include the affected version, a description of the issue and steps to reproduce it. You'll get a reply within a few days, and a fix or mitigation will be released as soon as it's ready.

## Scope

Kestro UI renders model output as React elements and never uses `dangerouslySetInnerHTML`. Links in Markdown are limited to `http`, `https`, `mailto` and relative URLs. Reports about bypassing these guarantees are especially welcome.
