"use client";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export function PropertyCategoryFilter({
  categories,
  selectedCategory,
}: {
  categories: CategoryOption[];
  selectedCategory: string;
}) {
  return (
    <form action="/admin/rera/properties" method="get" className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="tab" value="properties" />
      <label htmlFor="property-category-filter" className="text-sm font-medium text-neutral-700">
        Filter by category
      </label>
      <select
        id="property-category-filter"
        name="category"
        defaultValue={selectedCategory}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="min-h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800"
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
    </form>
  );
}
