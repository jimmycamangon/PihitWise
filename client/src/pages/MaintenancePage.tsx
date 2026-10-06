import { Card, DataTable, PageHeader, Stat } from '../components/ui'
import { servicesFor, sumCost } from '../data/mock'
import { useBike } from '../hooks/useBike'
import { formatDate, km, peso } from '../lib/format'

export default function MaintenancePage() {
    const { bike } = useBike()
    const services = servicesFor(bike.id)
    const last = services[0]

    return (
        <>
            <PageHeader title="Maintenance" subtitle={`Service history of your ${bike.name}.`} />

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                <Stat label="Services logged" value={String(services.length)} sub="all time" />
                <Stat label="Total spent" value={peso(sumCost(services))} sub="on maintenance" tone="accent" />
                <Stat label="Last service" value={last ? last.type : '—'}
                    sub={last ? `${formatDate(last.date)} · ${km(bike.odo - last.odo)} ago` : undefined} />
            </div>

            <Card title="Service history">
                <DataTable
                    rows={services}
                    empty="No services logged yet."
                    columns={[
                        { head: 'Date', cell: (s) => formatDate(s.date) },
                        { head: 'Service', cell: (s) => <span className="font-medium">{s.type}</span> },
                        { head: 'Shop', cell: (s) => <span className="text-muted">{s.shop}</span> },
                        { head: 'Odometer', cell: (s) => km(s.odo), align: 'right', mono: true },
                        { head: 'Cost', cell: (s) => peso(s.cost), align: 'right', mono: true },
                    ]}
                />
            </Card>
        </>
    )
}
