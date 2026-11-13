import Link from "next/link";
import Image from "next/image";
import { Plus, Building2, Play, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  PropertyToggles,
  PropertyActions,
} from "./_components/PropertyTableClient";
import { getVideoThumbnailUrl } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export default async function AdminReraPropertiesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const properties = await prisma.reraProperty.findMany({
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-neutral-800" /> RERA Properties
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage residential, commercial, and new launch listings for the RERA sub-site.
          </p>
        </div>
        <Link
          href="/admin/rera/properties/new"
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        {properties.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-900">
              No properties listed yet
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Add your first RERA verified property listing or new launch project.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/rera/properties/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Property
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full table-fixed text-left border-collapse">
              <colgroup>
                <col className="w-[23%]" />
                <col className="w-[17%]" />
                <col className="w-[20%]" />
                <col className="w-[14%]" />
                <col className="w-[16%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Property</th>
                  <th className="py-2.5 px-3">Type & BHK</th>
                  <th className="py-2.5 px-3">Locality</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Visibility</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {properties.map((prop) => {
                  const coverUrl =
                    prop.coverImageUrl || prop.images[0]?.url;
                  const isVideo =
                    Boolean(coverUrl?.match(/\.(mp4|mov|webm|ogv|m4v)/i)) ||
                    Boolean(coverUrl?.includes("/video/upload/"));
                  const thumbUrl = isVideo && coverUrl
                    ? getVideoThumbnailUrl(coverUrl, "VIDEO")
                    : coverUrl;

                  const hasNoProjectRera =
                    prop.isPublished &&
                    (!prop.projectReraNo || prop.projectReraNo.trim() === "");
                  const hasNoPriceAmount =
                    prop.priceAmount == null || prop.priceAmount <= 0;

                  return (
                    <tr
                      key={prop.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      {/* Cover Thumbnail & Title */}
                      <td className="py-2.5 px-3 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded bg-neutral-100 border border-neutral-200 relative overflow-hidden shrink-0 mt-0.5">
                            {thumbUrl ? (
                              isVideo ? (
                                <div className="relative w-full h-full bg-neutral-900 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-white/80 text-neutral-900 flex items-center justify-center shadow">
                                    <Play className="w-3 h-3 fill-current ml-0.5" />
                                  </div>
                                </div>
                              ) : (
                                <Image
                                  src={thumbUrl}
                                  alt={prop.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                  unoptimized={!thumbUrl.includes("res.cloudinary.com")}
                                />
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="font-semibold text-neutral-900 line-clamp-1">
                              {prop.title}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono truncate">
                              /{prop.slug}
                            </div>
                            {/* Project RERA warning badge */}
                            {hasNoProjectRera && (
                              <div className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded font-medium">
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>No Project RERA No.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Listing Type & Property Type */}
                      <td className="py-2.5 px-3 min-w-0">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                              {prop.listingType}
                            </span>
                            <span className="text-xs text-neutral-600 font-medium">
                              {prop.propertyType}
                            </span>
                          </div>
                          {prop.bhkLabel && (
                            <span className="text-xs text-neutral-500">
                              {prop.bhkLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Locality */}
                      <td className="py-2.5 px-3 min-w-0 text-neutral-700">
                        <div className="font-medium line-clamp-2 break-words">{prop.locality}</div>
                        {prop.projectName && (
                          <div className="text-xs text-neutral-400 truncate">
                            {prop.projectName}
                          </div>
                        )}
                      </td>

                      {/* Price Label & Price Amount warning */}
                      <td className="py-2.5 px-3 min-w-0">
                        <div className="space-y-1">
                          <div className="font-semibold text-neutral-900 break-words">
                            {prop.priceLabel}
                          </div>
                          {hasNoPriceAmount && (
                            <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded leading-tight w-fit max-w-full">
                              ⚠️ Won&apos;t appear in budget filters
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Visibility Toggles */}
                      <td className="py-2.5 px-3">
                        <PropertyToggles
                          id={prop.id}
                          isFeatured={prop.isFeatured}
                          isNewLaunch={prop.isNewLaunch}
                          isPublished={prop.isPublished}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-2 text-right">
                        <PropertyActions
                          id={prop.id}
                          slug={prop.slug}
                          title={prop.title}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
