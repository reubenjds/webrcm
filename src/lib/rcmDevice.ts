/**
 * RCM Device Communication
 * Handles WebUSB communication with Nintendo Switch in RCM mode
 */

import type { USBDevice } from '../types';
import { NVIDIA_VENDOR_ID, PACKET_SIZE, VULNERABILITY_LENGTH } from './constants';
import { createRCMPayload, bufferToHex } from './payloadBuilder';

export type LogCallback = (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;

/**
 * Checks if WebUSB is supported in the current browser
 */
export function isWebUSBSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.usb;
}

/**
 * Requests access to a Switch device in RCM mode
 */
export async function requestDevice(): Promise<USBDevice> {
  if (!navigator.usb) {
    throw new Error('WebUSB is not supported in this browser');
  }

  const device = await navigator.usb.requestDevice({
    filters: [{ vendorId: NVIDIA_VENDOR_ID }],
  });

  return device;
}

/**
 * Writes data to the device in chunks
 */
async function writePayload(
  device: USBDevice,
  data: Uint8Array,
  log: LogCallback
): Promise<number> {
  let remaining = data.length;
  let writeCount = 0;
  let offset = 0;

  while (remaining > 0) {
    const chunkSize = Math.min(remaining, PACKET_SIZE);
    const chunk = data.slice(offset, offset + chunkSize);

    await device.transferOut(1, chunk);

    remaining -= chunkSize;
    offset += chunkSize;
    writeCount++;

    // Log progress every 16 packets
    if (writeCount % 16 === 0) {
      const progress = Math.round((offset / data.length) * 100);
      log(`Sending payload... ${progress}%`, 'info');
    }
  }

  return writeCount;
}

/**
 * Launches a payload on the connected Switch device
 */
export async function launchPayload(
  device: USBDevice,
  payload: Uint8Array,
  log: LogCallback
): Promise<void> {
  // Open device connection
  await device.open();
  log(
    `Connected to ${device.manufacturerName || 'Unknown'} ${device.productName || 'Device'}`,
    'success'
  );

  // Claim USB interface
  await device.claimInterface(0);

  // Read device ID
  const deviceID = await device.transferIn(1, 16);
  if (deviceID.data) {
    log(`Device ID: ${bufferToHex(deviceID.data)}`, 'info');
  }

  // Create and send the RCM payload
  const rcmPayload = createRCMPayload(payload);
  log('Sending payload...', 'info');

  const writeCount = await writePayload(device, rcmPayload, log);
  log('Payload sent!', 'success');

  // If we've written an even number of packets, we need to send a padding packet
  // to switch to the higher buffer
  if (writeCount % 2 !== 1) {
    log('Switching to higher buffer...', 'info');
    await device.transferOut(1, new ArrayBuffer(PACKET_SIZE));
  }

  // Trigger the vulnerability
  log('Triggering vulnerability...', 'info');

  // The device disconnects on success, so controlTransferIn may hang or throw.
  // We race against a timeout to ensure we don't get stuck.
  const triggerPromise = device.controlTransferIn(
    {
      requestType: 'standard',
      recipient: 'interface',
      request: 0x00,
      value: 0x00,
      index: 0x00,
    },
    VULNERABILITY_LENGTH
  );

  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(resolve, 1000);
  });

  try {
    await Promise.race([triggerPromise, timeoutPromise]);
  } catch {
    // The device will disconnect when the exploit triggers successfully
    // So an error here is actually expected/good
  }

  log('Payload launched successfully!', 'success');
}

/**
 * Complete flow: request device and launch payload
 */
export async function executePayload(
  payload: Uint8Array,
  log: LogCallback
): Promise<void> {
  if (!isWebUSBSupported()) {
    throw new Error('WebUSB is not supported. Please use Chrome, Edge, or Opera on Linux, macOS, Android, or ChromeOS.');
  }

  log('Requesting access to USB device...', 'info');
  const device = await requestDevice();

  try {
    await launchPayload(device, payload, log);
  } finally {
    // Try to close the device connection
    try {
      await device.close();
    } catch {
      // Device may already be disconnected after exploit
    }
  }
}
