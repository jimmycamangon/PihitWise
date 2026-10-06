import PublicLayout, { Section } from '../components/PublicLayout'

// Placeholder copy — replace with the reviewed policy before launch.
export default function PrivacyPage() {
    return (
        <PublicLayout
            eyebrow="Privacy"
            title="Privacy Policy"
            intro="This page is a draft. The final policy will be published here before PihitWise opens for sign-ups."
        >
            <Section title="What we plan to collect">
                <p>Your account details (name and email) and the records you choose to log: bikes, services, fill-ups, expenses, and reminders.</p>
            </Section>
            <Section title="How it will be used">
                <p>To show your dashboard, calculate your fuel economy and costs, and send the reminders you set up.</p>
            </Section>
            <Section title="Your data">
                <p>Your records are yours. The final policy will describe how to export or delete them.</p>
            </Section>
        </PublicLayout>
    )
}
