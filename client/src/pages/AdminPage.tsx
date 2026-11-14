import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { Card, DataTable, FormMessage, PageHeader, Stat } from '../components/ui'
import { getAdminUsers } from '../api/admin'
import { useBike } from '../hooks/useBike'
import { useT } from '../lib/i18n'
import { formatDate } from '../lib/format'
import type { AdminUser } from '../types/admin'

const DAY_MS = 86_400_000

/** All riders with account info and how much they've logged. Only for admins (Admin:Emails on the server). */
export default function AdminPage() {
    const { me } = useBike()
    const t = useT()
    const [users, setUsers] = useState<AdminUser[] | null>(null)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [now] = useState(() => Date.now())   // "today" for the Last active column and the 30-day count

    useEffect(() => {
        if (!me?.isAdmin) return
        getAdminUsers()
            .then(setUsers)
            .catch((err) => setError(err instanceof Error ? err.message : t('common.somethingWrong')))
    }, [me?.isAdmin, t])

    // Not an admin (or the page was opened directly): back to the Dashboard.
    if (me && !me.isAdmin) return <Navigate to="/dashboard" replace />

    const loading = users === null && !error
    const all = users ?? []
    const thisMonth = new Date().toISOString().slice(0, 7)
    const newThisMonth = all.filter((u) => u.createdAt.slice(0, 7) === thisMonth).length
    const active30 = all.filter((u) => u.lastActiveAt && now - new Date(u.lastActiveAt).getTime() <= 30 * DAY_MS).length

    const query = search.trim().toLowerCase()
    const rows = query
        ? all.filter((u) => u.fullName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
        : all

    const lastActive = (iso: string | null) => {
        if (!iso) return t('admin.never')
        const days = Math.floor((now - new Date(iso).getTime()) / DAY_MS)
        if (days <= 0) return t('admin.today')
        if (days === 1) return t('admin.yesterday')
        if (days < 30) return t('admin.daysAgo', { days })
        return formatDate(iso)
    }
    const show = (value: number) => (loading ? '…' : String(value))

    return (
        <>
            <PageHeader title={t('admin.title')} subtitle={t('admin.subtitle')} />
            <FormMessage text={error} />

            <div className="grid grid-cols-3 gap-3 mb-3">
                <Stat label={t('admin.total')} value={show(all.length)} tone="accent" />
                <Stat label={t('admin.newThisMonth')} value={show(newThisMonth)} />
                <Stat label={t('admin.active30')} value={show(active30)} tone="ok" />
            </div>

            <Card title={t('admin.users')}>
                <div className="relative mb-3">
                    <Icon name="user" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
                    <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.search')} aria-label={t('admin.search')}
                        className="w-full h-9 rounded-md border border-line bg-surface pl-9 pr-3 text-xs text-ink
                             placeholder:text-faint outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
                </div>
                <DataTable
                    rows={loading ? [] : rows}
                    empty={loading ? t('an.loading') : query ? t('admin.noMatch') : t('admin.none')}
                    columns={[
                        {
                            head: t('admin.user'), cell: (u) => (
                                <div className="min-w-0">
                                    <div className="font-medium">{u.fullName}</div>
                                    <div className="text-[11px] text-faint">{u.email}</div>
                                </div>
                            ),
                        },
                        { head: t('admin.joined'), cell: (u) => formatDate(u.createdAt) },
                        { head: t('admin.lastActive'), cell: (u) => <span className="text-muted">{lastActive(u.lastActiveAt)}</span> },
                        { head: t('settings.bikes'), cell: (u) => u.bikes, align: 'right', mono: true },
                        { head: t('admin.logs'), cell: (u) => u.fuelLogs + u.serviceLogs + u.expenses, align: 'right', mono: true },
                        { head: t('nav.reminders'), cell: (u) => u.reminders, align: 'right', mono: true },
                    ]}
                />
                <p className="text-[11px] text-faint mt-3">{t('admin.privacyNote')}</p>
            </Card>
        </>
    )
}
