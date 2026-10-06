import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

interface PublicLayoutProps { eyebrow: string; title: string; intro?: string; children: ReactNode }

const footerLinks = [['About', '/about'], ['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']]

export function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="py-6 border-t border-line">
            <h2 className="text-sm font-medium text-ink mb-2">{title}</h2>
            <div className="text-[13px] text-muted leading-relaxed flex flex-col gap-3">{children}</div>
        </section>
    )
}

export default function PublicLayout({ eyebrow, title, intro, children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans antialiased transition-colors duration-300">
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 h-14
                      backdrop-blur-xl border-b border-line bg-canvas/80">
                <Logo />
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link to="/login"
                        className="hidden sm:inline-flex items-center h-8 px-3.5 rounded-md border border-line
                             text-xs font-medium text-ink no-underline hover:bg-raised transition-colors">
                        Sign in
                    </Link>
                    <Link to="/register"
                        className="inline-flex items-center h-8 px-3.5 rounded-md bg-accent text-on-accent
                             text-xs font-medium no-underline hover:opacity-90 transition-opacity">
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-16">
                <p className="font-mono text-[10px] uppercase tracking-[.2em] text-accent mb-4">{eyebrow}</p>
                <h1 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink mb-3">{title}</h1>
                {intro && <p className="text-sm text-muted leading-relaxed mb-8">{intro}</p>}
                {children}
            </main>

            <footer className="border-t border-line">
                <div className="max-w-6xl mx-auto px-6 md:px-16 py-8 flex items-center justify-between flex-wrap gap-5">
                    <div className="flex gap-6 flex-wrap">
                        {footerLinks.map(([label, to]) => (
                            <Link key={to} to={to} className="text-xs text-muted hover:text-ink transition-colors no-underline">{label}</Link>
                        ))}
                    </div>
                    <div className="text-[11px] text-faint">© 2025 PihitWise. Built for Filipino riders.</div>
                </div>
            </footer>
        </div>
    )
}
