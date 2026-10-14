import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

// Titles and order from softexedge-sept-2026's home ServiceSection; each
// line is that site's own meta description for the service's page.
const services = [
  {
    title: "Digital Marketing & Growth",
    href: "/digital-marketing",
    line: "Digital marketing programs planned through discovery and architecture, then engineered and deployed for measurable growth.",
  },
  {
    title: "AI & Marketing Automation",
    href: "/ai-marketing-automation",
    line: "AI-driven marketing automation designed through our discovery, architecture, and deployment process to help your business grow.",
  },
  {
    title: "Web Development",
    href: "/web-development",
    line: "Web development built with Next.js and Tailwind CSS, following our process from discovery through global deployment.",
  },
  {
    title: "App Development",
    href: "/app-development",
    line: "Mobile and app development taken from discovery and UX architecture through engineering and global deployment.",
  },
  {
    title: "Custom Software & SaaS",
    href: "/custom-software",
    line: "Custom software built with Next.js, TypeScript, and PostgreSQL, following our process from discovery through deployment.",
  },
  {
    title: "Brand Strategy & Identity",
    href: "/brand-strategy",
    line: "Brand strategy shaped by deep discovery and conversion-focused architecture, turning positioning into a defined identity.",
  },
  {
    title: "UI/UX Design",
    href: "/ui-ux-design",
    line: "UI/UX design and motion work developed from wireframed architecture through to a polished, deployed interface.",
  },
  {
    title: "Video Production",
    href: "/video-production",
    line: "Video production carried from discovery and concept architecture through production to a fully deployed final cut.",
  },
];

const GRADIENT_TEXT =
  "bg-linear-to-r from-[#2E5BFF] to-[#149CCB] bg-clip-text text-transparent";

/**
 * Our Services as stacking cards: every card is `position: sticky` in one
 * list, so each new card slides up over the last, with the earlier cards'
 * top edges peeking out (`.dup-stack*` in globals.css). `.dup-stack--flat`
 * turns off the shrink the portfolio stack uses: these cards stay full size.
 *
 * Card design is type-only, after a reference the user supplied: big
 * coloured number, huge heavy title ending in a full stop, one bold line.
 * Brand tone: white cards on an off-black (#0A0A0A) section, brand-gradient
 * number, near-black Satoshi black title, line in zinc-600 so the title leads.
 */
export default function DuplicateServices() {
  const count = services.length;

  return (
    <section
      id="services"
      aria-labelledby="dup-services-title"
      className="w-full bg-[#0A0A0A] px-3 pt-24 pb-24 md:px-6 md:pt-32"
    >
      <div className="mx-auto mb-12 max-w-[1400px] px-2 md:mb-16 md:px-4">
        <p className="mb-5 text-sm font-medium uppercase tracking-[0.3em] text-zinc-400 max-md:text-xs">
          Services
        </p>
        <h2
          id="dup-services-title"
          className="text-[2.5rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[6rem]"
        >
          Our <span className={`${GRADIENT_TEXT} pr-2`}>Services</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-[1.35] text-zinc-400 max-md:text-base">
          We merge strategic thinking with bold creative execution to deliver
          scalable digital experiences that elevate your brand.
        </p>
      </div>

      <ol
        className="dup-stack dup-stack--flat"
        style={{ "--n": count } as CSSProperties}
      >
        {services.map((service, i) => (
          <li
            key={service.href}
            className="dup-stack-card"
            style={{ "--i": i } as CSSProperties}
          >
            {/* The hairline ring and the upward shadow keep each white card
                distinct from the white card it slides over. */}
            <article className="dup-stack-card-inner group relative isolate flex flex-col justify-between overflow-hidden rounded-[20px] bg-white px-6 py-10 text-[#0A0A0A] shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] md:px-12 md:py-16 lg:px-16 lg:py-24">
              <Link
                href={service.href}
                className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#2E5BFF]"
              >
                <span className="sr-only">Explore {service.title}</span>
              </Link>

              <div className="pointer-events-none flex items-start justify-between gap-6">
                <p
                  className={`${GRADIENT_TEXT} text-4xl font-black leading-none tracking-[-0.04em] tabular-nums md:text-5xl lg:text-6xl`}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-r from-[#2E5BFF] to-[#149CCB] text-white transition-transform duration-300 group-hover:rotate-45 group-active:scale-[0.96] md:size-14"
                >
                  <ArrowUpRight className="size-5 md:size-7" />
                </span>
              </div>

              <div className="pointer-events-none flex flex-col gap-5 md:gap-8">
                <h3 className="-ml-[0.04em] text-[2.25rem] font-black leading-[0.92] tracking-[-0.045em] text-balance sm:text-5xl md:text-7xl lg:text-[6.5rem]">
                  {service.title}.
                </h3>
                <p className="max-w-[38ch] text-base font-bold leading-[1.25] tracking-[-0.01em] text-zinc-600 md:text-xl lg:text-[1.375rem]">
                  {service.line}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
