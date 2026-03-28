import React from 'react';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface TipConfirmProps {
  open: boolean;
  amount: string;
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

const TipConfirm: React.FC<TipConfirmProps> = ({
  open,
  amount,
  username,
  onConfirm,
  onCancel,
  submitting,
}) => {
  return (
    <Modal isOpen={open} onClose={onCancel} title="Confirm tip">
      <div className="space-y-4">
        <p className="text-sm font-bold text-gray-700">You are about to send {amount} XLM to @{username}.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" loading={submitting} onClick={onConfirm} className="sm:flex-1">
            Confirm and sign
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="sm:flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TipConfirm;
