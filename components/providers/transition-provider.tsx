"use client";

import React, { useRef } from "react";
import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";

export function TransitionProvider({ children }: { children: React.ReactNode }) {
    const overlayRef = useRef<HTMLDivElement>(null);

    return (
        <TransitionRouter
            auto={true}
            leave={(next) => {
                // Drop down from top
                gsap.fromTo(
                    overlayRef.current,
                    { y: "-100vh" },
                    {
                        y: "0vh",
                        duration: 0.8,
                        ease: "expo.inOut",
                        onComplete: next,
                    }
                );
            }}
            enter={(next) => {
                // Slide down out of view
                gsap.fromTo(
                    overlayRef.current,
                    { y: "0vh" },
                    {
                        y: "100vh",
                        duration: 0.8,
                        ease: "expo.inOut",
                        onComplete: next,
                    }
                );
            }}
        >
            <div
                ref={overlayRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100vh",
                    backgroundColor: "#171717",
                    zIndex: 9999,
                    pointerEvents: "none",
                    transform: "translateY(-100vh)",
                }}
            />
            {children}
        </TransitionRouter>
    );
}
