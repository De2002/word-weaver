## Role & Permissions Implementation Plan

### Phase 1: Database Changes
1. **Update poems RLS** — Replace `poet` role requirement with `lyric` OR `epic` for publishing
2. **Add `monthly_poem_count` tracking** — Create a function or query to count poems per billing cycle for Lyric quota enforcement (100/month)
3. **Update ink_wallets** — Add `locked_balance` and `available_balance` columns (Lyric earns to locked, Epic earns to available)
4. **Add ad_revenue_pool table** — Track admin-set ad revenue amounts alongside poet pool, distributed to Epic users only

### Phase 2: Backend Logic
5. **Update paddle-webhook** — On downgrade (Epic→Lyric): freeze withdrawals. On expiry: revert to Observer restrictions. On upgrade (Lyric→Epic): unlock withdrawals
6. **Create poem publishing guard** — Database function to check role + monthly quota before insert

### Phase 3: Frontend Enforcement
7. **Role-based UI gating** — Hide/disable publish button for Observers, show quota for Lyric, show full access for Epic
8. **Update PoemEditor** — Check role before allowing submission, show quota remaining for Lyric
9. **Update Wallet page** — Show locked vs available balance, only show withdraw for Epic
10. **Update feed/discovery** — Add Epic spotlight boost to ranking algorithms

### Key Decisions Needed
- Should existing "poet" role users be migrated to "lyric"?
- Should Observers be able to like/comment? (spec says optional)
- What's the minimum withdrawal threshold for Epic?
- How should ad revenue total be input by admin? (Admin dashboard field?)
