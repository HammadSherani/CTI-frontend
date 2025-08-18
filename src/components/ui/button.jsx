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
        'bg-[#1e7bff] text-white hover:brightness-95 active:brightness-90 focus:ring-[#1e7bff]/40',
      secondary:
        'bg-[#FEA621] text-black hover:brightness-95 active:brightness-90 focus:ring-[#FEA621]/40',
      ghost:
        'bg-white text-[#1e7bff] border border-[#d8e3ff] hover:bg-[#f2f6ff] focus:ring-[#1e7bff]/30',
    }[variant] ||
    'bg-[#1e7bff] text-white hover:brightness-95 active:brightness-90 focus:ring-[#1e7bff]/40';

  return (
    <button className={`${base} ${sizes} ${variants} ${className}`} {...props}>
      {children}
    </button>
  );
}
