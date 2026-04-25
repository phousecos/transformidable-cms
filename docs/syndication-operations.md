# Syndication — Operations Notes (Transformidable side)

Internal reference for configuring and maintaining the syndication
webhook. For brand-facing integration docs see
[`syndication-integration.md`](./syndication-integration.md).

## What it is

An `afterChange` hook on the `articles` collection that POSTs a
notification to one or more brand sites whenever an article is saved
with `status = "published"`. Source:
`src/collections/hooks/syndicate.ts`, wired in
`src/collections/Articles.ts`.

## Environment variables

For each brand listed in the `syndicateTo` field of `Articles.ts`, set
two env vars in the Payload deployment (Vercel → Project Settings →
Environment Variables):

| Variable                         | Required | Purpose                                   |
| -------------------------------- | -------- | ----------------------------------------- |
| `SYNDICATE_<BRAND>_URL`          | yes*     | Brand site's revalidate endpoint.         |
| `SYNDICATE_<BRAND>_SECRET`       | strongly recommended | Sent as `Authorization: Bearer`. |

\* Required only if you want notifications to flow to that brand.
Missing `_URL` means the brand is silently skipped — useful for partial
rollouts.

`<BRAND>` is the uppercased `syndicateTo` option value with
non-alphanumerics replaced by `_`. Current brands:

| `syndicateTo` value    | Env prefix              |
| ---------------------- | ----------------------- |
| `jerribland`           | `SYNDICATE_JERRIBLAND_` |
| `unlimitedpowerhouse`  | `SYNDICATE_UNLIMITEDPOWERHOUSE_` |
| `agentpmo`             | `SYNDICATE_AGENTPMO_`   |
| `prept`                | `SYNDICATE_PREPT_`      |
| `lumynr`               | `SYNDICATE_LUMYNR_`     |
| `vettersgroup`         | `SYNDICATE_VETTERSGROUP_` |

Example:

```
SYNDICATE_AGENTPMO_URL=https://agentpmo.com/api/revalidate
SYNDICATE_AGENTPMO_SECRET=7f9c...<32+ random bytes>
```

Generate secrets with `openssl rand -base64 32` or similar, share them
with the brand team out of band, and rotate if ever exposed.

## Adding a new brand

1. Add the brand to the `syndicateTo` options in
   `src/collections/Articles.ts` (around `Articles.ts:155-169`).
2. Deploy.
3. Have the brand team stand up a revalidate endpoint per the
   integration guide.
4. Set `SYNDICATE_<NEWBRAND>_URL` and `SYNDICATE_<NEWBRAND>_SECRET`.
5. Publish a test article with only the new brand selected and
   confirm delivery in the brand site's logs.

## Firing rules

The hook fires when:

- Collection operation is `create` or `update`, AND
- `doc.status === "published"`, AND
- `doc.syndicateTo` is a non-empty array.

Event classification:

- `article.published` — `previousDoc` was not published (first
  publish, or republish after unpublish).
- `article.updated` — `previousDoc` was already published (edit).

The hook does **not** fire on:

- Status transitions to `draft` / `review` / `scheduled` (i.e.
  unpublish is silent on the brand side).
- Deletes.
- Autosaves / drafts.

If we need unpublish notifications, extend the hook to also detect
`previousDoc.status === "published" && doc.status !== "published"` and
send an `article.unpublished` event, and add a matching `afterDelete`
hook.

## Failure handling

- Each brand is called with `Promise.allSettled`, so a failure for one
  brand never blocks another brand or the save operation itself.
- Non-2xx responses are logged at `warn` via `req.payload.logger`.
- Network / fetch errors are logged at `error`.
- **There is no retry queue.** If a brand's endpoint is down when the
  webhook fires, you either re-save the article to retrigger or have
  the brand run a backfill from the Payload API. If we start seeing
  drops in practice, add a `SyndicationLog` collection + a cron that
  retries failed deliveries.

## Observability

Hook logs look like:

```
[syndicate] Notified agentpmo of article.published for article 6613...
[syndicate] agentpmo responded 502 for article 6613... (the-transformable-agent)
[syndicate] No SYNDICATE_LUMYNR_URL configured; skipping lumynr
[syndicate] Failed to notify prept for article 6613...: fetch failed
```

Grep Vercel logs for `[syndicate]` to audit delivery.

## Manual test

1. Create or edit an article in the admin.
2. Set `status = "published"` and pick one brand in **Syndicate To**.
3. Save.
4. Check Vercel logs for a `[syndicate] Notified <brand>` line.
5. Confirm the brand site revalidated (check its own logs or hit the
   page with a hard refresh).

For a safe end-to-end test without touching real brand sites, point
`SYNDICATE_<TESTBRAND>_URL` at a request bin (e.g. webhook.site) and
inspect the captured payload.
