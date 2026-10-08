import { STATES_LIST, DISTRICTS_MAP } from '../ApplicantAndProject/applicantAndProjectConstants'

export const STEP2_STATES_LIST = STATES_LIST
export const STEP2_DISTRICTS_MAP = DISTRICTS_MAP

export const PROJECT_ZONES = [
  { label: 'Industrial Zone', value: 'Industrial Zone' },
  { label: 'Special Economic Zone (SEZ)', value: 'Special Economic Zone (SEZ)' },
  { label: 'Commercial Zone', value: 'Commercial Zone' },
  { label: 'Agricultural Zone', value: 'Agricultural Zone' },
  { label: 'Mixed-Use Zone', value: 'Mixed-Use Zone' },
]

export const LAND_OWNERSHIP_OPTIONS = [
  { label: 'Freehold Owned', value: 'Freehold Owned' },
  { label: 'Leasehold (Govt / Industrial Dev Corp)', value: 'Leasehold (Govt / Industrial Dev Corp)' },
  { label: 'Private Long-term Lease', value: 'Private Long-term Lease' },
  { label: 'Under Acquisition / Agreement to Sale', value: 'Under Acquisition / Agreement to Sale' },
]

export const LAND_USE_OPTIONS = [
  { label: 'Industrial / Manufacturing', value: 'Industrial / Manufacturing' },
  { label: 'Commercial / Tech Park', value: 'Commercial / Tech Park' },
  { label: 'Agricultural (Pending Conversion)', value: 'Agricultural (Pending Conversion)' },
  { label: 'Infrastructure Corridor', value: 'Infrastructure Corridor' },
]

export const TITLE_STATUS_OPTIONS = [
  { label: 'Clear & Marketable Title', value: 'Clear & Marketable Title' },
  { label: 'Title Search Completed (No Defects)', value: 'Title Search Completed (No Defects)' },
  { label: 'Title Due Diligence In Progress', value: 'Title Due Diligence In Progress' },
]

export const ENCUMBRANCE_OPTIONS = [
  { label: 'Nil / Free from all encumbrances', value: 'Nil / Free from all encumbrances' },
  { label: 'Existing Mortgage to be Refinanced', value: 'Existing Mortgage to be Refinanced' },
  { label: 'Ceded to Project SPV', value: 'Ceded to Project SPV' },
]

export const NA_CONVERSION_STATUS_OPTIONS = [
  { label: 'Converted to NA (Non-Agricultural)', value: 'Converted to NA (Non-Agricultural)' },
  { label: 'NA Application Submitted & Under Process', value: 'NA Application Submitted & Under Process' },
  { label: 'Not Applicable (Already Industrial / SEZ)', value: 'Not Applicable (Already Industrial / SEZ)' },
]

export const ACQUISITION_STATUS_OPTIONS = [
  { label: 'Fully Acquired & Registered', value: 'Fully Acquired & Registered' },
  { label: 'Registered Agreement to Sale with Possession', value: 'Registered Agreement to Sale with Possession' },
  { label: 'Allotment Letter Issued by Govt/SIDC', value: 'Allotment Letter Issued by Govt/SIDC' },
  { label: 'Acquisition Under Process', value: 'Acquisition Under Process' },
]

export const ROW_TYPES = [
  { label: 'Transmission Line Corridor', value: 'Transmission Line Corridor' },
  { label: 'Water Pipeline & Intake Route', value: 'Water Pipeline & Intake Route' },
  { label: 'Gas Pipeline Connectivity', value: 'Gas Pipeline Connectivity' },
  { label: 'Rail Siding / Road Approach', value: 'Rail Siding / Road Approach' },
  { label: 'Effluent Discharge Channel', value: 'Effluent Discharge Channel' },
]

export const ROW_OBTAINED_PENDING_OPTIONS = [
  { label: 'Fully Obtained / Right Secured', value: 'Fully Obtained / Right Secured' },
  { label: 'Partially Obtained (In Progress)', value: 'Partially Obtained (In Progress)' },
  { label: 'Applied & Pending Clearance', value: 'Applied & Pending Clearance' },
]

export const ROW_APPROVAL_STATUS_OPTIONS = [
  { label: 'Approved by Competent Authority', value: 'Approved by Competent Authority' },
  { label: 'Under Review / Statutory Hearing', value: 'Under Review / Statutory Hearing' },
  { label: 'Awaiting Final Gazetting', value: 'Awaiting Final Gazetting' },
]

export const POWER_SOURCE_OPTIONS = [
  { label: 'State Electricity Grid (DISCOM Dedicated Feeder)', value: 'State Electricity Grid (DISCOM Dedicated Feeder)' },
  { label: 'Captive Solar / Wind Power Plant', value: 'Captive Solar / Wind Power Plant' },
  { label: 'Dual Source (Grid + Dedicated DG Backup)', value: 'Dual Source (Grid + Dedicated DG Backup)' },
  { label: 'Substation Connection (33kV / 66kV / 132kV)', value: 'Substation Connection (33kV / 66kV / 132kV)' },
]

export const WATER_SOURCE_OPTIONS = [
  { label: 'Industrial Development Corp Supply (SIDC)', value: 'Industrial Development Corp Supply (SIDC)' },
  { label: 'River / Canal Water Allocation Approved', value: 'River / Canal Water Allocation Approved' },
  { label: 'Borewell with CGWA Permission', value: 'Borewell with CGWA Permission' },
  { label: 'Desalination / Recycled Water Plant', value: 'Desalination / Recycled Water Plant' },
]

export const APPROACH_ROAD_OPTIONS = [
  { label: 'National Highway (NH) Connected', value: 'National Highway (NH) Connected' },
  { label: 'State Highway (SH) 4-Lane Access', value: 'State Highway (SH) 4-Lane Access' },
  { label: 'Paved Industrial All-Weather Road', value: 'Paved Industrial All-Weather Road' },
  { label: 'Dedicated Project Access Road (Developed)', value: 'Dedicated Project Access Road (Developed)' },
]

export const DRAINAGE_ARRANGEMENT_OPTIONS = [
  { label: 'Integrated Storm Water Drainage Network', value: 'Integrated Storm Water Drainage Network' },
  { label: 'Municipal / Industrial Estate Drainage Tie-in', value: 'Municipal / Industrial Estate Drainage Tie-in' },
  { label: 'Internal Gravity Drainage with Retention Pond', value: 'Internal Gravity Drainage with Retention Pond' },
]

export const WASTE_EFFLUENT_OPTIONS = [
  { label: 'Zero Liquid Discharge (ZLD) Plant On-Site', value: 'Zero Liquid Discharge (ZLD) Plant On-Site' },
  { label: 'Common Effluent Treatment Plant (CETP) Connected', value: 'Common Effluent Treatment Plant (CETP) Connected' },
  { label: 'Effluent Treatment Plant (ETP) + STP On-Site', value: 'Effluent Treatment Plant (ETP) + STP On-Site' },
]

export const OTHER_INFRASTRUCTURE_OPTIONS = [
  { label: 'Telecommunications & High-Speed Optical Fiber', value: 'Telecommunications & High-Speed Optical Fiber' },
  { label: 'Fire Fighting System & Dedicated Water Reservoir', value: 'Fire Fighting System & Dedicated Water Reservoir' },
  { label: 'Staff Housing & Security Perimeter', value: 'Staff Housing & Security Perimeter' },
  { label: 'Warehousing & Logistics Marshalling Yard', value: 'Warehousing & Logistics Marshalling Yard' },
]

export const TECHNOLOGY_TYPE_OPTIONS = [
  { label: 'State-of-the-art Automated / Industry 4.0', value: 'State-of-the-art Automated / Industry 4.0' },
  { label: 'Imported Proven Proprietary Technology (Tier 1 OEM)', value: 'Imported Proven Proprietary Technology (Tier 1 OEM)' },
  { label: 'Indigenous Proven Commercial Technology', value: 'Indigenous Proven Commercial Technology' },
  { label: 'Green / Low-Carbon Certified Process Technology', value: 'Green / Low-Carbon Certified Process Technology' },
]

export const TECHNOLOGY_SOURCE_OPTIONS = [
  { label: 'Indigenous In-House R&D', value: 'Indigenous In-House R&D' },
  { label: 'Technology Transfer / Foreign Collaboration', value: 'Technology Transfer / Foreign Collaboration' },
  { label: 'Licensor Proprietary Package (Turnkey)', value: 'Licensor Proprietary Package (Turnkey)' },
  { label: 'Standard OEM Integration', value: 'Standard OEM Integration' },
]

export const CAPACITY_UNIT_OPTIONS = [
  { label: 'Metric Tonnes Per Annum (MTPA)', value: 'MTPA' },
  { label: 'Mega Watts (MW)', value: 'MW' },
  { label: 'Kilo Litres Per Day (KLPD)', value: 'KLPD' },
  { label: 'Units / Pieces per Year', value: 'Units/Year' },
  { label: 'Square Feet / Sq. Meters', value: 'Sq.Ft' },
]

export const NUMBER_OF_SHIFTS_OPTIONS = [
  { label: '1 Shift (8 Hours)', value: '1 Shift' },
  { label: '2 Shifts (16 Hours)', value: '2 Shifts' },
  { label: '3 Shifts (Continuous 24 Hours)', value: '3 Shifts' },
]

export const MACHINERY_CATEGORY_OPTIONS = [
  { label: 'Primary Processing Equipment', value: 'Primary Processing' },
  { label: 'Secondary / Auxiliary Machinery', value: 'Secondary / Auxiliary' },
  { label: 'Utilities & Power Generation Equipment', value: 'Utilities & Power' },
  { label: 'Testing, Quality & Packaging', value: 'Testing & Packaging' },
  { label: 'Material Handling Equipment', value: 'Material Handling' },
]

export const RAW_MATERIAL_SOURCE_OPTIONS = [
  { label: 'Domestic Local Suppliers', value: 'Domestic Local Suppliers' },
  { label: 'Imported (Overseas OEM/Mining)', value: 'Imported' },
  { label: 'Captive Supply / Group Companies', value: 'Captive Supply' },
  { label: 'Spot Market Procurement', value: 'Spot Market' },
]

export const RAW_MATERIAL_UNIT_OPTIONS = [
  { label: 'Metric Tonnes (MT)', value: 'MT' },
  { label: 'Kilo Litres (KL)', value: 'KL' },
  { label: 'Kilograms (Kg)', value: 'Kg' },
  { label: 'Barrels / Drums', value: 'Barrels' },
  { label: 'Standard Pieces / Units', value: 'Units' },
]

export const CONTRACT_TYPE_OPTIONS = [
  { label: 'Lump Sum Turnkey (LSTK)', value: 'LSTK' },
  { label: 'EPC (Engineering, Procurement, Construction)', value: 'EPC' },
  { label: 'EPCM (EPC Management & Advisory)', value: 'EPCM' },
  { label: 'Item Rate / Package Contracts', value: 'Package Contracts' },
]

export const MILESTONE_STATUS_OPTIONS = [
  { label: 'Planned', value: 'Planned' },
  { label: 'In-Progress', value: 'In-Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Delayed', value: 'Delayed' },
]
