export interface PageSeo {
  title: string;
  description: string;
  path: string;
  image?: string;
}

export function buildMetadata(siteUrl: string, seo: PageSeo) {
  const url = new URL(seo.path, siteUrl).toString();
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      images: seo.image ? [seo.image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: seo.image ? [seo.image] : undefined,
    },
  };
}
