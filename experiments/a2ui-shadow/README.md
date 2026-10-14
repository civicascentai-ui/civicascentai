# A2UI Shadow House: isolated pilot

**Status:** Staging experiment only. No changes to the public site, checkout, agent scheduler, or agent execution permissions.

This folder contains a genuine **A2UI v0.9.1 message fixture** (`sample.jsonl`) and a **minimal custom browser renderer for only five Basic Catalog component types**. This is NOT the official Lit/React A2UI SDK, a complete A2UI implementation, or evidence any agent is running. The sample messages present Scout, Zebra, Friday, and Sam with explicitly fictitious demo data. All button actions are local-only log events; they cannot send emails, run agents, initiate charges, or modify data.

Run locally (no API keys, paid services, package installs, or deployments):

```sh
python3 -m http.server 8765 --directory experiments/a2ui-shadow
```

Open `http://127.0.0.1:8765` and click a sample button. Browser checks should confirm four cards, keyboard focus and a local event log. Automated fixture checks: `python3 -m unittest discover -s tests -p 'test_a2ui_shadow.py' -v`.

The demo loads `sample.jsonl` over same-origin HTTP (a `file://` open does not work in browsers). It sets a restrictive content-security policy, inserts all text via `textContent`, permits only known UI components and local actions, and has no live agent backend. The message format references the official A2UI Basic Catalog, but a complete implementation should use a maintained A2UI renderer with a vetted transport and auth boundary.

## Promotion gate

Before adoption in Primary or Shadow House: official renderer interoperability test, schema validation, full keyboard/mobile/assistive-technology QA, source authentication, zero-side-effect action gate, endpoint access controls, and independent QA/QC approval. No merge or public deployment solely on the basis of this smoke test.

Official protocol: https://github.com/a2ui-project/a2ui/blob/main/specification/v0_9_1/docs/a2ui_protocol.md
