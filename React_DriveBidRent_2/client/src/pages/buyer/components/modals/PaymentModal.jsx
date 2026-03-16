import { useState, useEffect } from 'react';

export default function PaymentModal({
    isOpen,
    onClose,
    onProcessPayment,
    totalCost,
    selectedPaymentMethod,
    onPaymentMethodSelect
}) {
    const [paymentMethod, setPaymentMethod] = useState(selectedPaymentMethod || 'upi');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method);
        onPaymentMethodSelect(method);
    };

    const handlePayment = () => {
        onProcessPayment(paymentMethod);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-24">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-white">
                    <h2 className="text-xl font-bold">Complete Payment</h2>
                    <p className="text-orange-100 text-sm mt-1">Select your payment method</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Total Amount */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Total Amount Due</p>
                        <h3 className="text-2xl font-bold text-orange-600 mt-1">₹{totalCost.toLocaleString()}</h3>
                    </div>

                    {/* Payment Methods */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Select Payment Method</h4>
                        <div className="space-y-3">
                            {/* UPI Option */}
                            <div
                                className={`cursor-pointer p-4 rounded-lg border transition-all ${paymentMethod === 'upi'
                                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-orange-300'
                                    }`}
                                onClick={() => handlePaymentMethodSelect('upi')}
                            >
                                <div className="flex items-center">
                                    <div className="text-2xl mr-3">📱</div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900">Pay with UPI</h4>
                                        <p className="text-gray-600 text-xs mt-1">Instant payment using any UPI app</p>
                                    </div>
                                    {paymentMethod === 'upi' && (
                                        <div className="text-orange-500 text-xl">✓</div>
                                    )}
                                </div>
                            </div>

                            {/* Card Option */}
                            <div
                                className={`cursor-pointer p-4 rounded-lg border transition-all ${paymentMethod === 'card'
                                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-orange-300'
                                    }`}
                                onClick={() => handlePaymentMethodSelect('card')}
                            >
                                <div className="flex items-center">
                                    <div className="text-2xl mr-3">💳</div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900">Credit/Debit Card</h4>
                                        <p className="text-gray-600 text-xs mt-1">Pay using your card</p>
                                    </div>
                                    {paymentMethod === 'card' && (
                                        <div className="text-orange-500 text-xl">✓</div>
                                    )}
                                </div>
                            </div>

                            {/* Net Banking Option */}
                            <div
                                className={`cursor-pointer p-4 rounded-lg border transition-all ${paymentMethod === 'netbanking'
                                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-orange-300'
                                    }`}
                                onClick={() => handlePaymentMethodSelect('netbanking')}
                            >
                                <div className="flex items-center">
                                    <div className="text-2xl mr-3">🏦</div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900">Net Banking</h4>
                                        <p className="text-gray-600 text-xs mt-1">Pay using net banking</p>
                                    </div>
                                    {paymentMethod === 'netbanking' && (
                                        <div className="text-orange-500 text-xl">✓</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm"
                    >
                        Pay ₹{totalCost.toLocaleString()}
                    </button>
                </div>
            </div>
        </div>
    );
}