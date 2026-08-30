import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(120),
  email: z.string().trim().email('Valid email required').max(200),
  message: z.string().trim().min(10, 'Tell me a little more').max(4000),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { name, email, message } = parsed.data

    const saved = await db.contactMessage.create({
      data: { name, email, message },
      select: { id: true, createdAt: true },
    })

    return NextResponse.json({
      ok: true,
      id: saved.id,
      receivedAt: saved.createdAt,
      reply: 'SIGNAL RECEIVED — I reply within 24 hours.',
    })
  } catch (err) {
    console.error('[contact] failed to store message', err)
    return NextResponse.json(
      { ok: false, error: 'Transmission failed. Try again or email directly.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const count = await db.contactMessage.count()
    return NextResponse.json({ ok: true, signals: count })
  } catch {
    return NextResponse.json({ ok: false, signals: 0 }, { status: 500 })
  }
}
