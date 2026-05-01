import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingWrapper = ({
  children,
  loading = false,
  loadingText = null,
  loadingPosition = 'left',
  showSpinner = true,
  spinnerSize = 'sm',
  spinnerVariant = 'primary',
  disabled = false,
  className = '',
  as = 'div',
  overlay = false,
  overlayColor = 'rgba(255, 255, 255, 0.8)',
  size = 'md',
  variant = 'primary',
  type = 'button',
  onClick,
  href,
  to,
  ...props
}) => {
  
  // Size classes
  const sizeClasses = {
    sm: { button: 'btn-sm py-1 px-2', input: 'form-control-sm', text: 'small' },
    md: { button: '', input: '', text: '' },
    lg: { button: 'btn-lg py-2 px-4', input: 'form-control-lg', text: 'large' }
  };
  
  // Get loading text based on context
  const getLoadingText = () => {
    if (loadingText) return loadingText;
    if (as === 'button') return 'Processing...';
    if (as === 'a') return 'Loading...';
    return 'Loading...';
  };
  
  // Render spinner
  const renderSpinner = () => {
    if (!showSpinner) return null;
    return (
      <Spinner
        animation="border"
        size={spinnerSize}
        variant={spinnerVariant}
        className={loadingPosition === 'left' ? 'me-2' : loadingPosition === 'right' ? 'ms-2' : ''}
      />
    );
  };
  
  // Render loading content
  const renderLoadingContent = () => {
    const text = (loadingText !== false) && (
      <span className={sizeClasses[size].text}>{getLoadingText()}</span>
    );
    
    switch(loadingPosition) {
      case 'right':
        return (
          <>
            {text}
            {renderSpinner()}
          </>
        );
      case 'center':
        return (
          <div className="d-flex flex-column align-items-center justify-content-center">
            {renderSpinner()}
            {text && <span className="mt-2">{text}</span>}
          </div>
        );
      default: // left
        return (
          <>
            {renderSpinner()}
            {text}
          </>
        );
    }
  };
  
  // Handle overlay loading
  if (overlay && loading) {
    return (
      <div className="position-relative" style={{ minHeight: '50px' }}>
        {children}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded"
          style={{ 
            backgroundColor: overlayColor,
            zIndex: 1000,
            borderRadius: 'inherit'
          }}
        >
          <div className="text-center">
            {renderSpinner()}
            {getLoadingText() && (
              <div className="mt-2 small text-muted">{getLoadingText()}</div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Disabled styles
  const disabledClass = (loading || disabled) ? 'opacity-50' : '';
  const pointerEvents = (loading || disabled) ? 'pointer-events-none' : '';
  
  // Button element
  if (as === 'button') {
    return (
      <button
        type={type}
        className={`btn btn-${variant} ${sizeClasses[size].button} ${disabledClass} ${pointerEvents} ${className}`}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading ? renderLoadingContent() : children}
      </button>
    );
  }
  
  // Link element
  if (as === 'a') {
    return (
      <a
        href={href}
        className={`${disabledClass} ${pointerEvents} ${className}`}
        style={{ 
          cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
          textDecoration: 'none'
        }}
        onClick={(e) => {
          if (loading || disabled) {
            e.preventDefault();
            return;
          }
          if (onClick) onClick(e);
        }}
        {...props}
      >
        {loading ? renderLoadingContent() : children}
      </a>
    );
  }
  
  // Input element
  if (as === 'input') {
    return (
      <div className="position-relative">
        <input
          className={`${sizeClasses[size].input} ${className}`}
          disabled={disabled || loading}
          {...props}
        />
        {loading && (
          <div className="position-absolute end-0 top-50 translate-middle-y me-2">
            <Spinner animation="border" size={spinnerSize} variant={spinnerVariant} />
          </div>
        )}
      </div>
    );
  }
  
  // Select element
  if (as === 'select') {
    return (
      <div className="position-relative">
        <select
          className={`form-select ${sizeClasses[size].input} ${className}`}
          disabled={disabled || loading}
          {...props}
        >
          {children}
        </select>
        {loading && (
          <div className="position-absolute end-0 top-50 translate-middle-y me-4">
            <Spinner animation="border" size={spinnerSize} variant={spinnerVariant} />
          </div>
        )}
      </div>
    );
  }
  
  // Default div wrapper
  return (
    <div 
      className={`${disabledClass} ${pointerEvents} ${className}`}
      style={{ cursor: (loading || disabled) ? 'wait' : 'default' }}
      {...props}
    >
      {loading ? renderLoadingContent() : children}
    </div>
  );
};

export default LoadingWrapper;