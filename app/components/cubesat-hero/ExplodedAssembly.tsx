import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { classify, categoryConfig, phaseProgress, type CategoryId, PART_DISTANCE_METERS } from "./parts";

const MODEL_URL = "/models/AntSat_01.glb";

useGLTF.preload(MODEL_URL);

interface ExplodedAssemblyProps {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
  onReady?: () => void;
}

interface PartEntry {
  object: THREE.Object3D;
  category: CategoryId;
  originalPosition: THREE.Vector3;
  explodeOffset: THREE.Vector3;
}

const _box = new THREE.Box3();
const _tmp = new THREE.Vector3();

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
  const gltf = useGLTF(MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const elapsedRef = useRef(0);

  const { parts, assemblyCenter, modelRoot, bounds } = useMemo(() => {
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

      parts.push({
        object: part,
        category,
        originalPosition: part.position.clone(),
        explodeOffset,
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

    return { parts, assemblyCenter, modelRoot, bounds: assemblyBox };
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

    for (const entry of parts) {
      const t = phaseProgress(p, entry.category);
      _tmp.copy(entry.explodeOffset).multiplyScalar(t);
      entry.object.position.set(
        entry.originalPosition.x + _tmp.x,
        entry.originalPosition.y + _tmp.y,
        entry.originalPosition.z + _tmp.z,
      );
    }

    if (!reducedMotion) {
      elapsedRef.current += delta;
      const idleStrength = 1 - THREE.MathUtils.smoothstep(p, 0.0, 0.4);
      const idleRotation = elapsedRef.current * 0.05 * idleStrength;
      groupRef.current.rotation.y = idleRotation + p * 0.25;
    } else {
      groupRef.current.rotation.y = 0;
    }

    if (!settled) invalidate();
  });

  const camera = useThree((s) => s.camera);

  useEffect(() => {
    if (!groupRef.current || !modelRoot) return;
    groupRef.current.position.copy(assemblyCenter).multiplyScalar(-1);

    const size = new THREE.Vector3();
    bounds.getSize(size);
    const explosionMargin = 1.35;
    const fitDim = Math.max(size.x, size.y, size.z) * explosionMargin;
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    const fov = perspectiveCam.fov * (Math.PI / 180);
    const distance = fitDim / (2 * Math.tan(fov / 2));
    camera.position.set(distance * 0.55, distance * 0.35, distance * 0.75);
    camera.lookAt(0, 0, 0);
    perspectiveCam.near = Math.max(0.01, distance * 0.05);
    perspectiveCam.far = distance * 4;
    perspectiveCam.updateProjectionMatrix();
    invalidate();
  }, [assemblyCenter, modelRoot, bounds, camera, invalidate]);

  void bounds;

  return (
    <group ref={groupRef}>
      <primitive object={modelRoot} />
    </group>
  );
}
