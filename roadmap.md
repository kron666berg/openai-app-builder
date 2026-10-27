# Roadmap

## Auth (done)
- [x] Google sign-in (managed, free)
- [x] items.owner_id = auth.uid(), owner-scoped RLS, anon access revoked
- [x] /auth page; library routes under _authenticated; landing at /
- [x] Session-aware header (email + sign out), root auth listener
- [x] Two-account isolation verified (anon denied, cross-user read/update/delete blocked)

## Later
- Semantic search (Lovable AI)
- File uploads
- Optional: delete test users stash-test-a/b@example.com from auth
