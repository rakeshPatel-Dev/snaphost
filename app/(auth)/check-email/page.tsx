import Link from 'next/link'
import { checkEmailContent } from '@/data/checkEmail'
import { Button } from '@/components/ui/button'
import Container from '@/components/shared/Container'
import DashedGrid from '@/components/shared/DashedGrid'
import Logo from '@/components/layout/Logo'

type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CheckEmailPage({ searchParams }: Props) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const type = Array.isArray(resolvedSearchParams.type)
    ? resolvedSearchParams.type[0]
    : resolvedSearchParams.type
  const email = Array.isArray(resolvedSearchParams.email)
    ? resolvedSearchParams.email[0]
    : resolvedSearchParams.email

  const kind = type === 'forgot-password' ? 'forgotPassword' : 'signup'
  const data = checkEmailContent[kind as keyof typeof checkEmailContent]

  const description = data.description.replace('{email}', email ?? 'your email')

  return (
    <div className="relative isolate overflow-hidden bg-background text-foreground">
      {/* Background dashed grid */}
      <DashedGrid absolute zIndex={-1} opacity={0.4} />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-150 w-full max-w-5xl -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />

      <Container className="relative flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <Logo />
          </div>

          <div className="w-full rounded-4xl border border-border/60 bg-card/80 p-7 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] sm:p-8">
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
              {data.heading}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

            <div className="mt-6">
              <Button asChild size="lg" className="h-11 w-full cursor-pointer">
                <Link href={data.buttonHref}>{data.buttonLabel}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
