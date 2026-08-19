import { SearchableCombobox } from "@/components/common/SearchableCombobox"

function MemberLevelFilter({ value, onChange, levels = [], disabled = false }) {
  const options = levels.map((level) => ({
    value: level.id,
    label: level.name,
  }))

  return (
    <SearchableCombobox
      options={options}
      value={value}
      onChange={(next) => onChange(next)}
      allowCreate={false}
      clearable
      disabled={disabled}
      placeholder="Filter by level"
      searchPlaceholder="Search level…"
      emptyText="No levels found"
      className="w-full sm:w-56 [&_button]:h-10 sm:[&_button]:h-8"
    />
  )
}

export { MemberLevelFilter }
export default MemberLevelFilter
