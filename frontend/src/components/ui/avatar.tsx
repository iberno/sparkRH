import { forwardRef, type HTMLAttributes } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', className = '', ...props }, ref) => {
    const initial = name?.charAt(0)?.toUpperCase() || '?';

    return (
      <div
        ref={ref}
        className={`flex justify-center items-center rounded-full bg-spark-navy text-white font-medium overflow-hidden ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt || name || ''} className="size-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';
