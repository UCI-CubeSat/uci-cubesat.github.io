import { Html, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { classify, clamp01, orderedPartPhase, phaseProgress, type CategoryId, type PartPhase, PART_DISTANCE_METERS } from "./parts";

const MODEL_URL = "/models/AntSat_01.glb";
const DRACO_DECODER_PATH = "/draco/";
const MODEL_ROTATION_X = -Math.PI / 2 + 0.34;
const MODEL_YAW_START = -0.14;
const MODEL_YAW_END = 0.12;
const STACK_EPICENTER_Y = 0;
const STACK_NEUTRAL_BAND = 0.012;
const STACK_OUTSIDE_MARGIN = 0.055;
const STACK_OUTSIDE_SPAN = 0.38;
const PANEL_TOP_TARGET_Y = 0.46;
const VED_TARGET_Y = 0.74;
const ANTENNA_TARGET_Y = -0.76;
const BATTERY_TARGET_CLEARANCE = 0.08;

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
  originalSize: THREE.Vector3;
  foldOffset: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  animatedOffset: THREE.Vector3;
  phase: PartPhase;
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

interface LabelCalloutLineProps {
  id: string;
  offset: THREE.Vector3;
  lineRefs: MutableRefObject<Record<string, THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial> | null>>;
}

const _box = new THREE.Box3();
const _tmp = new THREE.Vector3();
const _tmpFold = new THREE.Vector3();
const _tmpExplode = new THREE.Vector3();
const _labelPosition = new THREE.Vector3();
const _highlightColor = new THREE.Color("#56ccf2");

const LABEL_SPECS: LabelSpec[] = [
  { id: "top-plate", text: "TOP PLATE", pattern: /top[\s_]?plate|cover[\s_]plate/i, offset: [0.06, 0.1, 0.03] },
  { id: "ved-skin", text: "VED SKIN", pattern: /vedskin/i, offset: [-0.12, 0.08, 0.02] },
  { id: "solar-array", text: "SOLAR PANELS", pattern: /solar[\s_]panel|^panel\d/i, offset: [0.12, 0.07, 0.04] },
  { id: "hinges", text: "HINGES", pattern: /hinge|torsion/i, offset: [0.08, 0.07, -0.06] },
  { id: "antenna", text: "ANTENNA", pattern: /antenna/i, offset: [0.08, -0.06, 0.03] },
  { id: "comms", text: "COMMS XCVR", pattern: /comms|xcvr/i, offset: [-0.12, -0.02, 0.04] },
  { id: "power-board", text: "POWER BOARD", pattern: /powerboard/i, offset: [0.12, 0.04, 0.04] },
  { id: "magnetorquer", text: "MAGNETORQUER", pattern: /magnetorquer/i, offset: [0.12, -0.02, -0.04] },
  { id: "standoffs", text: "PC104 STANDOFFS", pattern: /standoff/i, offset: [-0.11, 0.04, -0.04] },
  { id: "burnwire", text: "BURNWIRE RELEASE", pattern: /burnwire/i, offset: [0.1, -0.03, 0.05] },
  { id: "chassis", text: "SKELETON CHASSIS", pattern: /chassis[\s_-]?skeleton/i, offset: [-0.12, 0.03, 0.02] },
];

function allowsPreAssemblyFold(category: CategoryId): boolean {
  void category;
  return false;
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

function hasClassifiedRenderableDescendant(node: THREE.Object3D): boolean {
  for (const child of node.children) {
    if (!isRenderableNode(child)) continue;
    if (classify(child.name)) return true;
    if (hasClassifiedRenderableDescendant(child)) return true;
  }
  return false;
}

function flattenAssemblyParts(root: THREE.Object3D): THREE.Object3D[] {
  const out: THREE.Object3D[] = [];
  const walk = (node: THREE.Object3D) => {
    for (const child of node.children) {
      if (!isRenderableNode(child)) continue;
      if (classify(child.name) && !hasClassifiedRenderableDescendant(child)) {
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

function cloneRenderableMaterials(root: THREE.Object3D): void {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((material) => material.clone())
      : mesh.material.clone();
  });
}

function horizontalOutwardOffset(centerFromAssembly: THREE.Vector3, distance: number): THREE.Vector3 {
  const x = Math.abs(centerFromAssembly.x);
  const z = Math.abs(centerFromAssembly.z);

  if (x < 1e-5 && z < 1e-5) {
    return new THREE.Vector3(distance, 0, 0);
  }

  if (x >= z) {
    return new THREE.Vector3(Math.sign(centerFromAssembly.x || 1) * distance, 0, 0);
  }

  return new THREE.Vector3(0, 0, Math.sign(centerFromAssembly.z || 1) * distance);
}

function stackDirection(centerFromAssembly: THREE.Vector3): number {
  if (centerFromAssembly.y > STACK_EPICENTER_Y + STACK_NEUTRAL_BAND) return 1;
  if (centerFromAssembly.y < STACK_EPICENTER_Y - STACK_NEUTRAL_BAND) return -1;
  return 0;
}

function stackTargetY(name: string, category: CategoryId, centerFromAssembly: THREE.Vector3, chassisHalfY: number, maxStackDistance: number): number | null {
  if (/vedskin/i.test(name)) return VED_TARGET_Y;
  if (category === "antenna") return ANTENNA_TARGET_Y;
  if (/battery/i.test(name)) return -(chassisHalfY + BATTERY_TARGET_CLEARANCE);
  if (/top[\s_]?plate|cover[\s_]plate/i.test(name) || category === "panel") return PANEL_TOP_TARGET_Y;
  if (category === "deployable") return null;

  const side = stackDirection(centerFromAssembly);
  if (side === 0) return null;

  const order = maxStackDistance <= 1e-6
    ? 0
    : clamp01(Math.abs(centerFromAssembly.y - STACK_EPICENTER_Y) / maxStackDistance);
  return side * (chassisHalfY + STACK_OUTSIDE_MARGIN + order * STACK_OUTSIDE_SPAN);
}

function sidePullDistance(category: CategoryId, order: number): number {
  if (category === "panel") return PART_DISTANCE_METERS * 1.15;
  if (category === "deployable") return PART_DISTANCE_METERS * 1.65;
  if (category === "hinge" || category === "screw") return PART_DISTANCE_METERS * (0.35 + order * 0.15);
  return 0;
}

function buildExplodeOffset(
  name: string,
  category: CategoryId,
  centerFromAssembly: THREE.Vector3,
  order: number,
  chassisHalfY: number,
  maxStackDistance: number,
): THREE.Vector3 {
  const offset = new THREE.Vector3();

  if (category === "skeleton") {
    return offset;
  }

  const targetY = stackTargetY(name, category, centerFromAssembly, chassisHalfY, maxStackDistance);
  if (targetY !== null) {
    offset.y += targetY - centerFromAssembly.y;
  }

  const sideDistance = sidePullDistance(category, order);
  if (sideDistance > 0) {
    offset.add(horizontalOutwardOffset(centerFromAssembly, sideDistance));
  }

  return offset;
}

function centerOutOrder(centerY: number, maxDistanceFromEpicenter: number): number {
  if (maxDistanceFromEpicenter <= 1e-6) return 0;
  return clamp01(Math.abs(centerY - STACK_EPICENTER_Y) / maxDistanceFromEpicenter);
}

function setPartHighlight(part: PartEntry | null, active: boolean): void {
  if (!part) return;

  part.object.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      const mat = material as THREE.Material & {
        color?: THREE.Color;
        emissive?: THREE.Color;
        emissiveIntensity?: number;
      };

      if (mat.emissive) {
        if (!mat.userData.baseEmissive) {
          mat.userData.baseEmissive = mat.emissive.clone();
          mat.userData.baseEmissiveIntensity = mat.emissiveIntensity ?? 1;
        }
        mat.emissive.copy(mat.userData.baseEmissive as THREE.Color).lerp(_highlightColor, active ? 0.45 : 0);
        mat.emissiveIntensity = active ? 0.85 : (mat.userData.baseEmissiveIntensity as number);
        mat.needsUpdate = true;
      } else if (mat.color) {
        if (!mat.userData.baseColor) {
          mat.userData.baseColor = mat.color.clone();
        }
        mat.color.copy(mat.userData.baseColor as THREE.Color).lerp(_highlightColor, active ? 0.18 : 0);
        mat.needsUpdate = true;
      }
    }
  });
}

function LabelCalloutLine({ id, offset, lineRefs }: LabelCalloutLineProps) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      offset.clone().multiplyScalar(-1),
    ]);
    const material = new THREE.LineBasicMaterial({
      color: "#7fb6ff",
      depthTest: false,
      opacity: 0,
      transparent: true,
    });
    const object = new THREE.Line(geometry, material) as THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    object.frustumCulled = false;
    return object;
  }, [offset]);

  useEffect(() => {
    const refs = lineRefs.current;
    refs[id] = line;
    return () => {
      refs[id] = null;
      line.geometry.dispose();
      line.material.dispose();
    };
  }, [id, line, lineRefs]);

  return <primitive object={line} />;
}

export function ExplodedAssembly({ progressRef, reducedMotion, onReady }: ExplodedAssemblyProps) {
  const gltf = useGLTF(MODEL_URL, DRACO_DECODER_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const camera = useThree((s) => s.camera);
  const labelGroupRefs = useRef<Record<string, THREE.Group | null>>({});
  const labelElementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const labelLineRefs = useRef<Record<string, THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial> | null>>({});
  const hoveredPartRef = useRef<PartEntry | null>(null);
  const baseCameraPositionRef = useRef(new THREE.Vector3());
  const closeCameraPositionRef = useRef(new THREE.Vector3());
  const cameraLookAtRef = useRef(new THREE.Vector3(0, -0.08, 0));
  const cameraReadyRef = useRef(false);

  const { parts, labels, assemblyCenter, modelRoot, bounds, explodedBounds } = useMemo(() => {
    const scene = gltf.scene.clone(true);
    cloneRenderableMaterials(scene);

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
      const partSize = _box.getSize(new THREE.Vector3());

      const centerFromAssembly = partCenter.clone().sub(assemblyCenter);

      const foldOffset = new THREE.Vector3();

      if (allowsPreAssemblyFold(category)) {
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
        originalCenter: centerFromAssembly,
        originalSize: partSize,
        foldOffset,
        explodeOffset: new THREE.Vector3(),
        animatedOffset: new THREE.Vector3(),
        phase: { start: 0, end: 0 },
      });
    }

    const skeleton = parts.find((part) => part.category === "skeleton");
    const chassisHalfY = Math.max(0.115, (skeleton?.originalSize.y ?? 0.22) / 2 + 0.012);
    const maxDistanceFromEpicenter = Math.max(
      ...parts
        .filter((part) => part.category !== "skeleton")
        .map((part) => Math.abs(part.originalCenter.y - STACK_EPICENTER_Y)),
    );
    const maxStackDistance = Math.max(
      0.08,
      ...parts
        .filter((part) => part.category !== "skeleton" && part.category !== "deployable")
        .map((part) => Math.abs(part.originalCenter.y - STACK_EPICENTER_Y)),
    );

    for (const part of parts) {
      const order = centerOutOrder(part.originalCenter.y, maxDistanceFromEpicenter);
      part.explodeOffset.copy(buildExplodeOffset(part.object.name, part.category, part.originalCenter, order, chassisHalfY, maxStackDistance));
      part.phase = part.category === "skeleton" ? { start: 0, end: 0 } : orderedPartPhase(order);
    }

    const explodedBounds = new THREE.Box3();
    for (const part of parts) {
      const halfSize = part.originalSize.clone().multiplyScalar(0.5);
      const finalCenter = part.originalCenter.clone().add(part.explodeOffset);
      explodedBounds.expandByPoint(finalCenter.clone().sub(halfSize));
      explodedBounds.expandByPoint(finalCenter.clone().add(halfSize));
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

    return { parts, labels, assemblyCenter, modelRoot, bounds: assemblyBox, explodedBounds };
  }, [gltf]);

  useEffect(() => {
    onReady?.();
    invalidate();
  }, [onReady, invalidate]);

  const setHoveredPart = (part: PartEntry | null) => {
    if (hoveredPartRef.current === part) return;
    setPartHighlight(hoveredPartRef.current, false);
    hoveredPartRef.current = part;
    setPartHighlight(part, true);
    invalidate();
  };

  useEffect(() => {
    return () => setPartHighlight(hoveredPartRef.current, false);
  }, []);

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
      const t = phaseProgress(p, entry.phase);
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

      const labelLine = labelLineRefs.current[label.id];
      if (labelLine) {
        labelLine.material.opacity = labelT * 0.7;
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
    const explodedSize = new THREE.Vector3();
    const explodedCenter = new THREE.Vector3();
    explodedBounds.getSize(explodedSize);
    explodedBounds.getCenter(explodedCenter);

    const perspectiveCam = camera as THREE.PerspectiveCamera;
    const fov = perspectiveCam.fov * (Math.PI / 180);
    const assembledFitDim = Math.max(size.x, size.y, size.z) * 0.86;
    const explodedFitDim = Math.max(explodedSize.x, explodedSize.y, explodedSize.z) * 0.9;
    const assembledDistance = assembledFitDim / (2 * Math.tan(fov / 2));
    const explodedDistance = explodedFitDim / (2 * Math.tan(fov / 2));

    baseCameraPositionRef.current.set(assembledDistance * 0.42, assembledDistance * 0.05, assembledDistance * 0.78);
    closeCameraPositionRef.current.set(explodedDistance * 0.32, explodedDistance * 0.035, explodedDistance * 0.57);
    cameraLookAtRef.current.set(explodedCenter.x * 0.12, explodedCenter.y * 0.2 - 0.04, explodedCenter.z * 0.12);
    camera.position.copy(baseCameraPositionRef.current);
    camera.lookAt(cameraLookAtRef.current);
    perspectiveCam.near = Math.max(0.01, assembledDistance * 0.04);
    perspectiveCam.far = Math.max(assembledDistance, explodedDistance) * 5;
    perspectiveCam.updateProjectionMatrix();
    cameraReadyRef.current = true;
    invalidate();
  }, [assemblyCenter, modelRoot, bounds, explodedBounds, camera, invalidate]);

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
          <LabelCalloutLine id={label.id} offset={label.offset} lineRefs={labelLineRefs} />
          <Html center zIndexRange={[60, 1]} style={{ pointerEvents: "auto" }}>
            <div
              ref={(node) => {
                labelElementRefs.current[label.id] = node;
              }}
              onMouseEnter={() => setHoveredPart(label.part)}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-default whitespace-nowrap rounded-full border border-white/35 bg-deep-space/95 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_0_24px_rgba(86,204,242,0.48)] backdrop-blur-md transition-colors hover:border-atmosphere/80 hover:bg-[#0d1726]"
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
