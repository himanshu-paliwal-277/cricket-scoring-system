import { Plus } from "lucide-react";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50
      transition-opacity duration-300
      ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4
        transform transition-all
        duration-200
        ease-[cubic-bezier(0.16,1,0.3,1)]
        ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-[0.96] opacity-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <Plus size={20} className="rotate-45" />
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
