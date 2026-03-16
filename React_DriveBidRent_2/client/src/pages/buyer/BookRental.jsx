import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRentalById, bookRental } from '../../services/buyer.services';
import DatePickerModal from './components/modals/DatePickerModal';
import PaymentModal from './components/modals/PaymentModal';
import ProcessingModal from './components/modals/ProcessingModal';
import SuccessModal from './components/modals/SuccessModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BookRental() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [showDateModal, setShowDateModal] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchRentalDetails();
  }, [id]);

  const fetchRentalDetails = async () => {
    try {
      const data = await getRentalById(id);
      setRental(data);
    } catch (error) {
      console.error('Error fetching rental details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelection = (dates, cost) => {
    setSelectedDates(dates);
    setTotalCost(cost);
    setShowDateModal(false);
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentMethod) => {
    setShowPaymentModal(false);
    setShowProcessingModal(true);

    try {
      const bookingData = {
        rentalCarId: id,
        sellerId: rental.seller?._id,
        pickupDate: selectedDates.pickupDate,
        dropDate: selectedDates.dropDate,
        totalCost: totalCost,
        includeDriver: selectedDates.includeDriver || false
      };

      const result = await bookRental(bookingData);

      if (result.success) {
        setShowProcessingModal(false);
        setShowSuccessModal(true);
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setShowProcessingModal(false);
      alert('Booking failed. Please try again.');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/buyer/purchases');
  };

  if (loading) return <LoadingSpinner />;
  if (!rental) return <div className="text-center py-10">Rental not found</div>;

  return (
    <div className="rental-details max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="rental-container grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Vehicle Image and Basic Details */}
        <div className="vehicle-image bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md">
          <img src={rental.vehicleImage} alt={rental.vehicleName} className="w-full h-64 sm:h-80 object-cover" />
        </div>
        <div className="vehicle-info bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 mb-4">{rental.vehicleName}</h1>
          <p className="rental-cost text-lg sm:text-xl mb-4">Cost/day: <strong className="text-orange-600">₹{rental.costPerDay}</strong></p>
          <div className="vehicle-specs">
            <p><strong>Year:</strong> {rental.year}</p>
            <p><strong>AC:</strong> {rental.AC === 'available' ? 'Yes' : 'No'}</p>
            <p><strong>Driver:</strong> {rental.driverAvailable ? 'Available' : 'Not Available'}</p>
            <p><strong>Capacity:</strong> {rental.capacity}</p>
          </div>
        </div>

        {/* Rental Summary */}
        <div className="rental-summary bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md lg:col-span-2">
          <h2 className="text-xl sm:text-2xl font-bold text-orange-600 mb-4">Rental Summary</h2>
          <p><strong>Vehicle:</strong> {rental.vehicleName}</p>
          <p><strong>Cost/day:</strong> ₹{rental.costPerDay}</p>
          <p><strong>Pickup Date:</strong> <span id="summary-pickup-date">
            {selectedDates ? selectedDates.pickupDate : '-'}
          </span></p>
          <p><strong>Return Date:</strong> <span id="summary-return-date">
            {selectedDates ? selectedDates.dropDate : '-'}
          </span></p>
          <p><strong>Driver Required:</strong> <span id="summary-driver-required">
            {selectedDates?.includeDriver ? 'Yes' : 'No'}
          </span></p>
          <p><strong>Total Days:</strong> <span id="summary-days">
            {selectedDates ? selectedDates.totalDays : '-'}
          </span></p>
          <p><strong>Total Cost:</strong> <span id="total-cost">
            {totalCost > 0 ? `₹${totalCost.toLocaleString()}` : '-'}
          </span></p>
        </div>
      </div>

      {/* Modals */}
      <DatePickerModal
        isOpen={showDateModal}
        onClose={() => navigate('/buyer/rentals')}
        onProceed={handleDateSelection}
        rental={rental}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProcessPayment={handlePayment}
        totalCost={totalCost}
        selectedPaymentMethod="upi"
        onPaymentMethodSelect={() => { }}
      />

      <ProcessingModal
        isOpen={showProcessingModal}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        seller={rental.seller}
      />
    </div>
  );
}