import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'variant'> {
  variant?: Variant;
  icon?: ReactNode;
  children?: ReactNode;
}

const variants: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #6C63FF 0%, #7C4DFF 50%, #A855F7 100%)',
    boxShadow: '0 4px 24px rgba(108, 99, 255, 0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
  },
  secondary: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
    backdropFilter: 'blur(12px)',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid transparent',
    color: 'var(--text-secondary)',
  },
  danger: {
    background: 'rgba(255, 77, 109, 0.12)',
    border: '1px solid rgba(255, 77, 109, 0.3)',
    color: 'var(--error)',
  },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { variant = 'primary', icon, children, style, disabled, ...rest } = props;
    const styles = variants[variant as Variant];
    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px 24px',
          fontFamily: 'var(--font-accent)',
          fontWeight: 600,
          fontSize: '0.92rem',
          borderRadius: 'var(--radius-md)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.45 : 1,
          ...styles,
          ...style,
        }}
        {...rest}
      >
        {icon}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
