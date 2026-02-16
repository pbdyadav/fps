'use client';

import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function BackgroundParticles() {
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
  fullScreen: { enable: false },
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: { enable: true, mode: "grab" },
      onClick: { enable: true, mode: "push" },
    },
    modes: {
      grab: { distance: 180, links: { opacity: 0.6 } },
      push: { quantity: 3 },
    },
  },
  particles: {
    number: { value: 90, density: { enable: true, area: 800 } },
    color: { value: ["#ffffff", "#8b5cf6", "#6366f1"] },
    links: {
      enable: true,
      distance: 140,
      color: "#ffffff",
      opacity: 0.25,
      width: 1,
    },
    collisions: { enable: false },
    move: {
      enable: true,
      speed: 1.2,
      direction: "none",
      outModes: { default: "bounce" },
    },
    opacity: { value: 0.4 },
    size: { value: { min: 1, max: 3 } },
  },
  detectRetina: true,
}}

      className="absolute inset-0 -z-10"
    />
  );
}
