import React from 'react'
import {
  ITR_CATEGORIES,
  type ItrCategoryId,
  type ItrCategoryItem,
  CalculatorIcon,
  CheckIcon,
  UserCategoryIcon,
  StoreCategoryIcon,
  MedicalCategoryIcon,
  LaptopCategoryIcon,
  TrendingCategoryIcon,
  HomeCategoryIcon,
  DocumentCategoryIcon,
  LinkCategoryIcon,
} from '../itrFiling.constants'
import './ItrCategorySelectionView.css'

const CATEGORY_ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  user: UserCategoryIcon,
  store: StoreCategoryIcon,
  medical: MedicalCategoryIcon,
  laptop: LaptopCategoryIcon,
  trending: TrendingCategoryIcon,
  home: HomeCategoryIcon,
  document: DocumentCategoryIcon,
  link: LinkCategoryIcon,
}

const renderCategoryIcon = (name: string): React.ReactNode => {
  try {
    const IconComponent = CATEGORY_ICON_MAP[name] || UserCategoryIcon
    return <IconComponent size={19} />
  } catch {
    return <UserCategoryIcon size={19} />
  }
}

export const ItrCategoryBanner: React.FC = () => (
  <div className="itr-cat-banner">
    <div className="itr-cat-banner__top">
      <div className="itr-cat-banner__icon-box" aria-hidden="true">
        <CalculatorIcon size={20} className="itr-cat-banner__calc-svg" />
      </div>
      <div className="itr-cat-banner__text-group">
        <div className="itr-cat-banner__title-line">
          <h2 className="itr-cat-banner__title">ITR Filing</h2>
        </div>
        <span className="itr-cat-banner__subtag">SELECT PRIMARY INCOME</span>
      </div>
    </div>
    <p className="itr-cat-banner__desc">
      Select your main source of income. We will automatically determine the applicable ITR form for you.
    </p>
  </div>
)

export interface ItrCategoryCardProps {
  item: ItrCategoryItem
  isSelected: boolean
  onSelect: (id: ItrCategoryItem['id']) => void
}

export const ItrCategoryCard: React.FC<ItrCategoryCardProps> = ({ item, isSelected, onSelect }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    try {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect(item.id)
      }
    } catch {
      // No-op
    }
  }

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      className={`itr-cat-card ${isSelected ? 'itr-cat-card--selected' : ''}`}
      onClick={() => onSelect(item.id)}
      onKeyDown={handleKeyDown}
    >
      <div className="itr-cat-card__header">
        <div className="itr-cat-card__icon-box" aria-hidden="true">
          {renderCategoryIcon(item.iconName)}
        </div>
        <div className="itr-cat-card__radio-badge" aria-hidden="true">
          {isSelected && <CheckIcon size={12} className="itr-cat-card__check-icon" />}
        </div>
      </div>
      <div className="itr-cat-card__body">
        <h3 className="itr-cat-card__title">{item.title}</h3>
        <p className="itr-cat-card__subtitle">{item.subtitle}</p>
      </div>
      <div className="itr-cat-card__footer">
        <span className="itr-cat-card__tag">{item.formTag}</span>
      </div>
    </div>
  )
}

export interface ItrCategorySelectionViewProps {
  selectedCategoryId?: ItrCategoryId | null
  onSelectCategory?: (id: ItrCategoryId) => void
  onStartApplication?: () => void
  selectedId?: ItrCategoryId | null
  onSelect?: (id: ItrCategoryId) => void
  onStart?: (id: ItrCategoryId) => void
}

export const ItrCategorySelectionView: React.FC<ItrCategorySelectionViewProps> = ({
  selectedCategoryId,
  onSelectCategory,
  onStartApplication,
  selectedId,
  onSelect,
  onStart,
}) => {
  const activeId = selectedCategoryId ?? selectedId ?? null
  const handleSelect = onSelectCategory || onSelect || (() => {})
  const selectedItem = activeId ? ITR_CATEGORIES.find((c) => c.id === activeId) : null

  const handleStart = () => {
    try {
      if (!activeId) return
      onStartApplication?.()
      onStart?.(activeId)
    } catch {
      // No-op
    }
  }

  const renderFooter = () => (
    <div className="itr-cat-action-footer">
      <div className="itr-cat-action-summary">
        {selectedItem ? (
          <>
            <span className="itr-cat-action-summary__label">Selected Category:</span>
            <strong className="itr-cat-action-summary__val">{selectedItem.title}</strong>
          </>
        ) : (
          <span className="itr-cat-action-summary__prompt">
            Please select an income category above to proceed
          </span>
        )}
      </div>

      <button
        type="button"
        className={`itr-cat-start-btn ${!activeId ? 'itr-cat-start-btn--disabled' : ''}`}
        disabled={!activeId}
        onClick={handleStart}
      >
        <span>Start Application</span>
        <span aria-hidden="true" className="itr-cat-start-arrow">→</span>
      </button>
    </div>
  )

  return (
    <div className="itr-cat-view-container">
      <ItrCategoryBanner />
      <section className="itr-cat-grid" role="radiogroup" aria-label="Select income category">
        {ITR_CATEGORIES.map((cat) => (
          <ItrCategoryCard
            key={cat.id}
            item={cat}
            isSelected={activeId === cat.id}
            onSelect={handleSelect}
          />
        ))}
      </section>
      {renderFooter()}
    </div>
  )
}
