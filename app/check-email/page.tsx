import Link from 'next/link';
import { checkEmailContent } from '@/data/checkEmail';
import DashedGrid from '@/components/shared/DashedGrid';

type Props = {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CheckEmailPage({ searchParams }: Props) {
    const resolvedSearchParams = (await searchParams) ?? {};
    const type = Array.isArray(resolvedSearchParams.type) ? resolvedSearchParams.type[0] : resolvedSearchParams.type;
    const email = Array.isArray(resolvedSearchParams.email) ? resolvedSearchParams.email[0] : resolvedSearchParams.email;

    const kind = type === 'forgot-password' ? 'forgotPassword' : 'signup';
    const data = checkEmailContent[kind as keyof typeof checkEmailContent];

    const description = data.description.replace('{email}', email ?? 'your email');

    return (
        <main className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
            {/* Background dashed grid */}
            <DashedGrid absolute zIndex={-1} opacity={0.5} />

            <div className="mx-auto w-full max-w-md relative z-10">
                <div className="w-full rounded-4xl border border-border bg-card p-7 shadow-xl dark:shadow-black/40 sm:p-8">
                    <h1 className="text-2xl font-bold text-foreground">{data.heading}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{description}</p>

                    <div className="mt-6">
                        <Link
                            href="https://mail.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-full bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(37,99,235,0.45)] transition-all hover:from-blue-600 hover:to-blue-700"
                        >
                            Open Gmail
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
