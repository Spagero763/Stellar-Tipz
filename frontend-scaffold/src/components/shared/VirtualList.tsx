import React, { useRef, useEffect, useState, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  className?: string;
  itemClassName?: string;
  height?: number | string;
  onLoadMore?: () => void;
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 50,
  className = "",
  itemClassName = "",
  height = "400px",
  onLoadMore,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (items.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusedIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setFocusedIndex(items.length - 1);
      }
    },
    [items.length],
  );

  useEffect(() => {
    if (focusedIndex >= 0) {
      rowVirtualizer.scrollToIndex(focusedIndex);
    }
  }, [focusedIndex, rowVirtualizer]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!onLoadMore) return;
      const target = e.currentTarget;
      if (target.scrollHeight - target.scrollTop - target.clientHeight < 100) {
        onLoadMore();
      }
    },
    [onLoadMore]
  );

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height, maxHeight: "100%" }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onScroll={handleScroll}
      role="list"
      aria-label="Virtual list"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={rowVirtualizer.measureElement}
            className={`absolute top-0 left-0 w-full ${itemClassName} ${
              focusedIndex === virtualItem.index ? "ring-2 ring-black bg-gray-50 z-10" : ""
            }`}
            style={{
              transform: `translateY(${virtualItem.start}px)`,
            }}
            role="listitem"
            aria-setsize={items.length}
            aria-posinset={virtualItem.index + 1}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualList;
