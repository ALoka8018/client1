import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { Testimonials } from "@/components/projects/Testimonials";
import { FaqAndInsights } from "@/components/projects/FaqAndInsights";

export default function ProjectsPage() {
  return (
    <>
      <header className="container-max pt-section-mobile mb-16 text-center md:pt-section-desktop">
        <h1 className="mb-4 font-display text-headline-md text-primary md:text-display-lg">
          Engineering Mastery.
        </h1>
        <p className="mx-auto max-w-2xl font-sans text-body-lg text-on-surface-variant">
          Witness the transformation from structural decay to long-term
          engineering excellence. Our gallery showcases real-world solutions
          for complex leakage issues.
        </p>
      </header>

      <ProjectGallery />
      <Testimonials />
      <FaqAndInsights />
    </>
  );
}
