import Image from "next/image";
import { buttonClasses } from "@repo/ui/Button";

export function ProfileHero() {
  return (
    <section className="mb-12">
      <div className="glass relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl p-8 md:flex-row md:items-end">
        <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-10">
          <span className="material-icon text-9xl">engineering</span>
        </div>

        <div className="group relative">
          <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-surface-container-high shadow-xl">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2bnqJGMjHmiUhU4jhewCkLex_MxkWV7FkF0ulp1rsylKCYQ2E3gL73JC313vhjOkqf0cWSKN9ZaXrpg1M-KfHe6SSEQPHO5hZqNyRKdNFIUmxora8ZgSEfcLkx3UXNDaqbWcE5w-jBLJMuBuFa8r7452iS-kMcEuXmzm7eDIS3Le4eCfMEb8D3McWvgzmAX42aiC8Ov_sNl67Hmx83EXi9JsFXPfeccLxYZzT3DdjgTJKbYR34TlQfhraIA0m4fLELT3B_0nOA64"
              alt="Marcus Sterling"
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            aria-label="Edit avatar"
            className="absolute right-0 bottom-0 rounded-full bg-primary p-2 text-white shadow-lg transition-transform hover:scale-110"
          >
            <span className="material-icon text-sm">edit</span>
          </button>
        </div>

        <div className="flex-grow text-center md:text-left">
          <h1 className="mb-1 font-display text-headline-lg-mobile text-primary md:text-headline-lg">
            Marcus Sterling
          </h1>
          <p className="mb-4 flex items-center justify-center gap-2 font-sans text-body-lg text-on-surface-variant md:justify-start">
            <span className="material-icon text-lg text-primary">
              verified
            </span>
            Premium Partner • Member since 2022
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <span className="rounded-full bg-surface-container-high px-4 py-1 font-sans text-label-md text-on-surface-variant">
              Infrastructure Focus
            </span>
            <span className="rounded-full bg-surface-container-high px-4 py-1 font-sans text-label-md text-on-surface-variant">
              Verified ID
            </span>
          </div>
        </div>

        <button
          type="button"
          className={buttonClasses({
            variant: "primary",
            pill: true,
            className: "shadow-lg",
          })}
        >
          Edit Profile
        </button>
      </div>
    </section>
  );
}
