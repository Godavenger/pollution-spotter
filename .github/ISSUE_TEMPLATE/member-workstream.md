---
name: Member workstream
about: Assign a focused workstream with verifiable tasks and handoffs.
title: "[M#] Workstream title"
labels: "type:workstream"
assignees: ""
---

> For the four initial workstreams, copy the corresponding file from `github-issues/member-1.md` through `member-4.md` into a new Issue instead. This template is for a later, smaller workstream. Replace every placeholder before submitting.

**Owner:** @actual-github-username  
**Reviewer:** @actual-reviewer-username  
**Role label:** choose one of `role:m1-frontend`, `role:m2-backend`, `role:m3-vision`, `role:m4-map-integration`  
**Target window:** H__ to H__  
**Depends on:** #issue-number or “none”  
**Owned paths:** `path/to/file-or-folder`

## Outcome

Describe the observable result in one sentence.

## Tasks

- [ ] TASK-ID: Concrete action. Done when: observable evidence.
- [ ] TASK-ID: Concrete action. Done when: observable evidence.
- [ ] Handoff: Share the agreed interface or finished output with @recipient.

## Evidence and handoff

- Pull request: link here.
- Verification: steps followed and result; include the relevant preview URL or screenshot.
- Remaining dependency: state the owner and next action, or “none”.

## Working agreement

- Check a box only after its stated acceptance criterion passes.
- Add an Issue comment for a blocker, mention its owner, and apply `status:blocked`; remove the label when resolved.
- Use an actual GitHub account in the Assignees field. Text such as `@member1` is only a placeholder.
- Keep this Issue as the progress source. PDF and repository Markdown boxes do not synchronize with it.
- Close the Issue after all required tasks pass and the reviewer accepts the handoff.
