// The stacking portfolio cards (duplicate/DuplicatePortfolio). Same list as
// softexedge-sept-2026's src/data/portfolio.ts (its homepage panels).
export const portfolioProjects = [
  {
    id: 1,
    title: "Traul",
    subtitle: "On-Demand Logistics Platform",
    description:
      "A complete rebuild of an on-demand logistics platform — admin portal, driver app and customer app — engineered from scratch on React Native and Node.js, with real-time dispatch, geofencing and B2B billing built in, at roughly 75% lower cost than the previous vendor",
    tech: ["REACT NATIVE", "NODE.JS", "GEOFENCING", "PAYMENTS"],
    year: "2024",
    image: "/assets/traul3.png",
    category: "LOGISTICS",
    type: "image",
    // `/work/traul` 404'd: `work/[slug]` calls `notFound()` for any slug absent
    // from `src/data/projects.ts`, and Traul is the one panel here with no
    // entry there (the other four match a project exactly). Pointing at the
    // listing keeps the panel clickable instead of dead; give me a Traul entry
    // in projects.ts and this goes back to `/work/traul`.
    href: "/work",
  },
  {
    id: 2,
    title: "Finova Dashboard",
    subtitle: "Financial SaaS Platform",
    description:
      "A complete UX/UI overhaul for Finova's enterprise wealth management suite. By simplifying complex data visualizations and streamlining workflows, we reduced user onboarding time by over 60%",
    tech: ["REACT", "D3.JS", "NODE.JS", "TYPESCRIPT"],
    year: "2024",
    image: "/assets/0d3a38da975f62a06fb71d3837c0c2dd.webp",
    category: "ENTERPRISE",
    type: "image",
    href: "/work/finova-dashboard",
  },
  {
    id: 3,
    title: "Lumina Festival",
    subtitle: "Event Branding & Web",
    description:
      "An immersive digital portal for Europe's premier light and sound festival. The site features dynamic WebGL interactions that mirror the festival's physical installations, driving record-breaking ticket sales",
    tech: ["THREE.JS", "GSAP", "NEXT.JS", "CONTENTFUL"],
    year: "2023",
    image: "/assets/ux-store-jJT2r2n7lYA-unsplash.jpg",
    category: "BRANDING",
    type: "image",
    href: "/work/lumina-festival",
  },
  {
    id: 4,
    title: "Nova Workspace",
    subtitle: "Product Launch Campaign",
    description:
      "A high-impact promotional micro-site and cinematic video campaign introducing Nova's next-generation modular office pods to the North American market",
    tech: ["NEXT.JS", "FRAMER MOTION", "TAILWIND"],
    year: "2024",
    video: "/assets/video3.mp4",
    category: "CAMPAIGN",
    type: "video",
    href: "/work/nova-workspace",
  },
  {
    id: 5,
    title: "Zephyr Mobility",
    subtitle: "EV Automotive Marketing",
    description:
      "Launching the future of urban transit. We designed a sleek, high-performance marketing site for Zephyr's flagship electric scooter, focusing on 3D product storytelling and seamless pre-order flows",
    tech: ["WEBGL", "REACT", "NODE.JS", "STRIPE"],
    year: "2023",
    image: "/assets/f1a35da30130d44c9a129deaf2b6b9f4.webp",
    category: "AUTOMOTIVE",
    type: "image",
    href: "/work/zephyr-mobility",
  },
];
