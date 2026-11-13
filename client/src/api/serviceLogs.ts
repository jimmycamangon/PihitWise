import type { ServiceLog, ServiceLogRequest } from '../types/serviceLogs'
import { loggable } from './loggable'

const services = loggable<ServiceLog, ServiceLogRequest>('service', (v) => `/api/vehicles/${v}/services`, (id) => `/api/services/${id}`)

export const getServiceLogs = services.list
export const createServiceLog = services.create
export const updateServiceLog = services.update
export const deleteServiceLog = services.remove
