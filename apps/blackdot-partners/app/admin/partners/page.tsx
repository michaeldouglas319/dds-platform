import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createDdsSupabaseAdmin } from '@dds/auth/supabase'

export const dynamic = 'force-dynamic'

type PendingUser = {
  id: string
  clerk_id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  created_at: string
  access_level: string
}

async function assertAdmin(): Promise<void> {
  const { userId } = await auth()
  if (!userId) notFound()

  const supabase = createDdsSupabaseAdmin()
  const { data, error } = await supabase
    .from('users')
    .select('access_level')
    .eq('clerk_id', userId)
    .maybeSingle()

  if (error || !data || data.access_level !== 'ADMIN') {
    notFound()
  }
}

async function approvePartner(formData: FormData): Promise<void> {
  'use server'
  await assertAdmin()
  const targetId = String(formData.get('userId') || '')
  if (!targetId) return

  const supabase = createDdsSupabaseAdmin()
  const { error } = await supabase
    .from('users')
    .update({ access_level: 'MEMBER', updated_at: new Date().toISOString() })
    .eq('id', targetId)

  if (error) {
    console.error('[approvePartner] failed:', error)
    throw new Error('Failed to approve partner')
  }

  revalidatePath('/admin/partners')
}

async function denyPartner(formData: FormData): Promise<void> {
  'use server'
  await assertAdmin()
  const targetId = String(formData.get('userId') || '')
  if (!targetId) return

  // TODO: Replace with soft-deny once `denied_at` column is added to users table.
  // For now this is intentionally a no-op revalidation; the row stays as EVERYONE.
  console.warn('[denyPartner] soft-deny not yet implemented for user:', targetId)

  revalidatePath('/admin/partners')
}

export default async function AdminPartnersPage() {
  await assertAdmin()

  const supabase = createDdsSupabaseAdmin()
  const { data: pending, error } = await supabase
    .from('users')
    .select('id, clerk_id, email, first_name, last_name, avatar_url, created_at, access_level')
    .eq('access_level', 'EVERYONE')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[AdminPartnersPage] failed to load pending users:', error)
  }

  const users = (pending ?? []) as PendingUser[]

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: 'rgba(255,255,255,0.92)',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        padding: '48px 32px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.3, margin: 0 }}>
            Partner Access Requests
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: 8, fontSize: 14 }}>
            {users.length} pending {users.length === 1 ? 'request' : 'requests'}
          </p>
        </header>

        {users.length === 0 ? (
          <div
            style={{
              padding: 48,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            No pending partner requests.
          </div>
        ) : (
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th style={th}>Partner</th>
                  <th style={th}>Email</th>
                  <th style={th}>Requested</th>
                  <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const name =
                    [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unnamed'
                  const initials =
                    (u.first_name?.[0] ?? '') + (u.last_name?.[0] ?? '') || '?'
                  return (
                    <tr
                      key={u.id}
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatar_url}
                              alt=""
                              width={36}
                              height={36}
                              style={{ borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                color: 'rgba(255,255,255,0.7)',
                              }}
                            >
                              {initials.toUpperCase()}
                            </div>
                          )}
                          <span>{name}</span>
                        </div>
                      </td>
                      <td style={{ ...td, color: 'rgba(255,255,255,0.7)' }}>
                        {u.email ?? '—'}
                      </td>
                      <td style={{ ...td, color: 'rgba(255,255,255,0.55)' }}>
                        {new Date(u.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            gap: 8,
                            justifyContent: 'flex-end',
                          }}
                        >
                          <form action={approvePartner}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button type="submit" style={approveBtn}>
                              Approve
                            </button>
                          </form>
                          <form action={denyPartner}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button type="submit" style={denyBtn}>
                              Deny
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.5)',
}

const td: React.CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
}

const approveBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  color: '#0a0a0a',
  border: 'none',
  borderRadius: 6,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
}

const denyBtn: React.CSSProperties = {
  background: 'transparent',
  color: 'rgba(255,255,255,0.85)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 6,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
}
