import { initials } from '../personas';

const SIZES = {
  sm: 'size-8 text-xs',
  lg: 'size-18 border-4 border-surface text-2xl',
};

export default function Avatar({ name, size = 'sm', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-grid flex-none place-items-center rounded-full bg-accent-soft font-bold text-accent ${SIZES[size]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
