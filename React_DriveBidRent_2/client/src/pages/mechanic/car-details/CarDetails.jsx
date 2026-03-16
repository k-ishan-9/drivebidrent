import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVehicleDetails, submitReview } from '../../../services/mechanic.services';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CarDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    mechanicalCondition: '',
    bodyCondition: '',
    recommendations: '',
    conditionRating: ''
  });
  const [loading, setLoading] = useState(false); // You can use this if you want to disable button during submit

  useEffect(() => {
    getVehicleDetails(id)
      .then(res => setData(res.data.data))
      .catch(() => {
        toast.error('Failed to load vehicle details');
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.conditionRating) {
      toast.error('Please select a star rating');
      return;
    }

    setLoading(true);

    try {
      await submitReview(id, form);
      toast.success('Inspection report submitted successfully');
      // Small delay so user can see the success message
      setTimeout(() => {
        window.location.href = '/mechanic/current-tasks';
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit inspection report');
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <LoadingSpinner />;

  const { vehicle, seller } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-8 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Image */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12">
          <img
            src={vehicle.vehicleImage || '/placeholder-car.jpg'}
            alt={vehicle.vehicleName}
            className="w-full h-96 md:h-[520px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-3">{vehicle.vehicleName}</h1>
            <p className="text-xl opacity-95">
              {vehicle.year} • {vehicle.mileage.toLocaleString()} km • {vehicle.fuelType}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Vehicle Specs */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-orange-600 pb-3 inline-block">
                Vehicle Specifications
              </h3>
              <div className="space-y-5 text-lg">
                <p><strong>Year:</strong> {vehicle.year}</p>
                <p><strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} km</p>
                <p><strong>Condition:</strong> {vehicle.condition}</p>
                <p><strong>Fuel Type:</strong> {vehicle.fuelType}</p>
                <p><strong>Transmission:</strong> {vehicle.transmission}</p>
                <p><strong>Auction Date:</strong> {new Date(vehicle.auctionDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b-2 border-orange-600 pb-3 inline-block">
                Seller Information
              </h3>
              <div className="space-y-5 text-lg">
                <p><strong>Name:</strong> {seller.firstName} {seller.lastName}</p>
                <p><strong>Phone:</strong> {seller.phone}</p>
                <p><strong>Location:</strong> {seller.city}, {seller.state}</p>
              </div>
            </div>
          </div>

          {/* Review Section */}
          {vehicle.reviewStatus === 'completed' ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-3xl p-10 text-center">
              <p className="text-2xl font-bold text-green-800">Inspection Already Completed</p>
              <p className="text-gray-700 mt-3">
                Your review has been submitted and is under manager review.
              </p>
            </div>
          ) : (
            <div className="border-2 border-amber-300 rounded-3xl p-10">
              <h3 className="text-3xl font-bold text-amber-800 text-center mb-10">
                Submit Inspection Report
              </h3>

              <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Overall Condition Rating
                  </label>
                  <select
                    required
                    value={form.conditionRating}
                    onChange={(e) => setForm({ ...form, conditionRating: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:border-orange-600 outline-none text-lg"
                  >
                    <option value="">Choose rating</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} Star{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Mechanical Condition
                  </label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Engine, transmission, brakes, suspension, electrical..."
                    className="w-full p-5 border-2 border-amber-300 rounded-xl bg-white focus:border-orange-600 outline-none"
                    value={form.mechanicalCondition}
                    onChange={(e) => setForm({ ...form, mechanicalCondition: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Body & Interior Condition
                  </label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Paint, dents, interior wear, AC, lights..."
                    className="w-full p-5 border-2 border-amber-300 rounded-xl bg-white focus:border-orange-600 outline-none"
                    value={form.bodyCondition}
                    onChange={(e) => setForm({ ...form, bodyCondition: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Recommendations (Optional)
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Suggested repairs or notes for auction manager..."
                    className="w-full p-5 border-2 border-amber-300 rounded-xl bg-white"
                    value={form.recommendations}
                    onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-5 rounded-xl text-xl transition transform hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${
                    loading ? 'cursor-wait' : ''
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Inspection Report'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}