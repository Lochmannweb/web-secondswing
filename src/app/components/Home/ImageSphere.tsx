"use client";

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useSentry } from "@/app/hooks/useSentry";
import { Box } from "@mui/material";


interface ImageSphereProps {
  images?: string[];
  radius?: number;
}

export default function ImageSphere({ radius = 3 }: ImageSphereProps) {
  const [enterCenter, setEnterCenter] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showFirstText, setShowFirstText] = useState(false);
  const [showSecondText, setShowSecondText] = useState(false);

  
  const images = [
    "golfsæt.jpg", "golfsætold.jpg", "golfkøle.jpg", "golfsætold2.jpg",
    "golfsalg.jpg", "golfsalg1.jpg", "golfsalg2.jpg", "golfsalg3.jpg",
    "golfsalg4.jpg", "golfsalg5.jpg", "golfsalg6.jpg", "golfsalg7.jpg",
    "golfsalg8.jpg", "golfsalg9.jpg", "golfsalg10.jpg", "golfsalg11.jpg",
    "golfsalg12.jpg", "golfsalg13.jpg", "golfsalg14.jpg", "golfsalg15.jpg",
    "golfsalg16.jpg", "golfsætold.jpg", "golfkøle.jpg", "golfsætold2.jpg",
  ];

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, radius * 3], fov: 60 }} >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />

        <Suspense fallback={null}>
          <SphereContent 
            images={images} 
            radius={radius} 
            enterCenter={enterCenter} 
            showText={showText} 
            showFirstText={showFirstText} 
            showSecondText={showSecondText} 
            setEnterCenter={setEnterCenter} 
            setShowText={setShowText} 
            setShowFirstText={setShowFirstText} 
            setShowSecondText={setShowSecondText} 
            />
        </Suspense>
      </Canvas>

      {showText && (
        <Box
          sx={{
            position: "absolute",
            top: "42%",
            color: "white",
            justifySelf: "center",
            fontSize: "3rem",
            backgroundColor: "#003d0f64",
            padding: "2rem",
            borderRadius: "0.5rem",
          }}
        >
          <h2>Velkommen til Second Swing</h2>
        </Box>
      )}

      {showFirstText && (
        <Box
          sx={{
            position: "absolute",
            top: "44%",
            color: "white",
            justifySelf: "center",
            textAlign: "center",
            fontSize: "2rem",
            backgroundColor: "#003d0f64",
            padding: "2rem",
            borderRadius: "0.5rem",
          }}
        >
          <h2>Sælg dit golf udstyr hurtigt og sikkert.</h2>
        </Box>
      )}

      {showSecondText && (
        <Box
          sx={{
            position: "absolute",
            top: "44%",
            color: "white",
            justifySelf: "center",
            textAlign: "center",
            fontSize: "2rem",
            backgroundColor: "#003d0f64",
            padding: "2rem",
            borderRadius: "0.5rem",
          }}
        >
          <h2>Opret en annonce på få minutter.</h2>
        </Box>
      )}
    </div>
  );
}





/* ---------------- Sphere Content ---------------- */
interface SphereContentProps {
  images: string[];
  radius: number;
  enterCenter: boolean;
  showText: boolean;
  showFirstText: boolean;
  showSecondText: boolean;
  setShowText: (v: boolean) => void;
  setEnterCenter: (v: boolean) => void;
  setShowFirstText: (v: boolean) => void;
  setShowSecondText: (v: boolean) => void;
}


function SphereContent({
  images,
  radius,
  setEnterCenter,
  setShowText,
  setShowFirstText,
  setShowSecondText,
}: SphereContentProps) {
  const textures = useLoader(THREE.TextureLoader, images) as THREE.Texture[]; 
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { log, logWarning, logError } = useSentry();
  const [clicks, setClicks] = useState(0);

  // Når textures er loaded - logging
  textures.forEach((tex, index) => {
    if (!tex) {
      logWarning("Texture failed to load", { file: images[index] });
    }
  });

  const moveCamera = (x: number, y: number, z: number, done?: () => void) => {
    gsap.to(camera.position, {
      duration: 1.2,
      x,
      y,
      z,
      ease: "power2.out",
      onComplete: done,
    });
  };





  const rotateToMesh = (mesh: THREE.Mesh) => {
    if (!groupRef.current) return;

    const wp = mesh.getWorldPosition(new THREE.Vector3());
    const angle = Math.atan2(wp.x, wp.z);
    const rotationTarget = groupRef.current.rotation.y - angle;

    gsap.to(groupRef.current.rotation, {
      duration: 1,
      y: rotationTarget,
      ease: "power2.out",
    });
  };




  const handleClick = (mesh: THREE.Mesh) => {
    // logging med sentry
    try {
      log("User clicked image", {
        uuid: mesh.uuid,
        click: clicks + 1,
        file: images[clicks]
      });
    } catch (err) {
      logError(err);
    }



    const next = clicks + 1;
    setClicks(next);

    if (next === 1) {
      moveCamera(0, 0, 3, () => {
        setShowText(false);
        setEnterCenter(true);
        setShowFirstText(true);
      });
    }

    if (next === 2) {
      moveCamera(0, 0, 3, () => {
        setShowText(false);
        setShowFirstText(false);
        setShowSecondText(true);
      });
    }

    if (next === 3) {
      moveCamera(0, 0, radius * 3, () => {
        setClicks(0);
        setShowText(true);
        setEnterCenter(false);
        setShowFirstText(false);
        setShowSecondText(false);
      });
    }


    // logging med sentry
    try{
      log("User clicked image", { file: mesh.uuid, clickNumber: clicks + 1 });
    } catch (err) {
      logError(err);
    }

    // logging med sentry
    try {
    rotateToMesh(mesh);
    } catch (err) {
      logError(err);
    }

    rotateToMesh(mesh);
  };

  const points = sphereSurfacePoints(images.length, radius);

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <ImagePlane
          key={i}
          img={textures[i]}
          pos={p.pos}
          rot={p.rot}
          onClick={handleClick}
        />
      ))}
    </group>
  );
}









/* ---------------- Single Image Plane ---------------- */
interface ImagePlaneProps {
  img: THREE.Texture;
  pos: [number, number, number];
  rot: [number, number, number];
  onClick: (m: THREE.Mesh) => void;
}


function ImagePlane({
  img,
  pos,
  rot,
  onClick,
}: ImagePlaneProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => ref.current?.lookAt(0, 0, 0));

  return (
    <mesh
      ref={ref}
      position={pos}
      rotation={rot}
      onClick={() => ref.current && onClick(ref.current)}
    >
      <planeGeometry args={[1.2, 1.8]} />
      <meshBasicMaterial map={img} side={THREE.DoubleSide}/>
    </mesh>
  );
}








/* ---------------- Sphere Distribution ---------------- */

function sphereSurfacePoints(count: number, radius: number) {
  const rows = 3;
  const radii = [radius * 0.95, radius * 1.15, radius * 0.95];
  const heights = [0.7, 0, -0.7].map((h) => h * radius);

  const pts: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
  const perRow = Math.ceil(count / rows);

  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < perRow && idx < count; i++, idx++) {
      const angle = (i / perRow) * Math.PI * 2;
      const x = Math.cos(angle) * radii[r];
      const z = Math.sin(angle) * radii[r];
      const y = heights[r];

      const dir = new THREE.Vector3(x, y, z).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      const e = new THREE.Euler().setFromQuaternion(q);

      pts.push({ pos: [x, y, z], rot: [e.x, e.y, e.z] });
    }
  }

  return pts;
}
