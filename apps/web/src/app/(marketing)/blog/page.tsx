import Image from "next/image";

const POSTS = [
  {
    tag: "Dampness Treatment",
    title: "Signs of Hidden Water Leakage You Can't Ignore",
    excerpt:
      "Learn to identify moisture before it compromises your home's foundation — from musty odors to hairline paint bubbling.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCsOthRWCxt1932eXLic_CmYMUcScqx3I5pkJRcw8mcFa6asdtfHnuae3ycsqk1ELy-_WK73k4QkemEjLpbCTGbXRNuMcMrdQ9PCcquFmM-4VZPW99Ij2uW9YqPlWYm95UXNBEe8KZVmOIepVPrvg5atT208nbzeXconbnT7Dhgl0n4aY1AQMfwYDV_2KNl3EWKBTGGW366zsP519lZjyioClq1q3ztlrrayUTEM3v0SAUt4nkPFoEJNGfL_DUMYLGcEQ5RYvlOI_c",
  },
  {
    tag: "Terrace Care",
    title: "Polyurethane vs Epoxy: Which is better for Rooftops?",
    excerpt:
      "A technical breakdown of waterproofing materials for modern infrastructure, from UV resistance to long-term flexibility.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBob0vVDQ9rntTJudxTMzCG48ajHVtewVcmaXld_asv1PiTHLqOgD_jh4ufnRToW-Px4dtSTwzboI7rdknNPMEV2D0tQ9tRz86TyJ-t2w1UF9e_GSb6uaq6E3983qlHlv0KeuBLHgMNGvlENfzo4k-w7WlZuIxVHeiJYA_2WlZ94B16Bl49E9xyf66-XjqCas3sYamP-QYBXc8u_kB79iTUBkPSGNjJZWSZZGZ5A6I44YOEcWjHCYmUAuYXclJZcThktfqxTBjW4WM",
  },
  {
    tag: "Diagnostics",
    title: "Why Thermal Imaging Beats Guesswork Every Time",
    excerpt:
      "How a 0.05°C temperature difference can reveal a moisture bridge no visual inspection would ever catch.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfZSsQJp0DO6Q5Wy5BqcKqPIa7BppUQCQ66qGD1bJ3uotj__n5_cHXDWX-GaWGhrjdjLaYbjQ9iCQ-CuWwUyBzutTMtJmv6r9w9EdOro4atjK_FE2WaGQeeq0igkLoXc8HyiiI1nx5yhUZ3VibPDyGnXgHOO2lXETSOV0Xqf8-XABTFo3ZP9CDqvN9YsAh55kmzGPRfwCiAWdtktpZQC3UKrzHIiiYfDYcdUpCozu3I5XTwKyREN1Fg_RKnBM-ADC6B85DySQutug",
  },
  {
    tag: "Structural Health",
    title: "Reading the Warning Signs of Foundation Settlement",
    excerpt:
      "Hairline cracks, sticking doors, and uneven floors — what's cosmetic, and what needs an engineer's attention.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBoB3lSlC7v3NL7barUwJmGv9z1kLd_16TeQsW6IVeolabKuAlBgb9OvtMAWShbFXpZ5GUxvi7W5RJ3KI5xLyjyCypHOeSBhDMFYzVPQ-LHb58W1cZdtKM1Ry-_3wpR3giYQSat3swldhpYdtaRTRyFwu4BjL7VC7W_FzbrP7ISyA6t4lgMtjFkFKx6vB6D8JZBZSbFeZVB4cOXZ-UizO3a5uh-OmxC2yX2geF-Jv6s308eLV5B0wAJat5f-MrtJqpmucOmz0i_Hzs",
  },
];

export default function BlogPage() {
  return (
    <section className="py-section-mobile md:py-section-desktop">
      <div className="container-max">
        <div className="mb-10 text-center md:mb-16">
          <h1 className="mx-auto mb-6 max-w-2xl font-display text-display-sm text-primary md:text-display-lg">
            Engineering Insights.
          </h1>
          <p className="mx-auto max-w-2xl font-sans text-body-lg text-on-surface-variant">
            Technical breakdowns, field notes, and diagnostic guides from our
            engineering team.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2">
          {POSTS.map((post) => (
            <article
              key={post.title}
              className="glass overflow-hidden rounded-3xl"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <span className="mb-2 block text-xs font-bold tracking-widest text-secondary uppercase">
                  {post.tag}
                </span>
                <h2 className="mb-2 font-display text-headline-md text-primary">
                  {post.title}
                </h2>
                <p className="font-sans text-body-md text-on-surface-variant">
                  {post.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
