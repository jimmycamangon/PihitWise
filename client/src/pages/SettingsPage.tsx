import Icon from '../components/Icon'
import { Card, Label, PageHeader } from '../components/ui'
import { useBike } from '../hooks/useBike'

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5 border-t border-line first:border-0 first:pt-0 last:pb-0">
            <Label>{label}</Label>
            <div className="text-xs text-ink text-right truncate">{value}</div>
        </div>
    )
}

export default function SettingsPage() {
    const { me, vehicles, vehiclesLoading, signOut } = useBike()

    return (
        <>
            <PageHeader title="Settings" subtitle="Your account and preferences." />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-3xl">
                <Card title="Account">
                    <Row label="Name" value={me?.name ?? '…'} />
                    <Row label="Email" value={me?.email ?? '…'} />
                    <Row label="Bikes" value={vehiclesLoading ? '…' : String(vehicles.length)} />
                </Card>

                <Card title="Preferences">
                    <Row label="Currency" value="Philippine peso (₱)" />
                    <Row label="Distance" value="Kilometers" />
                    <Row label="Fuel economy" value="km/L" />
                    <Row label="Theme" value="Use the toggle in the top bar" />
                </Card>
            </div>

            <p className="text-[11px] text-faint mt-4 max-w-3xl">
                Changing your name, email or password isn't available yet.
            </p>

            <button type="button" onClick={signOut}
                className="inline-flex items-center gap-2 h-9 px-4 mt-5 rounded-md border border-line
                     text-xs font-medium text-ink hover:bg-raised transition-colors cursor-pointer">
                <Icon name="logout" size={14} />
                Sign out
            </button>
        </>
    )
}
