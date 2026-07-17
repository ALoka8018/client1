import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@repo/ui/Button";

export function Hero() {
  return (
    <section className="relative flex min-h-[795px] items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY78J0D81W2xHiffk_tsruouNtW90GTnKeAVV4eSNQ3kYuI6W-lvMH90HsiuhAoEfYq1xiGH-Chtc5HV7Lz09E7VTdsXUUg-FjfXPMG4zYKJoCW7ol496TOdil8v3jzR7_CkXz_ooPWQJmJgJdHnca2tFa_45Xiop_kvAWx4QAyiQrxM8NJKPzSBDix5SxNG00CLZvmL9BaAHD6r9o9oE2umT4402-BiWvlrRVcwIbHe7jeVtT6_EUm09cGkxk-peWP9HaU_6Bkt8"
          alt=""
          fill
          priority
          className="scale-105 object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      <div className="container-max relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1 font-sans text-label-md uppercase tracking-widest text-primary">
            Precision Engineering
          </span>
          <h1 className="mb-6 font-display text-headline-lg-mobile text-primary leading-[1.1] md:text-display-lg">
            Hidden Water Leakage? <br />
            <span className="text-secondary">
              We Find It Without Breaking Your Walls.
            </span>
          </h1>
          <p className="mb-10 max-w-xl font-sans text-body-lg text-on-surface-variant">
            Advanced Leak Detection using Acoustic Sensors, Thermal Imaging,
            and Moisture Mapping. Non-invasive, accurate, and cost-effective
            solutions for your infrastructure.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/book"
              className={buttonClasses({ variant: "accent", size: "lg" })}
            >
              Book Inspection
              <span className="material-symbols-outlined">
                calendar_today
              </span>
            </Link>
            <a
              href="tel:+916742304500"
              className={buttonClasses({ variant: "outline", size: "lg" })}
            >
              Call Now
              <span className="material-symbols-outlined">call</span>
            </a>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="glass rounded-3xl border border-white/40 p-4 shadow-xl">
            <div className="relative h-[500px] w-full overflow-hidden rounded-2xl shadow-inner">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLO7QrQORKFmhc4QCGl7gDg8YelK2XlL0VgLkMKuQpXadabtI_yBA0s4ipqJ1rI0ZTwwnURjiBUnoSlLwa1Z_W1b57SuL2TRfKvgcjhuoNm0o3r1-tCAQ7UQ7E9TxlPq84fHuYUVeaQVNG0XYvOM_RHyqYqXBFjFtCR1ExM0MGOiUKqFJ5dRttdlgZTzW0mNFyrt7yaDFXaF9XLcSXieDeLOCpdoezuIIHwRdQZRi8gXN1ljsJUXZfaz9nlr2N3CANQrrYR8CqO1o"
                alt="Moisture detection sensor scan visualization over a structural wall"
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
