import type { ReactNode } from 'react'

export type Tone = 'accent' | 'ok' | 'warn' | 'ink' | 'muted'
interface CardProps { title?: string; action?: ReactNode; children: ReactNode; className?: string }
interface StatProps { label: string; value: string; sub?: string; tone?: Tone }
interface ChartBar { label: string; value: number; display: string }
interface BarChartProps { bars: ChartBar[]; zeroBase?: boolean }
interface Column<T> { head: string; cell: (row: T) => ReactNode; align?: 'right'; mono?: boolean }
interface DataTableProps<T extends { id: string }> { columns: Column<T>[]; rows: T[]; empty: string }

const toneText: Record<Tone, string> = {
    accent: 'text-accent', ok: 'text-ok', warn: 'text-warn', ink: 'text-ink', muted: 'text-muted',
}

export function Label({ children }: { children: ReactNode }) {
    return <div className="font-mono text-[9px] uppercase tracking-[.14em] text-faint">{children}</div>
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-6">
            <h1 className="font-semibold tracking-tight text-xl text-ink">{title}</h1>
            <p className="text-[13px] text-muted mt-0.5">{subtitle}</p>
        </div>
    )
}

export function Card({ title, action, children, className = '' }: CardProps) {
    return (
        <section className={`bg-surface border border-line rounded-xl p-4 ${className}`}>
            {(title || action) && (
                <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-xs font-medium text-ink">{title}</h2>
                    {action}
                </div>
            )}
            {children}
        </section>
    )
}

export function Stat({ label, value, sub, tone = 'ink' }: StatProps) {
    return (
        <div className="bg-surface border border-line rounded-xl p-4">
            <Label>{label}</Label>
            <div className={`font-mono text-lg tracking-tight mt-1.5 ${toneText[tone]}`}>{value}</div>
            {sub && <div className="text-[11px] text-faint mt-0.5">{sub}</div>}
        </div>
    )
}

export function Badge({ tone = 'muted', children }: { tone?: Tone; children: ReactNode }) {
    return (
        <span className={`inline-flex items-center gap-1.5 h-5 px-2 rounded-full border border-line
            font-mono text-[9px] uppercase tracking-widest whitespace-nowrap ${toneText[tone]}`}>
            <span className="w-1 h-1 rounded-full bg-current" />
            {children}
        </span>
    )
}

/** Bars scale from zero with `zeroBase`; otherwise from the lowest value, to show small differences. */
export function BarChart({ bars, zeroBase = false }: BarChartProps) {
    const values = bars.map((b) => b.value)
    const max = Math.max(...values, 0)
    const min = zeroBase ? 0 : Math.min(...values)
    const height = (value: number) => {
        if (max === 0) return 0
        if (zeroBase) return (value / max) * 100
        return max === min ? 100 : 30 + ((value - min) / (max - min)) * 70
    }

    if (bars.length === 0) return <p className="text-xs text-faint py-6 text-center">Not enough data yet.</p>

    return (
        <div className="flex items-end gap-2 h-36">
            {bars.map((b, i) => (
                <div key={b.label + i} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 min-w-0">
                    <div className="font-mono text-[9px] text-muted">{b.display}</div>
                    <div className={`w-full rounded-t-sm ${i === bars.length - 1 ? 'bg-accent' : 'bg-bar'}`}
                        style={{ height: `${height(b.value)}%`, minHeight: b.value > 0 ? 2 : 0 }} />
                    <div className="font-mono text-[9px] uppercase text-faint truncate max-w-full">{b.label}</div>
                </div>
            ))}
        </div>
    )
}

export function DataTable<T extends { id: string }>({ columns, rows, empty }: DataTableProps<T>) {
    if (rows.length === 0) return <p className="text-xs text-faint py-6 text-center">{empty}</p>

    return (
        <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                        {columns.map((c) => (
                            <th key={c.head}
                                className={`font-mono font-normal text-[9px] uppercase tracking-[.14em] text-faint
                                    pb-2.5 pr-4 last:pr-0 whitespace-nowrap ${c.align === 'right' ? 'text-right' : ''}`}>
                                {c.head}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="border-t border-line">
                            {columns.map((c) => (
                                <td key={c.head}
                                    className={`py-2.5 pr-4 last:pr-0 text-xs text-ink whitespace-nowrap
                                        ${c.align === 'right' ? 'text-right' : ''} ${c.mono ? 'font-mono tracking-tight' : ''}`}>
                                    {c.cell(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
