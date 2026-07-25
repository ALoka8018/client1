import Image from "next/image";
import { SERVICE_AREA_CITIES } from "@/lib/serviceAreas";

export function ServiceZoneMap() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-headline-md text-primary-container">
          Service Zones
        </h3>
        <span className="flex items-center gap-2 font-sans text-label-md text-secondary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
          Live Updates
        </span>
      </div>

      <div className="group relative h-80 overflow-hidden rounded-[32px] shadow-inner">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdqPQBomL5tfQzEn-2Y2WSuFeZhYnprW-dm1pUmN-ACZCKnw8wv_T-PjkT9kmXZls8nDlABdvhGfeDvUpHp45tfO4L_zI6dzAHZ5irUVDTFS9RLCO2b5nawBFGnvKt7HrzduBPvEEF1C_wQbbx1OBtRKswg6phh3Pf7M-NUqwKnZ6NfSlUdDlEP_4O4CQJTwWQxmuWHYq_M7IHuRKw-W6rW0f-x3tFeSEttzvo9C9aapLilq0Yw_UeJiZt-rPPF7Wo8OQUfUjspUM"
          alt="Service coverage map of Bhubaneswar and Cuttack"
          fill
          className="object-cover"
        />

        <div className="absolute top-1/4 left-1/3 cursor-pointer transition-transform group-hover:scale-110">
          <div className="h-4 w-4 rounded-full border-2 border-white bg-secondary shadow-lg shadow-secondary/50" />
          <div className="absolute -top-10 -left-10 rounded-lg bg-surface-container-lowest px-3 py-1 text-xs font-bold text-primary opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Bhubaneswar HQ
          </div>
        </div>
        <div className="absolute top-1/2 right-1/4">
          <div className="h-3 w-3 rounded-full border-2 border-white bg-primary shadow-lg" />
        </div>

        <div className="glass absolute right-4 bottom-4 left-4 flex items-center justify-between rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              distance
            </span>
            <span className="font-sans text-label-md text-primary">
              Covering 50km radius
            </span>
          </div>
          <button
            type="button"
            className="text-sm font-bold text-secondary hover:underline"
          >
            View All Locations
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {SERVICE_AREA_CITIES.map((city) => (
          <span
            key={city}
            className="rounded-full border border-outline-variant bg-surface-container px-4 py-1.5 text-xs font-bold text-on-surface-variant"
          >
            {city}
          </span>
        ))}
      </div>
    </div>
  );
}
