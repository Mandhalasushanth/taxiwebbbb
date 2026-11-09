import {
  GSTHeroBanner,
  GSTServices,
} from './index'
import { useGstDashboardData } from '@modules/gst/hooks/useGstDashboardData'
import './GSTDashboard.css'

export const GSTDashboard = () => {
  const dashboardData = useGstDashboardData()

  return (
    <div className="gst-dashboard">
      <GSTHeroBanner />

      <div className="gst-dashboard__overview">
        <GSTServices services={dashboardData.services} />
      </div>
    </div>
  )
}

export const GstHomeScreen = GSTDashboard
export default GSTDashboard
