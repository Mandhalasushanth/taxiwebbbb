import { Input } from '@shared/components'

import { APPLICATION_FILTER_LABELS } from '@modules/staff/constants/staff.constants'
import { APPLICATION_FILTERS } from '@modules/staff/types/staff.types'
import type { ApplicationFilter } from '@modules/staff/types/staff.types'
import './ApplicationFilters.css'

export interface ApplicationFiltersProps {
  filter: ApplicationFilter
  search: string
  onFilterChange: (filter: ApplicationFilter) => void
  onSearchChange: (search: string) => void
}

export const ApplicationFilters = ({
  filter,
  search,
  onFilterChange,
  onSearchChange,
}: ApplicationFiltersProps) => (
  <div className="application-filters">
    <div className="application-filters__tabs" role="tablist" aria-label="Filter applications">
      {APPLICATION_FILTERS.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={filter === value}
          className={`application-filters__tab${filter === value ? ' is-active' : ''}`}
          onClick={() => onFilterChange(value)}
        >
          {APPLICATION_FILTER_LABELS[value]}
        </button>
      ))}
    </div>

    <Input
      name="search"
      className="application-filters__search"
      placeholder="Search by application ID, customer or agent"
      value={search}
      onChange={(event) => onSearchChange(event.target.value)}
    />
  </div>
)
