import React from 'react';

type ItemMenuButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

const ItemMenuButton: React.FC<ItemMenuButtonProps> = ({
  type = 'button',
  onClick,
  children,
  className = '',
  disabled = false,
}) => {
  const enabledStyle =
    'bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 shadow-md hover:shadow-lg';
  const disabledStyle = 'bg-gray-400 cursor-not-allowed opacity-75';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col justify-center items-center p-4 gap-2 text-white font-semibold 
        rounded-xl w-full h-[100px] text-center transition duration-300 ease-in-out
        ${disabled ? disabledStyle : enabledStyle}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default ItemMenuButton;
