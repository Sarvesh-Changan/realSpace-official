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

interface SearchableLocationInputProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  allowCustom?: boolean;
  required?: boolean;
  className: string;
}

function SearchableLocationInput({
  id,
  label,
  value,
  options,
  onChange,
  allowCustom = false,
  required = false,
  className,
}: SearchableLocationInputProps) {
  const listId = useId();
  const [draft, setDraft] = useState(value);

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66]">
        {label}{required ? ' *' : ''}
      </label>
      <input
        id={id}
        list={listId}
        value={draft}
        required={required}
        autoComplete="off"
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraft(nextValue);
          if (allowCustom) {
            onChange(nextValue);
            return;
          }
          const exactOption = options.find((option) => option.toLocaleLowerCase() === nextValue.trim().toLocaleLowerCase());
          if (exactOption) onChange(exactOption);
        }}
        onBlur={() => {
          if (allowCustom) {
            onChange(draft.trim());
            return;
          }
          const exactOption = options.find((option) => option.toLocaleLowerCase() === draft.trim().toLocaleLowerCase());
          setDraft(exactOption ?? value);
        }}
        placeholder={`Search ${label.toLowerCase()}...`}
        className={className}
      />
      <datalist id={listId}>
        {options.map((option) => <option key={option} value={option} />)}
      </datalist>
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
      <SearchableLocationInput
        key={`region-${region}`}
        id={`${variant}-region-${instanceId}`}
        label={regionLabel}
        value={region}
        options={regionOptions}
        onChange={onRegionChange}
        className={inputClass}
      />
      {showCity && (
        <SearchableLocationInput
          key={`city-${city}`}
          id={`${variant}-city-${instanceId}`}
          label={cityLabel}
          value={city}
          options={cityOptions}
          onChange={onCityChange}
          required={cityRequired}
          className={inputClass}
        />
      )}
      {isCityChosen && (
        <SearchableLocationInput
          key={`locality-${locality}`}
          id={`${variant}-locality-${instanceId}`}
          label={localityLabel}
          value={locality}
          options={localityOptions}
          onChange={onLocalityChange}
          allowCustom={variant === 'form'}
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
