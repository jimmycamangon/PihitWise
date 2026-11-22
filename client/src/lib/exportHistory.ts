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
        t('export.costPhp'), t('export.notes'), t('export.status'),
    ]
    const rows = sortServices(logs).map((l) => [
        l.date, l.odometer, l.type, l.shop, l.cost.toFixed(2), l.notes,
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
