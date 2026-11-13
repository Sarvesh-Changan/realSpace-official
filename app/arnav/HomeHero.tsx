"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const defaultSlides = [
  { image: "/arnav/images/slider/slide1.jpg", title: "Welcome to REALSPACE", sub: "Your Dream Home Awaits" },
  { image: "/arnav/images/slider/slide2.jpg", title: "Your Dream Home Awaits", sub: "Find the right home for your family" },
  { image: "/arnav/images/slider/slide3.jpg", title: "Property Guidance in Thane", sub: "Buy · Sell · Rent" },
];

export function HomeHero({ heading, body, buttonLabel, buttonUrl, customSlides, backgroundImage, interval = 6000 }: { heading: string; body: string; buttonLabel: string; buttonUrl: string; customSlides: Array<{ image: string; title: string; sub: string; buttonText?: string; buttonUrl?: string }>; backgroundImage?: string; interval?: number }) {
  const slides: Array<{ image: string; title: string; sub: string; buttonText?: string; buttonUrl?: string }> = customSlides.length ? customSlides : defaultSlides;
  const slideCount = slides.length;
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slideCount), interval);
    return () => window.clearInterval(timer);
  }, [slideCount, interval]);
  const slide = slides[active];
  return <section className="arnav-banner arnav-home-hero" style={{ backgroundImage: `url('${active === 0 && backgroundImage ? backgroundImage : slide.image}')` }}>
    <div className="container"><h1>{active === 0 ? heading : slide.title}</h1><p>{active === 0 ? body : slide.sub}</p><Link className="arnav-button" href={slide.buttonUrl || buttonUrl}>{slide.buttonText || buttonLabel}</Link>
      <div className="arnav-slide-dots" aria-label="Choose hero slide">{slides.map((item, index) => <button key={item.image} type="button" onClick={() => setActive(index)} aria-label={`Show slide ${index + 1}`} aria-current={index === active ? "true" : undefined}/>)}</div>
    </div>
  </section>;
}
