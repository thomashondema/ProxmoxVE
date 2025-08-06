import type { MetadataRoute } from "next";

import { basePath } from "@/config/site-config";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = "community-scripts.github.io";
  const protocol = "https";
  return [
    {
      url: `${protocol}://${domain}/${basePath}`,
      lastModified: new Date(),
    },
    {
      url: `${protocol}://${domain}/${basePath}/scripts`,
      lastModified: new Date(),
    },
    {
      url: `${protocol}://${domain}/${basePath}/json-editor`,
      lastModified: new Date(),
    },
  ];
}
