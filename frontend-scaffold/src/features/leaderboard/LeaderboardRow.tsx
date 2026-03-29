import React from "react";
import { useNavigate } from "react-router-dom";

import AmountDisplay from "../../components/shared/AmountDisplay";
import CreditBadge from "../../components/shared/CreditBadge";
import Avatar from "../../components/ui/Avatar";
import { useWalletStore } from "../../store";
import type { LeaderboardEntry } from "../../types/contract";

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, rank }) => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWalletStore();

  const isOwnProfile =
    connected && Boolean(publicKey) && publicKey?.toLowerCase() === entry.address.toLowerCase();

  const handleNavigate = () => {
    navigate(`/@${entry.username}`);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTableRowElement> = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <tr
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`cursor-pointer border-b-2 border-black bg-white transition duration-150 ${
        isOwnProfile
          ? "bg-yellow-200/50"
          : "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
      }`}
      aria-label={`View @${entry.username} profile`}
    >
      <td className="px-4 py-4 text-sm font-black tabular-nums">#{rank}</td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            address={entry.address}
            alt={entry.username}
            fallback={entry.username}
            size="md"
          />
          <span className="font-black uppercase">{entry.username}</span>
          {isOwnProfile && (
            <span className="border-2 border-black bg-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
              You
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <AmountDisplay amount={entry.totalTipsReceived} className="text-sm" />
      </td>
      <td className="px-4 py-4">
        <CreditBadge score={entry.creditScore} />
      </td>
    </tr>
  );
};

export default LeaderboardRow;
