import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronRight,
  HeartPulse,
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Stethoscope,
    title: "Find the right doctor",
    description: "Explore available providers and choose the care that feels right for you."
  },
  {
    icon: CalendarDays,
    title: "Request an appointment",
    description: "Send an appointment request in just a few steps, whenever it suits you."
  },
  {
    icon: HeartPulse,
    title: "Keep your care together",
    description: "See appointment updates and your care details in one easy-to-use place."
  }
];

const HomePage = () => (
  <main className="overflow-hidden bg-white text-ink">
    <header className="relative z-10 border-b border-line/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 text-medical" aria-label="ClinicFlow home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical text-white shadow-sm">
            <Activity className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">ClinicFlow</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <a className="text-sm font-medium text-muted transition hover:text-medical" href="#care">Your care</a>
          <a className="text-sm font-medium text-muted transition hover:text-medical" href="#how-it-works">How it works</a>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Link to="/login" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-medical transition hover:bg-canvas sm:inline-flex">
            Sign in
          </Link>
          <Link to="/register" className="primary-button !rounded-xl !px-4 !py-2.5">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>

    <section className="relative isolate bg-canvas">
      <div className="pointer-events-none absolute -right-36 -top-44 -z-10 h-[520px] w-[520px] rounded-full border border-sage/15" />
      <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-[380px] w-[380px] rounded-full border border-sage/15" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div className="soft-enter">
          <div className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-white px-3.5 py-2 text-xs font-bold text-sage-deep shadow-sm">
            <span className="h-2 w-2 rounded-full bg-sage-deep" />
            A calmer way to manage your care
          </div>
          <h1 className="mt-6 max-w-2xl font-display text-[2.75rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-medical sm:text-6xl lg:text-[4.25rem]">
            Healthcare, made <span className="text-sage-deep">easier to navigate.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
            Find a doctor, request an appointment, and keep track of your care — all in one welcoming place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="primary-button !rounded-xl !px-6 !py-3.5">
              Create your patient account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="secondary-button !rounded-xl !px-6 !py-3.5">
              Sign in to your account
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sage-deep" /> Private, secure access</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-sage-deep" /> Simple appointment updates</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] lg:mr-0">
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-sage/20 via-transparent to-medical/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] bg-medical p-6 text-white shadow-[0_30px_80px_rgba(36,75,104,0.22)] sm:p-9">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-sage/20 blur-sm" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Your care, in one place</p>
                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">A little more peace of mind.</h2>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#B9DED1]">
                  <HeartPulse className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-8 rounded-2xl border border-white/70 bg-white p-5 text-ink shadow-xl sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-sage-deep"><CalendarCheck2 className="h-5 w-5" /></span>
                    <div>
                      <p className="text-xs font-medium text-muted">Your appointments</p>
                      <p className="mt-0.5 text-sm font-bold text-ink">Care, clearly organized</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted" />
                </div>
                <div className="my-5 h-px bg-line" />
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF1F6] text-sm font-bold text-medical">DR</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">Your care team</p>
                    <p className="mt-0.5 text-xs text-muted">Browse doctors and request a visit</p>
                  </div>
                  <span className="rounded-full bg-[#E8F4EE] px-2.5 py-1 text-[11px] font-bold text-[#317254]">Available</span>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-canvas px-3.5 py-3">
                  <CalendarClock className="h-4 w-4 text-sage-deep" />
                  <p className="text-xs font-medium text-muted">Get clear updates on your requests</p>
                  <Check className="ml-auto h-4 w-4 shrink-0 text-success" />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 px-1 text-sm text-white/75">
                <span className="flex -space-x-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-medical bg-[#D9ECE4] text-[10px] font-bold text-medical">CF</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-medical bg-[#EAF1F6] text-medical"><Stethoscope className="h-3.5 w-3.5" /></span>
                </span>
                <span>Thoughtful tools for patients and care teams</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="care" className="mx-auto max-w-7xl scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.17em] text-sage-deep">Care that feels more connected</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-medical sm:text-4xl">The essentials, all in one place.</h2>
        <p className="mt-4 text-base leading-7 text-muted">Less time figuring things out. More confidence in what comes next.</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {services.map(({ icon: Icon, title, description }, index) => (
          <article key={title} className="group rounded-2xl border border-line bg-white p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-sage/50 hover:shadow-lift sm:p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-sage-deep transition group-hover:bg-medical group-hover:text-white">
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-sage-deep">0{index + 1}</p>
            <h3 className="mt-2 font-display text-lg font-bold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>

    <section id="how-it-works" className="scroll-mt-8 border-y border-line/80 bg-canvas">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-sage-deep">A straightforward journey</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-medical sm:text-4xl">From search to appointment, without the guesswork.</h2>
          <p className="mt-4 text-sm leading-7 text-muted">ClinicFlow brings the key steps together, so you can focus on finding the care you need.</p>
          <Link to="/register" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-sage-deep transition hover:text-medical">
            Get started today <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["01", "Create an account", "Set up your patient profile securely."],
            ["02", "Choose a doctor", "Explore providers available to you."],
            ["03", "Request a visit", "Track your appointment updates."]
          ].map(([number, title, description]) => (
            <div key={number} className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-medical text-xs font-bold text-white">{number}</span>
              <h3 className="mt-5 font-display font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
      <div className="flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-medical px-6 py-9 text-white sm:px-10 sm:py-11 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#B9DED1]">Your next step starts here</p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">Make managing your care feel simpler.</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">Create an account to find a doctor and request your first appointment.</p>
        </div>
        <Link to="/register" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-medical shadow-sm transition hover:bg-[#EFF6F3]">
          Create an account <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>

    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link to="/" className="flex w-fit items-center gap-2 font-bold text-medical">
          <Activity className="h-4 w-4" /> ClinicFlow
        </Link>
        <p>Care, made simpler.</p>
        <Link to="/login" className="inline-flex w-fit items-center gap-1 font-semibold text-medical hover:text-sage-deep">
          Sign in <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </footer>
  </main>
);

export default HomePage;
