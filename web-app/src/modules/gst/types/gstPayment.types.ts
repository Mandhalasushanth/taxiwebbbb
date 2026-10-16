export type PaymentMethodId = "upi" | "card" | "netbanking" | "";

export interface PaymentResult {
  transactionId: string;
  receiptNumber: string;
  method: string;
  dateText: string;
  applicationRef: string;
  amount: number;
  /** Set only when the payments service verified the gateway callback */
  verified: boolean;
  orderId?: string;
}

export interface GSTStepPaymentProps {
  amount?: number;
  serviceId?: string;
  applicationRef?: string;
  serviceTitle?: string;
  applicantName?: string;
  onBack: () => void;
  onSuccess: (paymentDetails: PaymentResult) => void;
}

export interface CardFormData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface PaymentErrors {
  method?: string;
  upiId?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  bank?: string;
  general?: string;
}

export interface UpiAppOption {
  id: string;
  name: string;
  iconSrc?: string;
  suffix?: string;
}

export const UPI_APPS: UpiAppOption[] = [
  { id: "phonepe", name: "PhonePe", suffix: "@ybl" },
  { id: "gpay", name: "GPay", suffix: "@okaxis" },
  { id: "paytm", name: "Paytm", suffix: "@paytm" },
  { id: "bhim", name: "BHIM", suffix: "@upi" },
];

export const POPULAR_BANKS = [
  "Axis Bank",
  "Bank of Baroda",
  "Canara Bank",
  "HDFC Bank",
  "ICICI Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "State Bank of India",
  "Union Bank of India",
];

export const ALL_BANKS = [
  "Axis Bank",
  "Bank of Baroda",
  "Bank of India",
  "Canara Bank",
  "DCB Bank",
  "Federal Bank",
  "HDFC Bank",
  "ICICI Bank",
  "IDFC FIRST Bank",
  "Indian Bank",
  "IndusInd Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "RBL Bank",
  "State Bank of India",
  "Union Bank of India",
  "Yes Bank",
];
