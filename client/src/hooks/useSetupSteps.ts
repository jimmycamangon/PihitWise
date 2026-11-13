import { getFuelLogs } from '../api/fuelLogs'
import { getReminders } from '../api/reminders'
import { isInstalled } from '../lib/onboarding'
import type { IconName } from '../components/Icon'
import type { Vehicle } from '../types/vehicles'
import { useVehicleData } from './useVehicleData'
import { useT } from '../lib/i18n'

export interface SetupStep {
    id: string
    title: string
    description: string
    icon: IconName
    done: boolean
    optional?: boolean
    to: string           // where the button goes
    action: string       // button text
}

const loadCounts = async (vehicleId: string) => {
    const [fuel, reminders] = await Promise.all([getFuelLogs(vehicleId), getReminders(vehicleId)])
    return { fillUps: fuel.length, reminders: reminders.length }
}

/** The "Get started" steps, ticked from the rider's real data. */
export function useSetupSteps(vehicle: Vehicle | null, vehiclesLoading: boolean) {
    const { data, loading } = useVehicleData(vehicle?.id, loadCounts)
    const t = useT()
    const hasBike = vehicle !== null

    const steps: SetupStep[] = [
        {
            id: 'bike', title: t('setup.bike'), icon: 'bike', done: hasBike, to: '/garage', action: t('setup.bikeAction'),
            description: t('setup.bikeHelp'),
        },
        {
            id: 'fill-up', title: t('setup.fillUp'), icon: 'fuel', done: hasBike && (data?.fillUps ?? 0) > 0,
            to: '/fuel?add=1', action: t('setup.fillUpAction'),
            description: t('setup.fillUpHelp'),
        },
        {
            id: 'reminder', title: t('setup.reminder'), icon: 'bell', done: hasBike && (data?.reminders ?? 0) > 0,
            to: '/reminders?add=1', action: t('setup.reminderAction'),
            description: t('setup.reminderHelp'),
        },
        {
            id: 'install', title: t('setup.install'), icon: 'phone', done: isInstalled(), optional: true,
            to: '/guide#offline', action: t('setup.installAction'),
            description: t('setup.installHelp'),
        },
    ]

    const required = steps.filter((s) => !s.optional)
    return {
        steps,
        loading: vehiclesLoading || (hasBike && loading),
        doneCount: required.filter((s) => s.done).length,
        requiredCount: required.length,
        complete: required.every((s) => s.done),
    }
}
