# CivicAscent AI — Librarian Continuous Resource Discovery Rule

Status: ACTIVE GOVERNANCE RULE
Owner authority: Executive Owner
Applies to: Agent 5 — Software Librarian, Steward & Independent Control Auditor; ChatGPT QC Overseer; all agents evaluating software, plugins, connectors, libraries, services, and technical resources.

## Purpose

Agent 5 continuously searches for new software, plugins, connectors, libraries, frameworks, accessibility tools, AI tools, design tools, analytics tools, security tools, automation tools, and other resources that could materially improve CivicAscent AI.

## Continuous Monitoring Rule

1. Agent 5 operates a continuous discovery watch 24 hours a day, 7 days a week, 365 days a year through the highest supported automation cadence.
2. The watch checks for materially new or newly relevant software/plugin resources and meaningful changes to already-known resources.
3. Duplicate, irrelevant, paid-only, unsafe, abandoned, or low-value resources should not be promoted merely because they are new.
4. Discovery is separate from approval. A newly discovered resource begins as CANDIDATE.

## Candidate Review Gate

Every new candidate must be evaluated before it is added to the approved CivicAscent resource library.

Required review dimensions:
- fit with CivicAscent mission and current Safari direction;
- accessibility and older-user usability impact;
- mobile/browser compatibility;
- security/privacy implications;
- licensing and provenance;
- performance impact;
- cost and free-tier availability;
- overlap or duplication with current tools;
- maintenance status and vendor reliability;
- practical value to product, operations, marketing, learning, or business outcomes;
- whether the tool introduces unnecessary complexity.

## Agent Approval Sequence

A candidate may move forward only after:
1. Agent 5 verifies facts, availability, licensing, cost, duplication, and technical risk.
2. Agent 1 reviews experience/design relevance when applicable.
3. Agent 2 reviews engineering feasibility, dependency impact, and implementation risk when applicable.
4. Agent 3 reviews accessibility, usability, and QA implications when applicable.
5. Agent 4 reviews creative/media relevance when applicable.
6. Agent 6 reviews strategic/business value and tradeoffs when applicable.
7. ChatGPT QC Overseer confirms all required reviews passed and no known defect or unresolved conflict remains.

Possible states:
CANDIDATE | REVIEWING | REJECTED | APPROVED RESOURCE | OWNER APPROVAL REQUIRED

## Installation / Connection Rule

Approval as a resource does not equal permission to install, connect, subscribe, purchase, or deploy.

Any action that installs or connects a plugin/service, grants permissions, incurs cost, changes credentials, changes production, or modifies protected infrastructure requires explicit owner approval at the time of that action.

Approved resources may be documented in the resource library before installation.

## Daily Update Report

Agent 5 produces one daily update report containing:
- newly discovered candidates;
- approved additions;
- rejected candidates and reason;
- meaningful updates to existing approved resources;
- cost/free-tier changes;
- security/licensing concerns;
- duplicate/overlap findings;
- recommendations requiring owner approval;
- confirmation that no production changes were made without authorization.

If nothing material changed, the report states: NO MATERIAL RESOURCE CHANGES.

## Hard Gate Before Any Agreed Change

Before any agreed resource-library, governance, tooling, dependency, plugin, connector, or implementation change is applied:

1. Create a hard-gate save point from the current verified state.
2. Record the exact branch/commit/version.
3. Confirm the save point is recoverable.
4. Email a copy of the save-point reference and recovery details to kpeters9@gmail.com.
5. Only after those steps are verified may the agreed change be applied.
6. After the change, rerun the applicable CivicAscent gates.
7. A failed gate stops progression until repaired and retested.

No save point + no emailed recovery copy = NO CHANGE.

## Resource Addition Standard

A resource is considered added to the CivicAscent approved resource library only when:
- required agent reviews are complete;
- QC Overseer confirms PASS;
- no unresolved cost/security/licensing/accessibility conflict remains;
- the resource is recorded with purpose, status, cost, limitations, and owner-approval requirements;
- the pre-change hard save point and email requirement has been satisfied for any actual project change.

## No Silent Changes

Agent 5 may discover, analyze, compare, and report continuously.
Agent 5 may not silently install, connect, subscribe, purchase, deploy, or alter production.

## Standing Report Format

LIBRARIAN DAILY RESOURCE REPORT

Date:
Discovery window:
New candidates:
Approved additions:
Rejected:
Existing-resource updates:
Cost changes:
Security/licensing notes:
Agent review status:
Owner approvals required:
Hard-gate save points created:
Emails sent:
Production changed: YES / NO
Open blockers:
Next review actions:
