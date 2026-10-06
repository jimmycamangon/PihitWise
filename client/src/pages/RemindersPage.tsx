import Icon from '../components/Icon'
import { Badge, Card, PageHeader, Stat } from '../components/ui'
import { upcomingReminders } from '../data/mock'
import { useBike } from '../hooks/useBike'
import { formatDate, km } from '../lib/format'
import { urgencyLabel, urgencyTone } from '../lib/urgency'

export default function RemindersPage() {
    const { bike } = useBike()
    const upcoming = upcomingReminders(bike)
    const count = (urgency: string) => upcoming.filter((u) => u.status.urgency === urgency).length

    return (
        <>
            <PageHeader title="Reminders" subtitle={`What's coming up for your ${bike.name}.`} />

            <div className="grid grid-cols-3 gap-3 mb-3">
                <Stat label="Overdue" value={String(count('overdue'))} tone={count('overdue') > 0 ? 'warn' : 'ink'} />
                <Stat label="Due soon" value={String(count('soon'))} tone={count('soon') > 0 ? 'accent' : 'ink'} />
                <Stat label="On track" value={String(count('ok'))} />
            </div>

            <Card title="All reminders">
                {upcoming.length === 0 && <p className="text-xs text-faint py-6 text-center">No reminders set.</p>}
                {upcoming.map(({ reminder, status }) => {
                    const byOdo = reminder.dueOdo !== undefined
                    return (
                        <div key={reminder.id} className="flex items-center gap-3 py-3 border-t border-line first:border-0 first:pt-0 last:pb-0">
                            <div className="w-8 h-8 rounded-md border border-line bg-raised flex items-center justify-center shrink-0 text-accent">
                                <Icon name={byOdo ? 'gauge' : 'calendar'} size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-ink truncate">{reminder.title}</div>
                                <div className="text-[11px] text-faint">
                                    {byOdo ? `Due at ${km(reminder.dueOdo ?? 0)}` : `Due ${formatDate(reminder.dueDate ?? '')}`}
                                </div>
                            </div>
                            <div className="hidden sm:block font-mono text-[11px] text-muted">{status.text}</div>
                            <Badge tone={urgencyTone[status.urgency]}>{urgencyLabel[status.urgency]}</Badge>
                        </div>
                    )
                })}
            </Card>
        </>
    )
}
