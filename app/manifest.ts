import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "REALSPACE — Interior & Exterior Design Studio",
    short_name: "REALSPACE",
    description: "Transform your residential or commercial space with REALSPACE, Thane's premier design studio.",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
  };
}
