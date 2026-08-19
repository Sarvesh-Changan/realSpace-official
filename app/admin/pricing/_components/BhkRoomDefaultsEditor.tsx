"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Info, Save, Check, AlertCircle } from "lucide-react";
import { upsertBhkRoomDefaults } from "../actions";

export type RoomType = "Kitchen" | "Hall" | "Bedroom" | "Bathroom" | "Wardrobe";

export interface RoomConfig {
  defaultQty: number;
  minQty: number;
  maxQty: number | null; // null signifies "No limit"
  isFixedFloor: boolean;
}

export interface BhkOptionData {
  id: string;
  label: string;
}

export interface BhkRoomDefaultData {
  id: string;
  bhkOptionId: string;
  roomGroupKey: string;
  defaultQty: number;
  minQty: number;
  maxQty: number | null;
  isFixedFloor: boolean;
}

interface BhkRoomDefaultsEditorProps {
  bhkOptions: BhkOptionData[];
  initialDefaults: BhkRoomDefaultData[];
}

type BhkConfigMap = Record<string, Record<RoomType, RoomConfig>>;

const DEFAULT_ROOM_CONFIG: Record<RoomType, RoomConfig> = {
  Kitchen: { defaultQty: 1, minQty: 1, maxQty: 1, isFixedFloor: true },
  Hall: { defaultQty: 1, minQty: 1, maxQty: 2, isFixedFloor: true },
  Bedroom: { defaultQty: 1, minQty: 1, maxQty: null, isFixedFloor: false },
  Bathroom: { defaultQty: 1, minQty: 1, maxQty: null, isFixedFloor: false },
  Wardrobe: { defaultQty: 1, minQty: 0, maxQty: null, isFixedFloor: false },
};

const ROOM_TYPES: RoomType[] = ["Kitchen", "Hall", "Bedroom", "Bathroom", "Wardrobe"];

const ROOM_MAP: Record<RoomType, string> = {
  Kitchen: "kitchen",
  Hall: "hall",
  Bedroom: "bedroom",
  Bathroom: "bathroom",
  Wardrobe: "wardrobe",
};

export default function BhkRoomDefaultsEditor({
  bhkOptions,
  initialDefaults,
}: BhkRoomDefaultsEditorProps) {
  const [selectedBhkId, setSelectedBhkId] = useState<string>(
    bhkOptions[0]?.id || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize config map indexed by bhkOptionId
  const [configs, setConfigs] = useState<BhkConfigMap>(() => {
    const initial = {} as BhkConfigMap;

    bhkOptions.forEach((bhk) => {
      initial[bhk.id] = {} as Record<RoomType, RoomConfig>;

      // Match existing DB defaults for this bhkOptionId
      const dbRows = initialDefaults.filter((d) => d.bhkOptionId === bhk.id);

      ROOM_TYPES.forEach((room) => {
        const groupKey = ROOM_MAP[room];
        const dbMatch = dbRows.find((r) => r.roomGroupKey === groupKey);

        if (dbMatch) {
          initial[bhk.id][room] = {
            defaultQty: dbMatch.defaultQty,
            minQty: dbMatch.minQty,
            maxQty: dbMatch.maxQty,
            isFixedFloor: dbMatch.isFixedFloor,
          };
        } else {
          // Dynamic sensible defaults if no DB row exists yet
          const bedrooms = parseInt(bhk.label.charAt(0)) || 1;
          initial[bhk.id][room] = {
            Kitchen: { ...DEFAULT_ROOM_CONFIG.Kitchen },
            Hall: { ...DEFAULT_ROOM_CONFIG.Hall },
            Bedroom: { ...DEFAULT_ROOM_CONFIG.Bedroom, defaultQty: bedrooms, minQty: bedrooms },
            Bathroom: { ...DEFAULT_ROOM_CONFIG.Bathroom, defaultQty: bedrooms, minQty: bedrooms },
            Wardrobe: { ...DEFAULT_ROOM_CONFIG.Wardrobe, defaultQty: bedrooms },
          }[room];
        }
      });
    });

    return initial;
  });

  const selectedBhk = bhkOptions.find((b) => b.id === selectedBhkId) || bhkOptions[0];
  const currentConfig = configs[selectedBhkId] || {
    Kitchen: { ...DEFAULT_ROOM_CONFIG.Kitchen },
    Hall: { ...DEFAULT_ROOM_CONFIG.Hall },
    Bedroom: { ...DEFAULT_ROOM_CONFIG.Bedroom },
    Bathroom: { ...DEFAULT_ROOM_CONFIG.Bathroom },
    Wardrobe: { ...DEFAULT_ROOM_CONFIG.Wardrobe },
  };

  const handleConfigChange = <K extends keyof RoomConfig>(
    room: RoomType,
    field: K,
    value: RoomConfig[K]
  ) => {
    setConfigs((prev) => ({
      ...prev,
      [selectedBhkId]: {
        ...prev[selectedBhkId],
        [room]: {
          ...prev[selectedBhkId][room],
          [field]: value,
        },
      },
    }));
    setSaveSuccess(false);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    if (!selectedBhkId) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    const items = ROOM_TYPES.map((room) => {
      const config = currentConfig[room];
      return {
        roomGroupKey: ROOM_MAP[room],
        defaultQty: config.defaultQty,
        minQty: config.minQty,
        maxQty: config.maxQty,
        isFixedFloor: config.isFixedFloor,
      };
    });

    try {
      const res = await upsertBhkRoomDefaults(selectedBhkId, items);

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage(res.error || "Failed to save BHK room defaults.");
      }
    } catch (err) {
      console.error("Error saving BHK defaults:", err);
      setErrorMessage("An unexpected error occurred while saving defaults.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!bhkOptions || bhkOptions.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-[#E8E2DA] p-6 text-center text-[#6D6A66]">
        No BHK pricing options found. Please add BHK options under Pricing Options first.
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-[#E8E2DA] shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E8E2DA] bg-[#F8F5F1]/50">
        <h2 className="text-lg font-semibold text-[#1C1C1C]">BHK Room Defaults</h2>
        <p className="text-sm text-[#6D6A66] mt-1">
          Configure the base quantities and constraints for the quote calculator per configuration.
        </p>
      </div>

      <div className="p-6">
        {/* BHK Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {bhkOptions.map((bhk) => {
            const isActive = selectedBhkId === bhk.id;
            return (
              <button
                key={bhk.id}
                onClick={() => {
                  setSelectedBhkId(bhk.id);
                  setSaveSuccess(false);
                  setErrorMessage(null);
                }}
                className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-[#6D6A66] hover:bg-[#EEE6DD] hover:text-[#1C1C1C] bg-[#F8F5F1]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBhkTab"
                    className="absolute inset-0 bg-[#C8A96A] rounded-lg shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{bhk.label}</span>
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Configuration Table */}
        <div className="overflow-x-auto rounded-lg border border-[#E8E2DA]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#F8F5F1]">
                <th className="py-3 px-4 text-xs font-semibold text-[#6D6A66] uppercase tracking-wider border-b border-[#E8E2DA]">
                  Room Type
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#6D6A66] uppercase tracking-wider border-b border-[#E8E2DA]">
                  Default Qty
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#6D6A66] uppercase tracking-wider border-b border-[#E8E2DA]">
                  Min Qty
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#6D6A66] uppercase tracking-wider border-b border-[#E8E2DA]">
                  Max Qty
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-[#6D6A66] uppercase tracking-wider border-b border-[#E8E2DA]">
                  Constraints
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2DA]">
              {ROOM_TYPES.map((room) => {
                const config = currentConfig[room];
                const hasNoLimit = config.maxQty === null;

                return (
                  <tr key={room} className="hover:bg-[#F8F5F1]/30 transition-colors group">
                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-[#1C1C1C]">
                      {room}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={config.defaultQty}
                        onChange={(e) =>
                          handleConfigChange(room, "defaultQty", parseInt(e.target.value) || 0)
                        }
                        className="w-20 px-3 py-1.5 border border-[#E8E2DA] rounded-md text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/50 focus:border-[#C8A96A] transition-all bg-white"
                      />
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={config.minQty}
                        onChange={(e) =>
                          handleConfigChange(room, "minQty", parseInt(e.target.value) || 0)
                        }
                        className="w-20 px-3 py-1.5 border border-[#E8E2DA] rounded-md text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/50 focus:border-[#C8A96A] transition-all bg-white"
                      />
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={config.minQty}
                          value={config.maxQty ?? ""}
                          disabled={hasNoLimit}
                          onChange={(e) =>
                            handleConfigChange(room, "maxQty", parseInt(e.target.value) || 0)
                          }
                          placeholder="-"
                          className="w-20 px-3 py-1.5 border border-[#E8E2DA] rounded-md text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/50 focus:border-[#C8A96A] transition-all bg-white disabled:bg-[#F8F5F1] disabled:text-[#6D6A66] disabled:border-[#E8E2DA]"
                        />
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-[#6D6A66] hover:text-[#1C1C1C] select-none">
                          <input
                            type="checkbox"
                            checked={hasNoLimit}
                            onChange={(e) =>
                              handleConfigChange(
                                room,
                                "maxQty",
                                e.target.checked ? null : config.defaultQty + 1
                              )
                            }
                            className="w-4 h-4 rounded border-[#E8E2DA] text-[#C8A96A] focus:ring-[#C8A96A] accent-[#C8A96A] cursor-pointer"
                          />
                          No limit
                        </label>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-[#6D6A66] hover:text-[#1C1C1C] select-none">
                          <input
                            type="checkbox"
                            checked={config.isFixedFloor}
                            onChange={(e) =>
                              handleConfigChange(room, "isFixedFloor", e.target.checked)
                            }
                            className="w-4 h-4 rounded border-[#E8E2DA] text-[#C8A96A] focus:ring-[#C8A96A] accent-[#C8A96A] cursor-pointer"
                          />
                          Fixed Floor
                        </label>

                        {/* Custom Tooltip */}
                        <div className="group/tooltip relative flex items-center cursor-help">
                          <Info className="w-4 h-4 text-[#6D6A66] hover:text-[#C8A96A] transition-colors" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-[#1C1C1C] text-white text-xs leading-relaxed rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                            When checked, customers can only decrease this count, never increase it.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1C1C1C]" />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-end border-t border-[#E8E2DA] pt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C8A96A] hover:bg-[#B78A47] text-white text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/50 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed w-[240px]"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving Defaults...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Saved Successfully
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Defaults for {selectedBhk?.label || "Selected BHK"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}