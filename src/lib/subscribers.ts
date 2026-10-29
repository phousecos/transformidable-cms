// Adding someone to a mailing list (the Transformidable Brief or book
// updates). Shared by api/subscribe and the Advisory tools download form.
// Callers show the same message whatever happens here, so no one can learn
// whether an email was already on the list.

export type ListName = 'brief' | 'book'
export type SubscriberSource = 'website' | 'reading_room' | 'article' | 'manual'

export async function joinList(
  payload: any,
  { email, name, source = 'website', list = 'brief' }: { email: string; name?: string; source?: SubscriberSource; list?: ListName },
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim()
  try {
    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: normalizedEmail } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      const sub = existing.docs[0] as Record<string, unknown>
      // Subscribers from before lists existed have none; they joined the Brief.
      // Someone coming back after unsubscribing starts over with just the
      // list they asked for now.
      const currentLists =
        sub.status === 'unsubscribed'
          ? []
          : Array.isArray(sub.lists) && sub.lists.length
            ? (sub.lists as string[])
            : ['brief']
      const lists = currentLists.includes(list) ? currentLists : [...currentLists, list]
      if (sub.status === 'unsubscribed' || lists.length !== (sub.lists as string[] | undefined)?.length) {
        await payload.update({
          collection: 'subscribers',
          id: sub.id as number,
          data: { status: 'active', lists },
        })
      }
      return
    }

    await payload.create({
      collection: 'subscribers',
      data: { email: normalizedEmail, name, source, lists: [list], status: 'active' },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : ''
    // Race-condition fallback: a concurrent insert won the unique constraint,
    // so the person is on the list either way.
    if (msg.includes('unique') || msg.includes('duplicate')) return
    throw error
  }
}
