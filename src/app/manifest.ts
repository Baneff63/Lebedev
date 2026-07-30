import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "baneoff — сведение и мастеринг",
    short_name: "baneoff",
    description: "Даниил Лебедев — инженер сведения и мастеринга.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2ede3",
    theme_color: "#141210",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
