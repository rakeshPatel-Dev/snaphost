import { privacyPolicySections } from '@/data/company';
import DashedGrid from '@/components/shared/DashedGrid';

export const metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for SnapHost.',
};

export default function PrivacyPolicyPage() {
    return (
        <main className="relative overflow-hidden">
            {/* Background dashed grid */}
            <DashedGrid absolute zIndex={-1} opacity={0.5} />

            <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
                <div className="relative overflow-hidden rounded-4xl border border-border bg-card/80 p-8 shadow-xl sm:p-12 backdrop-blur-md">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.01),transparent_28%)]" />
                    <div className="mb-5 inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Privacy Policy
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                        This policy describes the data SnapHost collects to power file uploads, user accounts, sharing, and the rest of the app experience.
                    </p>

                    <div className="mt-10 space-y-6">
                        {privacyPolicySections.map((section) => (
                            <section key={section.title} className="rounded-3xl border border-border bg-background/80 p-6">
                                <h2 className="text-lg font-semibold tracking-tight text-foreground">{section.title}</h2>
                                <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
                                    {section.body.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}