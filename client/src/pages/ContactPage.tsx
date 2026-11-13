import { useState } from 'react'
import type { FormEvent } from 'react'
import { Field } from '../components/AuthLayout'
import Icon from '../components/Icon'
import PublicLayout from '../components/PublicLayout'
import { FormMessage } from '../components/ui'
import { sendContactMessage } from '../api/contact'

interface ContactErrors { name?: string; email?: string; message?: string }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState<ContactErrors>({})
    const [website, setWebsite] = useState('')   // honeypot, hidden from people
    const [failure, setFailure] = useState('')
    const [sent, setSent] = useState(false)
    const [sending, setSending] = useState(false)

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const next: ContactErrors = {}
        if (!name.trim()) next.name = 'Enter your name.'
        if (!emailPattern.test(email.trim())) next.email = 'Enter a valid email address.'
        if (!message.trim()) next.message = 'Write a message.'
        setErrors(next)
        setFailure('')
        if (Object.keys(next).length > 0) return

        setSending(true)
        try {
            await sendContactMessage(name.trim(), email.trim(), message.trim(), website)
            setSent(true)
            setMessage('')
        } catch (err) {
            setFailure(err instanceof Error && err.message ? err.message : 'Your message couldn\'t be sent. Please try again later.')
        } finally {
            setSending(false)
        }
    }

    if (sent) {
        return (
            <PublicLayout eyebrow="Contact" title="Message sent." intro={`Thanks, ${name.trim()}. We'll reply to ${email.trim()}.`}>
                <button type="button" onClick={() => setSent(false)}
                    className="text-xs text-accent hover:opacity-80 cursor-pointer">
                    Send another message
                </button>
            </PublicLayout>
        )
    }

    return (
        <PublicLayout
            eyebrow="Contact"
            title="Get in touch."
            intro="Questions, feedback, or a feature you'd like to see? Send us a message."
        >
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 max-w-md">
                <Field label="Name" icon="user" type="text" name="name" autoComplete="name"
                    placeholder="Juan Dela Cruz" value={name} error={errors.name}
                    onChange={(e) => setName(e.target.value)} />
                <Field label="Email" icon="mail" type="email" name="email" autoComplete="email"
                    placeholder="you@example.com" value={email} error={errors.email}
                    onChange={(e) => setEmail(e.target.value)} />
                <div>
                    <label htmlFor="message" className="block text-[11px] font-medium text-muted mb-1.5">Message</label>
                    <textarea id="message" name="message" rows={5} value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        aria-invalid={!!errors.message}
                        placeholder="How can we help?"
                        className={`w-full rounded-md border bg-surface px-3 py-2.5 text-[13px] text-ink
                            placeholder:text-faint outline-none transition-colors resize-y
                            focus:border-accent focus:ring-2 focus:ring-accent/20
                            ${errors.message ? 'border-warn' : 'border-line'}`} />
                    {errors.message && <p className="text-[11px] text-warn mt-1.5">{errors.message}</p>}
                </div>

                {/* Honeypot: off-screen and skipped by keyboard and screen readers; only bots fill it. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                    value={website} onChange={(e) => setWebsite(e.target.value)}
                    className="absolute -left-[9999px] w-px h-px opacity-0" />

                <button type="submit" disabled={sending}
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-accent text-on-accent
                         text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
                    {sending ? 'Sending...' : 'Send message'}
                    {!sending && <Icon name="arrow" size={14} />}
                </button>

                <FormMessage text={failure} />
            </form>
        </PublicLayout>
    )
}
