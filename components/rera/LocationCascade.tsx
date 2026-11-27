'use client';

import React, { useId, useState } from 'react';
import {
  ALL_CITIES_VALUE,
  ALL_LOCALITIES_VALUE,
  ALL_REGIONS_VALUE,
  getLocalitiesForCity,
  getRegionForCity,
  RERA_LOCATIONS,
} from '@/lib/rera/locations';

const CUSTOM_LOCALITY_VALUE = '__rera_custom_locality__';

interface LocationSelectProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  allowCustom?: boolean;
  required?: boolean;
  className: string;
  placeholder: string;
}

function LocationSelect({
  id,
  label,
  value,
  options,
  onChange,
  allowCustom = false,
  required = false,
  className,
  placeholder,
}: LocationSelectProps) {
  const [customMode, setCustomMode] = useState(false);

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66]">
        {label}{required ? ' *' : ''}
      </label>
      {customMode ? (
        <>
          <input
            id={id}
            value={value}
            required={required}
            maxLength={150}
            onChange={(event) => onChange(event.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            className={className}
          />
          <button
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange('');
            }}
            className="mt-1 text-xs font-medium text-[#6D6A66] underline underline-offset-2 hover:text-[#1C1C1C]"
          >
            Choose a listed locality
          </button>
        </>
      ) : (
        <select
          id={id}
          value={value}
          required={required}
          onChange={(event) => {
            if (allowCustom && event.target.value === CUSTOM_LOCALITY_VALUE) {
              setCustomMode(true);
              onChange('');
              return;
            }
            onChange(event.target.value);
          }}
          className={`${className} cursor-pointer`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
          {allowCustom && <option value={CUSTOM_LOCALITY_VALUE}>Other locality…</option>}
        </select>
      )}
    </div>
  );
}

export interface LocationCascadeProps {
  region: string;
  city: string;
  locality: string;
  onRegionChange: (region: string) => void;
  onCityChange: (city: string) => void;
  onLocalityChange: (locality: string) => void;
  additionalLocalities?: string[];
  includeAllRegions?: boolean;
  includeAllCities?: boolean;
  includeAllLocalities?: boolean;
  cityRequired?: boolean;
  localityRequired?: boolean;
  variant?: 'filter' | 'form';
  regionLabel?: string;
  cityLabel?: string;
  localityLabel?: string;
}

export function LocationCascade({
  region,
  city,
  locality,
  onRegionChange,
  onCityChange,
  onLocalityChange,
  additionalLocalities = [],
  includeAllRegions = false,
  includeAllCities = false,
  includeAllLocalities = false,
  cityRequired = false,
  localityRequired = false,
  variant = 'form',
  regionLabel = 'Region',
  cityLabel = 'City',
  localityLabel = 'Locality',
}: LocationCascadeProps) {
  const instanceId = useId().replace(/:/g, '');
  const regionOptions = [
    ...(includeAllRegions ? [ALL_REGIONS_VALUE] : []),
    ...RERA_LOCATIONS.map((item) => item.name),
  ];
  const isRegionChosen = Boolean(region) && region !== ALL_REGIONS_VALUE;
  const cityRecords = RERA_LOCATIONS.find((item) => item.name === region)?.cities ?? [];
  const canonicalCityNames = cityRecords.map((item) => item.name);
  const cityOptions = [
    ...(includeAllCities ? [ALL_CITIES_VALUE] : []),
    ...canonicalCityNames,
    ...(city && city !== ALL_CITIES_VALUE && !canonicalCityNames.some((name) => name.toLocaleLowerCase() === city.toLocaleLowerCase())
      ? [city]
      : []),
  ];
  const showCity = isRegionChosen || Boolean(city);
  const isCityChosen = Boolean(city) && city !== ALL_CITIES_VALUE;
  const localityOptions = [
    ...(includeAllLocalities ? [ALL_LOCALITIES_VALUE] : []),
    ...getLocalitiesForCity(city, additionalLocalities),
  ];
  const inputClass = variant === 'filter'
    ? 'h-11 w-full border border-[#E8E2DA] bg-[#F8F5F1] px-3.5 text-xs font-medium text-[#1C1C1C] outline-none focus:border-[#C8A96A]'
    : 'mt-1 block min-h-[44px] w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500';

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <LocationSelect
        key={`region-${region}`}
        id={`${variant}-region-${instanceId}`}
        label={regionLabel}
        value={region}
        options={regionOptions}
        onChange={onRegionChange}
        placeholder="Select a region"
        className={inputClass}
      />
      {showCity && (
        <LocationSelect
          key={`city-${region}-${city}`}
          id={`${variant}-city-${instanceId}`}
          label={cityLabel}
          value={city}
          options={cityOptions}
          onChange={onCityChange}
          placeholder="Select a city"
          required={cityRequired}
          className={inputClass}
        />
      )}
      {isCityChosen && (
        <LocationSelect
          key={`locality-${city}`}
          id={`${variant}-locality-${instanceId}`}
          label={localityLabel}
          value={locality}
          options={localityOptions}
          onChange={onLocalityChange}
          allowCustom={variant === 'form'}
          placeholder="Select a locality (optional)"
          required={localityRequired}
          className={inputClass}
        />
      )}
    </div>
  );
}

export function getInitialReraRegion(city: string): string {
  return getRegionForCity(city);
}
