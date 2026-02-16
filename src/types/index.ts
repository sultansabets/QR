export interface InstrumentData {
  name: string;
  type: string;
  manufacturer?: string;
  range: { min: number; max: number; unit: string };
  accuracyClass: string;
  yearOfManufacture: number;
  methodology?: string;
}

export interface VerificationResult {
  success: boolean;
  timestamp: string;
  registryCheck: {
    found: boolean;
    regNumber?: string;
    validUntil?: string;
    matchPercentage?: number;
    errors?: string[];
    warnings?: string[];
  };
  accreditationCheck: {
    inScope: boolean;
    group?: string;
    rangeInOA?: string;
    errors?: string[];
    warnings?: string[];
  };
}

export interface VerificationHistoryItem {
  id: string;
  timestamp: string;
  instrumentName: string;
  instrumentType: string;
  result: 'success' | 'error';
  details: VerificationResult;
  instrumentData: InstrumentData;
}
