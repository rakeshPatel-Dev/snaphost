import { termsOfServiceSections } from '@/data/company';

export const metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for SnapHost.',
};

export default function TermsOfServicePage() {
    return (
        <main className="relative overflow-hidden">
            <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="bg-grid-pattern rounded-4xl border border-border bg-card/90 p-8 shadow-xl sm:p-12">
                    <div className="mb-5 inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Terms of Service
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Terms of Service
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                        These Terms describe how SnapHost can be used, what users are responsible for, and how uploaded content and public links should be handled.
                    </p>

                    <div className="mt-10 space-y-6">
                        {termsOfServiceSections.map((section) => (
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