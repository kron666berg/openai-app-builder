<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Agent rules
- All saved-item storage access goes through src/lib/items.ts — keeps UI independent so accounts, uploads and semantic search can be swapped in.
- items table currently allows open (no-login) access only for rows with owner_id NULL — prototype has no accounts; add owner-scoped RLS when auth arrives.
- Search is client-side text filtering (filterItems) — free and simple; replace with server/semantic search later.
