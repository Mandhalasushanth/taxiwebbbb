export { profileRoutes } from './routes'
export { CreateProfilePage } from './pages/CreateProfilePage/CreateProfilePage'
export { CompleteProfileCard } from './components/CompleteProfileCard/CompleteProfileCard'
export { DetailCard } from './components/DetailCard/DetailCard'
export { UnavailableModal } from './components/UnavailableModal/UnavailableModal'
export {
  calculateProfileProgress,
  formatCustomerType,
  formatGender,
  formatFullAddress,
  isFieldValuePresent,
  getCustomerId,
  getCustomerDisplayName,
  isPlaceholderCustomerName,
  isMockEmail,
} from './utils/profileProgress'
export type { ProfileFilters, ProfileItem } from './types/profile.types'
