import React from 'react'

interface ColorPickerProps {
  colors: Array<{
    id: string
    name: string
    hex: string
  }>
  selectedColorId?: string
  onSelect: (colorId: string) => void
  label?: string
}

export default function ColorPicker({
  colors,
  selectedColorId,
  onSelect,
  label,
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => onSelect(color.id)}
            className={`relative group`}
            title={color.name}
          >
            <div
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColorId === color.id
                  ? 'border-primary scale-110 shadow-lg'
                  : 'border-gray-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color.hex }}
            />
            {selectedColorId === color.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white drop-shadow-lg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
