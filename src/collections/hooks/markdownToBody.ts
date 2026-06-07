import type { CollectionBeforeValidateHook } from 'payload'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

/**
 * Derives the Lexical `body` from `bodyMarkdown` on save.
 *
 * `bodyMarkdown` is the source of truth — it's what the automated pipeline
 * (n8n) and editors author. The Transformidable frontend renders the Lexical
 * `body`, so we convert markdown → Lexical here and write it to `body`. This
 * lets a save succeed with markdown alone; no caller has to hand-build
 * Lexical JSON.
 *
 * We only (re)generate when there's markdown to convert AND it actually
 * changed, or `body` is empty — so we neither clobber unnecessarily nor
 * recompute on every unrelated save.
 */
export const deriveBodyFromMarkdown: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data

  const markdown = data.bodyMarkdown
  if (typeof markdown !== 'string' || markdown.trim() === '') return data

  const markdownChanged = markdown !== originalDoc?.bodyMarkdown
  const bodyEmpty = !data.body
  if (!markdownChanged && !bodyEmpty) return data

  try {
    const editorConfig = await editorConfigFactory.default({ config: req.payload.config })
    data.body = convertMarkdownToLexical({ editorConfig, markdown })
  } catch (err) {
    req.payload.logger.error(
      `[markdownToBody] Failed to convert bodyMarkdown to Lexical: ${
        err instanceof Error ? err.message : String(err)
      }`,
    )
    // Leave body untouched; the save proceeds (body is no longer required).
  }

  return data
}
