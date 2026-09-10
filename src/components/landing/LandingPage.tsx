import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { DepthText } from './DepthText';
import { InstallGuide } from './InstallGuide';
import './LandingPage.css';

const features = [
  {
    title: 'Stundenplan',
    description: 'Dein Schultag auf einen Blick – mit Räumen, Lehrkräften und klaren Zeitblöcken.',
    Icon: Clock3,
    color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300',
  },
  {
    title: 'Hausaufgaben',
    description: 'Aufgaben schnell erfassen, priorisieren und pünktlich erledigen.',
    Icon: ClipboardList,
    color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300',
  },
  {
    title: 'Kalender',
    description: 'Unterricht, Prüfungen und persönliche Termine in einer ruhigen Übersicht.',
    Icon: CalendarDays,
    color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-300',
  },
  {
    title: 'Noten',
    description: 'Leistungen nachvollziehbar dokumentieren und deine Entwicklung im Blick behalten.',
    Icon: GraduationCap,
    color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300',
  },
  {
    title: 'Vertretungen',
    description: 'Änderungen, Ausfälle und Raumwechsel dort sehen, wo du sie brauchst.',
    Icon: RefreshCw,
    color: 'bg-pink-500/10 text-pink-600 dark:bg-pink-400/15 dark:text-pink-300',
  },
];

const todayItems = [
  { time: '08:00', subject: 'Mathematik', room: 'B 204', color: 'bg-blue-500' },
  { time: '09:45', subject: 'Englisch', room: 'A 112', color: 'bg-purple-500' },
  { time: '11:30', subject: 'Biologie', room: 'C 021', color: 'bg-emerald-500' },
];

export function LandingPage() {
  const reduceMotion = useReducedMotion();
  const revealInitial = reduceMotion ? false : { opacity: 0, y: 20 };

  return (
    <div className="schoolcal-landing h-dvh w-full overflow-y-auto overflow-x-hidden bg-[#f4f7fb] text-slate-950 selection:bg-ios-blue selection:text-white dark:bg-[#050a12] dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-[-18rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-500/15" />
        <div className="absolute right-[-12rem] top-[44rem] h-[30rem] w-[30rem] rounded-full bg-indigo-400/10 blur-[100px] dark:bg-indigo-500/10" />
      </div>

      <header className="relative z-20 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.35rem] border border-white/70 bg-white/70 px-3 py-2.5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] sm:px-4"
          aria-label="Hauptnavigation"
        >
          <a
            href="#start"
            className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 font-black tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue"
            aria-label="SchoolCal Startseite"
          >
            <img src="/icon.svg" alt="" className="h-9 w-9 rounded-[0.7rem] shadow-sm" />
            <span className="hidden text-lg sm:inline">SchoolCal</span>
          </a>

          <div className="hidden items-center gap-7 text-sm font-bold text-slate-600 dark:text-slate-300 md:flex">
            <a className="rounded-lg hover:text-ios-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue" href="#vorteile">
              Vorteile
            </a>
            <a className="rounded-lg hover:text-ios-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue" href="#installieren">
              Installieren
            </a>
          </div>

          <a
            href="/app"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-ios-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue focus-visible:ring-offset-2 active:scale-[0.98] dark:bg-white dark:text-slate-950 dark:hover:bg-blue-100 dark:focus-visible:ring-offset-[#0b111b]"
          >
            <span className="hidden xs:inline">Desktop Version öffnen</span>
            <span className="xs:hidden">App öffnen</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main className="relative z-10">
        <section id="start" className="px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:pt-28">
          <div className="mx-auto max-w-7xl text-center">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-9 inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/[0.07] px-4 py-2 text-sm font-extrabold text-blue-700 dark:border-blue-300/15 dark:bg-blue-400/10 dark:text-blue-200"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Dein Schultag. Klar organisiert.
            </motion.div>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.08 }}
              className="mx-auto flex min-h-[4.5rem] w-full items-center justify-center px-2 py-4 sm:min-h-[7rem] lg:min-h-[9rem]"
            >
              <DepthText
                text="SchoolCal"
                layers={34}
                depth={2.2}
                faceColor="var(--landing-depth-face)"
                depthColor="#007AFF"
                tilt={9}
                pointerTracking
                smoothing={0.14}
                perspective={1000}
                autoOrbit
                orbitSpeed={0.15}
                fontSize="clamp(2.8rem, 12vw, 8rem)"
                fontWeight={900}
                shadow
                className="max-w-full"
              />
            </motion.h1>

            <motion.div
              initial={revealInitial}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.18 }}
              className="mx-auto mt-7 max-w-2xl"
            >
              <p className="text-lg font-medium leading-8 text-slate-600 dark:text-slate-300 sm:text-xl sm:leading-9">
                Stundenplan, Aufgaben, Noten und Änderungen an einem Ort. SchoolCal bringt Ruhe in deinen Schulalltag – auf jedem Gerät.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <a
                  href="/app"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-ios-blue px-6 py-3.5 text-base font-black text-white shadow-xl shadow-blue-500/20 transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue focus-visible:ring-offset-2 active:scale-[0.98] dark:focus-visible:ring-offset-[#09111c]"
                >
                  Desktop Version öffnen
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
                <a
                  href="#installieren"
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-black/10 bg-white/70 px-6 py-3.5 text-base font-extrabold text-slate-800 backdrop-blur transition hover:border-ios-blue/30 hover:text-ios-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue focus-visible:ring-offset-2 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:focus-visible:ring-offset-[#09111c]"
                >
                  Als App installieren
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.3 }}
              className="relative mx-auto mt-16 max-w-5xl sm:mt-20"
            >
              <div className="absolute inset-x-[12%] bottom-[-8%] h-1/2 rounded-full bg-blue-500/20 blur-[70px] dark:bg-blue-500/15" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-3 shadow-[0_40px_100px_-35px_rgba(14,65,125,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] sm:p-5">
                <div className="grid gap-4 rounded-[1.45rem] border border-black/[0.05] bg-[#f7f9fc] p-4 text-left dark:border-white/[0.06] dark:bg-[#0b121d] sm:p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
                  <div className="flex flex-col justify-between rounded-[1.5rem] bg-gradient-to-br from-[#12304A] to-[#075a9e] p-6 text-white sm:p-8">
                    <div>
                      <p className="text-sm font-bold text-blue-100">Guten Morgen</p>
                      <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Bereit für deinen Tag?</h2>
                    </div>
                    <div className="mt-10 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                        <p className="text-2xl font-black">3</p>
                        <p className="mt-1 text-sm text-blue-100">Aufgaben offen</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                        <p className="text-2xl font-black">5</p>
                        <p className="mt-1 text-sm text-blue-100">Stunden heute</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-black/[0.05] bg-white p-5 dark:border-white/[0.07] dark:bg-white/[0.05] sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Donnerstag, 10. September</p>
                        <h3 className="mt-1 text-xl font-black tracking-tight">Dein Stundenplan</h3>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-ios-blue">
                        <CalendarDays className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {todayItems.map((item) => (
                        <div key={item.time} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3.5 dark:bg-white/[0.05]">
                          <span className={`h-10 w-1 shrink-0 rounded-full ${item.color}`} />
                          <span className="w-12 shrink-0 text-sm font-extrabold text-slate-500 dark:text-slate-400">{item.time}</span>
                          <span className="min-w-0 flex-1 truncate font-extrabold">{item.subject}</span>
                          <span className="shrink-0 rounded-lg bg-black/[0.04] px-2 py-1 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">{item.room}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="about-title">
          <motion.div
            initial={revealInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
          >
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-ios-blue">Einfach SchoolCal</p>
              <h2 id="about-title" className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Mehr Überblick.<br />Weniger Kopfchaos.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              <p>
                SchoolCal verbindet alles, was deinen Schulalltag bestimmt, in einer schnellen und verständlichen Oberfläche. Damit du weniger Zeit mit Organisieren und mehr Zeit mit Lernen verbringen kannst.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 dark:bg-white/[0.07]"><ShieldCheck className="h-4 w-4 text-ios-blue" /> Sicher synchronisiert</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 dark:bg-white/[0.07]"><BellRing className="h-4 w-4 text-ios-blue" /> Rechtzeitig erinnert</span>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="vorteile" className="scroll-mt-8 px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="features-title">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={revealInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
              className="max-w-2xl"
            >
              <p className="text-sm font-black uppercase tracking-[0.18em] text-ios-blue">Alles an seinem Platz</p>
              <h2 id="features-title" className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Gebaut für echte Schultage.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Von der ersten Stunde bis zur nächsten Prüfung bleibt alles klar, aktuell und erreichbar.</p>
            </motion.div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {features.map(({ title, description, Icon, color }, index) => (
                <motion.article
                  key={title}
                  initial={revealInitial}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: reduceMotion ? 0 : index * 0.05 }}
                  className={`rounded-[1.75rem] border border-black/[0.06] bg-white/75 p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.55)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.05] ${index < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-xl font-black tracking-tight">{title}</h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="installieren" className="scroll-mt-8 px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="install-title">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={revealInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
              className="mx-auto mb-12 max-w-2xl text-center"
            >
              <p className="text-sm font-black uppercase tracking-[0.18em] text-ios-blue">Direkt auf deinem Gerät</p>
              <h2 id="install-title" className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">SchoolCal wie eine App nutzen.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Schnell erreichbar, im eigenen Fenster und bereit für deinen nächsten Schultag.</p>
            </motion.div>

            <motion.div
              initial={revealInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.6 }}
            >
              <InstallGuide />
            </motion.div>

            <div className="mt-10 text-center">
              <a
                href="/app"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-base font-black text-white transition hover:bg-ios-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue focus-visible:ring-offset-2 active:scale-[0.98] dark:bg-white dark:text-slate-950 dark:hover:bg-blue-100 dark:focus-visible:ring-offset-[#07101a]"
              >
                Desktop Version öffnen
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-black/[0.06] px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 dark:border-white/10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <img src="/icon.svg" alt="" className="h-9 w-9 rounded-xl" />
            <div>
              <p className="font-black">SchoolCal</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Dein digitaler Schulplaner.</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} SchoolCal</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
