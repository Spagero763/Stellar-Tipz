import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import AmountDisplay from '@/components/shared/AmountDisplay';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: string;
}

/**
 * WithdrawModal allows creators to withdraw their earned tips to their connected wallet.
 */
const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, balance }) => {
  const handleWithdraw = () => {
    // Placeholder for actual withdrawal logic
    alert('Withdrawal functionality will be enabled when the contract withdrawal logic is connected.');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Tips">
      <div className="space-y-6">
        <p className="text-gray-600 font-medium">
          Transfer your available balance to your connected Stellar wallet.
        </p>
        
        <div className="p-8 border-4 border-black bg-yellow-100 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2 text-center">Available for Withdrawal</p>
          <AmountDisplay amount={balance} className="text-4xl" />
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="primary" size="lg" onClick={handleWithdraw} className="w-full">
            Confirm Withdrawal
          </Button>
          <Button variant="outline" size="lg" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
        
        <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest">
          Network fees will be deducted by the Stellar network
        </p>
      </div>
    </Modal>
  );
};

export default WithdrawModal;
