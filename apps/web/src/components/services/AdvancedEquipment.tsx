import Image from "next/image";

const EQUIPMENT = [
  {
    title: "Precision Thermal Cameras",
    description:
      "Our high-resolution FLIR systems detect temperature variations as small as 0.05°C, revealing hidden moisture and electrical hotspots behind walls.",
    features: [
      "640x480 native resolution",
      "Real-time MSX technology",
      "Comprehensive heat-map reporting",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfZSsQJp0DO6Q5Wy5BqcKqPIa7BppUQCQ66qGD1bJ3uotj__n5_cHXDWX-GaWGhrjdjLaYbjQ9iCQ-CuWwUyBzutTMtJmv6r9w9EdOro4atjK_FE2WaGQeeq0igkLoXc8HyiiI1nx5yhUZ3VibPDyGnXgHOO2lXETSOV0Xqf8-XABTFo3ZP9CDqvN9YsAh55kmzGPRfwCiAWdtktpZQC3UKrzHIiiYfDYcdUpCozu3I5XTwKyREN1Fg_RKnBM-ADC6B85DySQutug",
    alt: "Technician holding a FLIR thermal imaging camera displaying a heat map of a pipe system",
  },
  {
    title: "Smart Moisture Meters",
    description:
      "Non-invasive electronic impedance sensors that map moisture distribution up to 20mm deep without damaging surfaces.",
    features: [
      "Dual-mode pin & pinless tech",
      "Calibration for 50+ material types",
      "Bluetooth data logging",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCUNS6WPUeorc2QRm0JQRQ_bd4irm5dbeCW0I7ndKdkZ7_d7iiVhV5RVE2oC4FYnPfpl77gBQNFaDgent2-RXLTnWl87g77LzWMwu_mA6mY1225HKoVv1bbGqFQrD7XcsoVqNddhcyDXItkZ6GSudGk439cupXAt4vhixjZcQN2gXt5RDuGO2bWZyA-Nfn9Vv1lwTEFeFFjG-1SWpLxKx3WLkZo7Rmbppx6CCrLzpkUdtnCE5zwiOpA0CGGPMT3qmAUNdqQJ5B2G4s",
    alt: "Digital moisture meter with pinless sensors being used against a concrete wall",
  },
];

export function AdvancedEquipment() {
  return (
    <section className="mt-section-mobile bg-surface-container-low py-24 md:mt-section-desktop">
      <div className="container-max">
        <div className="mb-16 text-center">
          <span className="font-sans text-label-md uppercase tracking-widest text-secondary">
            Engineering-Grade Tech
          </span>
          <h2 className="mt-4 font-display text-headline-md text-primary md:text-headline-lg">
            Advanced Equipment
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {EQUIPMENT.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-8 rounded-3xl bg-surface-container-lowest p-8 shadow-level-1 lg:flex-row"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl lg:w-1/2">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-full lg:w-1/2">
                <h3 className="mb-4 font-display text-headline-md text-primary">
                  {item.title}
                </h3>
                <p className="mb-6 font-sans text-body-md text-on-surface-variant">
                  {item.description}
                </p>
                <ul className="space-y-3">
                  {item.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-secondary">
                        check_circle
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
