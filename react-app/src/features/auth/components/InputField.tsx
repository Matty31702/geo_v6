import { Eye, EyeClosed } from "lucide-react";
import React, { Dispatch, SetStateAction, useState } from "react";

interface InputFieldProps {
  title: string;
  isPassword?: boolean;
  value: string;
  placeholder: string;
  setValue: Dispatch<SetStateAction<string>>;
}

const InputField: React.FC<InputFieldProps> = ({
  title,
  isPassword = false,
  value,
  placeholder,
  setValue,
}) => {
  const [isHidden, setIsHidden] = useState<boolean>(true);

  return (
    <div className="mb-6">
      <div className="text-white mb-2">{title}</div>
      <div className="relative">
        <input
          type={isPassword && isHidden ? "password" : "text"}
          className="w-full p-3 rounded pr-10"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsHidden(!isHidden)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {isHidden ? <EyeClosed size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
