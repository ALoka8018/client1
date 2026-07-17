import Image from "next/image";

const TESTIMONIALS = [
  {
    quote:
      "Their no-breakage solution for our bathroom leakage was like magic. Highly recommended for professionalism!",
    name: "Rajesh Kumar",
    role: "Real Estate Developer",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZcPHjA6JNyX2-ljxoDtYKpWBCJmjwbc298vlu84hNqTutV8Zo5ASoSKTGEPeTYgWBv9mA3DpMDlc3e7hSK3gMBKIr-uu6sAn0MV1_RncG4DtyULf4-TXhdEvOG4Rmac0aX9n-JGZhWBL4ouiMnL1GtRgpT_SdB4O-obSFrsJZV5S3u6PXKNSYnUVq2rZvW7qCqZn-EoZ-UwRpZU4O4DgZk3vldCoLdqXvmf7pFfXMc21rHVPe52VRWN6fcB0HkN96smQGWo37eGc",
  },
  {
    quote:
      "The 10-year warranty gave us the peace of mind we needed for our terrace project. Exceptional work.",
    name: "Anjali Sharma",
    role: "Homeowner",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBchSLsNOi1nPYLLVR7V4nOP8F6E2SN9DoMp6pp_RlujR2MO2BPP67TYmdeYYF3QUnfQZG45TuHMec07j4zo4VxKpO0UWpHIYtfmF2Jbq-cZq3PS0G_6iSKpdRdwuPVIJ2wsZyKEqx8tJ23PfCiJOQnEuimRv0o3-38GprdLgGn2z__qsFhe_m4LPWft4oX1ADu3msl897UN-iJj-uvs4NUxMNFbCj29mJyEAdugAIkNuuUVKZ_SJWZJ89A2I0Y6R2-laWtT-5XJtg",
  },
  {
    quote:
      "Technicians were punctual and knew exactly how to solve our complicated dampness issue. Worth every penny.",
    name: "Vikram Singh",
    role: "Architect",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC6MdWtjEbuOAH3BUyIbe3g9zdvk86CssMSykW7YHXUKFumJJvCYYy4rVsgMXjCOpJ1E2hMVWX2qkLHldJEggVjgTGev3xzh5aLwIEp_G3aliM0c7LoIT0clwGXl-ESTSpa8dDniW2Fo0C5ubWSykknHUeoRlW8VwGEUKR338NCLBPuRpVNVjJCgctakn6HGhxi02rxWxjEND6C3mwoIMoY9M9ROEY6e3AXaUOZp6VZUUgeTni1cnAMqLljzPxmFlby1eZFF_5EBQM",
  },
  {
    quote:
      "Finally found a waterproofing company that uses engineering-grade materials instead of local cement fixes.",
    name: "Priya Desai",
    role: "Interior Designer",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCoNDVmmHP2kgUHpnV1c3w_qKlua3Ut1fz283xTJjq2yrTe5v5q6WtGshYBGuytU1SozMcSaJy0MVyu7hlyFmLIVn0XhcywGHSDRLPMO4XEmKR5KVUi1e_2kBQCL3BmMTeUTayep1lU0b-MA2ynCVhDrm_JDfOMrQ7OlitKP6r6zMsKOn1XOiAu_KcDwKOSiHUq9rwPFEkgtpEFxgkFJWxKX1vvMmr3AG_PaBuOLn8WKx6FSAN-0TI8hTWesAvpgOTY2VMelxEAZ60",
  },
];

export function Testimonials() {
  return (
    <section className="bg-surface-container-low py-section-mobile md:py-section-desktop">
      <div className="container-max">
        <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 font-sans text-label-md text-white">
                4.9/5 RATING
              </span>
              <div className="flex text-secondary-container">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
            <h2 className="font-display text-headline-md text-primary md:text-headline-lg">
              Trusted by 5000+ Clients
            </h2>
          </div>
          <p className="max-w-sm font-sans text-body-md text-on-surface-variant">
            Authentic feedback from Google Reviews and direct client
            testimonials.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col justify-between rounded-3xl border border-white/40 bg-surface-container-lowest p-8 shadow-level-1"
            >
              <p className="mb-6 font-sans text-body-md italic text-on-surface-variant">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-surface-container">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-sans text-label-md text-primary">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-outline">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
