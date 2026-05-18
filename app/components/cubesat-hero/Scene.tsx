import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from "react";
import * as THREE from "three";
import { ExplodedAssembly } from "./ExplodedAssembly";

interface SceneProps {
  sectionRef: RefObject<HTMLElement>;
  reducedMotion: boolean;
}

function ScrollDriver({
  sectionRef,
  progressRef,
}: {
  sectionRef: RefObject<HTMLElement>;
  progressRef: MutableRefObject<number>;
}) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    let inView = true;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const scrollableRange = Math.max(1, rect.height - window.innerHeight);
      const p = Math.max(0, Math.min(1, -rect.top / scrollableRange));
      if (Math.abs(p - progressRef.current) > 0.0005) {
        progressRef.current = p;
        invalidate();
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
        if (inView) {
          invalidate();
        }
      },
      { rootMargin: "20% 0px 20% 0px" },
    );

    io.observe(el);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sectionRef, progressRef, invalidate]);

  return null;
}

function CameraRig({ isMobile }: { isMobile: boolean }) {
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = isMobile ? 42 : 32;
    cam.updateProjectionMatrix();
  }, [camera, isMobile]);

  return null;
}

export function Scene({ sectionRef, reducedMotion }: SceneProps) {
  const progressRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const dprCap = useMemo<[number, number]>(() => (isMobile ? [1, 1.5] : [1, 2]), [isMobile]);

  return (
    <Canvas
      frameloop="always"
      dpr={dprCap}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0.32, 0.18, 0.42], fov: 32, near: 0.01, far: 10 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      style={{ width: "100%", height: "100%", touchAction: "manipulation" }}
    >
      <CameraRig isMobile={isMobile} />
      <ScrollDriver sectionRef={sectionRef} progressRef={progressRef} />
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#d8ecff", "#0b1020", 0.7]} />
      <directionalLight position={[2, 3, 2]} intensity={1.45} />
      <directionalLight position={[-2, 1, -1.5]} intensity={0.65} color="#7FB6FF" />
      <Suspense fallback={null}>
        <ExplodedAssembly progressRef={progressRef} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}
