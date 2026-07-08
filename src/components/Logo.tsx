interface LogoProps {
  className?: string;
  variant?: 'default' | 'inverted';
}

export default function Logo({ className = "h-12 w-auto", variant = 'default' }: LogoProps) {
  const isDark = variant === 'inverted';
  
  return (
    <svg viewBox="0 0 300 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="60" height="60" rx="12" fill={isDark ? 'white' : '#1e3a8a'}/>
      <text x="35" y="52" fontFamily="Arial, Helvetica, sans-serif" fontSize="32" fontWeight="900" fill={isDark ? '#1e3a8a' : 'white'} textAnchor="middle">PI</text>
      <text x="80" y="42" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="bold" fill={isDark ? 'white' : '#1e3a8a'}>PROFOUND IQ</text>
      <text x="80" y="60" fontFamily="Arial, Helvetica, sans-serif" fontSize="13" fill={isDark ? '#94a3b8' : '#64748b'} letterSpacing="2">CONSULTING</text>
    </svg>
  );
}