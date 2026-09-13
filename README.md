# Vanilla OS On-going Update Check
This GNOME Extension checks if the system is undergoing an update and allows 
the user to request a cancelation of the update process.

In Vanilla OS, the update process is handled by ABRoot, each update consists of
multiple stages, and the process can be canceled until the 6th stage is reached.
This extension checks if ABRoot allows the user to cancel the update process and
lets the user request a cancelation by adding a lock file to /tmp.

## Use of Generative AI

Maintainers may use generative AI tools as assistants while working on vso-gnome-ext. Non-trivial assisted commits disclose the tool, model, and scope of the work.

AI tools may assist with code comments, documentation, repetitive code, and issue triage. Maintainers make project decisions and review every assisted change before it is merged.

Use these trailers for non-trivial assisted commits:

```plain
Assisted-by: <tool>:<model-version>
AI-Scope: <what the tool generated and the prompt or a short prompt summary>
```

Single-line completions, renames, and formatting changes do not need trailers.

Coding agents must also follow [AGENTS.md](AGENTS.md) before changing files,
creating commits, or opening pull requests.
