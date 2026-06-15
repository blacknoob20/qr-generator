import type { QRConfig } from './qr.types';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationWarning {
  id: string;
  code: string;
  severity: ValidationSeverity;
  message: string;
  reference?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationWarning[];
  warnings: ValidationWarning[];
  metadata: QRMetadata;
}

export interface ValidationRule {
  id: string;
  severity: ValidationSeverity;
  validate: (config: QRConfig, metadata: QRMetadata) => ValidationWarning | null;
}

export interface QRMetadata {
  version: number;
  capacity: number;
  used: number;
  modules: number;
  encoding: string;
}

export const DEFAULT_METADATA: QRMetadata = {
  version: 1,
  capacity: 0,
  used: 0,
  modules: 21,
  encoding: 'byte',
};
