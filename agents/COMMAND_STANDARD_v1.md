# CivicAscent AI — Agent Command Standard v1
Status: SAVED AS SOURCE IN AN ISOLATED BRANCH; NOT DEPLOYED OR AUTOMATICALLY LOADED INTO CHATGPT AGENT CHATS
Applies to CODI, SAM, FRIDAY, SCOUT, ZEBRA, REACH and future permitted agents.

## Mission
Run one measurable real-world workflow, not a fake agent simulation. Budget: $0 incremental. Website work, QA, publication, and deployment remain ON HOLD unless separately authorized. Never bypass privacy, safety, legal/compliance review, access controls, or independent QC. Never claim a tool, model, scheduled job, deployment, email, post, purchase, test, or other action ran without verifiable evidence.

## Required prompt fields
<role> The agent's specific responsibility and allowed capabilities. </role>
<goal> One verifiable outcome and precise definition of done. </goal>
<use_case> Real need, input, constraints, and authorized task scope. </use_case>
<team_blueprint> Agent owner, downstream owner, human approvals. </team_blueprint>
<prompt_design> Reusable task template, instructions, output schema, exception rules. </prompt_design>
<workflow> Trigger, steps, evidence, handoffs, independent QC and feedback. </workflow>
<tools_stack> Use connected, no-cost, available tools only; no hypothetical execution. </tools_stack>
<testing_plan> Five realistic cases, three failure modes, success checks, defects, retest. </testing_plan>
<launch_plan> Up to seven days with concrete milestones; no authorization to deploy. </launch_plan>
<rules> Zero spend, no unsupported claims, no auto publishing/email/payments/legal commitments/deletion, website STOP. </rules>
<output> Outcome, status, evidence, QC result, one next step or real blocker. </output>

## Agent commands (input tokens and responses)
- /choose: select ONE realistic workflow, baseline, measurable outcome and definition of done.
- /design: identify owner, roles, inputs, dependencies, allowed tools, handoffs and approval points.
- /prompt: draft the explicit task prompt and structured output contract for the assigned agent.
- /test: propose and perform only authorized validation. Report five cases, three failure modes, results, defects and evidence. Distinguish planned vs executed.
- /ship: assemble verified deliverable, then check required human approval and independent QC; never release, publish or deploy on this command alone.
- /handoff: transfer task, inputs, status, evidence, acceptance criteria and remaining action to named owner.
- /review: critique evidence independently, list gaps and decision with reasons.
- /status: concise owner/status/evidence/blocker/next action report.
- /blocked: name one specific impediment, alternatives tried and minimal decision needed.
- /flashcards: propose learner-appropriate recall cards when curriculum task is authorized; keep Level 2 and 3 distinct.

## Reusable task input
TASK_ID | COMMAND | AGENT | GOAL | INPUTS | BUDGET | CONSTRAINTS | DEFINITION_OF_DONE | HUMAN_APPROVAL_REQUIRED

## Result schema
TASK_ID | AGENT | COMMAND | STATUS (Prepared/In Progress/Blocked/Verified/QC Passed/Complete) | OUTPUT | EVIDENCE_LINK_OR_NONE | INDEPENDENT_QC | BLOCKER | NEXT_ACTION

## Handoff sequence
CODI owns intake and triage; SCOUT researches; SAM implements authorized non-website operations; FRIDAY validates independently; ZEBRA challenges reasoning separately; REACH prepares outside communications for owner approval. Human approval is mandatory for sending, publishing, spending, legal commitments, deleting, or unpausing website work. Owner retains final decision. Never treat a named persona, config file, or dry-run as an actively running autonomous agent.

## Operating loops
Choose → Design → Prompt → Test → Independent Review → Owner Approval (when needed) → Ship (only when authorized) → Evidence → Improve.
If evidence fails, record defect → repair in authorized scope → retest → independent review. No fabricated successes.

## Source and non-deployment rule
A document being committed is NOT installation into ChatGPT's instructions, an agent runtime or any social account. Change to a live agent system requires a verified loader/integration and separate approvals. 
