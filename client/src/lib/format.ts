const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const monthFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', timeZone: 'UTC' })

export const peso = (value: number) => `₱${Math.round(value).toLocaleString('en-PH')}`
export const km = (value: number) => `${value.toLocaleString('en-PH')} km`
export const formatDate = (iso: string) => dateFormat.format(new Date(iso))
/** `YYYY-MM` → short month name */
export const formatMonth = (yearMonth: string) => monthFormat.format(new Date(`${yearMonth}-01`))
