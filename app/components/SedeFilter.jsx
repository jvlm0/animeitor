"use client"

export default function SedeFilter({ currentSede, onSedeChange }) {
  const sedes = [
    { name: 'Todos', color: 'bg-gray-600 hover:bg-gray-700' },
    { name: 'Toledo', color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'Curitiba', color: 'bg-green-600 hover:bg-green-700' },
    { name: 'Remoto', color: 'bg-purple-600 hover:bg-purple-700' }
  ];

  return (
    <div className="mb-4 flex gap-3 justify-center">
      {sedes.map(({ name, color }) => (
        <button
          key={name}
          onClick={() => onSedeChange(name)}
          className={`
            px-6 py-3 rounded-lg font-semibold text-white
            transition-all duration-200 transform
            ${currentSede === name 
              ? 'ring-4 ring-white scale-105 shadow-lg' 
              : 'opacity-70 hover:opacity-100'
            }
            ${color}
          `}
        >
          {name}
        </button>
      ))}
    </div>
  );
}