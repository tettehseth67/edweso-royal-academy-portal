import React, { useState } from 'react';
import { X, CreditCard, Smartphone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PaystackModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  email: string;
  studentId: string;
  studentName: string;
  onSuccess: (paymentDetails: {
    paystackRef: string;
    paymentMethod: string;
    amount: number;
  }) => void;
  onFailure: (errorMessage: string) => void;
}

export default function PaystackModal({
  isOpen,
  onClose,
  amount,
  email,
  studentId,
  studentName,
  onSuccess,
  onFailure
}: PaystackModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');
  const [momoProvider, setMomoProvider] = useState<'MTN Mobile Money' | 'Telecel Cash' | 'AirtelTigo Money'>('MTN Mobile Money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'otp' | 'success' | 'error'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [paystackReference] = useState(() => 'PSTK-' + Math.floor(Math.random() * 900000000 + 100000000));

  if (!isOpen) return null;

  const handleMomoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid Ghanaian phone number');
      return;
    }
    // Simulate payment sequence
    setStep('processing');
    setTimeout(() => {
      setStep('otp'); // Standard Momo OTP or approval prompt simulation
    }, 1800);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 12 || !cardExpiry || cardCvv.length < 3) {
      alert('Please enter valid credit card details');
      return;
    }
    setStep('processing');
    setTimeout(() => {
      setStep('otp');
    }, 1800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      alert('Enter the 4-digit code sent to your device');
      return;
    }
    
    setStep('processing');
    
    setTimeout(() => {
      // 90% success rate or test fail option
      if (otpCode === '0000') {
        // Trigger simulated failure
        setErrorMessage('Insufficent funds in wallet or card was declined.');
        setStep('error');
      } else {
        setStep('success');
        setTimeout(() => {
          onSuccess({
            paystackRef: paystackReference,
            paymentMethod: paymentMethod === 'card' ? 'Card' : momoProvider,
            amount: amount
          });
        }, 1500);
      }
    }, 2000);
  };

  const handleTryAgain = () => {
    setStep('form');
    setOtpCode('');
  };

  return (
    <div id="paystack-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div id="paystack-card" className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-slate-800 flex flex-col border border-emerald-500/20">
        
        {/* Header - Paystack Style */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-sans font-bold text-sm tracking-wider text-emerald-400">paystack</span>
            <span className="text-slate-400 text-xs">| Secured checkout</span>
          </div>
          <button 
            id="close-paystack"
            onClick={() => {
              if (step !== 'processing') onClose();
            }} 
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* School branding bar */}
        <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Edweso Royal Academy</h4>
            <p className="text-[11px] text-slate-500 font-medium">Payment for {studentName} ({studentId})</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Amount to Pay</span>
            <span className="text-sm font-extrabold text-emerald-700">GHS {amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 flex-1 min-h-[300px] flex flex-col justify-center">
          
          {step === 'form' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-xs text-slate-500 mb-2 font-medium">Choose payment channel:</div>
              
              {/* Channel Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="pay-channel-momo"
                  onClick={() => setPaymentMethod('momo')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border text-sm font-semibold transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 shadow-xs'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone size={16} />
                  <span>Mobile Money</span>
                </button>
                <button
                  type="button"
                  id="pay-channel-card"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border text-sm font-semibold transition-all ${
                    paymentMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 shadow-xs'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard size={16} />
                  <span>Card</span>
                </button>
              </div>

              {/* MoMo Form */}
              {paymentMethod === 'momo' && (
                <form id="momo-form" onSubmit={handleMomoSubmit} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1">Momo Network</label>
                    <select
                      id="momo-provider"
                      value={momoProvider}
                      onChange={(e) => setMomoProvider(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium bg-white"
                    >
                      <option value="MTN Mobile Money">MTN MoMo (Ghana)</option>
                      <option value="Telecel Cash">Telecel Cash (Vodafone)</option>
                      <option value="AirtelTigo Money">AirtelTigo Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1">Mobile Money Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">+233</span>
                      <input
                        type="tel"
                        id="momo-phone"
                        placeholder="244123456"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        className="w-full p-2.5 pl-14 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-semibold"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Specify the phone number linked to your wallet.</span>
                  </div>
                  
                  <button
                    type="submit"
                    id="submit-momo"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm mt-4 transition-colors shadow-xs"
                  >
                    Pay GHS {amount.toFixed(2)}
                  </button>
                </form>
              )}

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <form id="card-form" onSubmit={handleCardSubmit} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="paystack-card-num"
                        placeholder="4000 1234 5678 9010"
                        maxLength={19}
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-semibold"
                      />
                      <CreditCard className="absolute right-3 top-3 text-slate-400" size={16} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 font-semibold mb-1">Expiry Date</label>
                      <input
                        type="text"
                        id="paystack-card-expiry"
                        placeholder="MM / YY"
                        maxLength={5}
                        required
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v.length > 2) {
                            v = v.substring(0, 2) + '/' + v.substring(2, 4);
                          }
                          setCardExpiry(v);
                        }}
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-semibold text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-semibold mb-1">CVV</label>
                      <input
                        type="password"
                        id="paystack-card-cvv"
                        placeholder="123"
                        maxLength={3}
                        required
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-semibold text-center"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    id="submit-card"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm mt-4 transition-colors shadow-xs"
                  >
                    Pay GHS {amount.toFixed(2)}
                  </button>
                </form>
              )}

              <div className="text-[11px] text-slate-400 text-center font-medium mt-3">
                Your card and wallet details are fully encrypted.
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-6 text-center animate-pulse">
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
              <h5 className="font-bold text-slate-800 text-sm">Contacting Network Provider</h5>
              <p className="text-xs text-slate-500 mt-1 max-w-[250px]">
                Please authorize the checkout prompt on your mobile device...
              </p>
            </div>
          )}

          {step === 'otp' && (
            <form id="otp-form" onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
              <div className="text-center mb-2">
                <div className="inline-flex p-2 bg-emerald-50 rounded-full mb-2">
                  <Smartphone className="text-emerald-600" size={24} />
                </div>
                <h5 className="font-bold text-sm text-slate-800">Verify Payment</h5>
                <p className="text-xs text-slate-500 mt-1">
                  We've simulated a verification code. Enter <strong className="text-slate-800">1234</strong> to complete or <strong className="text-red-600">0000</strong> to test a failed transaction.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  id="paystack-otp-input"
                  placeholder="Enter 4-Digit OTP"
                  maxLength={4}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 rounded-lg border border-slate-300 font-mono text-center tracking-widest text-lg font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                id="submit-otp"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-colors"
              >
                Authorize & Confirm GHS {amount.toFixed(2)}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  id="cancel-otp"
                  onClick={handleTryAgain}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Back to methods
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center text-center py-6 animate-fade-in">
              <div className="p-3 bg-emerald-50 rounded-full mb-3 text-emerald-600">
                <CheckCircle size={48} className="animate-bounce" />
              </div>
              <h5 className="font-extrabold text-emerald-800 text-base">Payment Successful!</h5>
              <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
                GHS {amount.toFixed(2)} has been successfully received by Edweso Royal Academy.
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 w-full mt-4 text-left font-mono text-[11px] space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-bold text-slate-800">{paystackReference}</span>
                </div>
                <div className="flex justify-between">
                  <span>Student:</span>
                  <span className="text-slate-800 font-semibold">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Channel:</span>
                  <span className="text-slate-800">{paymentMethod === 'card' ? 'Visa Card' : momoProvider}</span>
                </div>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col items-center justify-center text-center py-6 animate-fade-in">
              <div className="p-3 bg-rose-50 rounded-full mb-3 text-rose-600">
                <AlertCircle size={48} />
              </div>
              <h5 className="font-extrabold text-rose-800 text-base">Payment Failed</h5>
              <p className="text-xs text-rose-600 mt-1 max-w-[260px]">
                {errorMessage}
              </p>
              
              <div className="flex space-x-2 w-full mt-5">
                <button
                  type="button"
                  id="paystack-retry-btn"
                  onClick={handleTryAgain}
                  className="flex-1 py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold rounded-lg text-xs transition-colors"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  id="paystack-cancel-btn"
                  onClick={() => {
                    onClose();
                    onFailure(errorMessage);
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer - Paystack Style */}
        <div className="bg-slate-50 p-3 text-center border-t border-slate-100 flex justify-center items-center space-x-1 text-[10px] text-slate-400 font-medium">
          <span>Secured by</span>
          <span className="font-extrabold text-emerald-600">paystack</span>
          <span>with PCI-DSS compliance</span>
        </div>

      </div>
    </div>
  );
}
