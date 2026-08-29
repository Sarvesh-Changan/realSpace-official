"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Play, X } from "lucide-react";
import { getCloudinaryUrl, getVideoThumbnailUrl } from "@/lib/cloudinary";

export interface PublicVideoTestimonial {
  id: string;
  title: string;
  clientName: string;
  projectType: string | null;
  location: string | null;
  slug: string;
  quote: string;
  videoUrl: string | null;
  videoPublicId: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  thumbnailUrl: string | null;
  rating: number;
  createdAt: string;
}

interface TestimonialsClientProps {
  testimonials: PublicVideoTestimonial[];
}

type DateFilter = "ALL" | "THIS_MONTH" | "LAST_3_MONTHS" | "THIS_YEAR" | "CUSTOM";

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateValue));
}

function getMonthKey(dateValue: string) {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string) {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
    new Date(`${monthKey}-01T00:00:00`)
  );
}

function getEmbedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1` : null;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function getPlayableVideoUrl(videoUrl: string, videoPublicId?: string | null) {
  if (videoPublicId) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dipeupebc";
    const normalizedPublicId = videoPublicId.replace(/\.(mp4|mov|webm)$/i, "");
    return `https://res.cloudinary.com/${cloudName}/video/upload/f_mp4,vc_h264/${normalizedPublicId}.mp4`;
  }

  if (!videoUrl.includes("res.cloudinary.com") || !videoUrl.includes("/video/upload/")) {
    return videoUrl;
  }

  if (videoUrl.includes("/f_mp4/") || /\.mp4(?:\?|$)/i.test(videoUrl)) {
    return videoUrl;
  }

  return videoUrl.replace("/video/upload/", "/video/upload/f_mp4/");
}

function isWithinDateFilter(dateValue: string, filter: DateFilter, startDate: string, endDate: string) {
  if (filter === "ALL") return true;

  const date = new Date(dateValue);
  const now = new Date();

  if (filter === "THIS_MONTH") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }

  if (filter === "LAST_3_MONTHS") {
    const earliest = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return date >= earliest;
  }

  if (filter === "THIS_YEAR") return date.getFullYear() === now.getFullYear();

  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
  return (!start || date >= start) && (!end || date <= end);
}

function getThumbnail(item: PublicVideoTestimonial) {
  const imageUrl = item.imageUrls[0] || item.imageUrl;
  if (imageUrl) return imageUrl;
  if (item.thumbnailUrl) return item.thumbnailUrl;
  if (!item.videoUrl) return "/images/placeholder-image.png";
  return getEmbedUrl(item.videoUrl)
    ? "/images/placeholder-image.png"
    : getVideoThumbnailUrl(item.videoUrl, "VIDEO");
}

export function TestimonialsClient({ testimonials }: TestimonialsClientProps) {
  const searchParams = useSearchParams();
  const locations = useMemo(
    () => Array.from(new Set(testimonials.map((item) => item.location).filter((value): value is string => Boolean(value)))).sort(),
    [testimonials]
  );
  const projectTypes = useMemo(
    () => Array.from(new Set(testimonials.map((item) => item.projectType).filter((value): value is string => Boolean(value)))).sort(),
    [testimonials]
  );
  const months = useMemo(
    () => Array.from(new Set(testimonials.map((item) => getMonthKey(item.createdAt)))).sort().reverse(),
    [testimonials]
  );

  const queryLocation = searchParams.get("location");
  const queryProjectType = searchParams.get("projectType");
  const queryMonth = searchParams.get("month");
  const initialLocation = locations.find((location) => location.toLowerCase() === queryLocation?.toLowerCase()) || "ALL";
  const initialProjectType = projectTypes.find((projectType) => projectType.toLowerCase() === queryProjectType?.toLowerCase()) || "ALL";
  const initialMonth = months.find((month) => month === queryMonth) || "ALL";

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedProjectType, setSelectedProjectType] = useState(initialProjectType);
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilter>("ALL");
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [manualSelectedVideo, setManualSelectedVideo] = useState<PublicVideoTestimonial | null>(null);
  const [manualSelectedImage, setManualSelectedImage] = useState<PublicVideoTestimonial | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const querySelectedVideo = useMemo(() => {
    const videoSlug = searchParams.get("video");
    if (!videoSlug) return null;
    return testimonials.find((testimonial) => testimonial.videoUrl && (testimonial.slug === videoSlug || testimonial.id === videoSlug)) || null;
  }, [searchParams, testimonials]);
  const selectedVideo = manualSelectedVideo || querySelectedVideo;
  const selectedTestimonial = manualSelectedImage || selectedVideo;

  const openVideo = (item: PublicVideoTestimonial) => {
    if (!item.videoUrl) return;
    setManualSelectedImage(null);
    setManualSelectedVideo(item);
    setSelectedImageIndex(0);
    const params = new URLSearchParams(window.location.search);
    params.set("video", item.slug);
    window.history.pushState(null, "", `/testimonials?${params.toString()}`);
  };

  const openImage = (item: PublicVideoTestimonial) => {
    if (!item.imageUrl) return;
    setManualSelectedVideo(null);
    setManualSelectedImage(item);
    setSelectedImageIndex(0);
  };

  const moveImage = (direction: "next" | "previous") => {
    if (!manualSelectedImage) return;
    const imageUrls = manualSelectedImage.imageUrls.length ? manualSelectedImage.imageUrls : manualSelectedImage.imageUrl ? [manualSelectedImage.imageUrl] : [];
    if (imageUrls.length < 2) return;
    const offset = direction === "next" ? 1 : -1;
    setSelectedImageIndex((currentIndex) => (currentIndex + offset + imageUrls.length) % imageUrls.length);
  };

  const closeTestimonial = () => {
    setManualSelectedVideo(null);
    setManualSelectedImage(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("video");
    const query = params.toString();
    window.history.pushState(null, "", query ? `/testimonials?${query}` : "/testimonials");
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedLocation !== "ALL") params.set("location", selectedLocation.toLowerCase());
    if (selectedMonth !== "ALL") params.set("month", selectedMonth);
    if (selectedProjectType !== "ALL") params.set("projectType", selectedProjectType.toLowerCase());
    const videoSlug = new URLSearchParams(window.location.search).get("video");
    if (videoSlug) params.set("video", videoSlug);
    const query = params.toString();
    const nextUrl = query ? `/testimonials?${query}` : "/testimonials";
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [selectedLocation, selectedMonth, selectedProjectType]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const location = locations.find((value) => value.toLowerCase() === params.get("location")?.toLowerCase()) || "ALL";
      const projectType = projectTypes.find((value) => value.toLowerCase() === params.get("projectType")?.toLowerCase()) || "ALL";
      const month = months.find((value) => value === params.get("month")) || "ALL";
      setSelectedLocation(location);
      setSelectedProjectType(projectType);
      setSelectedMonth(month);
      setManualSelectedVideo(null);
      setManualSelectedImage(null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [locations, months, projectTypes]);

  useEffect(() => {
    if (!selectedTestimonial) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const params = new URLSearchParams(window.location.search);
        params.delete("video");
        const query = params.toString();
        setManualSelectedVideo(null);
        setManualSelectedImage(null);
        window.history.pushState(null, "", query ? `/testimonials?${query}` : "/testimonials");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTestimonial]);

  const filteredTestimonials = useMemo(() => testimonials.filter((item) => {
    const matchesLocation = selectedLocation === "ALL" || item.location === selectedLocation;
    const matchesProjectType = selectedProjectType === "ALL" || item.projectType === selectedProjectType;
    const matchesMonth = selectedMonth === "ALL" || getMonthKey(item.createdAt) === selectedMonth;
    const matchesDate = isWithinDateFilter(item.createdAt, selectedDateFilter, startDate, endDate);
    return matchesLocation && matchesProjectType && matchesMonth && matchesDate;
  }), [endDate, selectedDateFilter, selectedLocation, selectedMonth, selectedProjectType, startDate, testimonials]);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[url('/images/home/behind-project.png')] bg-fixed bg-cover bg-center pb-16 pt-24 sm:pb-20 sm:pt-28">
      <div className="absolute inset-0 -z-10 bg-brand-dark/75" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-3xl font-bold text-white sm:text-5xl">Testimonials</h1>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 rounded-2xl border border-brand-bgAlt bg-white p-3 shadow-sm sm:mt-12 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-semibold text-neutral-600">
            Location / Area
            <select value={selectedLocation} onChange={(event) => setSelectedLocation(event.target.value)} className="mt-1.5 min-h-[42px] w-full rounded-md border border-neutral-200 bg-brand-bg px-3 text-sm font-normal text-brand-text outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red">
              <option value="ALL">All locations</option>
              {locations.map((location) => <option key={location} value={location}>{location}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-neutral-600">
            Project Type
            <select value={selectedProjectType} onChange={(event) => setSelectedProjectType(event.target.value)} className="mt-1.5 min-h-[42px] w-full rounded-md border border-neutral-200 bg-brand-bg px-3 text-sm font-normal text-brand-text outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red">
              <option value="ALL">All project types</option>
              {projectTypes.map((projectType) => <option key={projectType} value={projectType}>{projectType}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-neutral-600">
            Month
            <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="mt-1.5 min-h-[42px] w-full rounded-md border border-neutral-200 bg-brand-bg px-3 text-sm font-normal text-brand-text outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red">
              <option value="ALL">All months</option>
              {months.map((month) => <option key={month} value={month}>{getMonthLabel(month)}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-neutral-600">
            Date range
            <select value={selectedDateFilter} onChange={(event) => setSelectedDateFilter(event.target.value as DateFilter)} className="mt-1.5 min-h-[42px] w-full rounded-md border border-neutral-200 bg-brand-bg px-3 text-sm font-normal text-brand-text outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red">
              <option value="ALL">Any date</option>
              <option value="THIS_MONTH">This month</option>
              <option value="LAST_3_MONTHS">Last 3 months</option>
              <option value="THIS_YEAR">This year</option>
              <option value="CUSTOM">Custom range</option>
            </select>
          </label>
          <div className="flex items-end">
            <div className="flex w-full items-center gap-2 rounded-md bg-brand-bg px-3 py-2 text-xs text-neutral-500 sm:block sm:bg-transparent sm:px-0 sm:py-0">
              <CalendarDays className="h-4 w-4 shrink-0 text-brand-red sm:hidden" />
              <div className="grid w-full grid-cols-2 gap-2">
                <input type="date" aria-label="Start date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setSelectedDateFilter("CUSTOM"); }} className="min-h-[38px] min-w-0 rounded-md border border-neutral-200 bg-white px-2 text-xs text-brand-text outline-none focus:border-brand-red" />
                <input type="date" aria-label="End date" value={endDate} onChange={(event) => { setEndDate(event.target.value); setSelectedDateFilter("CUSTOM"); }} className="min-h-[38px] min-w-0 rounded-md border border-neutral-200 bg-white px-2 text-xs text-brand-text outline-none focus:border-brand-red" />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm text-white/75">Showing {filteredTestimonials.length} of {testimonials.length} client testimonials</p>

        {filteredTestimonials.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {filteredTestimonials.map((item, index) => {
              const thumbnail = getThumbnail(item);
              const cardContent = (
                <>
                  <div className="relative aspect-video overflow-hidden bg-brand-bgAlt">
                    <Image src={getCloudinaryUrl(thumbnail, { width: 960, crop: "fill" })} alt={`${item.title} testimonial from ${item.clientName}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/30" />
                    {item.videoUrl && <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-white shadow-lg transition-transform group-hover:scale-110"><Play className="ml-1 h-6 w-6 fill-current" /></span></span>}
                  </div>
                  <div className="p-5 sm:p-6">
                    <h2 className="line-clamp-2 font-serif text-xl font-bold leading-tight text-brand-text transition-colors group-hover:text-brand-red">{item.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-600">&quot;{item.quote}&quot;</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
                      <span className="font-semibold text-brand-text">{item.clientName}</span>
                      {item.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-brand-red" />{item.location}</span>}
                    </div>
                  </div>
                </>
              );

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="group overflow-hidden rounded-2xl border border-brand-bgAlt bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-xl"
                >
                  {item.videoUrl ? <button type="button" onClick={() => openVideo(item)} className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-inset">{cardContent}</button> : item.imageUrl ? <button type="button" onClick={() => openImage(item)} className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-inset">{cardContent}</button> : <article>{cardContent}</article>}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-brand-bgAlt bg-white px-6 py-16 text-center">
            <p className="font-serif text-xl font-bold text-brand-text">No client testimonials found</p>
            <p className="mt-2 text-sm text-neutral-500">Try clearing one of the filters to see more client stories.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTestimonial && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeTestimonial} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${selectedTestimonial.title} testimonial`}>
            <button type="button" onClick={closeTestimonial} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="Close testimonial"><X className="h-5 w-5" /></button>
            <motion.div initial={{ scale: 0.96, y: 14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 14 }} onClick={(event) => event.stopPropagation()} className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="grid md:grid-cols-[1.55fr_1fr]">
                <div className="relative aspect-video min-h-[220px] bg-black">
                  {selectedTestimonial.videoUrl ? getEmbedUrl(selectedTestimonial.videoUrl) ? (
                    <iframe src={getEmbedUrl(selectedTestimonial.videoUrl) || undefined} title={`${selectedTestimonial.title} video testimonial`} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                  ) : (
                    <video src={getPlayableVideoUrl(selectedTestimonial.videoUrl, selectedTestimonial.videoPublicId)} controls autoPlay playsInline preload="metadata" className="h-full w-full object-contain" />
                  ) : selectedTestimonial.imageUrls[selectedImageIndex] || selectedTestimonial.imageUrl ? (
                    <Image src={selectedTestimonial.imageUrls[selectedImageIndex] || selectedTestimonial.imageUrl || ""} alt={`${selectedTestimonial.title} testimonial from ${selectedTestimonial.clientName}`} width={1600} height={900} className="h-full w-full object-contain" unoptimized />
                  ) : null}
                  {!selectedTestimonial.videoUrl && selectedTestimonial.imageUrls.length > 1 && (
                    <>
                      <button type="button" onClick={() => moveImage("previous")} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Previous image testimonial">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={() => moveImage("next")} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Next image testimonial">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Client story</p>
                  <h2 className="mt-3 font-serif text-2xl font-bold leading-tight text-brand-text sm:text-3xl">{selectedTestimonial.title}</h2>
                  <dl className="mt-6 space-y-4 text-sm">
                    <div><dt className="font-semibold text-neutral-500">Client</dt><dd className="mt-0.5 text-brand-text">{selectedTestimonial.clientName}</dd></div>
                    {selectedTestimonial.projectType && <div><dt className="font-semibold text-neutral-500">Project Type</dt><dd className="mt-0.5 text-brand-text">{selectedTestimonial.projectType}</dd></div>}
                    {selectedTestimonial.location && <div><dt className="font-semibold text-neutral-500">Location</dt><dd className="mt-0.5 text-brand-text">{selectedTestimonial.location}</dd></div>}
                    <div><dt className="font-semibold text-neutral-500">Date</dt><dd className="mt-0.5 text-brand-text">{formatDate(selectedTestimonial.createdAt)}</dd></div>
                  </dl>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
