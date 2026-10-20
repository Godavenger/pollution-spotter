# GitHub setup and completion tracking

The private repository is [Godavenger/pollution-spotter](https://github.com/Godavenger/pollution-spotter), on default branch `main`. This repository contains the eight-hour planning pack and presentation materials; the application still needs to be built. GitHub workstream Issues have **not** been created.

Team name: **Pollution Spotter**. Team leader: **Sharanya Mondal**. The four workstream roles are still **unassigned**; repository access does not assign a role.

Read [the pipeline](../PIPELINE.md) and [the pipeline PDF](../Pollution_Spotter_4_Member_Pipeline.pdf) for the 24 tasks, six per role. The build window is **10:00 AM–6:00 PM IST on 31 October 2026**. H0 means 10:00 AM; H8 means 6:00 PM.

## 1. Check access to the existing repository

The following status was verified through the GitHub API on **20 October 2026**. Invitations can change after this check.

| GitHub account | Repository access | Workstream |
| --- | --- | --- |
| `Godavenger` | Owner/admin | Unassigned |
| `Sangeeta2006451` | Write access accepted | Unassigned |
| `Shivi3123` | Write invitation pending | Unassigned |
| `deeparkai32109-alt` | Write invitation pending | Unassigned |

Teammates with pending invitations should accept their existing invitation while signed into the matching GitHub account, then open the repository. An administrator can review status in **Settings → Collaborators**. Do not create a duplicate repository or send duplicate invitations to start this plan.

Keep the repository private unless the team chooses otherwise or an organizer specifies a submission requirement. The public event page does not establish a repository-visibility rule. A private repository link requires appropriate access for reviewers.

## 2. Confirm files and assign the four roles

The repository should contain the pipeline PDF, `PIPELINE.md`, `GITHUB_TRACKER.md`, `github-issues/member-1.md` through `member-4.md`, `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/labels.json`, `docs/` and `presentations/`. Update files in this existing repository and preserve the folder paths and Git history. Do not upload only a ZIP or nest the pack inside a ZIP-named folder.

Do not commit `.env.local`, API keys, Supabase service credentials, `node_modules` or private photos. M2 creates the Next.js scaffold in a separate temporary folder and copies the intended application files into the clone, preserving the planning files; see [application setup](APP_SETUP.md).

At kickoff, agree on an owner for each workstream and replace the role placeholders in the tracker and Issue bodies. Until that conversation is complete, keep them explicitly unassigned.

| Role | Responsibility | Actual account | Role label |
| --- | --- | --- | --- |
| M1 | Frontend: upload, location, review and complaint copy UI | **Unassigned** (`@member1` placeholder) | `role:m1-frontend` |
| M2 | Backend: contracts, API, Supabase, anonymous ownership and deployment | **Unassigned** (`@member2` placeholder) | `role:m2-backend` |
| M3 | Vision: adapter, fixtures and six smoke cases | **Unassigned** (`@member3` placeholder) | `role:m3-vision` |
| M4 | Map, integration checks and demo | **Unassigned** (`@member4` placeholder) | `role:m4-map-integration` |

Choose real accounts in each Issue's **Assignees** sidebar. An `@mention` in the body does not assign an Issue or grant repository access.

## 3. Create labels and four workstream Issues

In **Issues → Labels**, create or update the names, colors and descriptions from [.github/labels.json](../.github/labels.json). The JSON file is a reference; uploading it does not create labels. If needed, enable Issues in **Settings → General → Features**.

Create one Issue for each source below. The 24 task checkboxes in these files become interactive when copied into real Issue bodies.

| Issue title | Copy this source | Assignee | Labels |
| --- | --- | --- | --- |
| M1: Frontend and reporting | [member-1.md](../github-issues/member-1.md) | Agreed M1 account | `type:workstream`, `role:m1-frontend` |
| M2: Backend and deployment | [member-2.md](../github-issues/member-2.md) | Agreed M2 account | `type:workstream`, `role:m2-backend` |
| M3: Vision and smoke checks | [member-3.md](../github-issues/member-3.md) | Agreed M3 account | `type:workstream`, `role:m3-vision` |
| M4: Map, integration and demo | [member-4.md](../github-issues/member-4.md) | Agreed M4 account | `type:workstream`, `role:m4-map-integration` |

For each row:

1. Open the source file on GitHub, select **Raw**, and copy the raw Markdown so every `- [ ]` marker is preserved.
2. Open **Issues → New issue → Open a blank issue** and paste the Markdown into the body. Replace the member/reviewer placeholders with agreed accounts. If roles have not been assigned, leave the actual Assignees field empty and state **Unassigned** in the body.
3. Set the title and labels, preview the unchecked task boxes, then submit. A file in `github-issues/` is not itself a GitHub Issue.
4. Record the four Issue numbers in the tracker or a coordination Issue. Replace dependency placeholders with real `#numbers` and agreed account mentions.

The [member workstream template](../.github/ISSUE_TEMPLATE/member-workstream.md) is for a smaller follow-up workstream. Use the [bug template](../.github/ISSUE_TEMPLATE/bug_report.md) for a reproducible blocker.

## 4. Use checkboxes as the progress record

| Where a checkbox appears | How it changes | Synchronization |
| --- | --- | --- |
| GitHub Issue body or comment | A user with edit permission clicks the box or edits the body | That Issue/comment only |
| Repository Markdown file | Change `- [ ]` to `- [x]` in the editor, then commit or propose the edit | That file only |
| PDF | Mark a printed copy or annotate with a PDF reader | Static reference only |

Use the four GitHub Issues as the live progress record. The PDF boxes are printable, not guaranteed fillable forms. These copies do not synchronize.

Before checking a task, perform its stated verification and attach useful evidence: a PR link, deployed URL, safe screenshot or check result. For a blocker, comment with the task ID, dependency and next action; add `status:blocked` and mention the teammate who can resolve it. Remove that label when work resumes. Close a workstream only after required tasks pass and its reviewer accepts the handoff.

If boxes cannot be changed, check sign-in, invitation acceptance and permission to edit the Issue. Being listed as an assignee alone does not grant repository access.

## 5. Run the eight-hour gates

M4 coordinates each checkpoint; every role verifies its area. These are team acceptance checkpoints, not automatic GitHub deployment controls. Use the detailed conditions in [PIPELINE.md](../PIPELINE.md).

| Gate | IST | Required evidence |
| --- | --- | --- |
| **H1** | 11:00 AM | Contracts agreed, credentials/model access checked and scaffold ready. Owners and handoffs are explicit. |
| **H3** | 1:00 PM | Persisted manual or visibly mocked slice reaches review, publication and the map. Mock reports remain in the sample view. |
| **H5** | 3:00 PM | Complete persisted flow includes complaint copy. Live vision works, or the team locks the clearly labeled manual fallback and records live AI as unmet. Failed uploads never pretend to succeed. |
| **H7** | 5:00 PM | Feature freeze after phone/integration checks, owner-only write checks and private-photo/public-response checks. Fix blockers only. |
| **H8** | 6:00 PM | Demonstration rehearsed, presentation ready and screenshots/video available as backup; submit through the organizer's announced process. |

The MVP is one photo → confirmed location → private draft → suggested visible labels or manual fallback → mandatory owner review → published map report → editable complaint text to copy. Map updates run on load, after publication and with **Refresh**. Photos remain private. Keep sample reports separate from real reports.

Hotspots, background polling, client image compression, notes, complaint downloads/persistence, a 20-case evaluation and extra features are deferred. M3 uses six focused smoke cases. If a gate fails, cut optional work and fix the smallest blocking problem; a target time passing does not mean a gate passed.

## 6. Optional Project board

The four Issues are sufficient for eight hours. If useful, M4 can link them to a GitHub Project with `Todo`, `In progress`, `Blocked` and `Done` statuses. Add existing repository Issues rather than duplicate draft cards. Update board status explicitly unless a matching Project workflow has been enabled. Mark `Done` only after task verification and review.

## 7. Local Git workflow

Install Git and use the supported browser/Git Credential Manager sign-in flow. Clone once from a parent directory where a new `pollution-spotter` folder can be created. Do not clone inside an existing clone.

```powershell
git clone https://github.com/Godavenger/pollution-spotter.git
Set-Location pollution-spotter
git status
```

If Git needs your commit identity, set your own name and GitHub-verified or no-reply email for this repository:

```powershell
git config user.name "Your Name"
git config user.email "YOUR-VERIFIED-OR-NOREPLY-EMAIL"
```

Start a focused branch only after confirming the working tree is clean. Finish or safely preserve existing changes before switching branches.

```powershell
git switch main
git pull --ff-only origin main
git switch -c m1/upload-preview
```

Use branches such as `m2/draft-api`, `m3/vision-adapter` and `m4/map-markers`. M2 owns `lib/contracts.ts`, root configuration and the lockfile; M1 reserves a client-only map slot for M4. Pull the merged scaffold before branching for dependent work.

After implementing and verifying a task, inspect the diff and stage only its intended paths. This example applies once the named component exists; use the real paths for your task.

```powershell
git status
git diff
git add components/report/UploadForm.tsx
git diff --cached
git commit -m "feat: add image upload preview"
git push -u origin m1/upload-preview
```

Open **Compare & pull request**, fill in the [PR template](../.github/PULL_REQUEST_TEMPLATE.md), include task IDs and `Refs #your-workstream-number`, and request the agreed reviewer. A teammate reviews and merges through GitHub. Use `Closes #...` only when the PR completes the entire Issue.

After merge, check verified task boxes. With a clean working tree, switch to `main`, pull with `--ff-only`, then create the next branch. If a pull cannot fast-forward or a merge conflicts, reconcile the affected changes with their owner. Do not discard teammates' work with a force push or hard reset.

At each gate and roughly every hour, report completed task IDs with evidence, the next task and any blocker. Keep the discussion on linked Issues so handoffs remain visible.
