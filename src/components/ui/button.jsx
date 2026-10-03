'use client';

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-full font-semibold transition ' +
    'focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizes =
    {
      sm: 'h-9 px-4 text-sm',
      md: 'h-10 px-5 text-sm',
      lg: 'h-11 px-6 text-base',
    }[size] || 'h-10 px-5 text-sm';
  const variants =
    {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500/40',
      secondary:
        'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 focus:ring-orange-500/40',
      ghost:
        'bg-transparent text-primary-600 border border-primary-200 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500/30',
    }[variant] ||
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500/40';

  return (
    <button className={`${base} ${sizes} ${variants} ${className}`} {...props}>
      {children}
    </button>
  );
}
