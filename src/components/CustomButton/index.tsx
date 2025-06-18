import React from 'react';

type CustomButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  negate?: boolean;
  disabled?: boolean;
};

const CustomButton: React.FC<CustomButtonProps> = ({
  type = 'button',
  onClick,
  children,
  className = '',
  negate = false,
  disabled = false,
}) => {
  // Estilo base para botão habilitado
  const enabledStyle = negate
    ? 'bg-[#333] hover:bg-[#555]'
    : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700';

  // Estilo para botão desabilitado
  const disabledStyle = 'bg-gray-400 cursor-not-allowed opacity-75';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex justify-center items-center mt-2 p-2 gap-2 
        text-white font-semibold rounded-md w-auto 
        transition ease-in-out duration-300
        ${disabled ? disabledStyle : enabledStyle}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default CustomButton;