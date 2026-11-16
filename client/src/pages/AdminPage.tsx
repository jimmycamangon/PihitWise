import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { Card, DataTable, FormMessage, PageHeader, Stat } from '../components/ui'
import { getAdminUsers } from '../api/admin'
import { useBike } from '../hooks/useBike'
import { useT } from '../lib/i18n'
import { formatDate } from '../lib/format'
import type { AdminUsersPage } from '../types/admin'

const DAY_MS = 86_400_000
const PAGE_SIZE = 50

/**
 * All riders with account info and how much they've logged. Only for admins (Admin:Emails on the server).
 * Search, paging and the counts are done by the server, so this stays fast with any number of users.
 */
export default function AdminPage() {
    const { me } = useBike()
    const t = useT()
    const [search, setSearch] = useState('')
    const [query, setQuery] = useState('')          // search, applied after typing pauses
    const [page, setPage] = useState(1)
    const [result, setResult] = useState<{ key: string; data: AdminUsersPage } | null>(null)
    const [error, setError] = useState('')
    const [now] = useState(() => Date.now())       // "today" for the Last active column

    // Wait for a short pause in typing before searching, and start again from page 1.
    useEffect(() => {
        const timer = window.setTimeout(() => { setQuery(search); setPage(1) }, 300)
        return () => window.clearTimeout(timer)
    }, [search])

    const key = `${query}|${page}`
    useEffect(() => {
        if (!me?.isAdmin) return
        let current = true
        getAdminUsers(query, page, PAGE_SIZE)
            .then((data) => { if (current) { setResult({ key: `${query}|${page}`, data }); setError('') } })
            .catch((err) => { if (current) setError(err instanceof Error ? err.message : t('common.somethingWrong')) })
        return () => { current = false }
    }, [me?.isAdmin, query, page, t])

    // Not an admin (or the page was opened directly): back to the Dashboard.
    if (me && !me.isAdmin) return <Navigate to="/dashboard" replace />

    const data = result?.data
    const loading = result?.key !== key && !error
    const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

    const lastActive = (iso: string | null) => {
        if (!iso) return t('admin.never')
        const days = Math.floor((now - new Date(iso).getTime()) / DAY_MS)
        if (days <= 0) return t('admin.today')
        if (days === 1) return t('admin.yesterday')
        if (days < 30) return t('admin.daysAgo', { days })
        return formatDate(iso)
    }
    const show = (value: number | undefined) => (value === undefined ? '…' : value.toLocaleString('en-PH'))

    return (
        <>
            <PageHeader title={t('admin.title')} subtitle={t('admin.subtitle')} />
            <FormMessage text={error} />

            <div className="grid grid-cols-3 gap-3 mb-3">
                <Stat label={t('admin.total')} value={show(data?.totalUsers)} tone="accent" />
                <Stat label={t('admin.newThisMonth')} value={show(data?.newThisMonth)} />
                <Stat label={t('admin.active30')} value={show(data?.activeLast30Days)} tone="ok" />
            </div>

            <Card title={t('admin.users')}>
                <div className="relative mb-3">
                    <Icon name="user" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
                    <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.search')} aria-label={t('admin.search')}
                        className="w-full h-9 rounded-md border border-line bg-surface pl-9 pr-3 text-xs text-ink
                             placeholder:text-faint outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
                </div>

                <div className={loading && data ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                    <DataTable
                        rows={data?.items ?? []}
                        empty={!data ? t('an.loading') : query ? t('admin.noMatch') : t('admin.none')}
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
                </div>

                {data && pages > 1 && (
                    <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-line">
                        <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1}
                            className="h-8 px-3 rounded-md border border-line text-xs text-ink hover:bg-raised cursor-pointer
                                 disabled:opacity-40 disabled:cursor-not-allowed">
                            {t('admin.prev')}
                        </button>
                        <span className="text-[11px] text-muted">{t('admin.pageOf', { page, pages })}</span>
                        <button type="button" onClick={() => setPage(page + 1)} disabled={page >= pages}
                            className="h-8 px-3 rounded-md border border-line text-xs text-ink hover:bg-raised cursor-pointer
                                 disabled:opacity-40 disabled:cursor-not-allowed">
                            {t('admin.next')}
                        </button>
                    </div>
                )}

                <p className="text-[11px] text-faint mt-3">{t('admin.privacyNote')}</p>
            </Card>
        </>
    )
}
