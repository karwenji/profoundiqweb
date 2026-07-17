import Image from 'next/image'

interface LogoProps {
  className?: string;
  variant?: 'default' | 'inverted';
}

export default function Logo({ className = "h-12 w-auto", variant = 'default' }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="Profound IQ Consulting"
      width={300}
      height={80}
      className={className}
      priority
    />
  );
}