import { Html, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { classify, categoryConfig, phaseProgress, type CategoryId, PART_DISTANCE_METERS } from "./parts";

const MODEL_URL = "/models/AntSat_01.glb";
const DRACO_DECODER_PATH = "/draco/";
const MODEL_ROTATION_X = -Math.PI / 2 + 0.28;
const MODEL_YAW_START = -0.14;
const MODEL_YAW_END = 0.12;

useGLTF.preload(MODEL_URL, DRACO_DECODER_PATH);

interface ExplodedAssemblyProps {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
  onReady?: () => void;
}

interface PartEntry {
  object: THREE.Object3D;
  category: CategoryId;
  originalPosition: THREE.Vector3;
  originalCenter: THREE.Vector3;
  foldOffset: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  animatedOffset: THREE.Vector3;
}

interface LabelEntry {
  id: string;
  text: string;
  part: PartEntry;
  offset: THREE.Vector3;
}

interface LabelSpec {
  id: string;
  text: string;
  pattern: RegExp;
  offset: [number, number, number];
}

const _box = new THREE.Box3();
const _tmp = new THREE.Vector3();
const _tmpFold = new THREE.Vector3();
const _tmpExplode = new THREE.Vector3();
const _labelPosition = new THREE.Vector3();

const LABEL_SPECS: LabelSpec[] = [
  { id: "top-plate", text: "TOP PLATE", pattern: /top[\s_]?plate|cover[\s_]plate/i, offset: [0.01, 0.08, 0.02] },
  { id: "ved-skin", text: "VED SKIN", pattern: /vedskin/i, offset: [-0.07, 0.04, 0] },
  { id: "solar-array", text: "SOLAR PANELS", pattern: /solar[\s_]panel|^panel\d/i, offset: [0.08, 0.04, 0.02] },
  { id: "hinges", text: "HINGES", pattern: /hinge|torsion/i, offset: [0.04, 0.05, -0.04] },
  { id: "antenna", text: "ANTENNA", pattern: /antenna/i, offset: [0.05, 0.07, 0] },
  { id: "comms", text: "COMMS XCVR", pattern: /comms|xcvr/i, offset: [-0.08, 0.05, 0.02] },
  { id: "power-board", text: "POWER BOARD", pattern: /powerboard/i, offset: [0.08, -0.02, 0.02] },
  { id: "magnetorquer", text: "MAGNETORQUER", pattern: /magnetorquer/i, offset: [0.08, 0.03, -0.03] },
  { id: "standoffs", text: "PC104 STANDOFFS", pattern: /standoff/i, offset: [-0.06, 0.03, -0.03] },
  { id: "burnwire", text: "BURNWIRE RELEASE", pattern: /burnwire/i, offset: [0.05, 0.04, 0.04] },
  { id: "chassis", text: "SKELETON CHASSIS", pattern: /chassis[\s_-]?skeleton/i, offset: [-0.08, 0.03, 0] },
];

function isFoldedPanel(category: CategoryId): boolean {
  return category === "panel" || category === "deployable";
}

function unfoldProgress(progress: number): number {
  return THREE.MathUtils.smoothstep(progress, 0.02, 0.46);
}

function labelProgress(progress: number): number {
  return THREE.MathUtils.smoothstep(progress, 0.54, 0.78);
}

function isRenderableNode(node: THREE.Object3D): boolean {
  let renderable = false;
  node.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) renderable = true;
  });
  return renderable;
}

function flattenAssemblyParts(root: THREE.Object3D): THREE.Object3D[] {
  const out: THREE.Object3D[] = [];
  const walk = (node: THREE.Object3D) => {
    for (const child of node.children) {
      if (!isRenderableNode(child)) continue;
      if (classify(child.name)) {
        out.push(child);
        continue;
      }
      if (child.children.length > 0) {
        walk(child);
        continue;
      }
      out.push(child);
    }
  };
  walk(root);
  return out;
}

export function ExplodedAssembly({ progressRef, reducedMotion, onReady }: ExplodedAssemblyProps) {
  const gltf = useGLTF(MODEL_URL, DRACO_DECODER_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const camera = useThree((s) => s.camera);
  const labelGroupRefs = useRef<Record<string, THREE.Group | null>>({});
  const labelElementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const baseCameraPositionRef = useRef(new THREE.Vector3());
  const closeCameraPositionRef = useRef(new THREE.Vector3());
  const cameraLookAtRef = useRef(new THREE.Vector3(0, -0.08, 0));
  const cameraReadyRef = useRef(false);

  const { parts, labels, assemblyCenter, modelRoot, bounds } = useMemo(() => {
    const scene = gltf.scene.clone(true);

    let modelRoot: THREE.Object3D = scene;
    scene.traverse((node) => {
      if (/antsat[\s_]?01[\s_]?full[\s_]?assembly/i.test(node.name)) {
        modelRoot = node;
      }
    });

    const toRemove: THREE.Object3D[] = [];
    scene.traverse((node) => {
      if (/current[\s_]?camera/i.test(node.name) && node !== modelRoot) {
        toRemove.push(node);
      }
    });
    for (const n of toRemove) {
      n.visible = false;
      n.removeFromParent();
    }

    modelRoot.updateMatrixWorld(true);
    const assemblyBox = new THREE.Box3().setFromObject(modelRoot);
    const assemblyCenter = assemblyBox.getCenter(new THREE.Vector3());

    const flatParts = flattenAssemblyParts(modelRoot);
    const seen = new Set<THREE.Object3D>();
    const parts: PartEntry[] = [];

    for (const part of flatParts) {
      if (seen.has(part)) continue;
      seen.add(part);

      let category: CategoryId | null = classify(part.name);
      if (!category) {
        let p: THREE.Object3D | null = part.parent;
        while (p) {
          const c = classify(p.name);
          if (c) {
            category = c;
            break;
          }
          p = p.parent;
        }
      }
      if (!category) category = "chassis";

      part.updateMatrixWorld(true);
      _box.setFromObject(part);
      const partCenter = _box.getCenter(new THREE.Vector3());

      const dir = partCenter.clone().sub(assemblyCenter);
      if (dir.lengthSq() < 1e-8) {
        dir.set(0, 1, 0);
      } else {
        dir.normalize();
      }

      const cfg = categoryConfig(category);
      const explodeOffset = dir.multiplyScalar(PART_DISTANCE_METERS * cfg.distanceScale);
      explodeOffset.y *= 1.7;

      if (category === "standoff") {
        explodeOffset.set(0, PART_DISTANCE_METERS * cfg.distanceScale * 1.15, 0);
      }

      const foldOffset = new THREE.Vector3();

      if (isFoldedPanel(category)) {
        foldOffset.copy(assemblyCenter).sub(partCenter);
        foldOffset.y *= 0.25;
        if (foldOffset.lengthSq() > 1e-8) {
          foldOffset.setLength(Math.min(0.18, foldOffset.length() * 0.7));
        }
      }

      parts.push({
        object: part,
        category,
        originalPosition: part.position.clone(),
        originalCenter: partCenter.clone().sub(assemblyCenter),
        foldOffset,
        explodeOffset,
        animatedOffset: new THREE.Vector3(),
      });
    }

    const labels: LabelEntry[] = [];
    for (const spec of LABEL_SPECS) {
      const part = parts.find((entry) => spec.pattern.test(entry.object.name));
      if (!part) continue;
      labels.push({
        id: spec.id,
        text: spec.text,
        part,
        offset: new THREE.Vector3(...spec.offset),
      });
    }

    if (typeof window !== "undefined" && import.meta.env.DEV) {
      const counts: Partial<Record<CategoryId, number>> = {};
      const uncategorizedNames: string[] = [];
      const allNamedNodes: string[] = [];
      modelRoot.traverse((n) => {
        if (n.name && !/^mesh_\d/.test(n.name)) allNamedNodes.push(n.name);
      });
      for (const p of parts) {
        counts[p.category] = (counts[p.category] ?? 0) + 1;
        if (!classify(p.object.name)) uncategorizedNames.push(p.object.name);
      }
      const summary = { counts, total: parts.length, uncategorizedNames, allNamedNodes };
      console.info("[CubesatHero]", JSON.stringify({ counts, total: parts.length, uncategorizedCount: uncategorizedNames.length }));
      (window as unknown as { __cubesatHero?: typeof summary }).__cubesatHero = summary;
    }

    return { parts, labels, assemblyCenter, modelRoot, bounds: assemblyBox };
  }, [gltf]);

  useEffect(() => {
    onReady?.();
    invalidate();
  }, [onReady, invalidate]);

  const currentProgressRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const target = progressRef.current;
    const damped = THREE.MathUtils.damp(currentProgressRef.current, target, 6, delta);
    const settled = Math.abs(damped - target) < 0.0005;
    currentProgressRef.current = settled ? target : damped;
    const p = currentProgressRef.current;
    const unfoldT = reducedMotion ? 1 : unfoldProgress(p);
    const labelT = labelProgress(p);

    for (const entry of parts) {
      const t = phaseProgress(p, entry.category);
      _tmpFold.copy(entry.foldOffset).multiplyScalar(1 - unfoldT);
      _tmpExplode.copy(entry.explodeOffset).multiplyScalar(t);
      _tmp.copy(_tmpFold).add(_tmpExplode);
      entry.animatedOffset.copy(_tmp);
      entry.object.position.set(
        entry.originalPosition.x + _tmp.x,
        entry.originalPosition.y + _tmp.y,
        entry.originalPosition.z + _tmp.z,
      );
    }

    if (!reducedMotion) {
      const rotationT = THREE.MathUtils.smoothstep(p, 0.08, 0.92);
      groupRef.current.rotation.set(MODEL_ROTATION_X, THREE.MathUtils.lerp(MODEL_YAW_START, MODEL_YAW_END, rotationT), 0);
    } else {
      groupRef.current.rotation.set(MODEL_ROTATION_X, MODEL_YAW_START, 0);
    }

    for (const label of labels) {
      const labelGroup = labelGroupRefs.current[label.id];
      if (labelGroup) {
        _labelPosition.copy(label.part.originalCenter).add(label.part.animatedOffset).add(label.offset);
        labelGroup.position.copy(_labelPosition);
      }

      const labelElement = labelElementRefs.current[label.id];
      if (labelElement) {
        labelElement.style.opacity = labelT.toFixed(3);
        labelElement.style.transform = `translateY(${(1 - labelT) * 8}px) scale(${0.94 + labelT * 0.06})`;
      }
    }

    if (cameraReadyRef.current) {
      const zoomT = THREE.MathUtils.smoothstep(p, 0.10, 0.84);
      camera.position.lerpVectors(baseCameraPositionRef.current, closeCameraPositionRef.current, zoomT);
      camera.lookAt(cameraLookAtRef.current);
    }
  });

  useEffect(() => {
    if (!groupRef.current || !modelRoot) return;
    groupRef.current.position.set(0, -0.08, 0);
    groupRef.current.rotation.set(MODEL_ROTATION_X, MODEL_YAW_START, 0);

    const size = new THREE.Vector3();
    bounds.getSize(size);
    const explosionMargin = 0.86;
    const fitDim = Math.max(size.x, size.y, size.z) * explosionMargin;
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    const fov = perspectiveCam.fov * (Math.PI / 180);
    const distance = fitDim / (2 * Math.tan(fov / 2));
    baseCameraPositionRef.current.set(distance * 0.42, distance * 0.05, distance * 0.78);
    closeCameraPositionRef.current.set(distance * 0.19, distance * 0.015, distance * 0.36);
    cameraLookAtRef.current.set(0, -0.08, 0);
    camera.position.copy(baseCameraPositionRef.current);
    camera.lookAt(cameraLookAtRef.current);
    perspectiveCam.near = Math.max(0.01, distance * 0.05);
    perspectiveCam.far = distance * 4;
    perspectiveCam.updateProjectionMatrix();
    cameraReadyRef.current = true;
    invalidate();
  }, [assemblyCenter, modelRoot, bounds, camera, invalidate]);

  void bounds;

  return (
    <group ref={groupRef}>
      <primitive object={modelRoot} position={assemblyCenter.clone().multiplyScalar(-1)} />
      {labels.map((label) => (
        <group
          key={label.id}
          ref={(node) => {
            labelGroupRefs.current[label.id] = node;
          }}
          position={label.part.originalCenter.clone().add(label.offset)}
        >
          <Html center zIndexRange={[40, 1]} style={{ pointerEvents: "none" }}>
            <div
              ref={(node) => {
                labelElementRefs.current[label.id] = node;
              }}
              className="whitespace-nowrap rounded-full border border-white/30 bg-deep-space/90 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_0_24px_rgba(86,204,242,0.45)] backdrop-blur-md"
              style={{
                opacity: 0,
                textShadow: "0 0 14px rgba(86,204,242,0.65)",
                transform: "translateY(8px) scale(0.94)",
                transition: "opacity 120ms ease, transform 120ms ease",
              }}
            >
              {label.text}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
