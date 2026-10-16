import { routePaths } from '@core/config/routePaths'
import type { LoanMarketplaceItem } from '@modules/loans/types/loanMarketplace.types'
import {
  BusinessGearsIcon,
  StorefrontIcon,
  HouseGardenIcon,
  PropertyVillaIcon,
  ExecutivePersonIcon,
  MachineryVehicleIcon,
  ProjectFinanceIcon,
  MsmeLoanIcon,
} from './loanMarketplace.icons'

/**
 * 3D Icon image mapping for all 8 loan categories.
 * Stored in public/assets/icons/loans/
 */
export const LOAN_SERVICE_ICON_IMAGE_MAP: Record<string, string> = {
  'business-working-capital': '/assets/icons/loans/business-loan.png',
  'personal-loan': '/assets/icons/loans/personal-loan.png',
  'home-loan': '/assets/icons/loans/home-loan.png',
  'property-loan': '/assets/icons/loans/property-loan.png',
  'vehicle-loan': '/assets/icons/loans/vehicle-loan.png',
  'machinery-loan': '/assets/icons/loans/machinery-loan.png',
  'msme-loan': '/assets/icons/loans/msme-loan.png',
  'project-finance': '/assets/icons/loans/project-finance.png',
}

/**
 * Complete list of loan items exactly matching the Marketplace catalog.
 */
export const LOAN_MARKETPLACE_ITEMS: LoanMarketplaceItem[] = [
  {
    id: 'business-working-capital',
    title: 'Business & Working Capital',
    desc: 'Business loans, Cash Credit & Overdraft in one application',
    applyPath: routePaths.loansBusinessWorkingCapital,
    tileBg: '#F0F4FF',
    tileBorder: '#DBE4FF',
    icon: <BusinessGearsIcon />,
  },
  {
    id: 'personal-loan',
    title: 'Personal Loan',
    desc: 'Quick personal funds up to ₹25 Lakhs',
    applyPath: routePaths.loansPersonalLoan,
    tileBg: '#FEF6EE',
    tileBorder: '#FED7AA',
    icon: <StorefrontIcon />,
  },
  {
    id: 'home-loan',
    title: 'Home Loan',
    desc: 'Lowest interest rate for home purchase & renovation',
    applyPath: routePaths.loansHomeLoan,
    tileBg: '#F0FDF4',
    tileBorder: '#BBF7D0',
    icon: <HouseGardenIcon />,
  },
  {
    id: 'property-loan',
    title: 'Property Loan',
    desc: 'Loan against commercial or residential property',
    applyPath: routePaths.loansPropertyLoan,
    tileBg: '#FDF2F8',
    tileBorder: '#FBCFE8',
    icon: <PropertyVillaIcon />,
  },
  {
    id: 'vehicle-loan',
    title: 'Vehicle Loan',
    desc: 'New & pre-owned commercial and personal vehicles',
    applyPath: routePaths.loansVehicleLoan,
    tileBg: '#F0F9FF',
    tileBorder: '#BAE6FD',
    icon: <ExecutivePersonIcon />,
  },
  {
    id: 'machinery-loan',
    title: 'Machinery Loan',
    desc: 'Equip your factory or business with modern machinery',
    applyPath: routePaths.loansMachineryLoan,
    tileBg: '#ECFEFF',
    tileBorder: '#A5F3FC',
    icon: <MachineryVehicleIcon />,
  },
  {
    id: 'msme-loan',
    title: 'MSME Loan',
    desc: 'Government-backed credit & business funding for MSMEs',
    applyPath: routePaths.loansMsmeLoan,
    tileBg: '#FEFCE8',
    tileBorder: '#FEF08A',
    icon: <MsmeLoanIcon />,
  },
  {
    id: 'project-finance',
    title: 'Project Finance',
    desc: 'Custom long-term capital for large infrastructure & projects',
    applyPath: routePaths.loansProjectFinance,
    tileBg: '#EEF2FF',
    tileBorder: '#C7D2FE',
    icon: <ProjectFinanceIcon />,
  },
]
