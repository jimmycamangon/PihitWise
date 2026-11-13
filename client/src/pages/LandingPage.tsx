import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import LanguageToggle from '../components/LanguageToggle'
import { t, useT } from '../lib/i18n'
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
                    <Label>{t('lp.mock.activeRide')}</Label>
                </div>
                <div className="text-sm font-medium text-ink">{name}</div>
                <div className="text-[11px] text-faint mb-3">{sub}</div>
                <Label>{t('lp.mock.odometer')}</Label>
                <div className="font-mono text-lg text-ink tracking-tight mt-0.5">{odo}</div>
            </div>
            <div className="text-right">
                <div className="font-mono text-xl text-ok tracking-tight">{kml}</div>
                <Label>{t('lp.mock.kmlAvg')}</Label>
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

const btnPrimary = `inline-flex items-center justify-center gap-2 rounded-md whitespace-nowrap shrink-0 bg-accent text-on-accent font-medium
    hover:opacity-90 transition-opacity no-underline`
const btnGhost = `inline-flex items-center justify-center gap-2 rounded-md whitespace-nowrap shrink-0 border border-line text-ink font-medium
    hover:bg-raised transition-colors no-underline`

// ── Main Component ─────────────────────────────────────────────────────────
export default function LandingPage() {
    useT()   // re-render everything (sub-components too) when the language changes
    const months = t('lp.months').split(',')
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
                      gap-3 px-4 sm:px-6 md:px-16 h-14
                      backdrop-blur-xl border-b border-line bg-canvas/80
                      transition-colors duration-300">
                <Logo />

                <div className="hidden md:flex items-center gap-8">
                    {[t('lp.nav.features'), t('lp.nav.dashboard'), t('lp.nav.mobile')].map((l, i) => (
                        <a key={l} href={`#${['features', 'showcase', 'mobile'][i]}`}
                            className="text-xs text-muted hover:text-ink transition-colors no-underline">
                            {l}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <LanguageToggle />
                    <ThemeToggle />
                    <Link to="/login" className={`${btnGhost} hidden md:inline-flex h-8 px-3.5 text-xs`}>
                        {t('public.signIn')}
                    </Link>
                    <Link to="/register" className={`${btnPrimary} h-8 px-3 sm:px-3.5 text-xs`}>
                        {t('public.getStarted')}
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
                            <h1 className="font-semibold tracking-tighter leading-[1.08] text-4xl md:text-5xl text-ink mb-5">
                                {t('lp.hero.title1')}<br />
                                <span className="text-accent">{t('lp.hero.title2')}</span>
                            </h1>

                            <p className="text-sm text-muted leading-relaxed max-w-sm mb-8">
                                {t('lp.hero.body')}
                            </p>

                            <div className="flex items-center gap-2.5 flex-wrap">
                                <a href="/register" className={`${btnPrimary} h-10 px-5 text-[13px]`}>
                                    {t('lp.hero.cta')}
                                    <Icon name="arrow" size={14} />
                                </a>
                                <a href="#showcase" className={`${btnGhost} h-10 px-5 text-[13px]`}>
                                    {t('lp.hero.view')}
                                </a>
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
                                    <Label>{t('lp.mock.dashboard')}</Label>
                                    <div className="w-10" />
                                </div>

                                <DashBikeCard name="Yamaha NMAX 155" sub="2023 · ABC 1234" odo="12,480 km" kml="42.6" />

                                <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                                    <StatCard label={t('lp.mock.thisMonth')} value="₱2,840" tone="accent" sub={t('lp.mock.totalSpent')} />
                                    <StatCard label={t('lp.mock.fuelCost')} value="₱68.4" sub={t('lp.mock.perLiter')} />
                                    <StatCard label={t('lp.mock.nextPms')} value="340 km" tone="warn" sub={t('lp.mock.remaining')} />
                                </div>

                                <Panel title={t('lp.mock.economyChart')} className="mb-2.5">
                                    <ChartBars
                                        bars={[
                                            { h: '55%' }, { h: '68%' }, { h: '75%', tone: 'ok' },
                                            { h: '62%' }, { h: '82%', tone: 'ok' }, { h: '78%', tone: 'accent' },
                                        ]}
                                        labels={months}
                                    />
                                </Panel>

                                <Panel title={t('lp.mock.recent')}>
                                    <ActivityRow icon="fuel" tone="accent" name={t('lp.mock.fillUp')} sub="12,480 km · 4.2 L · ₱280" time={t('lp.mock.today')} />
                                    <ActivityRow icon="wrench" tone="ok" name={t('lp.mock.oilChange')} sub="Moto World QC · ₱380" time={t('lp.mock.daysAgo', { count: 3 })} />
                                    <ActivityRow icon="bell" tone="warn" name={t('lp.mock.pmsReminder')} sub={t('lp.mock.dueIn', { km: '340 km' })} time={t('lp.mock.auto')} />
                                </Panel>
                            </div>

                            {/* Floating cards */}
                            <div className="absolute -bottom-5 -left-8 bg-surface border border-line
                              rounded-lg px-3.5 py-2.5 shadow-xl
                              animate-[float_4s_ease-in-out_infinite_0.5s]">
                                <Label>{t('lp.mock.savings')}</Label>
                                <div className="font-mono text-sm text-ok mt-1">+₱620</div>
                                <div className="text-[10px] text-faint">{t('lp.mock.vsLast')}</div>
                            </div>
                            <div className="absolute -top-6 -right-6 bg-surface border border-line
                              rounded-lg px-3.5 py-2.5 shadow-xl
                              animate-[float_4s_ease-in-out_infinite_1.5s]">
                                <Label>{t('lp.mock.nextOil')}</Label>
                                <div className="font-mono text-sm text-accent mt-1">340 km</div>
                                <div className="text-[10px] text-faint">{t('lp.mock.pmsReminder')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TRUST STRIP ─────────────────────────────────────────────────── */}
            <div className="border-t border-b border-line bg-surface py-7">
                <div className="max-w-6xl mx-auto px-6 md:px-16">
                    <div className="flex items-center justify-center gap-x-9 gap-y-3 flex-wrap">
                        {[t('lp.strip.km'), t('lp.strip.never'), t('lp.strip.free'), t('lp.strip.mobile'), t('lp.strip.offline')].map((item) => (
                            <div key={item} className="flex items-center gap-2 text-xs text-muted">
                                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── PROBLEM ─────────────────────────────────────────────────────── */}
            <section id="problem" className="py-24">
                <div className="max-w-6xl mx-auto px-6 md:px-16">
                    <div className="lp-reveal">
                        <Eyebrow>{t('lp.problem.eyebrow')}</Eyebrow>
                        <h2 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink mb-3">
                            {t('lp.problem.title1')}<br />{t('lp.problem.title2')}
                        </h2>
                        <p className="text-sm text-muted max-w-md leading-relaxed mb-12">
                            {t('lp.problem.body')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line rounded-xl overflow-hidden lp-reveal"
                        style={{ transitionDelay: '.1s' }}>
                        {([
                            { icon: 'clock', title: t('lp.problem.pmsTitle'), desc: t('lp.problem.pms') },
                            { icon: 'wallet', title: t('lp.problem.expenseTitle'), desc: t('lp.problem.expense') },
                            { icon: 'file', title: t('lp.problem.recordsTitle'), desc: t('lp.problem.records') },
                            { icon: 'fuel', title: t('lp.problem.fuelTitle'), desc: t('lp.problem.fuel') },
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
                        <Eyebrow>{t('lp.features.eyebrow')}</Eyebrow>
                        <h2 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink mb-3">
                            {t('lp.features.title1')}<br />{t('lp.features.title2')}
                        </h2>
                        <p className="text-sm text-muted max-w-md leading-relaxed mb-12">
                            {t('lp.features.body')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lp-reveal" style={{ transitionDelay: '.1s' }}>
                        {([
                            { num: '01', icon: 'wrench', title: t('lp.f1.title'), desc: t('lp.f1.desc'), tags: t('lp.f1.tags').split(',') },
                            { num: '02', icon: 'fuel', title: t('lp.f2.title'), desc: t('lp.f2.desc'), tags: t('lp.f2.tags').split(',') },
                            { num: '03', icon: 'bell', title: t('lp.f3.title'), desc: t('lp.f3.desc'), tags: t('lp.f3.tags').split(',') },
                            { num: '04', icon: 'chart', title: t('lp.f4.title'), desc: t('lp.f4.desc'), tags: t('lp.f4.tags').split(',') },
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
                                    {f.tags.map((tag) => (
                                        <span key={tag}
                                            className="px-2 py-0.5 rounded-full border border-line text-[10px] text-muted">
                                            {tag}
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
                            <Eyebrow>{t('lp.showcase.eyebrow')}</Eyebrow>
                            <h2 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink mb-3">
                                {t('lp.showcase.title1')}<br />{t('lp.showcase.title2')}
                            </h2>
                            <p className="text-sm text-muted leading-relaxed max-w-md mb-7">
                                {t('lp.showcase.body')}
                            </p>
                            <div className="flex flex-col gap-2.5">
                                {t('lp.showcase.list').split('|').map((item) => (
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
                                <StatCard label={t('lp.mock.spentJun')} value="₱3,120" tone="accent" />
                                <StatCard label={t('lp.mock.avgKml')} value="38.4" tone="ok" />
                                <StatCard label={t('lp.mock.nextPms')} value="780 km" tone="warn" />
                            </div>
                            <Panel title={t('lp.mock.expenseChart')} className="mb-2.5">
                                <ChartBars
                                    bars={[
                                        { h: '40%' }, { h: '60%' }, { h: '55%' },
                                        { h: '80%', tone: 'accent' }, { h: '50%' }, { h: '70%', tone: 'accent' },
                                    ]}
                                    labels={months}
                                />
                            </Panel>
                            <Panel title={t('lp.mock.timeline')}>
                                <ActivityRow icon="wrench" tone="ok" name={t('lp.mock.cvt')} sub="8,000 km · Shop Moto Cubao" time={t('lp.mock.weeksAgo', { count: 2 })} />
                                <ActivityRow icon="fuel" tone="accent" name={t('lp.mock.fillUp')} sub="8,220 km · 3.8 L · ₱260" time={t('lp.mock.daysAgo', { count: 5 })} />
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
                                            <div className="text-[8px] text-faint mb-0.5">{t('lp.mock.thisMonth')}</div>
                                            <div className="font-mono text-xs text-accent">₱2,840</div>
                                        </div>
                                        <div className="bg-raised rounded-lg p-2">
                                            <div className="text-[8px] text-faint mb-0.5">{t('lp.mock.avgKml')}</div>
                                            <div className="font-mono text-xs text-ok">42.6</div>
                                        </div>
                                    </div>
                                    <div className="bg-raised rounded-lg p-2 mb-1.5">
                                        <div className="text-[8px] text-faint mb-1.5">{t('lp.mock.fuelTrend')}</div>
                                        <div className="flex items-end gap-1 h-8">
                                            {([{ h: '50%' }, { h: '65%' }, { h: '80%', tone: 'ok' }, { h: '60%' }, { h: '90%', tone: 'ok' }, { h: '75%', tone: 'accent' }] as Bar[]).map((b, i) => (
                                                <div key={i} className={`flex-1 rounded-sm ${barBg[b.tone ?? 'dim']}`} style={{ height: b.h }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg border border-warn/25 bg-warn/8">
                                        <Icon name="alert" size={13} className="text-warn shrink-0" />
                                        <div>
                                            <div className="text-[9px] font-medium text-ink">{t('lp.mock.pmsDue', { km: '340 km' })}</div>
                                            <div className="text-[8px] text-faint">{t('lp.mock.oilReminder')}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lp-reveal" style={{ transitionDelay: '.15s' }}>
                            <Eyebrow>{t('lp.mobile.eyebrow')}</Eyebrow>
                            <h2 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink mb-3">
                                {t('lp.mobile.title1')}<br />{t('lp.mobile.title2')}
                            </h2>
                            <p className="text-sm text-muted leading-relaxed max-w-md mb-7">
                                {t('lp.mobile.body')}
                            </p>
                            <div className="flex flex-col border-t border-line">
                                {([
                                    { icon: 'zap', title: t('lp.m1.title'), desc: t('lp.m1.desc') },
                                    { icon: 'phone', title: t('lp.m2.title'), desc: t('lp.m2.desc') },
                                    { icon: 'bell', title: t('lp.m3.title'), desc: t('lp.m3.desc') },
                                    { icon: 'wifiOff', title: t('lp.m4.title'), desc: t('lp.m4.desc') },
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
                        <Eyebrow>{t('lp.more.eyebrow')}</Eyebrow>
                        <h2 className="font-semibold tracking-tighter text-3xl md:text-4xl text-ink max-w-xl mx-auto leading-[1.1]">
                            {t('lp.more.title1')}<br />{t('lp.more.title2')}
                        </h2>
                        <div className="w-8 h-px bg-accent mx-auto my-8" />
                        <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                            {t('about.intro')}
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
                            {t('lp.cta.badge')}
                        </div>
                        <h2 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink mb-3">
                            {t('lp.cta.title1')}<br />{t('lp.cta.title2')}
                        </h2>
                        <p className="text-sm text-muted leading-relaxed mb-8">
                            {t('lp.cta.body')}
                        </p>
                        <a href="/register" className={`${btnPrimary} h-10 px-6 text-[13px]`}>
                            {t('lp.cta.button')}
                            <Icon name="arrow" size={14} />
                        </a>
                        <div className="text-xs text-faint mt-5">
                            {t('register.haveAccount')}{' '}
                            <a href="/login" className="inline-flex items-center gap-1 text-accent no-underline hover:opacity-80">
                                {t('public.signIn')} <Icon name="arrow" size={12} />
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
                            {[[t('lp.nav.features'), '#features'], [t('lp.nav.dashboard'), '#showcase'], [t('public.about'), '/about'], [t('public.privacy'), '/privacy'], [t('public.contact'), '/contact']].map(([l, h]) => (
                                <a key={l} href={h} className="text-xs text-muted hover:text-ink transition-colors no-underline">{l}</a>
                            ))}
                        </div>
                        <div className="text-[11px] text-faint">© {new Date().getFullYear()} PihitWise</div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
