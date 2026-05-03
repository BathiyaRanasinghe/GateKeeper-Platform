'use client';

export default function JsonToggle({
  isJson,
  onChange,
}: {
  isJson: boolean;
  onChange: (toJson: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm ${!isJson ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
        Form
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isJson}
        onClick={() => onChange(!isJson)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isJson ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            isJson ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm ${isJson ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
        JSON
      </span>
    </div>
  );
}
