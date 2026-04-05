/**
 * Payload Builder
 * Constructs the RCM payload for the Fusee Gelee exploit
 */

import {
  INTERMEZZO,
  RCM_PAYLOAD_ADDRESS,
  INTERMEZZO_LOCATION,
  RCM_LENGTH,
  PAYLOAD_START_OFFSET,
  PACKET_SIZE,
} from './constants';

/**
 * Creates the RCM payload that will be sent to the Switch
 * 
 * The payload structure:
 * 1. RCM length header (4 bytes)
 * 2. Repeated intermezzo address (fills space before intermezzo)
 * 3. Intermezzo code
 * 4. Padding (0x1000 bytes)
 * 5. Actual payload
 * 
 * @param payload - The actual payload binary (e.g., Hekate, Atmosphere)
 * @returns The complete RCM payload ready for USB transfer
 */
export function createRCMPayload(payload: Uint8Array): Uint8Array {
  // Calculate how many times we need to repeat the intermezzo address
  const intermezzoAddressRepeatCount = (INTERMEZZO_LOCATION - RCM_PAYLOAD_ADDRESS) / 4;

  // Calculate total payload size (rounded up to packet size)
  const rcmPayloadSize =
    Math.ceil(
      (PAYLOAD_START_OFFSET + 4 * intermezzoAddressRepeatCount + 0x1000 + payload.byteLength) /
        PACKET_SIZE
    ) * PACKET_SIZE;

  // Create the payload buffer
  const rcmPayload = new Uint8Array(new ArrayBuffer(rcmPayloadSize));
  const rcmPayloadView = new DataView(rcmPayload.buffer);

  // Set RCM length at offset 0x0
  rcmPayloadView.setUint32(0x0, RCM_LENGTH, true);

  // Fill with repeated intermezzo address
  for (let i = 0; i < intermezzoAddressRepeatCount; i++) {
    rcmPayloadView.setUint32(PAYLOAD_START_OFFSET + i * 4, INTERMEZZO_LOCATION, true);
  }

  // Copy intermezzo code
  rcmPayload.set(INTERMEZZO, PAYLOAD_START_OFFSET + 4 * intermezzoAddressRepeatCount);

  // Copy actual payload after intermezzo + padding
  rcmPayload.set(payload, PAYLOAD_START_OFFSET + 4 * intermezzoAddressRepeatCount + 0x1000);

  return rcmPayload;
}

/**
 * Converts a DataView to a hex string for display
 */
export function bufferToHex(data: DataView): string {
  let result = '';
  for (let i = 0; i < data.byteLength; i++) {
    result += data.getUint8(i).toString(16).padStart(2, '0');
  }
  return result;
}

/**
 * Reads a file as an ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Fetches a payload file from the public directory
 */
export async function fetchPayload(path: string): Promise<Uint8Array> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch payload: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
