import { useCallback, useEffect, useState } from 'react'

/**
 * Loads data for the chosen bike, and again whenever the rider picks another bike.
 * `load` must not change between renders (define it outside the component).
 * `reload()` fetches again for the same bike without showing the loading state.
 */
export function useVehicleData<T>(vehicleId: string | undefined, load: (vehicleId: string) => Promise<T>) {
    const [data, setData] = useState<T | null>(null)
    // Which bike the data belongs to. Different from the chosen bike = still loading.
    const [loadedFor, setLoadedFor] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [version, setVersion] = useState(0)

    useEffect(() => {
        if (!vehicleId) return
        let current = true
        load(vehicleId)
            .then((result) => { if (current) { setData(result); setError('') } })
            .catch((err) => { if (current) { setData(null); setError(err instanceof Error ? err.message : 'Something went wrong.') } })
            .finally(() => { if (current) setLoadedFor(vehicleId) })
        // A newer bike was picked before this one finished: ignore the old answer.
        return () => { current = false }
    }, [vehicleId, load, version])

    const reload = useCallback(() => setVersion((v) => v + 1), [])
    const loading = loadedFor !== vehicleId
    return { data: loading ? null : data, loading, error, reload }
}
