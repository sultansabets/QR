import QRCode from 'qrcode';

export async function generateTestQR(certificateData: {
  id: string;
  certificateNumber: string;
  instrument: unknown;
  verificationDate: string;
}): Promise<string> {
  const qrData = JSON.stringify({
    id: certificateData.id,
    number: certificateData.certificateNumber,
    instrument: certificateData.instrument,
    date: certificateData.verificationDate,
  });
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
    return qrCodeDataUrl;
  } catch (err) {
    console.error('QR generation error:', err);
    throw err;
  }
}
