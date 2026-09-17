import React from "react";
import { FlutedGlass } from "@paper-design/shaders-react";
import { Link } from "react-router-dom";
import MineralsLogo from "../common/MineralsLogo";

const companyName = "MINERALS";

const BrandIcon = ({ d, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    <path d={d} />
  </svg>
);

const socialLinks = [
  { name: "X", href: "#", d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { name: "LinkedIn", href: "#", d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  { name: "Facebook", href: "#", d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { name: "Instagram", href: "#", d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { name: "Youtube", href: "#", d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
];

const footerLinks = [
  {
    title: "Platform",
    links: [
      { name: "Overview", href: "/" },
      { name: "Minerals", href: "/minerals" },
      { name: "Patents", href: "/patents" },
      { name: "Research", href: "/research" },
      { name: "Ecosystem", href: "/ecosystem" },
      { name: "Institutions", href: "/institutions" },
      { name: "AI Chat", href: "/chat" },
    ],
  },
  {
    title: "Insights",
    links: [
      { name: "Trends & Velocity", href: "/trends" },
      { name: "Technology Mapping", href: "/technology-mapping" },
      { name: "Technology Gaps", href: "/gaps" },
      { name: "Opportunities", href: "/opportunities" },
      { name: "Policy Brief", href: "/policy" },
      { name: "Global Benchmark", href: "/benchmark" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help", href: "/help" },
      { name: "Terms", href: "/terms" },
    ],
  },
];

export default function FooterSection5({ theme = "blue" }) {
  const isWhite = theme === "white";
  return (
    <footer className={`footer-section-5 w-full bg-[#F0F1FA] ${isWhite ? "footer-white" : ""} relative overflow-hidden antialiased [font-synthesis:none]`}>
      {/* Large Stroke Text Section — bottom half slides under the panel */}
      <div className="relative w-full flex justify-center items-end pt-24 md:pt-32 pb-0 z-0 pointer-events-none" aria-hidden="true">
        <h1 className="text-[120px] sm:text-[160px] md:text-[210px] font-semibold text-transparent [-webkit-text-stroke:1px_rgba(0,0,0,0.4)] leading-[0.75] select-none -mb-[0.3em] opacity-50 whitespace-nowrap">
          {companyName}
        </h1>
      </div>

      {/* Panel Section — blue shader by default, clean white on the AI chat page */}
      <div className={`relative w-full z-10 min-h-[400px] ${isWhite ? "bg-[var(--color-paper-white)] border-t border-[var(--color-haze)]" : "[--color-primary:#1C76F8] bg-(--color-primary)"}`}>
        {/* Background Shader (blue theme only) */}
        {!isWhite && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <FlutedGlass
            size={0.89}
            shape="lines"
            angle={0}
            distortionShape="prism"
            distortion={0.5}
            shift={0}
            blur={0}
            edges={0.25}
            stretch={0}
            scale={1.11}
            fit="cover"
            highlights={0.1}
            shadows={0.2}
            grainMixer={0.1}
            grainOverlay={0.1}
            colorBack="#00000000"
            colorHighlight="#F0F1FA"
            colorShadow="#000000"
            className="w-full h-full bg-transparent"
          />
        </div>
        )}

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-24 flex flex-col lg:flex-row justify-between gap-16 lg:gap-8">

          {/* Left Side */}
          <div className="flex flex-col justify-between max-w-sm w-full">
            <div className="flex flex-col">
              {/* Logo SVG */}
              <MineralsLogo className={`${isWhite ? "text-[var(--color-ink)]" : "text-[#F0F1FA]"} w-9 h-auto shrink-0 mb-2`} />
              <h2 className={`${isWhite ? "text-[var(--color-ink)]" : "text-[#F0F1FA]"} text-xl md:text-[22px] font-medium leading-tight`}>
                Smart Technology &amp; Patent Tracker<br />for Critical Minerals
              </h2>
            </div>

            <div className="flex flex-col gap-2 mt-12 lg:mt-auto pt-8">
              <div className="flex items-center gap-3">
                {socialLinks.map(({ name, href, d }) => (
                  <a
                    key={name}
                    href={href}
                    aria-label={name}
                    className={`${isWhite ? "text-[var(--color-graphite)] hover:text-[var(--color-ink)]" : "text-[#F0F1FA]/70 hover:text-[#F0F1FA]"} transition-colors inline-flex items-center justify-center opacity-80 hover:opacity-100`}
                  >
                    <BrandIcon d={d} style={{ width: '20px', height: '20px' }} />
                  </a>
                ))}
              </div>
              <p className={`font-light ${isWhite ? "text-[var(--color-graphite)]" : "text-[#F0F1FA]/80"} text-xs md:text-[13px] mt-1`}>
                © 2026 {companyName}, All rights reserved
              </p>
              <a
                href="https://hemmingways.in/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${isWhite ? "text-[var(--color-graphite)]" : "text-[#F0F1FA]/60"} font-light text-xs md:text-[13px] hover:opacity-80 transition-opacity`}
              >
                Developed by Hemmingway Technologies Private Limited
              </a>
            </div>
          </div>

          {/* Right Side - Links */}
          <div className="flex gap-12 md:gap-24 flex-wrap lg:flex-nowrap">
            {footerLinks.map((section) => (
              <div key={section.title} className="flex flex-col gap-5">
                <h3 className={`${isWhite ? "text-[var(--color-ink)]" : "text-[#F0F1FA]"} font-semibold text-lg md:text-xl`}>
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-3 md:gap-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className={`${isWhite ? "text-[var(--color-graphite)] hover:text-[var(--color-ink)]" : "text-[#F0F1FA]/70 hover:text-[#F0F1FA]"} transition-colors text-sm md:text-[15px] font-medium`}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}
