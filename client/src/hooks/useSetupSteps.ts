import { getFuelLogs } from '../api/fuelLogs'
import { getReminders } from '../api/reminders'
import { isInstalled } from '../lib/onboarding'
import type { IconName } from '../components/Icon'
import type { Vehicle } from '../types/vehicles'
import { useVehicleData } from './useVehicleData'

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
    const hasBike = vehicle !== null

    const steps: SetupStep[] = [
        {
            id: 'bike', title: 'Add your bike', icon: 'bike', done: hasBike, to: '/garage', action: 'Go to Garage',
            description: 'Its name and the odometer reading on your panel. Everything else is logged against it.',
        },
        {
            id: 'fill-up', title: 'Log your first fill-up', icon: 'fuel', done: hasBike && (data?.fillUps ?? 0) > 0,
            to: '/fuel?add=1', action: 'Log a fill-up',
            description: 'Date, odometer, liters and cost. Two full-tank fill-ups give your first km/L.',
        },
        {
            id: 'reminder', title: 'Set a reminder', icon: 'bell', done: hasBike && (data?.reminders ?? 0) > 0,
            to: '/reminders?add=1', action: 'Add a reminder',
            description: 'For example: oil change every 1,500 km. It counts down as your odometer goes up.',
        },
        {
            id: 'install', title: 'Install the app on your phone', icon: 'phone', done: isInstalled(), optional: true,
            to: '/guide#offline', action: 'How to install',
            description: 'Opens from your home screen and keeps working without signal.',
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
