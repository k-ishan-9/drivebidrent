// client/src/pages/mechanic/components/PastTaskCard.jsx
export default function PastTaskCard({ vehicle }) {
  return (
    <div className="group bg-gradient-to-br from-white via-green-50/20 to-white rounded-[20px] shadow-[0_8px_30px_rgba(16,185,129,0.12)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.25)] border border-green-200/50 hover:border-green-400/60 overflow-hidden h-full flex flex-col transition-all duration-500 ease-out hover:-translate-y-2 transform">
      <div className="relative overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <img
          src={vehicle.vehicleImage}
          alt={vehicle.vehicleName}
          className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 via-emerald-600 to-green-600 text-white font-bold px-5 py-2 rounded-full text-sm shadow-[0_4px_12px_rgba(16,185,129,0.4)] backdrop-blur-sm z-10 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
          COMPLETED
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 leading-tight">{vehicle.vehicleName}</h3>
        <div className="text-gray-600 space-y-3 text-sm bg-gradient-to-br from-gray-50 to-green-50/30 p-5 rounded-xl border border-gray-100/50">
          <p className="flex justify-between items-center"><span className="font-medium text-gray-600">Year:</span> <span className="font-bold text-gray-800">{vehicle.year}</span></p>
          <p className="flex justify-between items-center"><span className="font-medium text-gray-600">Mileage:</span> <span className="font-bold text-gray-800">{vehicle.mileage.toLocaleString()} km</span></p>
          <p className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Rating Given:</span> 
            <span className="font-bold text-yellow-600 flex items-center gap-1">
              {vehicle.mechanicReview?.conditionRating || 'N/A'} 
              {vehicle.mechanicReview?.conditionRating && <span className="text-yellow-500">★</span>}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}