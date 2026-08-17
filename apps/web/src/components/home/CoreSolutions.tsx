import Image from "next/image";
import { buttonClasses } from "@repo/ui/Button";

export function CoreSolutions() {
  return (
    <section className="py-section-mobile md:py-section-desktop">
      <div className="container-max">
        <div className="mb-10 text-center md:mb-16">
          <h2 className="mb-4 font-display text-headline-md text-primary md:text-headline-lg">
            Core Engineering Solutions
          </h2>
          <p className="mx-auto max-w-2xl font-sans text-body-lg text-on-surface-variant">
            Specialized diagnostic services designed to preserve structural
            integrity and prevent long-term damage.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="group relative flex min-h-[400px] items-end overflow-hidden rounded-3xl p-8 md:col-span-8">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4Pk4_IE8D4zycGD0es6UMkwBoO3SQc_Ou8807hDCQmbknoe10FiLMbDYU1XhGnidBwCxbm9f9MP2kljbZIQWgD00dsiBQOnCKbXeSA5nQkbL43TGtcK7_pGVG0PCybgfFEOyzPf2tYE_YVxaPqqOIpMMl_8dIG4Nn6hKZI23V-6uKttVtrUU7o_gFn-RXI4lv8loA8UqGkkqNMCJ4mBLxhCSi8ehP0MfHs6bD3LAEFNNoVEjfGVZ4U6ygT5zoEH1IOLJ9uqy2wgE"
            alt="Acoustic leak detector device in use on a modern kitchen floor"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
          <div className="relative z-10">
            <h3 className="mb-2 font-display text-headline-md text-white md:text-headline-lg">
              Water Leakage Detection
            </h3>
            <p className="mb-6 max-w-md font-sans text-body-md text-white/80">
              Using sub-surface acoustic technology to pinpoint leaks without
              any drilling or wall demolition.
            </p>
            <button
              className={buttonClasses({
                variant: "accent",
                className: "transition-all duration-300 group-hover:px-10",
              })}
            >
              Learn More
            </button>
          </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl bg-surface-container-lowest p-8 md:col-span-4">
            <div>
              <span className="material-icon mb-4 text-4xl text-secondary">
                foundation
              </span>
              <h3 className="mb-4 font-display text-headline-md text-primary-container">
                Seepage Repair
              </h3>
              <p className="font-sans text-body-md text-on-surface-variant">
                Permanent solutions for rising dampness and ceiling seepage
                using crystalline waterproofing.
              </p>
            </div>
            <div className="relative mt-6 h-40 w-full overflow-hidden rounded">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBahdvN_cTRPxgSZdoF51Y5Ga40hSt3t_rKf-GKHZ4DvL_6AUmx26W6sNaLa2BLPPNOdW7Oa2w11PqTtWhoosZ_NvI6iwTBPX9KBovJB1ixbK5b1LZ3kjMQpiGgidL8RYkumarMrotjJhY1ZxHjWBqLWiqv0_k7OVlKFK4VavySoXETJEJjsrCDTpXxg9FeRuMGFyyAuZ3iGoFvBgGekfSEJ4Yeh1rTOn5ul6BZpDc6a8TacImL_ZAhm19msa4v-OBWVu_5pqtNadU"
                alt="Crystalline waterproofing injection into a concrete structure"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
