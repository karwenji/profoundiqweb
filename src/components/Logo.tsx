import Image from 'next/image'

interface LogoProps {
  className?: string;
  variant?: 'default' | 'inverted';
}

export default function Logo({ className = "h-10 w-auto sm:h-14 md:h-16 lg:h-20", variant = 'default' }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="Profound IQ Consulting"
      width={400}
      height={100}
      className={className}
      priority
    />
  );
}