// WebUSB type declarations
export interface USBDevice {
  manufacturerName?: string;
  productName?: string;
  open(): Promise<void>;
  close(): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
  transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
  controlTransferIn(
    setup: USBControlTransferParameters,
    length: number
  ): Promise<USBInTransferResult>;
}

export interface USBInTransferResult {
  data?: DataView;
  status: 'ok' | 'stall' | 'babble';
}

export interface USBOutTransferResult {
  bytesWritten: number;
  status: 'ok' | 'stall' | 'babble';
}

export interface USBControlTransferParameters {
  requestType: 'standard' | 'class' | 'vendor';
  recipient: 'device' | 'interface' | 'endpoint' | 'other';
  request: number;
  value: number;
  index: number;
}

export interface USBDeviceRequestOptions {
  filters: Array<{
    vendorId?: number;
    productId?: number;
  }>;
}

// Extend Navigator interface for WebUSB
declare global {
  interface Navigator {
    usb?: {
      requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>;
      getDevices(): Promise<USBDevice[]>;
    };
  }
}

// Payload manifest types
export interface PayloadVersion {
  version: string;
  file: string;
  date: string;
  url: string;
}

export interface PayloadEntry {
  name: string;
  repo: string;
  latest: string;
  versions: PayloadVersion[];
}

export interface PayloadManifest {
  hekate: PayloadEntry;
  fusee: PayloadEntry;
  lastUpdated: string;
  maxVersionsToKeep: number;
}

// Payload selection types
export type PayloadType = 'hekate' | 'fusee' | 'custom';

export interface PayloadSelection {
  type: PayloadType;
  version?: string; // For hekate/fusee, the version string
  file?: File; // For custom payloads
}

// Log entry for output display
export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

// Execution state
export type ExecutionState = 'idle' | 'connecting' | 'sending' | 'triggering' | 'success' | 'error';
