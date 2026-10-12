import type { ChangeEvent, FocusEvent } from 'react'
import { Check } from 'lucide-react'
import { classNames } from '@shared/utils'
import { CONTACT_SERVICE_OPTIONS } from '../../data/marketingContent'
import './ServiceChips.css'

export interface ServiceChipsProps {
  name: string
  label: string
  value: string
  error?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur: (event: FocusEvent<HTMLInputElement>) => void
}

const ERROR_ID = 'mk-service-chips-error'

/** Radio group shown as compact pills (native radios keep keyboard and screen-reader support) */
export const ServiceChips = ({ name, label, value, error, onChange, onBlur }: ServiceChipsProps) => {
  const renderChip = (option: (typeof CONTACT_SERVICE_OPTIONS)[number], index: number) => {
    const isSelected = option.label === value
    return (
      <label key={option.id} className={classNames('mk-chip', isSelected && 'mk-chip--selected')}>
        <input
          type="radio"
          name={name}
          value={option.label}
          checked={isSelected}
          className="mk-chip__input"
          // Only the first radio carries the error state so focus-on-error lands on the group
          aria-invalid={index === 0 && Boolean(error) ? true : undefined}
          aria-describedby={error ? ERROR_ID : undefined}
          onChange={onChange}
          onBlur={onBlur}
        />
        {isSelected && <Check className="mk-chip__tick" aria-hidden="true" />}
        <span>{option.label}</span>
      </label>
    )
  }

  return (
    <fieldset className={classNames('mk-chips', error && 'mk-chips--invalid')}>
      <legend className="mk-chips__legend">
        {label}
        <span aria-hidden="true"> *</span>
      </legend>
      <div className="mk-chips__list">{CONTACT_SERVICE_OPTIONS.map(renderChip)}</div>
      {error && (
        <p id={ERROR_ID} className="mk-chips__error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}
