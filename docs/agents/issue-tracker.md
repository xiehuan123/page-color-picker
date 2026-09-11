# Issue tracker: Local Markdown

Issues and specs for this repository live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- The authoritative spec is `.scratch/<feature-slug>/spec.md`.
- Implementation issues are separate files under `.scratch/<feature-slug>/issues/`, numbered in dependency order.
- A `Status:` line records triage or implementation state.
- `Blocked by:` names every gating ticket; a ticket is ready only when every blocker is done.
- Comments and evidence updates are appended under `## Work log`.

No GitHub, GitLab, remote, or pull-request workflow is used for this project.
