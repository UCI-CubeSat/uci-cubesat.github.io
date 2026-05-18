import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ClientOnly } from "./ClientOnly";
import { HeroFallback } from "./HeroFallback";

const Scene = lazy(() => import("./Scene").then((m) => ({ default: m.Scene })));

function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefers(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return prefers;
}

export function CubesatHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[250vh] bg-deep-space"
      aria-label="AntSat 01 exploded view"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(47,128,237,0.12) 0%, rgba(7,10,15,0) 55%)",
          }}
        />
        <div className="absolute inset-0 z-[1]">
          <ClientOnly fallback={<HeroFallback />}>
            {() => (
              <Suspense fallback={<HeroFallback />}>
                <Scene sectionRef={sectionRef} reducedMotion={reducedMotion} />
              </Suspense>
            )}
          </ClientOnly>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex flex-col items-center px-6 pt-20 text-center max-sm:pt-14"
        >
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-earth mb-3">
            The Hardware
          </p>
          <h2 className="font-semibold text-[40px] text-primary leading-tight m-0 max-sm:text-[28px]">
            Inside AntSat 01
          </h2>
          <p className="mt-3 text-sm leading-[1.6] text-muted max-w-md mx-auto max-sm:text-[13px]">
            Scroll to disassemble — 69 parts across 11 subsystems.
          </p>
        </div>
        <div
          className="absolute inset-x-0 top-0 z-[1] h-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, #070A0F 0%, rgba(7,10,15,0.85) 30%, rgba(7,10,15,0) 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-[2] h-32 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(7,10,15,0) 0%, rgba(7,10,15,0.85) 70%, #070A0F 100%)",
          }}
        />
      </div>
    </section>
  );
}
