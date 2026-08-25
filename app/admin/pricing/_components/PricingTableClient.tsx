"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { deletePricingOption, togglePricingOptionActive } from "../actions";

export interface PricingOption {
  id: string;
  groupKey: string;
  label: string;
  basePrice: number;
  perUnitPrice?: number | null;
  isActive: boolean;
  sortOrder: number;
}

interface PricingConfigTableProps {
  options: PricingOption[];
  onAdd: (groupKey?: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, newStatus: boolean) => void;
}

const GROUP_LABELS: Record<string, string> = {
  bhk_type: "BHK Types",
  kitchen: "Kitchen Layouts",
  hall: "Hall & Living",
  bedroom: "Bedrooms",
  wardrobe: "Wardrobes",
  interior_package: "Interior Packages",
  exterior_service: "Exterior Services",
  material_tier: "Material Tiers",
  addon: "Additional Services",
};

export function PricingConfigTable({ options, onAdd, onEdit, onDelete, onToggleActive }: PricingConfigTableProps) {
  // Group options by groupKey
  const groupedOptions = options.reduce((acc, opt) => {
    if (!acc[opt.groupKey]) acc[opt.groupKey] = [];
    acc[opt.groupKey].push(opt);
    return acc;
  }, {} as Record<string, PricingOption[]>);

  // Manage expanded state for accordion
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.keys(GROUP_LABELS).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Quote Calculator Rules</h2>
          <p className="text-xs sm:text-sm text-neutral-500">Manage base prices and multiplier rules for the public calculator.</p>
        </div>
        <button onClick={() => onAdd()} className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] bg-brand-red text-white text-xs sm:text-sm font-medium rounded-md hover:bg-brand-red/90 transition-colors cursor-pointer w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Option
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(GROUP_LABELS).map(([groupKey, groupLabel]) => {
          const groupItems = (groupedOptions[groupKey] || []).sort((a, b) => a.sortOrder - b.sortOrder);
          const isExpanded = expandedGroups[groupKey];

          return (
            <div key={groupKey} className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
              <div 
                className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200 cursor-pointer select-none hover:bg-neutral-100 transition-colors min-h-[44px]"
                onClick={() => toggleGroup(groupKey)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-neutral-500" /> : <ChevronRight className="w-4 h-4 text-neutral-500" />}
                  <h3 className="font-semibold text-neutral-900 text-sm sm:text-base">{groupLabel}</h3>
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-neutral-200 text-neutral-700 rounded-full">
                    {groupItems.length}
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAdd(groupKey); }} 
                  className="text-xs font-medium text-brand-red hover:text-brand-red/80 flex items-center gap-1 p-1 min-h-[36px] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              </div>

              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[560px]">
                    <thead>
                      <tr className="bg-white border-b border-neutral-100 text-xs text-neutral-400 font-medium">
                        <th className="px-4 py-2.5">Label</th>
                        <th className="px-4 py-2.5 text-right">Base Price</th>
                        <th className="px-4 py-2.5 text-right">Per Unit</th>
                        <th className="px-4 py-2.5 text-center w-24">Order</th>
                        <th className="px-4 py-2.5 text-center w-24">Active</th>
                        <th className="px-4 py-2.5 text-right w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-sm">
                      {groupItems.map(item => (
                        <tr key={item.id} className="hover:bg-neutral-50/50">
                          <td className="px-4 py-3 font-medium text-neutral-800">{item.label}</td>
                          <td className="px-4 py-3 text-right font-mono text-neutral-600">{formatCurrency(item.basePrice)}</td>
                          <td className="px-4 py-3 text-right font-mono text-neutral-500">{item.perUnitPrice ? formatCurrency(item.perUnitPrice) : "—"}</td>
                          <td className="px-4 py-3 text-center text-neutral-400">{item.sortOrder}</td>
                          <td className="px-4 py-3 text-center">
                            <label className="relative inline-flex items-center cursor-pointer min-h-[36px] min-w-[36px] justify-center">
                              <input type="checkbox" className="sr-only peer" checked={item.isActive} onChange={(e) => onToggleActive(item.id, e.target.checked)} />
                              <div className="relative w-7 h-4 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                          </td>
                          <td className="px-4 py-3 text-right space-x-1">
                            <button onClick={() => onEdit(item.id)} className="text-neutral-400 hover:text-brand-red transition-colors p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded hover:bg-neutral-100 cursor-pointer" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(item.id)} className="text-neutral-400 hover:text-red-600 transition-colors p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded hover:bg-neutral-100 cursor-pointer" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {groupItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-xs text-neutral-400">
                            No pricing rules configured for {groupLabel.toLowerCase()}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PricingConfigTableWrapper({ options }: { options: PricingOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAdd = (groupKey?: string) => {
    if (groupKey) {
      router.push(`/admin/pricing/new?groupKey=${groupKey}`);
    } else {
      router.push("/admin/pricing/new");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/pricing/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing option?")) return;
    startTransition(async () => {
      const res = await deletePricingOption(id);
      if (!res.success) {
        alert(res.error || "Failed to delete pricing option.");
      } else {
        router.refresh();
      }
    });
  };

  const handleToggleActive = async (id: string, newStatus: boolean) => {
    startTransition(async () => {
      const res = await togglePricingOptionActive(id, newStatus);
      if (!res.success) {
        alert(res.error || "Failed to toggle active status.");
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : ""}>
      <PricingConfigTable
        options={options}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
}