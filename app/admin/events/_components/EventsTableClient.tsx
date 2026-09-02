"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Calendar, Film, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import { deleteEvent, toggleEventPublished } from "../actions";

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string;
  coverImagePublicId?: string | null;
  mediaCount: number;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

interface EventsTableClientProps {
  events: EventItem[];
}

export function EventsTableClient({ events }: EventsTableClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? All associated media will be permanently removed.`)) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteEvent(id);
      setDeletingId(null);
      if (!res.success) {
        alert(res.error || "Failed to delete event.");
      } else {
        router.refresh();
      }
    });
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleEventPublished(id, !currentStatus);
      if (!res.success) {
        alert(res.error || "Failed to update published status.");
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8E2DA] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#C8A96A]" /> Events & Exhibition Showcase
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6A66] mt-1">
            Manage event galleries, cover media, and public exhibition showcases.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-[#C8A96A] text-white text-sm font-semibold rounded-lg hover:bg-[#B78A47] transition-all shadow-sm cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Event
        </Link>
      </div>

      {/* Events Table Container */}
      <div className="bg-white border border-[#E8E2DA] rounded-xl shadow-xs overflow-hidden">
        {events.length === 0 ? (
          <div className="p-12 text-center text-[#6D6A66]">
            <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#1C1C1C]">No events created yet</h3>
            <p className="text-sm text-[#6D6A66] mt-1 mb-4">
              Get started by adding your first event or exhibition showcase.
            </p>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8A96A] text-white text-sm font-medium rounded-lg hover:bg-[#B78A47] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add First Event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F5F1] border-b border-[#E8E2DA]">
                  <th className="py-3.5 px-4 text-xs font-bold text-[#6D6A66] uppercase tracking-wider">
                    Cover
                  </th>
                  <th className="py-3.5 px-4 text-xs font-bold text-[#6D6A66] uppercase tracking-wider">
                    Title & Slug
                  </th>
                  <th className="py-3.5 px-4 text-xs font-bold text-[#6D6A66] uppercase tracking-wider text-center">
                    Media Items
                  </th>
                  <th className="py-3.5 px-4 text-xs font-bold text-[#6D6A66] uppercase tracking-wider text-center">
                    Status
                  </th>
                  <th className="py-3.5 px-4 text-xs font-bold text-[#6D6A66] uppercase tracking-wider text-center">
                    Sort Order
                  </th>
                  <th className="py-3.5 px-4 text-xs font-bold text-[#6D6A66] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2DA]">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-[#F8F5F1]/50 transition-colors group text-sm text-[#1C1C1C]"
                  >
                    {/* Cover Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="relative w-16 h-12 rounded-md overflow-hidden bg-neutral-100 border border-[#E8E2DA] flex-shrink-0">
                        {event.coverImageUrl ? (
                          <Image
                            src={event.coverImageUrl}
                            alt={event.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#1C1C1C] line-clamp-1">{event.title}</div>
                      <div className="text-xs text-[#6D6A66] font-mono mt-0.5">{event.slug}</div>
                    </td>

                    {/* Media Count Badge */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8F5F1] text-[#1C1C1C] border border-[#E8E2DA]">
                        <Film className="w-3.5 h-3.5 text-[#C8A96A]" />
                        {event.mediaCount} {event.mediaCount === 1 ? "item" : "items"}
                      </span>
                    </td>

                    {/* Published Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublished(event.id, event.isPublished)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          event.isPublished
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        }`}
                        title="Click to toggle status"
                      >
                        {event.isPublished ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    {/* Sort Order */}
                    <td className="py-3 px-4 text-center font-mono text-xs text-[#6D6A66]">
                      {event.sortOrder}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="p-2 text-[#6D6A66] hover:text-[#1C1C1C] hover:bg-[#F8F5F1] rounded-md transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          disabled={deletingId === event.id || isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Event"
                        >
                          {deletingId === event.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
