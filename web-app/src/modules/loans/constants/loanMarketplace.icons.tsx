import React from 'react'
import {
  ArrowRight,
  Cog,
  Store,
  Home,
  Building,
  Car,
  Factory,
  FolderGit2,
  Wallet,
} from 'lucide-react'

/**
 * 1. Business Loan: Mechanical Gears on Base
 */
export const BusinessGearsIcon: React.FC = () => (
  <Cog size={36} className="loan-item-card__icon-svg" aria-hidden="true" />
)

/**
 * 2. Personal Loan: Storefront / Personal Finance Facility
 */
export const StorefrontIcon: React.FC = () => (
  <Store size={36} className="loan-item-card__icon-svg" aria-hidden="true" />
)

/**
 * 3. Home Loan: Suburban House with Garden Shrub & Chimney
 */
export const HouseGardenIcon: React.FC = () => (
  <Home size={36} className="loan-item-card__icon-svg" aria-hidden="true" />
)

/**
 * 4. Property Loan: Brick Cottage Villa
 */
export const PropertyVillaIcon: React.FC = () => (
  <Building size={36} className="loan-item-card__icon-svg" aria-hidden="true" />
)

/**
 * 5. Vehicle Loan: Executive Driver / Automotive Icon
 */
export const ExecutivePersonIcon: React.FC = () => (
  <Car size={36} className="loan-item-card__icon-svg" aria-hidden="true" />
)

/**
 * 7. Machinery Loan: Industrial Equipment / Vehicle
 */
export const MachineryVehicleIcon: React.FC = () => (
  <Factory size={36} className="loan-item-card__icon-svg" aria-hidden="true" />
)

/**
 * 8. Project Finance: Blueprint / Architecture Project
 */
export const ProjectFinanceIcon: React.FC = () => (
  <FolderGit2 size={36} className="loan-item-card__icon-svg" aria-hidden="true" />
)

/**
 * Header Wallet Icon
 */
export const WalletIcon: React.FC = () => (
  <Wallet size={28} aria-hidden="true" />
)

/**
 * Arrow after the "Apply Now" action (matches the GST "Start" arrow)
 */
export const ApplyArrowIcon: React.FC = () => (
  <ArrowRight size={16} strokeWidth={2.5} className="loan-item-card__arrow" aria-hidden="true" />
)
