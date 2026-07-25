"use client";

import { useEffect, useState } from "react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

type GalleryPair = {
  bookingId: string;
  bookingCode: string;
  serviceTitle: string | null;
  beforeUrl: string;
  afterUrl: string;
};

const FALLBACK_PROJECTS = [
  {
    title: "Bathroom Leakage",
    description:
      "Complete subsurface waterproofing without breaking the structure.",
    beforeSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjrup7vsA3F3nG2aKXWTjLhy3mzqWTtE21x9iuBFLPoSjrjZRykBEfectPWSYInhx6YuzE-EStCXw-LoFLvTprA7spRb6gUNrmFzkCNNC7-YYX2_18ishg_vw7BZJtWRfCdYo9rJtXYnQcxWwQBGkb0KrPD5nY9v9iLwCXohkGzotON5yGdfH0MkRknnYexNf5_dQq9OJPyZQrqBtMOuda_t_IbWZpz7VTA1oBOFrd9InNr5cB9Z5gcjtwx9Y9IcMzYIGSdcK5o40",
    afterSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA3_KhVOAbKyaJ3dEWssKtWnTZrJ4SYykYyiSE1iUEw9FLZL1lKBdc3TJEJHyqBdLunOKDkFAZRaEyl5m0xckzUh31_IDZK6rLAkfNrFsVUnK-Wmr57h_sqkWqoUS378FHj1OuWJEnbMk_npoJMMoyr_C2Ury5iy407xZ5mKfVzWMX5Y2t0MvArMOsYbPtZjZKEo9bTka-IF-yJ_QYYMMtM9XBO4DkIrGUkd6MTl99b-z1g0dhhJapExWzGg1YAvk03tx_A-EsDmqU",
    beforeAlt: "Damaged bathroom floor with water leakage and cracked tiles",
    afterAlt: "Restored bathroom floor after waterproofing",
  },
  {
    title: "Terrace Leakage",
    description:
      "Polyurethane multi-layer coating for ultimate sun and rain protection.",
    beforeSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDS3V5HVOKuj8kz-_2MCgtsxmGRCfxBqdS_aNGNxfO5oywgLkGoUqWbnTed59jd5hkhqGdaJelZ4YO_NDtMHHpBbiVAIZDxYlun9G-piiCUCIdcSFxX6tPrEM_iB9R8XaegwR_r5ro1VajwCh876nSMXRapG0uEArdCs9XJ3J2m3tWHzO2Ks0VHzdIY7DKGQXhes2x7yZnz3Wnwy_nTWWhN_AqdegLnZ-cjJjCwL8sxvorJhs2A7idlBhTLEuRROkpekBNVwl_TjDY",
    afterSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlMDIMqpJ2TR_zy6GZKMknYGywz1Bdmqj-7YnE-IOZKn9lB7L1EbR_STWomj2mWe-ec6uLz9Gaz_YMcryDReTK0YZ9Tq_ERpXTgSdG-osqhQB_k6M97Mutx5ASKCEJT3Vr5fU5LDYQ2vswyKJ2HOzEIYc9P60gCA4ipsqQc9FOEnQc66PS78CgNwDCfT4bLeWvdeVhRs-gdCGFqgdUKrATV3F0K-iNoFYwE4Ma2dyXqM38oY9HDVndkrdgNZQQLMGFpFqdAiK4_SU",
    beforeAlt: "Commercial terrace with concrete spalling and pooling water",
    afterAlt: "Terrace finished with reflective waterproofing coating",
  },
  {
    title: "Wall Dampness",
    description: "Nano-injection technology to treat dampness from the core.",
    beforeSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAYWfW_AeKkSah3uprEZhV-CBNvl6RNLUY61a9l_dnG8DEW6JD6aPXeTRj3pYROzPtCMi_W8uzpmdwaSlQYzWYFDVJIZ0xGf8FOsqZ2efiNLYej8vyT5WjIPup_ykQ3DNodzfsXTzLlvkX8330GlzDsp-_b6Y-iZGB1MMx_6IaHm3cdajAjmdr1vTaXnsb70nHRKvCL-ZLefpor6dKa5gYdfozgojk473eOe_CJyJowfz6Drn3OAwPtcBRhggXf8ATsAffyPulWT2A",
    afterSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBRIj2P6nOhXRZO33039UraDg8QpCtY659kBAYwnPv-JDewS0lpzA64GpxvsNFM_XWHsCiV9fOMk2jt24lu4U23c52jrZr5PiRmFF93v88j_3VnRDNAmartBm9-vB6NwntLf8NnN3P1Q32KP1Lv6EGU81kk8KeRqXXuLYBlrgxYoElPFAbQ1laoUBK4GV0FBryL6rQJe_NcJnr0i_5Cl3HlbcBkqm0fYp-w08Kd0DzW9vwpKOLjnpHM-mRF5YcqjnYBhlIgdFC9xcM",
    beforeAlt: "Damp interior wall with peeling paint and efflorescence",
    afterAlt: "Repainted interior wall with a smooth matte finish",
  },
];

export function ProjectGallery() {
  const [gallery, setGallery] = useState<GalleryPair[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/projects/gallery`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad response"))))
      .then((data: GalleryPair[]) => {
        if (!cancelled) setGallery(Array.isArray(data) && data.length > 0 ? data : null);
      })
      .catch(() => {
        if (!cancelled) setGallery(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const useFallback = gallery === null;

  return (
    <section className="container-max mb-section-mobile md:mb-section-desktop">
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
        {useFallback
          ? FALLBACK_PROJECTS.map((project) => (
              <div key={project.title} className="flex flex-col gap-4">
                <h3 className="font-display text-headline-md text-primary-container">
                  {project.title}
                </h3>
                <BeforeAfterSlider
                  beforeSrc={project.beforeSrc}
                  afterSrc={project.afterSrc}
                  beforeAlt={project.beforeAlt}
                  afterAlt={project.afterAlt}
                />
                <p className="font-sans text-body-md text-on-surface-variant">
                  {project.description}
                </p>
              </div>
            ))
          : gallery.map((pair) => (
              <div key={pair.bookingId} className="flex flex-col gap-4">
                <h3 className="font-display text-headline-md text-primary-container">
                  {pair.serviceTitle ?? "Completed Project"}
                </h3>
                <BeforeAfterSlider
                  beforeSrc={pair.beforeUrl}
                  afterSrc={pair.afterUrl}
                  beforeAlt={`${pair.serviceTitle ?? "Job"} before`}
                  afterAlt={`${pair.serviceTitle ?? "Job"} after`}
                />
                <p className="font-sans text-body-md text-on-surface-variant">
                  Completed job {pair.bookingCode}.
                </p>
              </div>
            ))}
      </div>
    </section>
  );
}
