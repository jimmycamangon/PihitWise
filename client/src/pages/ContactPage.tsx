import { useState } from 'react'
import type { FormEvent } from 'react'
import { Field } from '../components/AuthLayout'
import Icon from '../components/Icon'
import PublicLayout from '../components/PublicLayout'

interface ContactErrors { name?: string; email?: string; message?: string }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState<ContactErrors>({})
    const [notice, setNotice] = useState('')

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()
        const next: ContactErrors = {}
        if (!name.trim()) next.name = 'Enter your name.'
        if (!emailPattern.test(email.trim())) next.email = 'Enter a valid email address.'
        if (!message.trim()) next.message = 'Write a message.'
        setErrors(next)
        if (Object.keys(next).length > 0) return setNotice('')

        // TODO: send the message once the backend exposes a contact endpoint
        setNotice('Messages aren\'t connected to the server yet.')
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

                <button type="submit"
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-accent text-on-accent
                         text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer">
                    Send message
                    <Icon name="arrow" size={14} />
                </button>

                {notice && <p role="status" className="text-[11px] text-muted text-center">{notice}</p>}
            </form>
        </PublicLayout>
    )
}
