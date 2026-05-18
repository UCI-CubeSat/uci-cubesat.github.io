import { Component, Suspense, lazy, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router";
import { ClientOnly } from "./ClientOnly";
import { HeroFallback } from "./HeroFallback";

const Scene = lazy(() => import("./Scene").then((m) => ({ default: m.Scene })));

interface SceneBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface SceneBoundaryState {
  hasError: boolean;
}

class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[CubesatHero] 3D scene failed to render", error, errorInfo);
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

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
              <SceneBoundary fallback={<HeroFallback />}>
                <Suspense fallback={<HeroFallback />}>
                  <Scene sectionRef={sectionRef} reducedMotion={reducedMotion} />
                </Suspense>
              </SceneBoundary>
            )}
          </ClientOnly>
        </div>
        <div className="pointer-events-none absolute inset-0 z-[2]">
          <div className="mx-auto flex h-full max-w-[1200px] items-center px-8 pt-16 max-md:items-start max-md:px-6 max-md:pt-24">
            <div className="max-w-[430px] text-left drop-shadow-[0_18px_34px_rgba(0,0,0,0.45)]">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-earth">
                Our Mission
              </p>
              <h2 className="m-0 mb-5 text-[44px] font-semibold leading-tight text-primary max-sm:text-[32px]">
                AntSat 01
              </h2>
              <p className="m-0 mb-4 text-[15px] leading-[1.75] text-muted max-sm:text-[14px]">
                UCI CubeSat is developing, testing, and launching a 2U nanosatellite into Low Earth Orbit to
                validate the Variable Emissivity Device, a thermal regulation payload built for compact spacecraft.
              </p>
              <p className="m-0 mb-6 text-[15px] leading-[1.75] text-muted max-sm:hidden">
                The exploded model shows the flight hardware stack: deployable panels, avionics boards,
                communications hardware, standoffs, antenna hardware, and the chassis structure that carries the mission.
              </p>
              <Link
                to="/aboutus/what-we-do"
                className="pointer-events-auto inline-block text-[15px] font-medium text-earth transition-colors hover:text-atmosphere"
              >
                Explore Subsystems -&gt;
              </Link>
            </div>
          </div>
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
