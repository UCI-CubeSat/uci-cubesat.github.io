import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { useScrollAnimation } from "~/hooks/useScrollAnimation";
import { CountUp } from "~/components/CountUp";
import { CubesatHero } from "~/components/cubesat-hero/CubesatHero";

export const meta: MetaFunction = () => [
  { title: "UCI CubeSat" },
  {
    name: "description",
    content:
      "UCI CubeSat is a student-led organization at UC Irvine designing, building, and launching a 2U nanosatellite into Low Earth Orbit.",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://ucicubesat.com/",
  },
  { property: "og:title", content: "UCI CubeSat" },
  {
    property: "og:description",
    content:
      "A student-led organization at UC Irvine designing and launching a 2U nanosatellite into Low Earth Orbit.",
  },
  { property: "og:url", content: "https://ucicubesat.com/" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "UCI CubeSat" },
  {
    name: "twitter:description",
    content:
      "A student-led organization at UC Irvine designing and launching a 2U nanosatellite into Low Earth Orbit.",
  },
  {
    name: "twitter:image",
    content: "https://ucicubesat.com/images/og-image.png",
  },
];

export default function Home() {
  const statsAnimation = useScrollAnimation<HTMLElement>();
  const aboutAnimation = useScrollAnimation<HTMLElement>();
  const sponsorsAnimation = useScrollAnimation<HTMLElement>();

  return (
    <>
      <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/earth-orbit-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover object-bottom"
          aria-hidden="true"
        >
          <source src="/videos/earth-orbit.mp4" type="video/mp4" />
          <source src="/videos/earth-orbit.webm" type="video/webm" />
        </video>
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, #070A0F 0%, rgba(7,10,15,0.85) 35%, rgba(7,10,15,0.4) 65%, rgba(7,10,15,0.7) 85%, #070A0F 100%)",
          }}
        />
        <div className="relative z-[2] text-center max-w-[640px] px-6 -mt-[10vh]">
          <h1 className="font-bold text-[72px] text-primary m-0 mb-6 leading-[1.15] max-sm:text-[48px] overflow-hidden">
            {"UCI CubeSat".split("").map((char, i) => (
              <span
                key={i}
                className="hero-letter"
                style={{ animationDelay: `${0.2 + i * 0.04}s` }}
                aria-hidden="true"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
            <span className="sr-only">UCI CubeSat</span>
          </h1>
          <p
            className="hero-fade-up text-base leading-[1.7] text-muted max-w-[520px] mx-auto mb-8 max-sm:text-[15px]"
            style={{ animationDelay: "0.8s" }}
          >
            Designing, testing, and launching a modular nanosatellite into
            low-Earth orbit.
          </p>
          <div className="hero-fade-up" style={{ animationDelay: "1s" }}>
            <Link
              to="/aboutus/what-we-do"
              className="inline-block text-[15px] font-medium text-white transition-colors hover:text-atmosphere"
            >
              Explore Our Mission →
            </Link>
          </div>
        </div>
      </section>

      <CubesatHero />

      <section
        ref={statsAnimation.ref}
        className={`relative z-[3] flex items-center justify-center gap-16 py-16 px-6 max-sm:gap-10 max-sm:py-12 animate-on-scroll ${statsAnimation.isVisible ? "visible" : ""}`}
      >
        <div className="flex flex-col items-center gap-1">
          <CountUp
            end={10}
            suffix="+"
            duration={2}
            className="text-[48px] font-semibold text-primary leading-none max-sm:text-[36px]"
          />
          <span className="text-sm text-muted">Years In Progress</span>
        </div>
        <div className="w-px h-12 bg-starlight" />
        <div className="flex flex-col items-center gap-1">
          <CountUp
            end={200}
            suffix="+"
            duration={2}
            className="text-[48px] font-semibold text-primary leading-none max-sm:text-[36px]"
          />
          <span className="text-sm text-muted">Members</span>
        </div>
      </section>

      <section
        ref={aboutAnimation.ref}
        className={`relative section-glow-earth flex items-center justify-center gap-[60px] py-24 px-10 max-w-[1200px] mx-auto max-sm:flex-col max-sm:py-16 max-sm:px-6 max-sm:gap-8 animate-on-scroll ${aboutAnimation.isVisible ? "visible" : ""}`}
      >
        <div className="shrink-0 relative">
          <div className="absolute -inset-2 rounded-lg bg-gradient-to-br from-earth/10 to-atmosphere/5 blur-xl pointer-events-none" />
          <img
            src="/photos/Home_Page.png"
            alt="UCI CubeSat team working on satellite"
            width={400}
            height={300}
            loading="lazy"
            className="relative rounded-lg block max-w-full h-auto max-sm:w-full"
          />
        </div>
        <div className="max-w-[500px]">
          <h2 className="font-semibold text-[40px] text-primary m-0 mb-6 max-sm:text-[30px]">
            Who We Are
          </h2>
          <p className="text-[15px] leading-[1.7] text-muted m-0 mb-4 max-sm:hidden">
            We are an interdisciplinary team of undergraduate students at UCI
            dedicated to building and launching a 2U nanosatellite. The
            satellite operates with five main engineering subsystems: Avionics,
            Communications, Structures, Power, and Systems, in addition to
            housing our research payload.
          </p>
          <p className="text-[15px] leading-[1.7] text-muted m-0 mb-4 hidden max-sm:block">
            We are an interdisciplinary team of undergraduate students at UCI
            dedicated to building and launching a 2U nanosatellite. The
            satellite operates with six main engineering sub-teams.
          </p>
          <p className="text-[15px] leading-[1.7] text-muted m-0 mb-4">
            Our mission is to test innovative thermal management technology in
            space, while providing hands-on experience to future leaders in
            aerospace engineering.
          </p>
          <Link
            to="/aboutus/meet-the-team"
            className="inline-block text-[15px] font-medium text-earth mt-2 transition-colors hover:text-atmosphere"
          >
            Meet The Team →
          </Link>
        </div>
      </section>

      <section
        ref={sponsorsAnimation.ref}
        className={`py-10 px-6 animate-on-scroll ${sponsorsAnimation.isVisible ? "visible" : ""}`}
      >
        <p className="text-xs text-dust uppercase tracking-[0.2em] text-center m-0 mb-12">
          Our Sponsors
        </p>
        <div className="flex items-center justify-center gap-16 flex-wrap max-sm:gap-10">
          <img
            src="/images/NG_logo.png"
            alt="Northrop Grumman"
            width={265}
            height={60}
            loading="lazy"
            className="max-h-8 w-auto object-contain grayscale brightness-[0.7] transition-[filter] duration-300 hover:grayscale-0 hover:brightness-100"
          />
          <img
            src="/images/TO_logo.png"
            alt="Terran Orbital"
            width={78}
            height={60}
            loading="lazy"
            className="max-h-8 w-auto object-contain grayscale brightness-[0.7] transition-[filter] duration-300 hover:grayscale-0 hover:brightness-100"
          />
          <img
            src="/images/GA_logo.png"
            alt="General Atomics Aeronautical"
            width={200}
            height={30}
            loading="lazy"
            className="max-h-8 w-auto object-contain grayscale brightness-[0.7] transition-[filter] duration-300 hover:grayscale-0 hover:brightness-100"
          />
          <img
            src="/images/ANSYS_logo.png"
            alt="Ansys"
            width={165}
            height={42}
            loading="lazy"
            className="max-h-8 w-auto object-contain grayscale brightness-[0.7] transition-[filter] duration-300 hover:grayscale-0 hover:brightness-100"
          />
        </div>
      </section>
    </>
  );
}
