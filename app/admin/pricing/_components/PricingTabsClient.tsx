"use client";

import React, { useState } from "react";
import { Sliders, LayoutGrid } from "lucide-react";
import BhkRoomDefaultsEditor, {
  type BhkOptionData,
  type BhkRoomDefaultData,
} from "./BhkRoomDefaultsEditor";
import {
  ComponentPricingMatrixEditor,
  type ComponentPricingRecord,
} from "./ComponentPricingMatrixEditor";

interface PricingTabsClientProps {
  bhkOptions: BhkOptionData[];
  initialDefaults: BhkRoomDefaultData[];
  componentPricing: ComponentPricingRecord[];
}

export function PricingTabsClient({
  bhkOptions,
  initialDefaults,
  componentPricing,
}: PricingTabsClientProps) {
  const [activeTab, setActiveTab] = useState<"matrix" | "defaults">("matrix");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8E2DA] pb-1">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "matrix"
              ? "border-[#C8A96A] text-[#1C1C1C]"
              : "border-transparent text-[#6D6A66] hover:text-[#1C1C1C]"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Component Tier Matrix
        </button>
        <button
          onClick={() => setActiveTab("defaults")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "defaults"
              ? "border-[#C8A96A] text-[#1C1C1C]"
              : "border-transparent text-[#6D6A66] hover:text-[#1C1C1C]"
          }`}
        >
          <Sliders className="w-4 h-4" />
          BHK Room Defaults
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "matrix" && (
        <ComponentPricingMatrixEditor initialPricing={componentPricing} />
      )}

      {activeTab === "defaults" && (
        <BhkRoomDefaultsEditor
          bhkOptions={bhkOptions}
          initialDefaults={initialDefaults}
        />
      )}
    </div>
  );
}


