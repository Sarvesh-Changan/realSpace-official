import {
  Home,
  Utensils,
  Sofa,
  BedDouble,
  Box,
  Briefcase,
  Hammer,
  Key,
  Building,
  Building2,
  Layers,
  Sun,
  TreePine,
  Store,
  Wrench,
  PaintBucket,
  type LucideIcon,
} from "lucide-react";

export function getServiceIconComponent(
  iconKey?: string | null,
  designType?: string,
  index: number = 0
): LucideIcon {
  const key = iconKey?.toLowerCase().trim() || "";

  if (key.includes("home") || key.includes("house")) return Home;
  if (key.includes("kitchen") || key.includes("utensil") || key.includes("modular"))
    return Utensils;
  if (key.includes("sofa") || key.includes("living")) return Sofa;
  if (key.includes("bed") || key.includes("bedroom")) return BedDouble;
  if (key.includes("wardrobe") || key.includes("box") || key.includes("storage"))
    return Box;
  if (key.includes("office") || key.includes("work") || key.includes("briefcase"))
    return Briefcase;
  if (
    key.includes("renovation") ||
    key.includes("hammer") ||
    key.includes("remodel")
  )
    return Hammer;
  if (key.includes("turnkey") || key.includes("key")) return Key;
  if (key.includes("architecture") || key.includes("building")) return Building;
  if (key.includes("facade")) return Building2;
  if (key.includes("elevation") || key.includes("layers")) return Layers;
  if (key.includes("balcony") || key.includes("terrace") || key.includes("sun"))
    return Sun;
  if (key.includes("outdoor") || key.includes("tree") || key.includes("pine"))
    return TreePine;
  if (key.includes("commercial") || key.includes("store")) return Store;
  if (key.includes("wrench") || key.includes("tool")) return Wrench;
  if (key.includes("paint")) return PaintBucket;

  if (designType === "EXTERIOR") {
    const exteriorDefaults = [Building, Building2, Layers, Sun, TreePine, Store];
    return exteriorDefaults[index % exteriorDefaults.length];
  }

  const interiorDefaults = [
    Home,
    Utensils,
    Sofa,
    BedDouble,
    Box,
    Briefcase,
    Hammer,
    Key,
  ];
  return interiorDefaults[index % interiorDefaults.length];
}
