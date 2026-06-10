import Link from 'next/link';
import { ArrowRight, Scale, ShieldCheck, Sparkles } from 'lucide-react';
import { companyOverviewLinks } from '@/data/company';
import DashedGrid from '@/components/shared/DashedGrid';

export const metadata = {
    title: 'Company',
    description: 'Legal and policy information for SnapHost.',
};

const iconMap = {
    'Terms of Service': Scale,
    'Privacy Policy': ShieldCheck,
};

export default function CompanyPage() {
    return (
        <main className="relative overflow-hidden">
            {/* Background dashed grid */}
            <DashedGrid absolute zIndex={-1} opacity={0.5} />

            <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
                <div className="relative overflow-hidden rounded-4xl border border-border bg-card/80 p-8 shadow-xl sm:p-12 backdrop-blur-md">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.01),transparent_28%)]" />

                    <div className="relative">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5 text-accent" />
                            Company
                        </div>

                        <div className="max-w-2xl">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                                Legal and policy information for SnapHost.
                            </h1>
                            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                                These pages explain how SnapHost works, what data we handle, and what users can and cannot do on the platform.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 md:grid-cols-2">
                            {companyOverviewLinks.map((card) => {
                                const Icon = iconMap[card.title as keyof typeof iconMap];

                                return (
                                    <Link
                                        key={card.title}
                                        href={card.href}
                                        className="group rounded-3xl border border-border bg-background/80 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-semibold tracking-tight text-foreground">{card.title}</h2>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
                                        <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                                            Read more
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}