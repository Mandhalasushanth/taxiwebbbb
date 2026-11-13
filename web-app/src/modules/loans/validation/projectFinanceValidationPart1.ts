import type { ProjectFinanceData } from '@modules/loans/types/projectFinance.types'
import type { LoanStepValidationResult } from './commonLoanValidation'
import { LOAN_PATTERNS, loanFieldRules, toStepResult } from './commonLoanValidation'

export const validateStep1 = (data: ProjectFinanceData): LoanStepValidationResult => {
  const errors: Record<string, string> = {}

  // Section 1: Applicant / Borrower Details
  const name = (data.applicantName || '').trim()
  if (!name) {
    errors.applicantName = 'Applicant / Borrower name is required'
  } else if (name.length < 3) {
    errors.applicantName = 'Please enter a valid applicant name (at least 3 characters)'
  }

  if (!data.entityType || !data.entityType.trim()) {
    errors.entityType = 'Please select constitution / entity type'
  }

  const panTrimmed = (data.pan || '').trim().toUpperCase()
  if (!panTrimmed) {
    errors.pan = 'PAN is required'
  } else if (!/^[A-Z]{3}[ABCFGHJLPT][A-Z][0-9]{4}[A-Z]$/.test(panTrimmed)) {
    errors.pan = 'Please enter a valid 10-character PAN (e.g. ABCPH5478H)'
  }

  const cin = (data.cinLlpin || '').trim().toUpperCase()
  if (cin && !LOAN_PATTERNS.CIN.test(cin) && !LOAN_PATTERNS.LLPIN.test(cin)) {
    errors.cinLlpin = 'Enter a valid 21-character CIN (e.g. U12345TS2020PTC123456) or LLPIN (e.g. AAB-1234)'
  }

  const incorporationError = loanFieldRules.pastDate(data.dateOfIncorporation, 'Date of Incorporation')
  if (incorporationError) {
    errors.dateOfIncorporation = incorporationError
  }

  if (!data.primaryBusinessActivity || !data.primaryBusinessActivity.trim()) {
    errors.primaryBusinessActivity = 'Please select primary business activity'
  }

  // Section 2: Registered Office Address
  if (!data.officeAddressLine1 || !data.officeAddressLine1.trim()) {
    errors.officeAddressLine1 = 'Registered office address line 1 is required'
  }

  const officeStateError = loanFieldRules.placeName(data.officeState, 'State')
  if (officeStateError) {
    errors.officeState = officeStateError
  }

  const officeCityError = loanFieldRules.placeName(data.officeDistrictCity, 'District / city')
  if (officeCityError) {
    errors.officeDistrictCity = officeCityError
  }

  const officePinError = loanFieldRules.pincode(data.officePinCode)
  if (officePinError) {
    errors.officePinCode = officePinError
  }

  // Section 4: Project Classification
  const pName = (data.projectName || '').trim()
  if (!pName) {
    errors.projectName = 'Project name is required'
  } else if (pName.length < 3) {
    errors.projectName = 'Please enter a valid project name'
  }

  if (!data.projectSector || !data.projectSector.trim()) {
    errors.projectSector = 'Please select project sector'
  }

  if (!data.projectSubSector || !data.projectSubSector.trim()) {
    errors.projectSubSector = 'Please select project sub-sector'
  }

  if (!data.projectType || !data.projectType.trim()) {
    errors.projectType = 'Please select project type'
  }

  if (!data.developmentOption || !data.developmentOption.trim()) {
    errors.developmentOption = 'Please select development option (Greenfield / Expansion / etc.)'
  }

  return toStepResult(errors)
}

export const validateStep2 = (data: ProjectFinanceData): LoanStepValidationResult => {
  const errors: Record<string, string> = {}

  // Section 1: Project Location
  if (!data.step2ProjectAddress || !data.step2ProjectAddress.trim()) {
    errors.step2ProjectAddress = 'Project address is required'
  }
  const step2StateError = loanFieldRules.placeName(data.step2State, 'State')
  if (step2StateError) {
    errors.step2State = step2StateError
  }
  const step2DistrictError = loanFieldRules.placeName(data.step2District, 'District')
  if (step2DistrictError) {
    errors.step2District = step2DistrictError
  }
  const step2PinError = loanFieldRules.pincode(data.step2PinCode)
  if (step2PinError) {
    errors.step2PinCode = step2PinError
  }
  if (!data.step2ProjectZone || !data.step2ProjectZone.trim()) {
    errors.step2ProjectZone = 'Please select project zone'
  }
  const townError = loanFieldRules.placeName(data.step2NearestTownCity, 'Nearest town / city')
  if (townError) {
    errors.step2NearestTownCity = townError
  }

  // Section 2: Land Details
  const landReqNum = parseFloat(data.totalLandRequiredAcres || '0')
  if (!data.totalLandRequiredAcres || !data.totalLandRequiredAcres.trim()) {
    errors.totalLandRequiredAcres = 'Total land required (acres) is required'
  } else if (isNaN(landReqNum) || landReqNum <= 0) {
    errors.totalLandRequiredAcres = 'Please enter a valid land area in acres greater than 0'
  }

  const landAvailNum = parseFloat(data.landAvailableAcres || '')
  if (!data.landAvailableAcres || !data.landAvailableAcres.trim()) {
    errors.landAvailableAcres = 'Land available (acres) is required'
  } else if (isNaN(landAvailNum) || landAvailNum < 0) {
    errors.landAvailableAcres = 'Please enter a valid land area in acres'
  }
  const landAcqNum = parseFloat(data.landAcquiredAcres || '')
  if (!data.landAcquiredAcres || !data.landAcquiredAcres.trim()) {
    errors.landAcquiredAcres = 'Land acquired (acres) is required'
  } else if (isNaN(landAcqNum) || landAcqNum < 0) {
    errors.landAcquiredAcres = 'Please enter a valid land area in acres'
  } else if (!isNaN(landReqNum) && landReqNum > 0 && landAcqNum > landReqNum) {
    errors.landAcquiredAcres = 'Land acquired cannot be more than total land required'
  }
  if (!data.landOwnership || !data.landOwnership.trim()) {
    errors.landOwnership = 'Please select land ownership'
  }
  if (!data.landUse || !data.landUse.trim()) {
    errors.landUse = 'Please select land use'
  }
  if (!data.titleStatus || !data.titleStatus.trim()) {
    errors.titleStatus = 'Please select title status'
  }
  if (!data.encumbrance || !data.encumbrance.trim()) {
    errors.encumbrance = 'Please select encumbrance status'
  }
  if (!data.naConversionStatus || !data.naConversionStatus.trim()) {
    errors.naConversionStatus = 'Please select NA conversion status'
  }

  // Section 4: ROW
  if (data.rowRequired) {
    if (!data.rowType || !data.rowType.trim()) {
      errors.rowType = 'Please select ROW type'
    }
    const lenNum = parseFloat(data.rowTotalLengthKm || '0')
    if (!data.rowTotalLengthKm || !data.rowTotalLengthKm.trim()) {
      errors.rowTotalLengthKm = 'Total length (km) is required'
    } else if (isNaN(lenNum) || lenNum <= 0) {
      errors.rowTotalLengthKm = 'Please enter a valid length in km'
    }
    if (!data.rowObtainedPending || !data.rowObtainedPending.trim()) {
      errors.rowObtainedPending = 'Please select obtained/pending status'
    }
    if (!data.rowApprovalStatus || !data.rowApprovalStatus.trim()) {
      errors.rowApprovalStatus = 'Please select approval status'
    }
  }

  // Section 5: Utilities & Site Infrastructure
  if (!data.powerSource || !data.powerSource.trim()) {
    errors.powerSource = 'Please select power source'
  }
  if (!data.waterSource || !data.waterSource.trim()) {
    errors.waterSource = 'Please select water source'
  }
  if (!data.approachRoad || !data.approachRoad.trim()) {
    errors.approachRoad = 'Please select approach road'
  }
  if (!data.drainageArrangement || !data.drainageArrangement.trim()) {
    errors.drainageArrangement = 'Please select drainage arrangement'
  }
  if (!data.wasteEffluentArrangement || !data.wasteEffluentArrangement.trim()) {
    errors.wasteEffluentArrangement = 'Please select waste / effluent arrangement'
  }

  // Section 6: Technical Details
  if (!data.technologyType || !data.technologyType.trim()) {
    errors.technologyType = 'Please select technology type'
  }
  if (!data.technologyDescription || !data.technologyDescription.trim()) {
    errors.technologyDescription = 'Technology description is required'
  }
  if (!data.technologySource || !data.technologySource.trim()) {
    errors.technologySource = 'Please select technology source'
  }
  if (!data.technologyProvider || !data.technologyProvider.trim()) {
    errors.technologyProvider = 'Technology provider is required'
  }

  // Section 7: Capacity & Production
  if (!data.proposedCapacity || !data.proposedCapacity.trim()) {
    errors.proposedCapacity = 'Proposed capacity is required'
  }
  if (!data.capacityUnit || !data.capacityUnit.trim()) {
    errors.capacityUnit = 'Please select capacity unit'
  }
  if (!data.productionPerYear || !data.productionPerYear.trim()) {
    errors.productionPerYear = 'Production per year is required'
  }
  const opDays = parseInt(data.operatingDaysPerYear || '0', 10)
  if (!data.operatingDaysPerYear || !data.operatingDaysPerYear.trim()) {
    errors.operatingDaysPerYear = 'Operating days per year is required'
  } else if (isNaN(opDays) || opDays < 1 || opDays > 366) {
    errors.operatingDaysPerYear = 'Operating days must be between 1 and 366'
  }
  if (!data.numberOfShifts || !data.numberOfShifts.trim()) {
    errors.numberOfShifts = 'Please select number of shifts'
  }

  // Section 10: EPC
  if (!data.epcContractor || !data.epcContractor.trim()) {
    errors.epcContractor = 'EPC Contractor name is required'
  }
  if (!data.contractType || !data.contractType.trim()) {
    errors.contractType = 'Please select contract type'
  }
  const epcVal = parseFloat(String(data.epcContractValue || '').replace(/[^\d.]/g, ''))
  if (!data.epcContractValue || !data.epcContractValue.trim()) {
    errors.epcContractValue = 'EPC Contract Value (₹) is required'
  } else if (isNaN(epcVal) || epcVal <= 0) {
    errors.epcContractValue = 'Please enter a valid EPC contract value'
  }
  if (!data.constructionStartDate || !data.constructionStartDate.trim()) {
    errors.constructionStartDate = 'Construction start date is required'
  }
  if (!data.expectedCompletionDate || !data.expectedCompletionDate.trim()) {
    errors.expectedCompletionDate = 'Expected completion date is required'
  } else {
    const completionOrderError = loanFieldRules.dateOrder(
      data.constructionStartDate,
      data.expectedCompletionDate,
      'Expected completion date must be after construction start date'
    )
    if (completionOrderError) errors.expectedCompletionDate = completionOrderError
  }

  // Section 12: Manpower
  const totEmp = parseInt(data.totalEmployees || '0', 10)
  if (!data.totalEmployees || !data.totalEmployees.trim()) {
    errors.totalEmployees = 'Total employees is required'
  } else if (isNaN(totEmp) || totEmp <= 0) {
    errors.totalEmployees = 'Please enter total number of employees (at least 1)'
  }

  return toStepResult(errors)
}

export const validateStep3 = (data: ProjectFinanceData): LoanStepValidationResult => {
  const errors: Record<string, string> = {}

  // 1. Total Project Cost (Capex Breakup)
  const landCost = parseFloat(String(data.landSiteDevCost || '').replace(/\D/g, ''))
  if (!data.landSiteDevCost || !data.landSiteDevCost.trim()) {
    errors.landSiteDevCost = 'Land & Site Development Cost is required'
  } else if (isNaN(landCost) || landCost <= 0) {
    errors.landSiteDevCost = 'Please enter a valid amount (e.g. 15000000)'
  }

  const civilCost = parseFloat(String(data.civilWorksCost || '').replace(/\D/g, ''))
  if (!data.civilWorksCost || !data.civilWorksCost.trim()) {
    errors.civilWorksCost = 'Civil Works & Building Construction Cost is required'
  } else if (isNaN(civilCost) || civilCost <= 0) {
    errors.civilWorksCost = 'Please enter a valid amount (e.g. 25000000)'
  }

  const plantCost = parseFloat(String(data.plantMachineryCost || '').replace(/\D/g, ''))
  if (!data.plantMachineryCost || !data.plantMachineryCost.trim()) {
    errors.plantMachineryCost = 'Plant & Machinery / Equipment Cost is required'
  } else if (isNaN(plantCost) || plantCost <= 0) {
    errors.plantMachineryCost = 'Please enter a valid amount (e.g. 40000000)'
  }

  const engCost = parseFloat(String(data.engineeringTechnicalCost || '').replace(/\D/g, ''))
  if (!data.engineeringTechnicalCost || !data.engineeringTechnicalCost.trim()) {
    errors.engineeringTechnicalCost = 'Engineering & Technical Knowhow Cost is required'
  } else if (isNaN(engCost) || engCost <= 0) {
    errors.engineeringTechnicalCost = 'Please enter a valid amount (e.g. 5000000)'
  }

  const preOperativeCost = parseFloat(String(data.preliminaryPreOperativeCost || '').replace(/\D/g, ''))
  if (!data.preliminaryPreOperativeCost || !data.preliminaryPreOperativeCost.trim()) {
    errors.preliminaryPreOperativeCost = 'Preliminary & Pre-operative Expenses is required'
  } else if (isNaN(preOperativeCost) || preOperativeCost <= 0) {
    errors.preliminaryPreOperativeCost = 'Please enter a valid amount (e.g. 3000000)'
  }

  const marginCost = parseFloat(String(data.marginMoneyWorkingCapitalCost || '').replace(/\D/g, ''))
  if (!data.marginMoneyWorkingCapitalCost || !data.marginMoneyWorkingCapitalCost.trim()) {
    errors.marginMoneyWorkingCapitalCost = 'Margin Money for Working Capital is required'
  } else if (isNaN(marginCost) || marginCost <= 0) {
    errors.marginMoneyWorkingCapitalCost = 'Please enter a valid amount (e.g. 2000000)'
  }

  const totProjectCost = parseFloat(String(data.totalEstimatedProjectCost || '').replace(/\D/g, ''))
  if (!data.totalEstimatedProjectCost || !data.totalEstimatedProjectCost.trim()) {
    errors.totalEstimatedProjectCost = 'Total Estimated Project Cost is required'
  } else if (isNaN(totProjectCost) || totProjectCost <= 0) {
    errors.totalEstimatedProjectCost = 'Please enter a valid total estimated project cost'
  }

  // 2. Means of Finance (Funding Structure)
  const equityNum = parseFloat(String(data.promotersEquityContribution || '').replace(/\D/g, ''))
  if (!data.promotersEquityContribution || !data.promotersEquityContribution.trim()) {
    errors.promotersEquityContribution = 'Promoters Equity Contribution is required'
  } else if (isNaN(equityNum) || equityNum <= 0) {
    errors.promotersEquityContribution = 'Please enter a valid equity contribution (e.g. 27750000)'
  }

  const debtNum = parseFloat(String(data.debtTermLoanRequested || '').replace(/\D/g, ''))
  if (!data.debtTermLoanRequested || !data.debtTermLoanRequested.trim()) {
    errors.debtTermLoanRequested = 'Debt / Term Loan Requested is required'
  } else if (isNaN(debtNum) || debtNum <= 0) {
    errors.debtTermLoanRequested = 'Please enter a valid loan requested amount (e.g. 64750000)'
  }

  const ratio = (data.proposedDebtToEquityRatio || '').trim()
  if (!ratio) {
    errors.proposedDebtToEquityRatio = 'Proposed Debt to Equity Ratio is required'
  } else if (!/^\d{1,3}:\d{1,3}$/.test(ratio)) {
    errors.proposedDebtToEquityRatio = 'Please enter ratio in valid format (e.g. 70:30)'
  }

  // 3. Disbursement Schedule & Phasing
  const phase1Num = parseFloat(String(data.phase1DrawdownInvestment || '').replace(/\D/g, ''))
  if (!data.phase1DrawdownInvestment || !data.phase1DrawdownInvestment.trim()) {
    errors.phase1DrawdownInvestment = 'Phase 1 Drawdown is required'
  } else if (isNaN(phase1Num) || phase1Num <= 0) {
    errors.phase1DrawdownInvestment = 'Please enter a valid Phase 1 investment amount'
  }

  if (!data.phase1Milestone || !data.phase1Milestone.trim()) {
    errors.phase1Milestone = 'Phase 1 Milestone is required (e.g. Land Acquisition & Civil Works)'
  }

  if (!data.expectedCommercialOperationsDate || !data.expectedCommercialOperationsDate.trim()) {
    errors.expectedCommercialOperationsDate = 'Expected Commercial Operations Date (COD) is required'
  } else {
    const codOrderError = loanFieldRules.dateOrder(
      data.constructionStartDate,
      data.expectedCommercialOperationsDate,
      'Commercial operations date must be after construction start date'
    )
    if (codOrderError) errors.expectedCommercialOperationsDate = codOrderError
  }

  // 4. Cross-checks: cost breakup, funding and drawdown must tie to total project cost
  const capexSum = [landCost, civilCost, plantCost, engCost, preOperativeCost, marginCost].reduce(
    (sum, v) => sum + (isNaN(v) ? 0 : v),
    0
  )
  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`
  if (!errors.totalEstimatedProjectCost && capexSum > 0 && totProjectCost !== capexSum) {
    errors.totalEstimatedProjectCost = `Total project cost must equal the sum of the cost breakup (${fmt(capexSum)})`
  }
  if (!errors.debtTermLoanRequested && totProjectCost > 0 && debtNum >= totProjectCost) {
    errors.debtTermLoanRequested = 'Loan requested must be less than the total project cost'
  }
  if (
    !errors.promotersEquityContribution &&
    !errors.debtTermLoanRequested &&
    totProjectCost > 0 &&
    equityNum + debtNum !== totProjectCost
  ) {
    errors.promotersEquityContribution = `Equity + loan requested must equal total project cost (${fmt(totProjectCost)})`
  }
  if (!errors.phase1DrawdownInvestment && totProjectCost > 0 && phase1Num > totProjectCost) {
    errors.phase1DrawdownInvestment = 'Phase 1 drawdown cannot exceed the total project cost'
  }


  return toStepResult(errors)
}
