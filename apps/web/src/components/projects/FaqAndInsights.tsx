import Image from "next/image";
import Link from "next/link";

const FAQS = [
  {
    question: "Do you break walls?",
    answer:
      'No. Our "No-Breakage" philosophy utilizes nano-injection and advanced surface treatments to fix leakage without disturbing your existing structural integrity or aesthetics.',
    defaultOpen: true,
  },
  {
    question: "Is there a warranty?",
    answer:
      "Yes. Every solution we provide comes with a written warranty ranging from 5 to 15 years, depending on the material and application technique chosen for your project.",
  },
  {
    question: "How soon can you start?",
    answer:
      "We typically conduct a site inspection within 24 hours. Depending on the scale of the solution, physical work can begin within 2-3 business days.",
  },
];

const INSIGHTS = [
  {
    tag: "Dampness Treatment",
    title: "Signs of Hidden Water Leakage You Can't Ignore",
    excerpt:
      "Learn to identify moisture before it compromises your home's foundation.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCsOthRWCxt1932eXLic_CmYMUcScqx3I5pkJRcw8mcFa6asdtfHnuae3ycsqk1ELy-_WK73k4QkemEjLpbCTGbXRNuMcMrdQ9PCcquFmM-4VZPW99Ij2uW9YqPlWYm95UXNBEe8KZVmOIepVPrvg5atT208nbzeXconbnT7Dhgl0n4aY1AQMfwYDV_2KNl3EWKBTGGW366zsP519lZjyioClq1q3ztlrrayUTEM3v0SAUt4nkPFoEJNGfL_DUMYLGcEQ5RYvlOI_c",
  },
  {
    tag: "Terrace Care",
    title: "Polyurethane vs Epoxy: Which is better for Rooftops?",
    excerpt:
      "A technical breakdown of waterproofing materials for modern infrastructure.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBob0vVDQ9rntTJudxTMzCG48ajHVtewVcmaXld_asv1PiTHLqOgD_jh4ufnRToW-Px4dtSTwzboI7rdknNPMEV2D0tQ9tRz86TyJ-t2w1UF9e_GSb6uaq6E3983qlHlv0KeuBLHgMNGvlENfzo4k-w7WlZuIxVHeiJYA_2WlZ94B16Bl49E9xyf66-XjqCas3sYamP-QYBXc8u_kB79iTUBkPSGNjJZWSZZGZ5A6I44YOEcWjHCYmUAuYXclJZcThktfqxTBjW4WM",
  },
];

export function FaqAndInsights() {
  return (
    <section className="container-max py-section-mobile md:py-section-desktop">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="mb-8 font-display text-headline-md text-primary md:text-headline-lg">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                open={faq.defaultOpen}
                className="group border-b border-outline-variant pb-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-display text-headline-md text-primary [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="material-icon transition-transform group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="mt-4 rounded-2xl bg-primary/5 p-6 font-sans text-body-md text-on-surface-variant">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-headline-md text-primary md:text-headline-lg">
              Engineering Insights
            </h2>
            <Link
              href="/blog"
              className="flex items-center gap-2 font-sans text-label-md text-secondary hover:underline"
            >
              View All
              <span className="material-icon">arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-6">
            {INSIGHTS.map((insight) => (
              <Link
                key={insight.title}
                href="/blog"
                className="glass group flex gap-6 rounded-3xl p-4 transition-all hover:shadow-lg"
              >
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={insight.image}
                    alt={insight.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">
                    {insight.tag}
                  </span>
                  <h4 className="font-display leading-tight text-headline-md text-primary transition-colors group-hover:text-secondary">
                    {insight.title}
                  </h4>
                  <p className="mt-2 line-clamp-1 text-sm text-on-surface-variant">
                    {insight.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
