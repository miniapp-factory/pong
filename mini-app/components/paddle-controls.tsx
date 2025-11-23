"use client";

export default function PaddleControls({
  onUp,
  onDown,
}: {
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="flex gap-4">
      <button
        className="bg-purple-800 text-white px-4 py-2 rounded"
        onMouseDown={onUp}
      >
        ▲
      </button>
      <button
        className="bg-purple-800 text-white px-4 py-2 rounded"
        onMouseDown={onDown}
      >
        ▼
      </button>
    </div>
  );
}
