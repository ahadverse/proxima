import Image from 'next/image';

/**
 * The accepted payment methods as logos, shown in the footer until a payment-methods image is uploaded in the admin
 * (Settings -> Payment methods image, which takes over). The files live in public/payments; to change one, drop a file
 * with the same name there.
 */
const METHODS = [
  { name: 'bKash', src: '/payments/bkash.png', width: 320, height: 146 },
  { name: 'Nagad', src: '/payments/nagad.svg', width: 240, height: 80 },
  { name: 'Rocket', src: '/payments/rocket.svg', width: 417, height: 263 },
  { name: 'Upay', src: '/payments/upay.svg', width: 313, height: 433 },
  { name: 'Visa', src: '/payments/visa.svg', width: 1000, height: 325 },
  { name: 'Mastercard', src: '/payments/mastercard.svg', width: 1000, height: 618 },
];

export function PaymentLogos({ label }: { label: string }) {
  return (
    <ul aria-label={label} className="grid grid-cols-3 gap-2">
      {METHODS.map((method) => (
        <li key={method.name} className="flex h-14 items-center justify-center rounded-xl border border-line bg-white px-3 shadow-sm">
          {/* SVG and tiny PNG files served as they are: nothing to optimise, so the image optimiser is skipped. */}
          <Image src={method.src} alt={method.name} width={method.width} height={method.height} unoptimized className="max-h-8 w-auto max-w-full object-contain" />
        </li>
      ))}
    </ul>
  );
}
