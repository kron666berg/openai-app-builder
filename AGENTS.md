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

- All saved-item storage access goes through src/lib/items.ts — keeps UI independent so uploads and semantic search can be swapped in.
- items rows are owned via owner_id (default auth.uid()); RLS policies scope all CRUD to the owner, anon has no grants. Keep every new policy owner-scoped.
- Library routes live under src/routes/_authenticated/ (managed gate redirects to /auth); only the landing (/) and /auth are public.
- Google sign-in goes through lovable.auth.signInWithOAuth (managed broker) — never supabase.auth.signInWithOAuth for Google.
- Search is client-side text filtering (filterItems) — free and simple; replace with server/semantic search later.
