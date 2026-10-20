# Put the plan on GitHub and track completion

This pack contains the plan, PDF, Issue text, and collaboration templates. It is **not an application scaffold**: the four members still need to create the Next.js app, database, vision adapter, and map following the plan. No repository, Issues, account invitations, or deployment have been created for you.

Read [Pollution_Spotter_4_Member_Pipeline.pdf](../Pollution_Spotter_4_Member_Pipeline.pdf) for the pipeline and acceptance criteria. Use four GitHub workstream Issues as the team's shared progress record. Member 4 coordinates this setup; Member 2 owns application root configuration and deployment. All hours below are elapsed hours from the team kickoff.

## 1. Create the repository and upload this pack

1. Sign in to GitHub. Select **+ → New repository**, name it `pollution-spotter`, and choose visibility. A private repository works for team development; grant judges access only if required. Initialize with a README so the default branch exists, then select **Create repository**.
2. Open the repository's **Code** tab and select **Add file → Upload files**. Extract the planning ZIP locally, then upload the **contents of its root**, preserving folder paths. The PDF should be at the repository root and this guide should be at `docs/GITHUB_SETUP.md`; do not nest everything inside a ZIP-named folder. Upload extracted files, not only the ZIP.
3. Include the `.github` directory. If your file picker hides it, drag the directory from File Explorer or use **Add file → Create new file** and paste each template using its complete path, for example `.github/ISSUE_TEMPLATE/member-workstream.md`. The leading dot and directory names matter.
4. If GitHub reports a collision with the initialized README, omit that README from the batch and edit the existing README separately with the pack's content. Commit the upload with a clear message such as `docs: add hackathon planning pack`.
5. Confirm the repository contains the PDF, `github-issues/member-1.md` through `member-4.md`, `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/labels.json`, and this guide. Issue templates become available when their files are on the default branch. In **Settings → General → Features**, enable **Issues** if needed.

Do not upload `.env.local`, API keys, Supabase service credentials, `node_modules`, or private photos. The app scaffold comes later. Because this repository already has planning files, Member 2 should create the scaffold in a separate temporary folder and copy its application files deliberately into this repository, preserving the planning pack and existing Git history.

## 2. Add teammates and replace placeholders

1. A repository administrator opens **Settings → Collaborators** or **Collaborators and teams**, selects **Add people**, and invites the other three GitHub accounts. Each teammate accepts the invitation. Give contributors the ability to edit Issues and push feature branches; organization policies may require an administrator.
2. Record actual accounts in the table below by editing this file with the pencil button and committing the change. `@member1`, `@member2`, `@member3`, and `@member4` are placeholders, not assigned accounts.
3. Replace those placeholders in the four workstream Issue bodies before creating the Issues. Choose actual accounts in GitHub's **Assignees** sidebar: writing an `@mention` in text does not assign someone.

| Member | Responsibility | Replace with actual account | Role label |
| --- | --- | --- | --- |
| M1 | Frontend: upload, location, review, complaint UI | `@member1` | `role:m1-frontend` |
| M2 | Backend: contracts, API, Supabase, auth, deployment | `@member2` | `role:m2-backend` |
| M3 | Vision: adapter, schema, fixtures, evaluation | `@member3` | `role:m3-vision` |
| M4 | Map, hotspots, integration QA, project, demo | `@member4` | `role:m4-map-integration` |

## 3. Create the labels

Open **Issues → Labels → New label** and create the names, colors, and descriptions in [.github/labels.json](../.github/labels.json). Existing default labels may remain.

`labels.json` is a reference list: GitHub does **not** import or create labels just because the file exists. Create these labels through the web UI before using the Issue templates. Optional GitHub CLI/API label creation can be added later by a repository administrator; no automation is required or supplied as a running workflow.

## 4. Create four real workstream Issues

Create one Issue per member. Each source file contains that role's ordered task list; keep the task IDs and acceptance criteria intact.

| Issue title | Copy this source | Assign | Add labels |
| --- | --- | --- | --- |
| M1: Frontend upload, review, and complaint | [member-1.md](../github-issues/member-1.md) | Actual M1 account | `type:workstream`, `role:m1-frontend` |
| M2: Backend, data, and deployment | [member-2.md](../github-issues/member-2.md) | Actual M2 account | `type:workstream`, `role:m2-backend` |
| M3: Vision adapter and evaluation | [member-3.md](../github-issues/member-3.md) | Actual M3 account | `type:workstream`, `role:m3-vision` |
| M4: Map, integration, and demo | [member-4.md](../github-issues/member-4.md) | Actual M4 account | `type:workstream`, `role:m4-map-integration` |

For each row:

1. Open the source file on GitHub and select **Raw**. Copy the raw Markdown, including each `- [ ]` task marker; copying only the rendered page may lose checkbox syntax.
2. Open **Issues → New issue → Open a blank issue**. Paste the Markdown in the **body**, replace member placeholders, and use the title above. If GitHub offers a template chooser, the blank Issue option is enabled by this pack.
3. Set the actual assignee and the two labels. Preview the body to confirm unchecked task boxes, then submit. This creates the interactive Issue; uploading `member-1.md` alone does not create one.
4. Record the four Issue numbers in a pinned coordination Issue or the repository README. Replace dependency placeholders with these real `#numbers` and actual teammate mentions.

The [member workstream template](../.github/ISSUE_TEMPLATE/member-workstream.md) is for a smaller follow-up workstream. It intentionally does not duplicate the 48 core tasks. Use the [bug template](../.github/ISSUE_TEMPLATE/bug_report.md) for reproducible failures.

## 5. Use checkboxes correctly

The three formats hold independent state:

| Where the box appears | How it changes | Does it synchronize? |
| --- | --- | --- |
| GitHub Issue body or comment | A user with the required edit permission clicks the task box, or edits the body | No; it updates that Issue/comment only |
| Markdown file in the repository | Open the pencil editor, change `- [ ]` to `- [x]`, then commit or propose the edit | No; it updates that file only |
| PDF | Mark a printed copy, or annotate it with a PDF reader | No; the PDF is a static reference |

The PDF's boxes are intended for reading/printing or annotations, not GitHub controls or guaranteed fillable PDF forms. GitHub Issues are the recommended progress source so the team does not maintain three competing trackers. If a task box cannot be changed, check that you are signed in, the invitation was accepted, and your account can edit that Issue. An assignee field by itself does not grant repository permission.

Before checking a task, run its stated verification and add evidence when useful: PR link, deployed URL, safe screenshot, or test result. Comment with the blocked task ID, dependency, and next action if work stops; apply `status:blocked` to the affected workstream and mention the teammate who can help. Remove the label when work resumes. Close a workstream only after all required tasks pass and the reviewer accepts the handoff.

## 6. Optional GitHub Projects board

Member 4 can open the repository **Projects** tab and create or link a GitHub Project with a Board view. Creating an account/organization Project may require additional permission. The four Issues alone are sufficient if a Project is unavailable.

1. Add the four **existing repository Issues** to the Project. Do not create disconnected draft cards with duplicate task lists.
2. Configure the Project's **Status** field to contain `Todo`, `In progress`, `Blocked`, and `Done`.
3. Add optional fields `Owner`, `Target hour`, and `Gate`; keep the actual repository Issue assignee as the ownership record.
4. Move a card to `In progress` when work starts and `Blocked` when it needs help. A checked Issue task does not automatically move a Project card. Update status explicitly unless the team has intentionally enabled a matching Project workflow.
5. Set `Done` only after the Issue's required tasks and reviewer acceptance pass. Optional follow-up work should have its own Issue labeled `scope:optional`.

## 7. Run the three release gates

Member 4 coordinates the checkpoint, and all four members verify their area. Put these gates in a coordination Issue or create three short gate Issues, then link the relevant workstream tasks. Check a gate only when the whole condition passes. These are acceptance checkpoints, not automatic GitHub deployment controls.

- [ ] **H6 — Mocked thin slice:** agreed contracts connect image selection and production-shaped draft/review/map/complaint fixtures. This is a fixture-driven preview; the real publish backend and final review/complaint UI arrive at H8-12. All simulated reports stay visibly in the sample layer. Each owner confirms the interface and handoff; resolve contract drift before polish.
- [ ] **H12 — Live core flow:** on the deployed app, a real image creates a private draft, live vision suggests labels, a human confirms them, publication updates the map, and complaint text can be copied/downloaded. Provider failure clearly offers manual review; draft creation failure does not pretend to succeed. Member 2 verifies owner-only write access and private photo storage.
- [ ] **H24 — Demo acceptance:** the deployed phone flow works; map polling and hotspot rules pass; sample markers remain visibly separate; empty/error/retry states work; private fields are absent from public responses; complaints are editable drafts; the team has rehearsed the demo and prepared screenshots/video as backup. Freeze required feature changes at H22 and use H22–24 for delivery.

At any failed gate, create focused bug Issues, assign the responsible member, and reduce optional work. Do not mark a gate done because its target hour has elapsed. H24–36 is optional improvement time after the H24 acceptance criteria pass.

## 8. First-time local Git workflow

Install Git and sign in to GitHub using the supported browser/Git Credential Manager flow. Clone the repository once. The commands below are examples for **PowerShell**; replace `YOUR-ACCOUNT` with the repository owner. Run them in a directory where a new `pollution-spotter` folder can be created, not inside an existing clone.

```powershell
git clone https://github.com/YOUR-ACCOUNT/pollution-spotter.git
Set-Location pollution-spotter
git status
```

If Git asks for an identity, set your name and GitHub-verified or GitHub-provided no-reply email for this repository:

```powershell
git config user.name "Your Name"
git config user.email "YOUR-VERIFIED-OR-NOREPLY-EMAIL"
```

Before starting a task, confirm `git status` says the working tree is clean. If it lists changes, finish or safely preserve your current work before switching branches; ask a teammate if unsure. The examples assume the default branch is `main`; substitute the actual default branch if it differs.

```powershell
git switch main
git pull --ff-only origin main
git switch -c m1/upload-preview
```

Use a descriptive branch per focused change, for example `m2/draft-api`, `m3/vision-adapter`, or `m4/map-markers`. Coordinate edits to shared files: Member 2 owns `lib/contracts.ts` and root configuration; Member 1 reserves a client-only map slot for Member 4. Pull the merged scaffold before creating feature branches that depend on it.

After changing and verifying files, review the diff and stage **only the intended files**. This example applies after Member 1 has created the named component; use the real paths for your task.

```powershell
git status
git diff
git add components/report/UploadForm.tsx
git diff --cached
git commit -m "feat: add image upload preview"
git push -u origin m1/upload-preview
```

Open **Compare & pull request** on GitHub, fill in the [PR template](../.github/PULL_REQUEST_TEMPLATE.md), include task IDs and `Refs #your-workstream-number`, and request the reviewer named in the plan. A teammate reviews, then merges through GitHub. Use `Closes #...` only if the PR completes the **whole Issue**; otherwise merging may close unfinished work prematurely.

After merge, check the finished task boxes in the workstream Issue. Before the next task, with a clean working tree, switch to `main`, pull with `--ff-only`, and create a new task branch. If a pull cannot fast-forward or Git reports conflicts, stop that Git operation and resolve them with the teammate who owns the affected files; do not use a force push or a hard reset. A merge conflict is a request to reconcile both changes, not to discard a teammate's work.

## Team rhythm

At each gate and roughly every two hours, each member reports: completed task IDs with evidence, the next task ID, and any blocker plus its owner. Keep the discussion on the linked Issues so handoffs remain visible. This planning pack supplies the workflow; your team creates and updates the actual GitHub records.
