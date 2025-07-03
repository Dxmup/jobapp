"use client"

import dynamic from "next/dynamic"

const MagneticCursor = dynamic(
  () => import("@/components/animations/magnetic-cursor").then((mod) => ({ default: mod.MagneticCursor })),
  {
    ssr: false,
  },
)

export function ClientMagneticCursor() {
  return <MagneticCursor />
}
