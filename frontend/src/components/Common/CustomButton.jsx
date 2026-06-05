import React from 'react';
import { Button } from 'react-bootstrap';

function CustomButton({ 
  children, 
  variant = 'dark', // 'dark' (black), 'outline-dark', 'light', etc.
  onClick, 
  type = 'button', 
  className = '', 
  disabled = false,
  icon = '' // dynamic icon class name string (e.g. 'bi-plus-square')
}) {
  
  // Custom styling matching the wireframe's sleek, clean look
  const baseStyle = {
    padding: '0.6rem 1.4rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    borderRadius: '6px', // Sleek corners like the wireframe
    transition: 'all 0.2s ease-in-out',
  };

  // Handing the wireframe's solid black button style easily
  const getVariantClass = () => {
    if (variant === 'dark') return 'bg-black text-white border-0 hover-opacity';
    return ''; // otherwise let Bootstrap handle standard outline/light variants
  };

  return (
    <Button
      type={type}
      variant={variant === 'dark' ? 'dark' : variant}
      onClick={onClick}
      disabled={disabled}
      className={`d-inline-flex align-items-center justify-content-center gap-2 shadow-sm ${getVariantClass()} ${className}`}
      style={baseStyle}
    >
      {/* If an icon string is provided, render the icon automatically */}
      {icon && <i className={`bi ${icon} fs-5`}></i>}
      {children}
    </Button>
  );
}

export default CustomButton;