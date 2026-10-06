import PublicLayout, { Section } from '../components/PublicLayout'

export default function AboutPage() {
    return (
        <PublicLayout
            eyebrow="About"
            title="A digital garage for Filipino riders."
            intro="PihitWise helps riders stay organized, informed, and in control of motorcycle ownership — so you can spend less time worrying and more time riding."
        >
            <Section title="Why we built it">
                <p>
                    Most riders rely on memory, receipts, and group chats to manage their bikes. Oil changes get missed,
                    fuel economy drops unnoticed, and there's no clean record when it's time to sell.
                </p>
            </Section>
            <Section title="What it does">
                <p>
                    Log every service and fill-up, watch your km/L trend, see what your motorcycle really costs each
                    month, and get reminded before your PMS, LTO registration, and insurance are due.
                </p>
            </Section>
            <Section title="Who it's for">
                <p>
                    Everyday riders of scooters and commuter bikes — NMAX, ADV, Aerox, Click, Mio, and more. Free to
                    get started, and built to be used from your phone.
                </p>
            </Section>
        </PublicLayout>
    )
}
