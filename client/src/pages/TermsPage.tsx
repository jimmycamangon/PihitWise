import PublicLayout, { Section } from '../components/PublicLayout'

// Placeholder copy — replace with the reviewed terms before launch.
export default function TermsPage() {
    return (
        <PublicLayout
            eyebrow="Terms"
            title="Terms of Service"
            intro="This page is a draft. The final terms will be published here before PihitWise opens for sign-ups."
        >
            <Section title="Using PihitWise">
                <p>PihitWise is a record-keeping and reminder tool for your motorcycle. You're responsible for the accuracy of what you log.</p>
            </Section>
            <Section title="Not a substitute for a mechanic">
                <p>Reminders and fuel economy trends are guides only. Follow your owner's manual and consult a qualified mechanic for service decisions.</p>
            </Section>
            <Section title="Your account">
                <p>Keep your sign-in details private. The final terms will cover account closure and acceptable use.</p>
            </Section>
        </PublicLayout>
    )
}
