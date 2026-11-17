import type { ServiceLog } from '../types/serviceLogs'
import type { Vehicle } from '../types/vehicles'
import { t } from './i18n'
import { today } from './expenses'

// Service history export: a CSV file (opens in Excel / Google Sheets) and helpers for the
// printable report (pages/ReportPage.tsx), which riders save as PDF from the print screen.

/** Newest first, like the Maintenance page. Same day: the higher odometer is the later one. */
export function sortServices(logs: ServiceLog[]) {
    return [...logs].sort((a, b) => b.date.localeCompare(a.date) || b.odometer - a.odometer)
}

export function serviceSummary(logs: ServiceLog[]) {
    const sorted = sortServices(logs)
    return {
        count: logs.length,
        total: logs.reduce((sum, l) => sum + l.cost, 0),
        first: sorted[sorted.length - 1]?.date ?? null,
        last: sorted[0]?.date ?? null,
    }
}

// ── Trust signals for buyers ───────────────────────────────────────────────

const DAY_MS = 86_400_000
/** Logged within this many days of the service date counts as "logged on time". */
export const ON_TIME_DAYS = 7

const dayNumber = (isoDate: string) => Date.parse(`${isoDate.slice(0, 10)}T00:00:00Z`) / DAY_MS

/** The local date an entry was saved in PihitWise (YYYY-MM-DD). */
export const loggedOn = (log: ServiceLog) => log.createdAt.slice(0, 10)

/** Entered more than a week after the service happened (back-filled). */
export const addedLater = (log: ServiceLog) => dayNumber(log.createdAt) - dayNumber(log.date) > ON_TIME_DAYS

/** Changed after it was first saved. */
export const wasEdited = (log: ServiceLog) => !!log.updatedAt

export interface RecordCheck { ok: boolean; text: string }

/**
 * Plain-language checks a buyer can use to judge the history:
 * odometer order, how many entries were logged on time, long gaps, edits, and fill-ups backing up the mileage.
 */
export function recordChecks(services: ServiceLog[], fuel: { date: string; odometer: number }[], formatDate: (iso: string) => string): RecordCheck[] {
    const checks: RecordCheck[] = []
    if (services.length === 0) return checks
    const byDate = [...services].sort((a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer)

    // 1. The odometer should only go up over time.
    let highest = -1
    const backwards = byDate.find((l) => {
        const lower = l.odometer < highest
        highest = Math.max(highest, l.odometer)
        return lower
    })
    checks.push(backwards
        ? { ok: false, text: t('check.odoBack', { date: formatDate(backwards.date) }) }
        : { ok: true, text: t('check.odoOk') })

    // 2. Entries logged around the time of the service (not all added later).
    const onTime = services.filter((l) => !addedLater(l)).length
    checks.push({ ok: onTime / services.length >= 0.5, text: t('check.onTime', { count: onTime, total: services.length, days: ON_TIME_DAYS }) })

    // 3. Long stretches with no service logged (6+ months).
    let gap: { from: string; to: string; months: number } | null = null
    for (let i = 1; i < byDate.length; i++) {
        const months = Math.floor((dayNumber(byDate[i].date) - dayNumber(byDate[i - 1].date)) / 30.4)
        if (months >= 6 && (!gap || months > gap.months)) gap = { from: byDate[i - 1].date, to: byDate[i].date, months }
    }
    if (gap) checks.push({ ok: false, text: t('check.gap', { from: formatDate(gap.from), to: formatDate(gap.to), months: gap.months }) })

    // 4. Entries changed after they were saved.
    const edited = services.filter(wasEdited).length
    if (edited > 0) checks.push({ ok: false, text: t('check.edited', { count: edited }) })

    // 5. Fill-ups logged over time independently back up the mileage.
    if (fuel.length >= 3) {
        const sorted = [...fuel].sort((a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer)
        checks.push({
            ok: true,
            text: t('check.fuel', {
                count: fuel.length,
                from: formatDate(sorted[0].date), to: formatDate(sorted[sorted.length - 1].date),
                kmFrom: sorted[0].odometer.toLocaleString('en-PH'), kmTo: sorted[sorted.length - 1].odometer.toLocaleString('en-PH'),
            }),
        })
    } else {
        checks.push({ ok: false, text: t('check.fewFuel') })
    }

    return checks
}

/** "My daily ride" → "my-daily-ride" for file names. */
const slug = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'bike'

export const exportFileName = (vehicle: Vehicle, extension: string) =>
    `pihitwise-${slug(vehicle.name)}-service-history-${today()}.${extension}`

/** A CSV field: quoted when needed, quotes doubled. */
function field(value: string | number | null | undefined) {
    const text = value === null || value === undefined ? '' : String(value)
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** The bike's service history as CSV, with column names in the rider's language. */
export function serviceHistoryCsv(vehicle: Vehicle, logs: ServiceLog[]) {
    const header = [
        t('common.date'), t('common.odometerKm'), t('service.service'), t('service.shop'),
        t('export.costPhp'), t('export.notes'), t('export.loggedOn'), t('export.edited'), t('export.status'),
    ]
    const rows = sortServices(logs).map((l) => [
        l.date, l.odometer, l.type, l.shop, l.cost.toFixed(2), l.notes,
        addedLater(l) ? `${loggedOn(l)} (${t('export.addedLater')})` : loggedOn(l),
        l.updatedAt ? l.updatedAt.slice(0, 10) : '',
        l.pending ? t('sync.waitingTag') : '',
    ])
    const bike = [vehicle.name, `${vehicle.brand} ${vehicle.model} ${vehicle.year}`, vehicle.plateNumber ?? '']
        .filter(Boolean).join(' · ')
    const lines = [
        [t('export.title'), bike].map(field).join(','),
        '',
        header.map(field).join(','),
        ...rows.map((r) => r.map(field).join(',')),
    ]
    // The BOM makes Excel read ₱ and other non-ASCII text correctly.
    return '﻿' + lines.join('\r\n') + '\r\n'
}

/** Saves the service history CSV to the rider's device. */
export function downloadServiceHistoryCsv(vehicle: Vehicle, logs: ServiceLog[]) {
    const blob = new Blob([serviceHistoryCsv(vehicle, logs)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = exportFileName(vehicle, 'csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}
