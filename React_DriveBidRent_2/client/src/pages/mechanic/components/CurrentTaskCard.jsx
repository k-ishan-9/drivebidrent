// client/src/pages/mechanic/components/CurrentTaskCard.jsx
import { Link } from 'react-router-dom';

export default function CurrentTaskCard({ vehicle }) {
  return (
    <Link
      to={`/mechanic/car-details/${vehicle._id}`}
      className="group block bg-gradient-to-br from-white via-orange-50/20 to-white rounded-[20px] shadow-[0_8px_30px_rgba(255,107,0,0.12)] hover:shadow-[0_20px_50px_rgba(255,107,0,0.25)] transition-all duration-500 ease-out border border-orange-200/50 hover:border-orange-400/60 overflow-hidden h-full flex flex-col hover:-translate-y-2 transform"
    >
      <div className="relative overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <img
          src={vehicle.vehicleImage}
          alt={vehicle.vehicleName}
          className="w-full h-52 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-[0_4px_12px_rgba(255,107,0,0.4)] backdrop-blur-sm z-10 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
          ASSIGNED
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-3 leading-tight group-hover:from-orange-500 group-hover:to-red-500 transition-all duration-300">{vehicle.vehicleName}</h3>
        <div className="text-gray-600 space-y-2.5 text-sm bg-gradient-to-br from-gray-50 to-orange-50/30 p-4 rounded-xl border border-gray-100/50">
          <p className="flex justify-between items-center"><span className="font-medium text-gray-600">Year:</span> <span className="font-bold text-gray-800">{vehicle.year}</span></p>
          <p className="flex justify-between items-center"><span className="font-medium text-gray-600">Mileage:</span> <span className="font-bold text-gray-800">{vehicle.mileage.toLocaleString()} km</span></p>
          <p className="flex justify-between items-center"><span className="font-medium text-gray-600">Condition:</span> <span className="font-bold text-gray-800 capitalize">{vehicle.condition}</span></p>
          <p className="flex justify-between items-center"><span className="font-medium text-gray-600">Auction:</span> <span className="font-bold text-gray-800">{new Date(vehicle.auctionDate).toLocaleDateString()}</span></p>
        </div>
        <div className="mt-auto pt-4">
          <span className="block text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl text-sm font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-[0_4px_12px_rgba(255,107,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.4)] transform group-hover:scale-[1.02]">
            Inspect Vehicle
          </span>
        </div>
      </div>
    </Link>
  );
}