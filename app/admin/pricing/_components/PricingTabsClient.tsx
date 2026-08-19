"use client";

import React, { useState } from "react";
import { DollarSign, Sliders } from "lucide-react";
import { PricingConfigTableWrapper, type PricingOption } from "./PricingTableClient";
import BhkRoomDefaultsEditor, {
  type BhkOptionData,
  type BhkRoomDefaultData,
} from "./BhkRoomDefaultsEditor";

interface PricingTabsClientProps {
  options: PricingOption[];
  bhkOptions: BhkOptionData[];
  initialDefaults: BhkRoomDefaultData[];
}

export function PricingTabsClient({
  options,
  bhkOptions,
  initialDefaults,
}: PricingTabsClientProps) {
  const [activeTab, setActiveTab] = useState<"options" | "defaults">("options");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8E2DA] pb-1">
        <button
          onClick={() => setActiveTab("options")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "options"
              ? "border-[#C8A96A] text-[#1C1C1C]"
              : "border-transparent text-[#6D6A66] hover:text-[#1C1C1C]"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Pricing Options
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
      {activeTab === "options" && <PricingConfigTableWrapper options={options} />}

      {activeTab === "defaults" && (
        <BhkRoomDefaultsEditor
          bhkOptions={bhkOptions}
          initialDefaults={initialDefaults}
        />
      )}
    </div>
  );
}
