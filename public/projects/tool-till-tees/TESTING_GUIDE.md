# Testing Guide

## Running Tests

```bash
npm test            # run all tests once
npm run test:watch  # run tests in watch mode
npm run typecheck   # TypeScript type checking
```

Note: `api/__tests__/` is excluded from `tsconfig.json` — tests run under vitest separately.

## Existing Test Coverage

### `api/__tests__/health.test.ts`
- GET /api/health returns 200 with `{ status: "ok" }`
- OPTIONS preflight returns 204

### `api/__tests__/send-interest.test.ts`
- OPTIONS preflight returns 204
- GET request rejected with 405
- Missing name returns 400
- Name exceeding 100 chars returns 400
- Missing email returns 400
- Invalid email format returns 400
- Email exceeding 254 chars returns 400
- Missing message returns 400
- Message exceeding 2000 chars returns 400
- Null body returns 400
- Honeypot filled returns 400 (spam detected)
- Missing SMTP_HOST returns 500
- Missing RECIPIENT_EMAIL returns 500
- Successful send returns 200 with `{ success: true }`
- sendMail called with correct to, replyTo, subject, and text
- sendMail rejection returns 500

### `api/__tests__/sancio/validation.test.ts`
- Project input validation (title required, max length, description max length) — 8 tests
- Agreement input validation (project_id required, title required, max length) — 7 tests
- Module input validation (agreement_id required, title required, content max length) — 8 tests
- Module update validation (title, content, nudge_period_days, auto_expire) — 8 tests
- Note input validation (agreement_id required, content required, source enum) — 9 tests
- Proposal input validation (module_id required, proposed_content required, max length) — 8 tests
- **Total: 48 tests**

### `api/__tests__/sancio/invite.test.ts`
- OPTIONS preflight returns 204
- Non-POST rejected with 405
- Auth failure returns early
- Missing project_id returns 400
- Invalid email returns 400
- Short passphrase returns 400
- Non-creator returns 403
- Hashes passphrase with bcrypt cost 12
- **Total: 8 tests**

### `api/__tests__/sancio/verify-passphrase.test.ts`
- OPTIONS preflight returns 204
- Non-POST rejected with 405
- Missing project_id returns 400
- Wrong passphrase returns 401
- Joining own project returns 400
- Correct passphrase succeeds with signature log and notification
- **Total: 6 tests**

### `api/__tests__/sancio/projects.test.ts`
- OPTIONS preflight returns 204
- Non-GET/POST rejected with 405
- Lists projects for authenticated user
- Returns 500 on database error
- Creates project with title (201)
- Rejects missing title (400)
- Rejects title exceeding max length (400)
- **Total: 7 tests**

### Not yet covered
- `api/forms/index.ts` — list/create forms
- `api/forms/[id].ts` — get/update/delete form
- `api/forms/[id]/publish.ts` — publish form
- `api/forms/[id]/submissions.ts` — list submissions
- `api/public/forms/[slug].ts` — public form fetch
- `api/public/forms/[slug]/submit.ts` — public form submission
- `api/submissions/[id].ts` — update submission status
- `lib/form-validation.ts` — field type validation
- `lib/form-conditions.ts` — condition evaluation
- `lib/slug.ts` — slug generation
- `lib/auth.ts` — JWT authentication

## Manual Test Scenarios

### Health Check
1. `GET /api/health`
2. Expect: `{ "status": "ok" }` with status 200

### Root Status
1. `GET /api`
2. Expect: `{ "name": "Tool Till Tees API", "status": "ok" }` with status 200

### Interest/Contact Submission
1. `POST /api/send-interest` with `{ "name": "Test", "email": "test@example.com", "message": "Hello" }`
2. Expect: `{ "success": true }` with status 200
3. Verify email arrives at `RECIPIENT_EMAIL`

### Forms CRUD (requires auth token)
1. `POST /api/forms` with `{ "title": "My Form" }` — creates a form, expect 201
2. `GET /api/forms` — lists forms, expect array containing the new form
3. `GET /api/forms/:id` — returns the specific form
4. `PUT /api/forms/:id` with `{ "title": "Updated Title" }` — updates form, expect 200
5. `PUT /api/forms/:id` with `{ "status": "published" }` — publishes the form, expect 200 with `published_at` set
6. `DELETE /api/forms/:id` — deletes the form, expect 204

### Publish Shortcut
1. Create a draft form
2. `POST /api/forms/:id/publish` — expect 200 with `status: "published"` and `published_at` set
3. Verify form is now accessible via public endpoint

### Form Submissions Listing
1. Create and publish a form
2. Submit data via public endpoint (see below)
3. `GET /api/forms/:id/submissions` — expect array containing the submission
4. Verify submissions are ordered by `submitted_at` descending
5. Try with a form ID that doesn't belong to you — expect 404

### Public Form View & Submit
1. Publish a form (see above)
2. `GET /api/public/forms/:slug` — returns definition and public settings (no `notification_emails`)
3. `POST /api/public/forms/:slug/submit` with `{ "data": { "field-id": "value" } }` — submits data, expect 201
4. Verify submission appears in `form_submissions` table
5. Try accessing a draft form's slug — expect 404

### Submission Status Update
1. Create a submission (see above)
2. `PUT /api/submissions/:id` with `{ "status": "read" }` — expect 200 with updated submission
3. `PUT /api/submissions/:id` with `{ "status": "archived" }` — expect 200
4. Try invalid status — expect 400
5. Try updating a submission for a form you don't own — expect 404

### Validation Testing
1. Submit a form with a required field missing — expect 422 with field errors
2. Submit with a hidden conditional field filled — verify it's stripped from stored data
3. Submit with extra fields not in the definition — verify they're stripped
4. Submit with wrong types (string for number field, etc.) — expect 422

## Regression Checklist

- [ ] Health endpoint returns 200
- [ ] Root endpoint returns API name and status
- [ ] Interest form validates all fields correctly
- [ ] Interest form honeypot blocks bots
- [ ] Interest form sends email successfully
- [ ] Forms CRUD requires authentication (401 without token)
- [ ] Unauthenticated requests to /api/forms return 401
- [ ] Forms are scoped to the authenticated user (can't see other users' forms)
- [ ] Form create generates a unique slug
- [ ] Form update with duplicate slug returns 409
- [ ] Form publish sets `published_at` timestamp
- [ ] Publish shortcut endpoint works
- [ ] Published forms accessible via public endpoint
- [ ] Draft/archived forms NOT accessible via public endpoint
- [ ] Public endpoint strips `notification_emails` from settings
- [ ] Form submission validates against form definition
- [ ] Conditional fields are evaluated correctly during submission
- [ ] Hidden fields are stripped from submission data
- [ ] Extra fields are stripped from submission data
- [ ] Submissions listing requires ownership of the parent form
- [ ] Submission status can only be updated by form owner
- [ ] Form deletion cascades to submissions
- [ ] SMTP notification failure does not block submission save
- [ ] TypeScript type check passes (`npm run typecheck`)
- [ ] All existing tests pass (`npm test`)
