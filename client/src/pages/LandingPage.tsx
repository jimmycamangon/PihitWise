import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import type { IconName } from '../components/Icon'

// ── Types ──────────────────────────────────────────────────────────────────
type Tone = 'accent' | 'ok' | 'warn' | 'ink'
type BarTone = 'dim' | 'accent' | 'ok'
interface DashBikeCardProps { name: string; sub: string; odo: string; kml: string }
interface StatCardProps { label: string; value: string; tone?: Tone; sub?: string }
interface Bar { h: string; tone?: BarTone }
interface ChartBarsProps { bars: Bar[]; labels: string[] }
interface ActivityRowProps { icon: IconName; tone: Tone; name: string; sub: string; time: string }

const toneText: Record<Tone, string> = {
    accent: 'text-accent', ok: 'text-ok', warn: 'text-warn', ink: 'text-ink',
}
const barBg: Record<BarTone, string> = {
    dim: 'bg-bar', accent: 'bg-accent', ok: 'bg-ok',
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <p className="font-mono text-[10px] uppercase tracking-[.2em] text-accent mb-4">{children}</p>
    )
}

function Label({ children }: { children: ReactNode }) {
    return (
        <div className="font-mono text-[9px] uppercase tracking-[.14em] text-faint">{children}</div>
    )
}

function Panel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
    return (
        <div className={`bg-raised border border-line rounded-lg p-3.5 ${className}`}>
            <div className="text-[11px] text-muted mb-3">{title}</div>
            {children}
        </div>
    )
}

function DashBikeCard({ name, sub, odo, kml }: DashBikeCardProps) {
    return (
        <div className="flex items-end justify-between bg-raised border border-line rounded-lg p-4 mb-2.5">
            <div>
                <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-1 h-1 rounded-full bg-accent" />
                    <Label>Active ride</Label>
                </div>
                <div className="text-sm font-medium text-ink">{name}</div>
                <div className="text-[11px] text-faint mb-3">{sub}</div>
                <Label>Odometer</Label>
                <div className="font-mono text-lg text-ink tracking-tight mt-0.5">{odo}</div>
            </div>
            <div className="text-right">
                <div className="font-mono text-xl text-ok tracking-tight">{kml}</div>
                <Label>km/L avg</Label>
            </div>
        </div>
    )
}

function StatCard({ label, value, tone = 'ink', sub }: StatCardProps) {
    return (
        <div className="bg-raised border border-line rounded-lg p-3">
            <Label>{label}</Label>
            <div className={`font-mono text-sm tracking-tight mt-1 ${toneText[tone]}`}>{value}</div>
            {sub && <div className="text-[10px] text-faint mt-0.5">{sub}</div>}
        </div>
    )
}

function ChartBars({ bars, labels }: ChartBarsProps) {
    return (
        <>
            <div className="flex items-end gap-1.5 h-14">
                {bars.map((b, i) => (
                    <div key={i} className={`flex-1 rounded-t-sm ${barBg[b.tone ?? 'dim']}`} style={{ height: b.h }} />
                ))}
            </div>
            <div className="flex gap-1.5 mt-1.5">
                {labels.map((l) => (
                    <div key={l} className="flex-1 font-mono text-[8px] uppercase text-faint text-center">{l}</div>
                ))}
            </div>
        </>
    )
}

function ActivityRow({ icon, tone, name, sub, time }: ActivityRowProps) {
    return (
        <div className="flex items-center gap-2.5 py-2 border-b border-line last:border-0 last:pb-0 first:pt-0">
            <div className={`w-7 h-7 rounded-md border border-line bg-surface flex items-center justify-center shrink-0 ${toneText[tone]}`}>
                <Icon name={icon} size={13} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-ink">{name}</div>
                <div className="text-[10px] text-faint truncate">{sub}</div>
            </div>
            <div className="font-mono text-[9px] uppercase text-faint">{time}</div>
        </div>
    )
}

const btnPrimary = `inline-flex items-center gap-2 rounded-md bg-accent text-on-accent font-medium
    hover:opacity-90 transition-opacity no-underline`
const btnGhost = `inline-flex items-center gap-2 rounded-md border border-line text-ink font-medium
    hover:bg-raised transition-colors no-underline`
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

// ── Main Component ─────────────────────────────────────────────────────────
export default function LandingPage() {
    // Scroll reveal
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('lp-visible') }),
            { threshold: 0.12 }
        )
        document.querySelectorAll('.lp-reveal').forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    return (
        <div className="bg-canvas text-ink font-sans antialiased overflow-x-hidden transition-colors duration-300">

            {/* ── NAV ─────────────────────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
                      px-6 md:px-16 h-14
                      backdrop-blur-xl border-b border-line bg-canvas/80
                      transition-colors duration-300">
                <Logo />

                <div className="hidden md:flex items-center gap-8">
                    {['Features', 'Dashboard', 'Mobile'].map((l, i) => (
                        <a key={l} href={`#${['features', 'showcase', 'mobile'][i]}`}
                            className="text-xs text-muted hover:text-ink transition-colors no-underline">
                            {l}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link to="/login" className={`${btnGhost} hidden sm:inline-flex h-8 px-3.5 text-xs`}>
                        Sign in
                    </Link>
                    <Link to="/register" className={`${btnPrimary} h-8 px-3.5 text-xs`}>
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* ── HERO ────────────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
                {/* Glow */}
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-150 pointer-events-none
                        bg-[radial-gradient(ellipse_at_center,var(--accent),transparent_70%)] opacity-[.09]" />

                <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-16 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left */}
                        <div className="lp-reveal">
                            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full
                              border border-line bg-surface mb-7 text-[11px] text-muted">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                Now available for all Filipino riders
                            </div>

                            <h1 className="font-semibold tracking-tighter leading-[1.08] text-4xl md:text-5xl text-ink mb-5">
                                Your digital<br />
                                <span className="text-accent">garage.</span>
                            </h1>

                            <p className="text-sm text-muted leading-relaxed max-w-sm mb-8">
                                Track <span className="text-ink">maintenance</span>,{' '}
                                <span className="text-ink">fuel economy</span>,{' '}
                                <span className="text-ink">expenses</span>, and service
                                history — all in one modern rider dashboard.
                            </p>

                            <div className="flex items-center gap-2.5 flex-wrap mb-10">
                                <a href="/register" className={`${btnPrimary} h-10 px-5 text-[13px]`}>
                                    Get started — free
                                    <Icon name="arrow" size={14} />
                                </a>
                                <a href="#showcase" className={`${btnGhost} h-10 px-5 text-[13px]`}>
                                    View dashboard
                                </a>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[10px] uppercase tracking-[.14em] text-faint mr-1.5">Built for</span>
                                {['NMAX 155', 'Honda ADV', 'Aerox', 'Click 160', 'Mio i 125'].map((b) => (
                                    <span key={b}
                                        className="px-2.5 py-0.5 rounded-full border border-line text-[11px] text-muted">
                                        {b}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right — dashboard preview */}
                        <div className="relative hidden lg:block lp-reveal" style={{ transitionDelay: '.15s' }}>
                            <div className="relative bg-surface border border-line rounded-xl p-4
                              shadow-[0_30px_80px_-20px_rgba(20,50,100,0.25)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">

                                {/* Window chrome */}
                                <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-line">
                                    <div className="flex gap-1.5">
                                        {[0, 1, 2].map((c) => (
                                            <div key={c} className="w-2 h-2 rounded-full bg-bar" />
                                        ))}
                                    </div>
                                    <Label>PihitWise dashboard</Label>
                                    <div className="w-10" />
                                </div>

                                <DashBikeCard name="Yamaha NMAX 155" sub="2023 · ABC 1234" odo="12,480 km" kml="42.6" />

                                <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                                    <StatCard label="This month" value="₱2,840" tone="accent" sub="total spent" />
                                    <StatCard label="Fuel cost" value="₱68.4" sub="per liter" />
                                    <StatCard label="Next PMS" value="340 km" tone="warn" sub="remaining" />
                                </div>

                                <Panel title="Fuel economy — last 6 fill-ups" className="mb-2.5">
                                    <ChartBars
                                        bars={[
                                            { h: '55%' }, { h: '68%' }, { h: '75%', tone: 'ok' },
                                            { h: '62%' }, { h: '82%', tone: 'ok' }, { h: '78%', tone: 'accent' },
                                        ]}
                                        labels={months}
                                    />
                                </Panel>

                                <Panel title="Recent activity">
                                    <ActivityRow icon="fuel" tone="accent" name="Fuel fill-up" sub="12,480 km · 4.2 L · ₱280" time="Today" />
                                    <ActivityRow icon="wrench" tone="ok" name="Oil change" sub="Moto World QC · ₱380" time="3d ago" />
                                    <ActivityRow icon="bell" tone="warn" name="PMS reminder" sub="Due in 340 km" time="Auto" />
                                </Panel>
                            </div>

                            {/* Floating cards */}
                            <div className="absolute -bottom-5 -left-8 bg-surface border border-line
                              rounded-lg px-3.5 py-2.5 shadow-xl
                              animate-[float_4s_ease-in-out_infinite_0.5s]">
                                <Label>Monthly savings</Label>
                                <div className="font-mono text-sm text-ok mt-1">+₱620</div>
                                <div className="text-[10px] text-faint">vs last month</div>
                            </div>
                            <div className="absolute -top-6 -right-6 bg-surface border border-line
                              rounded-lg px-3.5 py-2.5 shadow-xl
                              animate-[float_4s_ease-in-out_infinite_1.5s]">
                                <Label>Next oil change</Label>
                                <div className="font-mono text-sm text-accent mt-1">340 km</div>
                                <div className="text-[10px] text-faint">PMS reminder</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TRUST STRIP ─────────────────────────────────────────────────── */}
            <div className="border-t border-b border-line bg-surface py-7">
                <div className="max-w-6xl mx-auto px-6 md:px-16">
                    <div className="flex items-center justify-center gap-x-9 gap-y-3 flex-wrap">
                        {['Built for Filipino riders', 'Track every kilometer', 'Never miss maintenance again', 'Free to get started', 'Mobile-first experience'].map((t) => (
                            <div key={t} className="flex items-center gap-2 text-xs text-muted">
                                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── PROBLEM ─────────────────────────────────────────────────────── */}
            <section id="problem" className="py-24">
                <div className="max-w-6xl mx-auto px-6 md:px-16">
                    <div className="lp-reveal">
                        <Eyebrow>The problem</Eyebrow>
                        <h2 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink mb-3">
                            Motorcycle ownership<br />gets messy.
                        </h2>
                        <p className="text-sm text-muted max-w-md leading-relaxed mb-12">
                            Most riders rely on memory, receipts, and group chats to manage their bikes. There's a better way.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line rounded-xl overflow-hidden lp-reveal"
                        style={{ transitionDelay: '.1s' }}>
                        {([
                            { icon: 'clock', title: 'Forgotten PMS', desc: 'Missed oil changes and maintenance schedules slowly damage your engine without you even noticing.' },
                            { icon: 'wallet', title: 'No expense visibility', desc: 'No idea how much your motorcycle actually costs you per month — fuel, parts, and repairs add up fast.' },
                            { icon: 'file', title: 'Scattered records', desc: 'Maintenance history buried in receipts and chats. No clean record when it\'s time to sell your bike.' },
                            { icon: 'fuel', title: 'Invisible fuel trends', desc: 'Fuel economy changes go unnoticed. A slow drop in km/L can signal engine issues before they get serious.' },
                        ] as { icon: IconName; title: string; desc: string }[]).map((p) => (
                            <div key={p.title} className="p-7 bg-surface hover:bg-raised transition-colors">
                                <Icon name={p.icon} size={18} className="text-accent mb-4" />
                                <div className="font-medium text-sm text-ink mb-1.5">{p.title}</div>
                                <div className="text-[13px] text-muted leading-relaxed">{p.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ────────────────────────────────────────────────────── */}
            <section id="features" className="py-24 bg-surface border-t border-b border-line">
                <div className="max-w-6xl mx-auto px-6 md:px-16">
                    <div className="lp-reveal">
                        <Eyebrow>Features</Eyebrow>
                        <h2 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink mb-3">
                            Everything organized<br />in one place.
                        </h2>
                        <p className="text-sm text-muted max-w-md leading-relaxed mb-12">
                            PihitWise brings your entire motorcycle ownership experience into a single intelligent dashboard.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lp-reveal" style={{ transitionDelay: '.1s' }}>
                        {([
                            { num: '01', icon: 'wrench', title: 'Maintenance Tracking', desc: 'Log and track every service — oil changes, CVT cleaning, brake replacements, tire swaps, and more. Your full service history, always accessible.', tags: ['Oil change', 'CVT cleaning', 'Brakes', 'Tires'] },
                            { num: '02', icon: 'fuel', title: 'Fuel Analytics', desc: 'Log every fill-up and watch your km/L trend over time. Spot fuel economy drops early. Know exactly how much you\'re spending on fuel per month.', tags: ['km/L tracking', 'Monthly reports', 'Trend charts'] },
                            { num: '03', icon: 'bell', title: 'Smart Reminders', desc: 'Set reminders by date or by odometer. Get notified before your PMS, LTO registration, and insurance lapse — so you never get caught off guard again.', tags: ['Date-based', 'km-based', 'LTO renewal'] },
                            { num: '04', icon: 'chart', title: 'Ownership Insights', desc: 'Understand your real total cost of ownership. Monthly expense breakdowns, service history timelines, and resale-ready records all in one place.', tags: ['Expense breakdown', 'History export', 'Resale docs'] },
                        ] as { num: string; icon: IconName; title: string; desc: string; tags: string[] }[]).map((f) => (
                            <div key={f.num}
                                className="bg-canvas border border-line rounded-xl p-7
                                  hover:border-accent/40 transition-colors duration-200">
                                <div className="flex items-center justify-between mb-5">
                                    <Icon name={f.icon} size={18} className="text-accent" />
                                    <span className="font-mono text-[10px] tracking-[.14em] text-faint">{f.num}</span>
                                </div>
                                <div className="font-medium text-sm text-ink mb-1.5">{f.title}</div>
                                <div className="text-[13px] text-muted leading-relaxed mb-5">{f.desc}</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {f.tags.map((t) => (
                                        <span key={t}
                                            className="px-2 py-0.5 rounded-full border border-line text-[10px] text-muted">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SHOWCASE ────────────────────────────────────────────────────── */}
            <section id="showcase" className="py-28 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-200 h-100 pointer-events-none opacity-[.06]
                        bg-[radial-gradient(ellipse,var(--accent),transparent_70%)]" />
                <div className="max-w-6xl mx-auto px-6 md:px-16 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <div className="lp-reveal">
                            <Eyebrow>Dashboard</Eyebrow>
                            <h2 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink mb-3">
                                The dashboard<br />is the product.
                            </h2>
                            <p className="text-sm text-muted leading-relaxed max-w-md mb-7">
                                A premium analytics experience designed specifically for motorcycle riders — not a generic tracker. Real intelligence, clean design.
                            </p>
                            <div className="flex flex-col gap-2.5">
                                {['Real-time odometer and km/L tracking', 'Monthly fuel and expense breakdowns', 'Upcoming maintenance at a glance', 'Full activity timeline for every bike', 'Multi-bike garage support'].map((item) => (
                                    <div key={item} className="flex items-center gap-2.5 text-[13px] text-muted">
                                        <Icon name="check" size={14} className="text-accent shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-surface border border-line rounded-xl p-4 lp-reveal
                            shadow-[0_30px_80px_-20px_rgba(20,50,100,0.2)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
                            style={{ transitionDelay: '.15s' }}>
                            <DashBikeCard name="Honda ADV 160" sub="2022 · XYZ 5678" odo="8,220 km" kml="38.4" />
                            <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                                <StatCard label="Spent (Jun)" value="₱3,120" tone="accent" />
                                <StatCard label="Avg km/L" value="38.4" tone="ok" />
                                <StatCard label="Next PMS" value="780 km" tone="warn" />
                            </div>
                            <Panel title="6-month expense breakdown" className="mb-2.5">
                                <ChartBars
                                    bars={[
                                        { h: '40%' }, { h: '60%' }, { h: '55%' },
                                        { h: '80%', tone: 'accent' }, { h: '50%' }, { h: '70%', tone: 'accent' },
                                    ]}
                                    labels={months}
                                />
                            </Panel>
                            <Panel title="Maintenance timeline">
                                <ActivityRow icon="wrench" tone="ok" name="CVT cleaning" sub="8,000 km · Shop Moto Cubao" time="2w ago" />
                                <ActivityRow icon="fuel" tone="accent" name="Fuel fill-up" sub="8,220 km · 3.8 L · ₱260" time="5d ago" />
                            </Panel>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MOBILE ──────────────────────────────────────────────────────── */}
            <section id="mobile" className="py-24 bg-surface border-t border-b border-line">
                <div className="max-w-6xl mx-auto px-6 md:px-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Phone mockup */}
                        <div className="flex justify-center lp-reveal">
                            <div className="w-55 bg-canvas border border-line rounded-[32px] p-3 relative
                              shadow-[0_30px_70px_-20px_rgba(20,50,100,0.25)] dark:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]">
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-1 bg-bar rounded-full" />
                                <div className="mt-4 rounded-3xl bg-surface border border-line p-3">
                                    <div className="text-[9px] font-semibold tracking-[.22em] text-ink mb-2.5">PIHIT<span className="text-accent">WISE</span></div>
                                    <div className="flex items-center gap-2 p-2 bg-raised rounded-lg mb-1.5">
                                        <div className="w-6 h-6 rounded-md border border-line bg-surface flex items-center justify-center text-accent shrink-0">
                                            <Icon name="gauge" size={12} />
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-medium text-ink">NMAX 155</div>
                                            <div className="text-[8px] text-faint">12,480 km · ABC 1234</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                                        <div className="bg-raised rounded-lg p-2">
                                            <div className="text-[8px] text-faint mb-0.5">This month</div>
                                            <div className="font-mono text-xs text-accent">₱2,840</div>
                                        </div>
                                        <div className="bg-raised rounded-lg p-2">
                                            <div className="text-[8px] text-faint mb-0.5">Avg km/L</div>
                                            <div className="font-mono text-xs text-ok">42.6</div>
                                        </div>
                                    </div>
                                    <div className="bg-raised rounded-lg p-2 mb-1.5">
                                        <div className="text-[8px] text-faint mb-1.5">Fuel trend</div>
                                        <div className="flex items-end gap-1 h-8">
                                            {([{ h: '50%' }, { h: '65%' }, { h: '80%', tone: 'ok' }, { h: '60%' }, { h: '90%', tone: 'ok' }, { h: '75%', tone: 'accent' }] as Bar[]).map((b, i) => (
                                                <div key={i} className={`flex-1 rounded-sm ${barBg[b.tone ?? 'dim']}`} style={{ height: b.h }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg border border-warn/25 bg-warn/8">
                                        <Icon name="alert" size={13} className="text-warn shrink-0" />
                                        <div>
                                            <div className="text-[9px] font-medium text-ink">PMS due in 340 km</div>
                                            <div className="text-[8px] text-faint">Oil change reminder</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lp-reveal" style={{ transitionDelay: '.15s' }}>
                            <Eyebrow>Mobile first</Eyebrow>
                            <h2 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink mb-3">
                                Built for riders<br />on the go.
                            </h2>
                            <p className="text-sm text-muted leading-relaxed max-w-md mb-7">
                                Log a fill-up in under a minute. Check your next PMS at a stoplight. PihitWise is designed for how riders actually use their phones.
                            </p>
                            <div className="flex flex-col border-t border-line">
                                {([
                                    { icon: 'zap', title: '1-minute logging', desc: 'Log fuel and maintenance fast. No friction, no long forms.' },
                                    { icon: 'phone', title: 'Responsive dashboard', desc: 'Full analytics on any screen — phone, tablet, or desktop.' },
                                    { icon: 'bell', title: 'Smart notifications', desc: 'PMS and registration alerts before they\'re overdue.' },
                                ] as { icon: IconName; title: string; desc: string }[]).map((f) => (
                                    <div key={f.title} className="flex gap-3.5 items-start py-4 border-b border-line">
                                        <Icon name={f.icon} size={16} className="text-accent shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-medium text-[13px] text-ink mb-0.5">{f.title}</div>
                                            <div className="text-[13px] text-muted">{f.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── EMOTIONAL ───────────────────────────────────────────────────── */}
            <section className="py-32 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-150 h-100 pointer-events-none opacity-[.07]
                        bg-[radial-gradient(ellipse,var(--accent),transparent_70%)]" />
                <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-16">
                    <div className="lp-reveal">
                        <Eyebrow>More than tracking</Eyebrow>
                        <h2 className="font-semibold tracking-tighter text-3xl md:text-4xl text-ink max-w-xl mx-auto leading-[1.1]">
                            More than<br />maintenance tracking.
                        </h2>
                        <div className="w-8 h-px bg-accent mx-auto my-8" />
                        <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                            PihitWise helps riders stay organized, informed, and in control of motorcycle ownership — so you can spend less time worrying and more time riding.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
            <section className="py-24 bg-surface border-t border-line">
                <div className="max-w-xl mx-auto px-6 md:px-16 text-center">
                    <div className="lp-reveal">
                        <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full
                            border border-line bg-canvas text-[11px] text-muted mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            Free for all riders
                        </div>
                        <h2 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink mb-3">
                            Start building your<br />digital garage.
                        </h2>
                        <p className="text-sm text-muted leading-relaxed mb-8">
                            Join riders who are already tracking smarter. No credit card required — get started in seconds.
                        </p>
                        <a href="/register" className={`${btnPrimary} h-10 px-6 text-[13px]`}>
                            Create free account
                            <Icon name="arrow" size={14} />
                        </a>
                        <div className="text-xs text-faint mt-5">
                            Already have an account?{' '}
                            <a href="/login" className="inline-flex items-center gap-1 text-accent no-underline hover:opacity-80">
                                Sign in <Icon name="arrow" size={12} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────────────── */}
            <footer className="py-8 border-t border-line">
                <div className="max-w-6xl mx-auto px-6 md:px-16">
                    <div className="flex items-center justify-between flex-wrap gap-5">
                        <Logo />
                        <div className="flex gap-6 flex-wrap">
                            {[['Features', '#features'], ['Dashboard', '#showcase'], ['About', '/about'], ['Privacy', '/privacy'], ['Contact', '/contact'], ['GitHub', 'https://github.com']].map(([l, h]) => (
                                <a key={l} href={h} className="text-xs text-muted hover:text-ink transition-colors no-underline">{l}</a>
                            ))}
                        </div>
                        <div className="text-[11px] text-faint">© 2025 PihitWise. Built for Filipino riders.</div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
