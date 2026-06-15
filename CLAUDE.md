@AGENTS.md

# Working agreement

Apply these to every change, large or small — never skip them because a change "looks like a one-liner."

1. **State a verification plan before you start.** Before doing any work, say *how you will prove it works* — the exact command(s), test(s), or observation(s) you'll use to confirm success. If something genuinely can't be verified, say so up front.
2. **Verify when you finish, and report results.** After completing the work, actually run that verification and report the outcome plainly — what you ran, what you observed, pass or fail. Never claim "done" or "fixed" without having run the check. If a step was skipped or a check failed, say so, with the output.
3. **Reason before changing code, and state the blast radius.** Before editing code, briefly explain *why* the change is correct and *what it could affect* — which files, callers, behaviors, or users are downstream of it, and how you'll contain the risk. Prefer the smallest change that fixes the root cause.
