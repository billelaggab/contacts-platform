# PressContacts SaaS Platform

Specialized Contact Management SaaS tailored for journalists and media professionals.

## Implemented Architecture

### 1. Database & Models (Prisma)
- **User**: Multi-role (SUPER_ADMIN, JOURNALIST, ORG_ADMIN, PR_REP) with strict status verification (PENDING, APPROVED, REJECTED, SUSPENDED) and pressCardUrl.
- **Contact**: Tiered access (PUBLIC_PR, VIP, PRIVATE), syncVersion, deletedAt for soft delete sync engines.
- **ContactPhoneNumber**: Dynamic multi-label contact phones.
- **MediaAsset**: High-resolution press kit images separate from avatars.
- **ContactHistory**: Career timeline.
- **JournalistNote**: Private notes per journalist.
- **ContactAccessRequest**: Gatekept access approval engine for VIP contacts.
- **ContactReport**: Crowdsourced verification reporting system.
- **AuditLog**: Traceability for all access/reveal events.

### 2. Tiered Access & Gatekept Onboarding
- **Middleware Guard**: Automatically restricts unapproved users to `/pending-approval`.
- **VIP Contact Masking**: Hides sensitive phones/emails until access is requested and approved by Super Admin.
- **Private Contacts**: Strictly scoped to the creator with built-in Confidentiality Charter warnings.

### 3. Native Sync API
- **Route**: `GET /api/v1/sync/contacts?since=...`
- Returns updated, created, and soft-deleted contacts optimized for the Android Sync Engine.

### 4. Admin Workflows
- Review press cards, approve/reject user onboardings.
- Review and unlock VIP access requests.
