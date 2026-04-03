"use client";

import React, { useRef, startTransition } from "react";
import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";

export function TransitionProvider({ children }: { children: React.ReactNode }) {
    const firstLayer = useRef<HTMLDivElement | null>(null);
    const secondLayer = useRef<HTMLDivElement | null>(null);

    return (
        <TransitionRouter
            auto={true}
            leave={(next) => {
                const tl = gsap
                    .timeline({
                        onComplete: next,
                    })
                    .fromTo(
                        firstLayer.current,
                        { y: "100%" },
                        {
                            y: 0,
                            duration: 0.5,
                            ease: "circ.inOut",
                        }
                    )
                    .fromTo(
                        secondLayer.current,
                        { y: "100%" },
                        {
                            y: 0,
                            duration: 0.5,
                            ease: "circ.inOut",
                        },
                        "<50%" // Staggered start halfway through the first animation
                    );

                return () => {
                    tl.kill();
                };
            }}
            enter={(next) => {
                const tl = gsap
                    .timeline()
                    .fromTo(
                        secondLayer.current,
                        { y: 0 },
                        {
                            y: "-100%",
                            duration: 0.5,
                            ease: "circ.inOut",
                        }
                    )
                    .fromTo(
                        firstLayer.current,
                        { y: 0 },
                        {
                            y: "-100%",
                            duration: 0.5,
                            ease: "circ.inOut",
                        },
                        "<50%"
                    )
                    .call(() => {
                        // Defer React updates to prevent jank during animation
                        requestAnimationFrame(() => {
                            startTransition(next);
                        });
                    }, undefined, "<50%");

                return () => {
                    tl.kill();
                };
            }}
        >
            {/* We need pointing-events-none and absolute positioning to avoid disrupting layout */}
            <div
                ref={firstLayer}
                className="fixed inset-0 z-[9998] translate-y-full bg-primary pointer-events-none"
            />
            <div
                ref={secondLayer}
                className="fixed inset-0 z-[9999] translate-y-full bg-foreground pointer-events-none"
            />
            {children}
        </TransitionRouter>
    );
}
