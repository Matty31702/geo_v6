import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  vehicleName: string;
};

const DeleteVehicleModal = ({
  isOpen,
  onClose,
  onConfirmDelete,
  vehicleName,
}: Props) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              Confirm Delete
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-bold">{vehicleName}</span>? This action cannot
            be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmDelete}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DeleteVehicleModal;
