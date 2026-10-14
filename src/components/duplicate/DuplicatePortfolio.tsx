import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import DesktopAutoplayVideo from "@/components/ui/DesktopAutoplayVideo";
import { portfolioProjects } from "@/data/portfolio";

/**
 * /duplicate portfolio: the homepage projects as stacking cards instead of the
 * home page's pinned horizontal scroll. Every card is `position: sticky` in
 * one list, so each new card slides up over the last; a small per-card top
 * offset leaves the earlier cards' edges peeking out. Cards underneath shrink
 * a little as the next lands (scroll-driven, `.dup-stack*` in globals.css);
 * without support the cards still stack, they just don't shrink.
 */
export default function DuplicatePortfolio() {
  const count = portfolioProjects.length;

  return (
    <section
      id="portfolio"
      aria-labelledby="dup-portfolio-title"
      className="w-full bg-white px-3 pt-24 pb-24 md:px-6 md:pt-32"
    >
      <div className="mx-auto mb-12 max-w-[1400px] px-2 md:mb-16 md:px-4">
        <p className="mb-5 text-sm font-medium uppercase tracking-[0.3em] text-zinc-600 max-md:text-xs">
          Portfolio
        </p>
        <h2
          id="dup-portfolio-title"
          className="text-[2.5rem] font-bold leading-[1.05] tracking-tight text-black sm:text-6xl md:text-7xl lg:text-[6rem]"
        >
          Our{" "}
          <span className="bg-linear-to-r from-[#2E5BFF] to-[#149CCB] bg-clip-text pr-2 text-transparent">
            Projects
          </span>
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-[1.35] text-zinc-600 max-md:text-base">
          {String(count).padStart(2, "0")} case studies in brand, product and
          growth.
        </p>
      </div>

      <ol className="dup-stack" style={{ "--n": count } as CSSProperties}>
        {portfolioProjects.map((project, i) => (
          <li
            key={project.id}
            className="dup-stack-card"
            style={{ "--i": i } as CSSProperties}
          >
            <article className="dup-stack-card-inner relative isolate flex flex-col justify-end overflow-hidden rounded-[20px] bg-[#0a0a0a] p-6 text-white md:p-12 lg:p-16">
              <Link
                href={project.href}
                className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
              >
                <span className="sr-only">View {project.title}</span>
              </Link>

              <div className="absolute inset-0 -z-10">
                {project.type === "video" ? (
                  <DesktopAutoplayVideo
                    src={project.video}
                    poster="/assets/video3-poster.jpg"
                    aria-hidden="true"
                    tabIndex={-1}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={project.image as string}
                    alt=""
                    fill
                    sizes="(min-width: 768px) calc(100vw - 48px), calc(100vw - 24px)"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
              </div>

              <div className="pointer-events-none relative z-10 flex w-full flex-col items-start gap-3 md:gap-5 lg:w-[80%]">
                <p className="text-sm font-medium uppercase tracking-[0.3em] max-md:text-xs">
                  <span className="tabular-nums text-white/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mx-3 text-white/40">/</span>
                  {project.category}
                </p>
                <h3 className="-ml-[0.04em] text-4xl font-bold leading-[0.95] tracking-[-0.04em] md:text-6xl lg:text-[5.5rem]">
                  {project.title}
                </h3>
                <p className="max-w-[95%] text-sm leading-[1.5] text-white/80 md:text-lg lg:max-w-[85%]">
                  {project.description}
                </p>
                <ul className="mt-1 flex flex-wrap gap-2 md:gap-3">
                  {project.tech.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-md border border-white/20 bg-black/50 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-white/90 md:bg-black/20 md:px-4 md:py-1.5 md:text-xs md:backdrop-blur-md"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>

              <span className="pointer-events-none absolute top-5 right-5 z-10 rounded-full bg-linear-to-r from-[#2E5BFF] to-[#149CCB] px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white md:top-8 md:right-8">
                View project
              </span>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
