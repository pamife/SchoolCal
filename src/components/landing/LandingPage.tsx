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
  Sparkles,
  Wifi,
} from 'lucide-react';
import { DepthText } from './DepthText';
import { InstallGuide } from './InstallGuide';
import { Aurora } from './reactbits/Aurora';
import { Magnet } from './reactbits/Magnet';
import { SpotlightCard } from './reactbits/SpotlightCard';
import { TiltSurface } from './reactbits/TiltSurface';
import './LandingPage.css';

const features = [
  {
    title: 'Stundenplan',
    description: 'Dein Schultag auf einen Blick – mit Räumen, Lehrkräften und klaren Zeitblöcken.',
    Icon: Clock3,
    color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300',
    spotlight: 'rgba(0, 122, 255, 0.20)' as const,
  },
  {
    title: 'Hausaufgaben',
    description: 'Aufgaben schnell erfassen, priorisieren und pünktlich erledigen.',
    Icon: ClipboardList,
    color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300',
    spotlight: 'rgba(249, 115, 22, 0.16)' as const,
  },
  {
    title: 'Kalender',
    description: 'Unterricht, Prüfungen und persönliche Termine in einer ruhigen Übersicht.',
    Icon: CalendarDays,
    color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-300',
    spotlight: 'rgba(139, 92, 246, 0.17)' as const,
  },
  {
    title: 'Noten',
    description: 'Leistungen nachvollziehbar dokumentieren und deine Entwicklung im Blick behalten.',
    Icon: GraduationCap,
    color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300',
    spotlight: 'rgba(16, 185, 129, 0.16)' as const,
  },
  {
    title: 'Vertretungen',
    description: 'Änderungen, Ausfälle und Raumwechsel dort sehen, wo du sie brauchst.',
    Icon: RefreshCw,
    color: 'bg-pink-500/10 text-pink-600 dark:bg-pink-400/15 dark:text-pink-300',
    spotlight: 'rgba(236, 72, 153, 0.16)' as const,
  },
];

const todayItems = [
  { time: '08:00', subject: 'Mathematik', room: 'B 204', color: 'bg-blue-500' },
  { time: '09:45', subject: 'Englisch', room: 'A 112', color: 'bg-purple-500' },
  { time: '11:30', subject: 'Biologie', room: 'C 021', color: 'bg-emerald-500' },
];

export function LandingPage() {
  const reduceMotion = useReducedMotion();
  const revealInitial = reduceMotion ? false : { opacity: 0, y: 22 };
  const revealTransition = { duration: reduceMotion ? 0 : 0.55 };

  return (
    <div className="schoolcal-landing h-dvh w-full overflow-x-hidden overflow-y-auto bg-[#f4f7fb] text-slate-950 selection:bg-ios-blue selection:text-white dark:bg-[#050912] dark:text-white">
      <div className="landing-atmosphere" aria-hidden="true">
        <span className="landing-orb landing-orb--one" />
        <span className="landing-orb landing-orb--two" />
      </div>

      <header className="relative z-30 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
        <nav className="landing-nav mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-4" aria-label="Hauptnavigation">
          <a
            href="#start"
            className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 font-black tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue"
            aria-label="SchoolCal Startseite"
          >
            <span className="landing-logo-wrap">
              <img src="/icon.svg" alt="" className="h-9 w-9 rounded-[0.7rem]" />
            </span>
            <span className="hidden text-lg sm:inline">SchoolCal</span>
          </a>

          <div className="hidden items-center gap-7 text-sm font-bold text-slate-600 dark:text-slate-300 md:flex">
            <a className="landing-nav-link rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue" href="#vorteile">
              Vorteile
            </a>
            <a className="landing-nav-link rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue" href="#installieren">
              Installieren
            </a>
          </div>

          <a href="/app" className="premium-button premium-button--dark min-h-11 px-4 py-2 text-sm" aria-label="Desktop Version von SchoolCal öffnen">
            <span className="hidden sm:inline">Desktop Version öffnen</span>
            <span className="sm:hidden">App öffnen</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main className="relative z-10">
        <section id="start" className="landing-hero relative px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:pt-28">
          <Aurora className="hero-aurora" paused={Boolean(reduceMotion)} />
          <div className="hero-grid" aria-hidden="true" />

          <div className="relative z-10 mx-auto max-w-7xl text-center">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5 }}
              className="landing-pill mb-9 inline-flex items-center gap-2 px-4 py-2 text-sm font-extrabold"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Dein Schultag. Klar organisiert.
            </motion.div>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, scale: 0.965 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.08 }}
              className="hero-title mx-auto flex min-h-[4.5rem] w-full items-center justify-center px-2 py-4 sm:min-h-[7rem] lg:min-h-[9rem]"
            >
              <DepthText
                text="SchoolCal"
                layers={34}
                depth={2.15}
                faceColor="var(--landing-depth-face)"
                depthColor="#007AFF"
                tilt={8}
                pointerTracking
                smoothing={0.14}
                perspective={1000}
                autoOrbit
                orbitSpeed={0.11}
                fontSize="clamp(2.65rem, 11.5vw, 8rem)"
                fontWeight={900}
                shadow
                className="max-w-full"
              />
            </motion.h1>

            <motion.div
              initial={revealInitial}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.18 }}
              className="mx-auto mt-7 max-w-2xl"
            >
              <p className="text-lg font-medium leading-8 text-slate-600 dark:text-slate-300 sm:text-xl sm:leading-9">
                Stundenplan, Aufgaben, Noten und Änderungen an einem Ort. SchoolCal bringt Ruhe in deinen Schulalltag – auf jedem Gerät.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Magnet wrapperClassName="w-full sm:w-auto" disabled={Boolean(reduceMotion)}>
                  <a href="/app" className="premium-button premium-button--primary min-h-14 w-full px-6 py-3.5 text-base sm:w-auto">
                    Desktop Version öffnen
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </a>
                </Magnet>
                <Magnet wrapperClassName="w-full sm:w-auto" disabled={Boolean(reduceMotion)}>
                  <a href="#installieren" className="premium-button premium-button--glass min-h-14 w-full px-6 py-3.5 text-base sm:w-auto">
                    Als App installieren
                  </a>
                </Magnet>
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.75, delay: reduceMotion ? 0 : 0.3 }}
              className="relative mx-auto mt-16 max-w-5xl sm:mt-20"
            >
              <div className="preview-glow" aria-hidden="true" />
              <TiltSurface>
                <div className="app-window">
                  <div className="app-window__chrome" aria-hidden="true">
                    <div className="app-window__traffic-lights"><span /><span /><span /></div>
                    <div className="app-window__address">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      app.schoolcal.de
                    </div>
                    <div className="app-window__status"><Wifi className="h-3.5 w-3.5" /> synchronisiert</div>
                  </div>
                  <div className="app-window__content">
                    <div className="grid gap-4 rounded-[1.45rem] border border-black/[0.05] bg-[#f7f9fc] p-4 text-left dark:border-white/[0.06] dark:bg-[#0b121d] sm:p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
                      <div className="preview-welcome flex flex-col justify-between rounded-[1.5rem] p-6 text-white sm:p-8">
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
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-ios-blue">
                            <CalendarDays className="h-5 w-5" aria-hidden="true" />
                          </div>
                        </div>
                        <div className="grid gap-3">
                          {todayItems.map((item) => (
                            <div key={item.time} className="preview-row flex items-center gap-4 rounded-2xl bg-slate-50 p-3.5 dark:bg-white/[0.05]">
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
                </div>
              </TiltSurface>
            </motion.div>
          </div>
        </section>

        <section className="landing-section px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="about-title">
          <motion.div
            initial={revealInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={revealTransition}
            className="about-panel mx-auto grid max-w-6xl gap-10 p-7 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-14"
          >
            <div>
              <p className="section-kicker">Einfach SchoolCal</p>
              <h2 id="about-title" className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Mehr Überblick.<br />Weniger Kopfchaos.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              <p>
                SchoolCal verbindet alles, was deinen Schulalltag bestimmt, in einer schnellen und verständlichen Oberfläche. Damit du weniger Zeit mit Organisieren und mehr Zeit mit Lernen verbringen kannst.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <span className="landing-chip"><ShieldCheck className="h-4 w-4 text-ios-blue" aria-hidden="true" /> Sicher synchronisiert</span>
                <span className="landing-chip"><BellRing className="h-4 w-4 text-ios-blue" aria-hidden="true" /> Rechtzeitig erinnert</span>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="vorteile" className="landing-section scroll-mt-8 px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="features-title">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={revealInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={revealTransition}
              className="max-w-2xl"
            >
              <p className="section-kicker">Alles an seinem Platz</p>
              <h2 id="features-title" className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Gebaut für echte Schultage.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Von der ersten Stunde bis zur nächsten Prüfung bleibt alles klar, aktuell und erreichbar.</p>
            </motion.div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {features.map(({ title, description, Icon, color, spotlight }, index) => (
                <motion.div
                  key={title}
                  initial={revealInitial}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : index * 0.05 }}
                  className={index < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}
                >
                  <SpotlightCard className="feature-card h-full p-6" spotlightColor={spotlight}>
                    <div className={`feature-icon flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mt-6 text-xl font-black tracking-tight">{title}</h3>
                    <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="installieren" className="landing-section scroll-mt-8 px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="install-title">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={revealInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={revealTransition}
              className="mx-auto mb-12 max-w-2xl text-center"
            >
              <p className="section-kicker">Direkt auf deinem Gerät</p>
              <h2 id="install-title" className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">SchoolCal wie eine App nutzen.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Schnell erreichbar, im eigenen Fenster und bereit für deinen nächsten Schultag.</p>
            </motion.div>

            <motion.div
              initial={revealInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: reduceMotion ? 0 : 0.6 }}
            >
              <InstallGuide />
            </motion.div>

            <div className="mt-10 flex justify-center text-center">
              <Magnet disabled={Boolean(reduceMotion)}>
                <a href="/app" className="premium-button premium-button--dark min-h-14 px-6 py-3.5 text-base">
                  Desktop Version öffnen
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
              </Magnet>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-black/[0.06] px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 dark:border-white/10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <span className="landing-logo-wrap"><img src="/icon.svg" alt="" className="h-9 w-9 rounded-xl" /></span>
            <div>
              <p className="font-black">SchoolCal</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Dein digitaler Schulplaner.</p>
            </div>
          </div>
          <p className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-ios-blue" aria-hidden="true" />
            © {new Date().getFullYear()} SchoolCal
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
