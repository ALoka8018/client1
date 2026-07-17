import Image from "next/image";

export function BookingHero() {
  return (
    <section className="container-max mb-16">
      <div className="relative flex min-h-[400px] items-center overflow-hidden rounded-[40px] p-8 md:p-16">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLNHeIvNlcofyiisADUyexVdBBItuF51mItN4Sq-jWyKrUbvvUCBcsRa4MAPL4rFUYwTmPwsQncbvnmmIvfWcRoS7crsXXnK3BGObx8B6dgo3A8xNTnGNnAF1KGHaf0wpZcLwB28QQY3U27-9pY6fzBwUf1T37mQBMCco3zCMvIPeBbG2u3YV20aDShcbbdfZ-ANvoDFfO_U5rlL6OoJ3QSZdkimqRhFhsdDEc0R5VvVY1KOzAiLSZXa0-WHQXE7bPtlTuELL1Fn8"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40" />
        <div className="relative z-10 max-w-2xl text-on-primary">
          <h1 className="mb-6 font-display text-headline-lg-mobile leading-tight md:text-display-lg">
            Engineering Excellence, Just a Click Away.
          </h1>
          <p className="max-w-lg font-sans text-body-lg text-white/80">
            From minor structural fixes to major infrastructure overhauls,
            our experts provide end-to-end solutions for every engineering
            challenge.
          </p>
        </div>
      </div>
    </section>
  );
}
