import { FilterPills } from "@/components/common/FilterPills"

const filters = ["All", "Active", "Inactive", "Deceased"]

function MemberFilters({ active, onChange, disabled = false }) {
  return (
    <FilterPills
      options={filters}
      active={active}
      onChange={onChange}
      disabled={disabled}
    />
  )
}

export { MemberFilters }
export default MemberFilters
