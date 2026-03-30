import { AlertTriangle, Loader2 } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export function DeletePatientModal({ isOpen, patient, onClose, onConfirm, isDeleting }: Props) {
  if (!isOpen || !patient) return null;

  const handleConfirm = async () => {
    await onConfirm(patient.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">

        <div className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>

          <h2 className="text-xl font-bold text-gray-900">Excluir Paciente</h2>

          <p className="mt-2 text-sm text-gray-500">
            Tem certeza que deseja excluir <strong className="font-semibold text-gray-900">{patient.name}</strong>? Esta ação removerá o cadastro permanentemente.
          </p>

          <div className="mt-6 flex w-full gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Excluir'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
