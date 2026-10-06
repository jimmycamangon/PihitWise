import { Badge, Label, PageHeader } from '../components/ui'
import { avgKml, bikes, servicesFor, upcomingReminders } from '../data/mock'
import { useBike } from '../hooks/useBike'
import { formatDate, km } from '../lib/format'

export default function GaragePage() {
    const { bike: active, setBikeId } = useBike()

    return (
        <>
            <PageHeader title="Garage" subtitle="Every bike you own, in one place." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bikes.map((bike) => {
                    const isActive = bike.id === active.id
                    const lastService = servicesFor(bike.id)[0]
                    const next = upcomingReminders(bike)[0]

                    return (
                        <div key={bike.id}
                            className={`bg-surface border rounded-xl p-5 transition-colors ${isActive ? 'border-accent/50' : 'border-line'}`}>
                            <div className="flex items-start justify-between gap-3 mb-5">
                                <div>
                                    <div className="text-base font-medium text-ink">{bike.name}</div>
                                    <div className="text-xs text-faint">{bike.year} · {bike.plate}</div>
                                </div>
                                {isActive
                                    ? <Badge tone="accent">Active</Badge>
                                    : (
                                        <button type="button" onClick={() => setBikeId(bike.id)}
                                            className="h-7 px-3 rounded-md border border-line text-[11px] font-medium text-ink
                                                 hover:bg-raised transition-colors cursor-pointer">
                                            Set active
                                        </button>
                                    )}
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                <div>
                                    <Label>Odometer</Label>
                                    <div className="font-mono text-sm text-ink tracking-tight mt-1">{km(bike.odo)}</div>
                                </div>
                                <div>
                                    <Label>km/L avg</Label>
                                    <div className="font-mono text-sm text-ok tracking-tight mt-1">{avgKml(bike.id).toFixed(1)}</div>
                                </div>
                                <div>
                                    <Label>Last service</Label>
                                    <div className="text-xs text-ink mt-1">{lastService ? lastService.type : '—'}</div>
                                    {lastService && <div className="text-[11px] text-faint">{formatDate(lastService.date)}</div>}
                                </div>
                                <div>
                                    <Label>Next due</Label>
                                    <div className="text-xs text-ink mt-1">{next ? next.reminder.title : '—'}</div>
                                    {next && <div className="text-[11px] text-faint">{next.status.text}</div>}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}
