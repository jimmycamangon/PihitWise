import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { getVehicles } from '../api/vehicles'
import { getServiceLogs } from '../api/serviceLogs'
import { useT } from '../lib/i18n'
import { formatDate, km, peso } from '../lib/format'
import { downloadServiceHistoryCsv, exportFileName, serviceSummary, sortServices } from '../lib/exportHistory'
import type { ServiceLog } from '../types/serviceLogs'
import type { Vehicle } from '../types/vehicles'

/**
 * Printable service history of one bike: /report?bike=<id>.
 * "Save as PDF" opens the browser's print screen, where the rider picks "Save as PDF".
 * The report always prints black on white, whatever the app theme.
 */
export default function ReportPage() {
    const t = useT()
    const [params] = useSearchParams()
    const bikeId = params.get('bike') ?? ''
    const [data, setData] = useState<{ vehicle: Vehicle; logs: ServiceLog[] } | null>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        let current = true
        Promise.all([getVehicles(), getServiceLogs(bikeId)])
            .then(([vehicles, logs]) => {
                if (!current) return
                const vehicle = vehicles.find((v) => v.id === bikeId)
                if (!vehicle) return setError(t('export.noBike'))
                setData({ vehicle, logs })
            })
            .catch((err) => { if (current) setError(err instanceof Error ? err.message : t('common.somethingWrong')) })
        return () => { current = false }
    }, [bikeId, t])

    // The page title becomes the PDF's suggested file name.
    useEffect(() => {
        if (!data) return
        const before = document.title
        document.title = exportFileName(data.vehicle, 'pdf').replace(/\.pdf$/, '')
        return () => { document.title = before }
    }, [data])

    const toolbarButton = `h-9 px-3.5 inline-flex items-center gap-2 rounded-md text-xs font-medium cursor-pointer no-underline`

    if (error || !data) {
        return (
            <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center gap-4 p-6 text-center">
                {error
                    ? <p className="text-sm text-warn">{error}</p>
                    : <div className="w-full max-w-3xl h-96 bg-surface border border-line rounded-xl animate-pulse" />}
                <Link to="/maintenance" className={`${toolbarButton} border border-line text-ink`}>{t('export.back')}</Link>
            </div>
        )
    }

    const { vehicle, logs } = data
    const services = sortServices(logs)
    const summary = serviceSummary(logs)
    const hasPending = logs.some((l) => l.pending)

    return (
        <div className="min-h-screen bg-neutral-200 print:bg-white py-6 print:py-0 px-3 print:px-0">
            {/* Toolbar: not printed */}
            <div className="print:hidden max-w-3xl mx-auto mb-4 flex flex-wrap items-center gap-2">
                <Link to="/maintenance" className={`${toolbarButton} bg-white border border-neutral-300 text-neutral-800`}>
                    {t('export.back')}
                </Link>
                <span className="flex-1" />
                <button type="button" onClick={() => downloadServiceHistoryCsv(vehicle, logs)}
                    className={`${toolbarButton} bg-white border border-neutral-300 text-neutral-800`}>
                    <Icon name="file" size={14} />
                    {t('export.csv')}
                </button>
                <button type="button" onClick={() => window.print()}
                    className={`${toolbarButton} bg-blue-600 text-white`}>
                    <Icon name="file" size={14} />
                    {t('export.pdf')}
                </button>
            </div>
            <p className="print:hidden max-w-3xl mx-auto mb-4 text-[11px] text-neutral-600">{t('export.pdfHint')}</p>

            {/* The document */}
            <article className="max-w-3xl mx-auto bg-white text-neutral-900 shadow-md print:shadow-none rounded-sm p-8 print:p-0 text-[12px] leading-relaxed">
                <header className="flex items-start justify-between gap-6 pb-4 border-b-2 border-neutral-900">
                    <div>
                        <div className="text-[11px] font-semibold tracking-[.2em]">PIHIT<span className="text-blue-600">WISE</span></div>
                        <h1 className="text-xl font-semibold mt-1">{t('export.title')}</h1>
                    </div>
                    <div className="text-right text-[11px] text-neutral-600">
                        {t('export.generated')}<br />
                        <span className="text-neutral-900">{formatDate(new Date().toISOString())}</span>
                    </div>
                </header>

                <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-neutral-300">
                    <Detail label={t('garage.name')} value={vehicle.name} />
                    <Detail label={`${t('garage.brand')} / ${t('garage.model')}`} value={`${vehicle.brand} ${vehicle.model} (${vehicle.year})`} />
                    <Detail label={t('garage.plate')} value={vehicle.plateNumber ?? '—'} />
                    <Detail label={t('export.currentOdometer')} value={km(vehicle.odometer)} />
                </section>

                <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-neutral-300">
                    <Detail label={t('service.logged')} value={String(summary.count)} />
                    <Detail label={t('service.totalSpent')} value={peso(summary.total)} />
                    <Detail label={t('export.firstService')} value={summary.first ? formatDate(summary.first) : '—'} />
                    <Detail label={t('service.last')} value={summary.last ? formatDate(summary.last) : '—'} />
                </section>

                {services.length === 0 ? (
                    <p className="py-10 text-center text-neutral-500">{t('service.noneShort')}</p>
                ) : (
                    <table className="w-full mt-4 border-collapse">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-300">
                                <th className="py-2 pr-3 font-medium">{t('common.date')}</th>
                                <th className="py-2 pr-3 font-medium text-right">{t('common.odometer')}</th>
                                <th className="py-2 pr-3 font-medium">{t('service.service')}</th>
                                <th className="py-2 pr-3 font-medium">{t('service.shop')}</th>
                                <th className="py-2 font-medium text-right">{t('common.cost')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((l) => (
                                <tr key={l.id} className="border-b border-neutral-200 align-top break-inside-avoid">
                                    <td className="py-2 pr-3 whitespace-nowrap">{formatDate(l.date)}</td>
                                    <td className="py-2 pr-3 text-right font-mono whitespace-nowrap">{km(l.odometer)}</td>
                                    <td className="py-2 pr-3">
                                        <div className="font-medium">{l.type}{l.pending ? ' *' : ''}</div>
                                        {l.notes && <div className="text-[11px] text-neutral-600">{l.notes}</div>}
                                    </td>
                                    <td className="py-2 pr-3">{l.shop ?? '—'}</td>
                                    <td className="py-2 text-right font-mono whitespace-nowrap">{peso(l.cost)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-semibold">
                                <td colSpan={4} className="pt-3 text-right pr-3">{t('an.total')}</td>
                                <td className="pt-3 text-right font-mono">{peso(summary.total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                )}

                <footer className="mt-8 pt-3 border-t border-neutral-300 text-[10px] text-neutral-500 flex flex-wrap justify-between gap-2">
                    <span>{hasPending ? `* ${t('export.pendingNote')}` : t('export.recordedNote')}</span>
                    <span>PihitWise · v{__APP_VERSION__}</span>
                </footer>
            </article>
        </div>
    )
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</div>
            <div className="font-medium mt-0.5">{value}</div>
        </div>
    )
}
