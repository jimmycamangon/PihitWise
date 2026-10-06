import { BarChart, Card, DataTable, PageHeader, Stat } from '../components/ui'
import { avgKml, fuelEconomy, fuelFor, sumCost } from '../data/mock'
import { useBike } from '../hooks/useBike'
import { formatDate, km, peso } from '../lib/format'

export default function FuelPage() {
    const { bike } = useBike()
    const logs = fuelFor(bike.id)
    const economy = fuelEconomy(bike.id)
    const kmlById = new Map(economy.map((e) => [e.id, e.kml]))
    const best = economy.length > 0 ? Math.max(...economy.map((e) => e.kml)) : 0
    const liters = logs.reduce((sum, f) => sum + f.liters, 0)

    return (
        <>
            <PageHeader title="Fuel" subtitle={`Fill-ups and fuel economy of your ${bike.name}.`} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <Stat label="Avg km/L" value={avgKml(bike.id).toFixed(1)} sub="across all fill-ups" tone="ok" />
                <Stat label="Best km/L" value={best ? best.toFixed(1) : '—'} sub="single fill-up" />
                <Stat label="Fuel spent" value={peso(sumCost(logs))} sub={`${logs.length} fill-ups`} tone="accent" />
                <Stat label="Liters" value={`${liters.toFixed(1)} L`} sub="total filled" />
            </div>

            <Card title="Fuel economy per fill-up (km/L)" className="mb-3">
                <BarChart bars={economy.map((e) => ({
                    label: formatDate(e.date).split(',')[0], value: e.kml, display: e.kml.toFixed(1),
                }))} />
            </Card>

            <Card title="Fill-up log">
                <DataTable
                    rows={logs}
                    empty="No fill-ups logged yet."
                    columns={[
                        { head: 'Date', cell: (f) => formatDate(f.date) },
                        { head: 'Odometer', cell: (f) => km(f.odo), align: 'right', mono: true },
                        { head: 'Liters', cell: (f) => f.liters.toFixed(1), align: 'right', mono: true },
                        { head: '₱ / L', cell: (f) => (f.cost / f.liters).toFixed(1), align: 'right', mono: true },
                        { head: 'km/L', cell: (f) => kmlById.get(f.id)?.toFixed(1) ?? '—', align: 'right', mono: true },
                        { head: 'Cost', cell: (f) => peso(f.cost), align: 'right', mono: true },
                    ]}
                />
            </Card>
        </>
    )
}
