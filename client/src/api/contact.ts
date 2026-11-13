export async function sendContactMessage(name: string, email: string, message: string, website: string) : Promise<void> {
    const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website })
    })
    if (response.status === 429) {
        throw new Error('Too many messages. Please wait a minute and try again.')
    }
    if(!response.ok) {
        throw new Error(await response.text())
    }
}
