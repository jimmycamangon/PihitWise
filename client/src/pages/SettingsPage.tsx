import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { Card, Label, PageHeader } from '../components/ui'
import { bikes, user } from '../data/mock'

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5 border-t border-line first:border-0 first:pt-0 last:pb-0">
            <Label>{label}</Label>
            <div className="text-xs text-ink text-right">{value}</div>
        </div>
    )
}

export default function SettingsPage() {
    return (
        <>
            <PageHeader title="Settings" subtitle="Your account and preferences." />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-3xl">
                <Card title="Account">
                    <Row label="Name" value={user.name} />
                    <Row label="Email" value={user.email} />
                    <Row label="Bikes" value={String(bikes.length)} />
                </Card>

                <Card title="Preferences">
                    <Row label="Currency" value="Philippine peso (₱)" />
                    <Row label="Distance" value="Kilometers" />
                    <Row label="Fuel economy" value="km/L" />
                    <Row label="Theme" value="Use the toggle in the top bar" />
                </Card>
            </div>

            <p className="text-[11px] text-faint mt-4 max-w-3xl">
                Editing isn't available yet — these values are sample data until the app is connected to the server.
            </p>

            <Link to="/login"
                className="inline-flex items-center gap-2 h-9 px-4 mt-5 rounded-md border border-line
                     text-xs font-medium text-ink no-underline hover:bg-raised transition-colors">
                <Icon name="logout" size={14} />
                Sign out
            </Link>
        </>
    )
}
