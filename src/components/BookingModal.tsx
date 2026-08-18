/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { 
  X, 
  Users, 
  Calendar, 
  Clock, 
  Utensils, 
  Phone, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  ChevronRight,
  Flame,
  ChefHat,
  Search
} from 'lucide-react';
import { MenuItem, BulkBooking } from '../types';
import { transliterateToHindi, transliterateLocal } from '../utils/transliterate';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onBookingSubmitted?: (booking: BulkBooking) => void;
}

export default function BookingModal({ isOpen, onClose, menuItems, onBookingSubmitted }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerHindiName, setCustomerHindiName] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState<'bandola' | 'wedding' | 'reception' | 'birthday' | 'corporate' | 'other'>('bandola');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [eventDate, setEventDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('19:30');
  const [cateringType, setCateringType] = useState<'restaurant' | 'catering_service'>('restaurant');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [customFoodNotes, setCustomFoodNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<BulkBooking | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleMenuItem = (itemName: string) => {
    setItemQuantities(prev => {
      const next = { ...prev };
      if (itemName in next) {
        delete next[itemName];
      } else {
        next[itemName] = 1;
      }
      return next;
    });
  };

  const updateQuantity = (itemName: string, newQty: number) => {
    const validQty = Math.max(1, newQty);
    setItemQuantities(prev => ({
      ...prev,
      [itemName]: validQty
    }));
  };

  const handleSelectAllRecommended = () => {
    const popularItems = menuItems.filter(m => m.isPopular || m.isChefSpecial);
    setItemQuantities(prev => {
      const next = { ...prev };
      popularItems.forEach(item => {
        if (!(item.name in next)) {
          next[item.name] = 1;
        }
      });
      return next;
    });
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('कृपया अपना नाम दर्ज करें (Please enter your name)');
      setStep(1);
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('कृपया १० अंकों का मोबाइल नंबर दर्ज करें (Please enter 10 digit phone number)');
      setStep(1);
      return;
    }
    if (!eventDate) {
      setErrorMsg('कृपया बंडोला/कार्यक्रम की तारीख चुनें (Please select event date)');
      setStep(1);
      return;
    }

    setIsSubmitting(true);

    const formattedMenuItems = Object.entries(itemQuantities).map(([name, qty]) => {
      const match = menuItems.find(m => m.name === name);
      const hindiSuffix = match?.hindiName ? ` / ${match.hindiName}` : '';
      return `${name}${hindiSuffix} (${qty} मात्रा/प्लेट)`;
    });

    const bookingPayload = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      eventType,
      guestCount: Number(guestCount) || 50,
      eventDate,
      eventTime,
      selectedMenuItems: formattedMenuItems,
      customFoodNotes: customFoodNotes.trim(),
      cateringType
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      if (!res.ok) {
        throw new Error('Failed to create booking on server');
      }

      const createdBooking: BulkBooking = await res.json();
      setSubmittedBooking(createdBooking);
      if (onBookingSubmitted) {
        onBookingSubmitted(createdBooking);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('बुकिंग सबमिट करने में असमर्थ। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSubmittedBooking(null);
    setStep(1);
    setCustomerName('');
    setPhone('');
    setGuestCount(100);
    setItemQuantities({});
    setSearchQuery('');
    setSelectedCategory('all');
    setCustomFoodNotes('');
    setErrorMsg('');
    onClose();
  };

  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'bandola': return 'शाही बंडोला (Bandola)';
      case 'wedding': return 'शादी / विवाह (Wedding)';
      case 'reception': return 'रिसेप्शन समारोह';
      case 'birthday': return 'जन्मदिन (Birthday)';
      case 'corporate': return 'कॉरपोरेट मीट';
      default: return 'पारिवारिक कार्यक्रम';
    }
  };

  // Generate WhatsApp text link
  const getWhatsAppLink = () => {
    if (!submittedBooking) return '#';
    const text = `*नई शाही बंडोला / बल्क बुकिंग - माजीसा रेस्टोरेंट*%0A%0A` +
      `👤 *ग्राहक का नाम:* ${submittedBooking.customerName}%0A` +
      `📞 *मोबाइल नंबर:* ${submittedBooking.phone}%0A` +
      `🎉 *कार्यक्रम:* ${getEventTypeName(submittedBooking.eventType)}%0A` +
      `👥 *कुल लोग (Members):* ${submittedBooking.guestCount} जन%0A` +
      `📅 *तारीख व समय:* ${submittedBooking.eventDate} @ ${submittedBooking.eventTime}%0A` +
      `📍 *स्थान/प्रकार:* ${submittedBooking.cateringType === 'restaurant' ? 'माजीसा रेस्टोरेंट में (Hall/Dining)' : 'हमारे स्थान पर कैटरिंग (Outdoors)'}%0A` +
      `🍛 *चुना गया खाना:* ${submittedBooking.selectedMenuItems.join(', ') || 'विशेष थाली'}%0A` +
      `📝 *विशेष निर्देश (क्या-क्या रखना है):* ${submittedBooking.customFoodNotes || 'कोई विशेष निर्देश नहीं'}`;
    
    return `https://wa.me/918107165253?text=${text}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-amber-950/95 border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-amber-50 my-auto"
        >
          {/* Header Bar */}
          <div className="relative bg-gradient-to-r from-red-950 via-amber-900 to-red-950 p-4 sm:p-6 border-b border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-xl" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200 flex items-center gap-2">
                  <span>शाही बंडोला व शादी बुकिंग</span>
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </h2>
                <p className="text-xs sm:text-sm text-amber-300/80 font-serif">
                  बंडोला, विवाह या बड़े आयोजनों के लिए भोजन बुकिंग व कैटरिंग सेवा
                </p>
              </div>
            </div>

            <button
              onClick={resetAndClose}
              className="p-2 rounded-full bg-amber-900/50 text-amber-300 hover:bg-amber-800 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto space-y-6">

            {/* SUCCESS POPUP SCREEN */}
            {submittedBooking ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-6 px-2">
                <div className="relative w-20 h-20 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)] animate-pulse">
                  <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                  <Sparkles className="w-6 h-6 text-amber-300 absolute -top-1 -right-1 animate-spin" />
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/50 text-amber-300 rounded-full text-xs font-serif font-bold tracking-widest uppercase inline-block">
                    👑 बंडोला बुकिंग सफलतापूर्वक दर्ज
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
                    बधाई हो, आपकी बंडोला बुकिंग दर्ज हो गई है!
                  </h3>
                  <p className="text-amber-300/90 text-sm max-w-lg mx-auto font-serif">
                    धन्यवाद <span className="font-bold text-amber-100">{submittedBooking.customerName}</span> जी! 
                    माजीसा रेस्टोरेंट टीम आपके <span className="font-bold text-amber-200">{submittedBooking.guestCount} लोगों</span> की शाही दावत की पूरी व्यवस्था करेगी।
                  </p>
                </div>

                {/* Royal Booking Certificate Card */}
                <div className="bg-gradient-to-b from-amber-950/90 via-amber-900/40 to-amber-950/90 border-2 border-amber-500/50 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3 shadow-2xl relative">
                  <div className="flex justify-between items-center border-b border-amber-500/30 pb-3">
                    <div>
                      <span className="text-[10px] text-amber-400/80 uppercase tracking-widest font-mono block">बुकिंग पहचान पत्र (BOOKING ID)</span>
                      <span className="font-mono text-amber-200 font-bold text-base">{submittedBooking.id}</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-xs font-bold rounded-lg">
                      🟢 CONFIRMED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-amber-400/80 text-[11px] block">ग्राहक का नाम:</span>
                      <span className="font-bold text-amber-100">{submittedBooking.customerName}</span>
                    </div>
                    <div>
                      <span className="text-amber-400/80 text-[11px] block">संपर्क फोन:</span>
                      <span className="font-bold text-amber-100">{submittedBooking.phone}</span>
                    </div>
                    <div>
                      <span className="text-amber-400/80 text-[11px] block">आयोजन:</span>
                      <span className="font-semibold text-amber-200">{getEventTypeName(submittedBooking.eventType)}</span>
                    </div>
                    <div>
                      <span className="text-amber-400/80 text-[11px] block">कुल लोग:</span>
                      <span className="font-bold text-amber-100">{submittedBooking.guestCount} लोग</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-amber-400/80 text-[11px] block">तारीख व समय:</span>
                      <span className="font-semibold text-amber-200">{submittedBooking.eventDate} ({submittedBooking.eventTime}) • {submittedBooking.cateringType === 'restaurant' ? 'रेस्टोरेंट में सिटिंग' : 'आउटडोर कैटरिंग'}</span>
                    </div>
                  </div>

                  {submittedBooking.selectedMenuItems.length > 0 && (
                    <div className="pt-2 border-t border-amber-500/20">
                      <span className="text-amber-400/80 block text-[11px] mb-2 font-bold">📋 चुने गए व्यंजन व मात्रा ({submittedBooking.selectedMenuItems.length}):</span>
                      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {submittedBooking.selectedMenuItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 px-3 py-1.5 bg-amber-900/60 border border-amber-500/40 text-amber-100 text-xs rounded-lg font-medium">
                            <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                              {idx + 1}
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {submittedBooking.customFoodNotes && (
                    <div className="pt-2 border-t border-amber-500/20 text-xs">
                      <span className="text-amber-400/80 block text-[11px] font-semibold">विशेष निर्देश:</span>
                      <p className="text-amber-200 italic">{submittedBooking.customFoodNotes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xl transition active:scale-98 cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5 fill-current" />
                    <span>WhatsApp पर तुरंत अलर्ट भेजें (Instant WhatsApp Confirmation)</span>
                  </a>
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="px-6 py-3.5 bg-amber-900/80 hover:bg-amber-800 text-amber-200 font-semibold rounded-xl transition border border-amber-600/50 cursor-pointer"
                  >
                    होम पर लौटें (Close Popup)
                  </button>
                </div>
              </motion.div>
            ) : (

              /* BOOKING FORM */
              <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleSubmit(e); }} autoComplete="off" className="space-y-6">

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-900/60 border border-red-500/50 text-red-200 text-sm font-semibold flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Step Indicator Tabs */}
                <div className="flex items-center justify-center gap-4 border-b border-amber-500/20 pb-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`px-4 py-2 rounded-lg text-sm font-serif font-bold transition flex items-center gap-2 ${
                      step === 1 
                        ? 'bg-amber-600 text-amber-950 shadow-md' 
                        : 'bg-amber-900/40 text-amber-300 hover:bg-amber-900/60'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>1. ग्राहक व कार्यक्रम विवरण</span>
                  </button>
                  <ChevronRight className="w-4 h-4 text-amber-500/50" />
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className={`px-4 py-2 rounded-lg text-sm font-serif font-bold transition flex items-center gap-2 ${
                      step === 2 
                        ? 'bg-amber-600 text-amber-950 shadow-md' 
                        : 'bg-amber-900/40 text-amber-300 hover:bg-amber-900/60'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span>2. मैन्यू व मात्रा का चुनाव ({Object.keys(itemQuantities).length})</span>
                  </button>
                </div>

                {/* STEP 1: Details */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-amber-300/90 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-amber-400" />
                            <span>आपका नाम (Full Name) *</span>
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono">✨ ऑटो हिंदी</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomerName(val);
                            const localH = transliterateLocal(val);
                            setCustomerHindiName(localH !== val ? localH : '');
                            if (val.trim()) {
                              transliterateToHindi(val).then(res => {
                                if (res) setCustomerHindiName(res);
                              });
                            } else {
                              setCustomerHindiName('');
                            }
                          }}
                          placeholder="जैसे: विक्रम सिंह / Vikram Singh"
                          className="w-full bg-amber-950/80 border border-amber-500/40 rounded-xl px-4 py-2.5 text-amber-100 placeholder-amber-500/50 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs"
                        />
                        {customerName && (
                          <div className="text-[10px] text-amber-400/80 mt-1 font-serif flex items-center gap-1.5">
                            <span>ग्राहक नाम:</span>
                            <span className="font-bold text-amber-100">{customerName}</span>
                            {customerHindiName && customerHindiName !== customerName && (
                              <span className="text-amber-300 font-semibold bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                                / {customerHindiName}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-amber-300/90 mb-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>फोन / मोबाइल नंबर (Phone) *</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="जैसे: 9829012345"
                          className="w-full bg-amber-950/80 border border-amber-500/40 rounded-xl px-4 py-2.5 text-amber-100 placeholder-amber-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Event Type */}
                      <div>
                        <label className="block text-xs font-semibold text-amber-300/90 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>आयोजन / इवेंट का प्रकार *</span>
                        </label>
                        <select
                          value={eventType}
                          onChange={(e: any) => setEventType(e.target.value)}
                          className="w-full bg-amber-950/80 border border-amber-500/40 rounded-xl px-4 py-2.5 text-amber-100 focus:outline-none focus:border-amber-400"
                        >
                          <option value="bandola">शाही बंडोला (Bandola Group Feast)</option>
                          <option value="wedding">शादी / विवाह समारोह (Wedding)</option>
                          <option value="reception">रिसेप्शन / सगाई (Reception)</option>
                          <option value="birthday">जन्मदिन (Birthday Party)</option>
                          <option value="corporate">कॉरपोरेट मीटिंग / पार्टी</option>
                          <option value="other">अन्य पारिवारिक आयोजन</option>
                        </select>
                      </div>

                      {/* Guest Count */}
                      <div>
                        <label className="block text-xs font-semibold text-amber-300/90 mb-1 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>कितने लोग हैं? (Number of People) *</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={10}
                            max={5000}
                            required
                            value={guestCount}
                            onChange={(e) => setGuestCount(Number(e.target.value))}
                            className="w-full bg-amber-950/80 border border-amber-500/40 rounded-xl px-4 py-2.5 text-amber-100 font-bold text-lg focus:outline-none focus:border-amber-400"
                          />
                          <span className="text-amber-300 text-sm font-semibold shrink-0">लोग (Members)</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Date */}
                      <div>
                        <label className="block text-xs font-semibold text-amber-300/90 mb-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>आयोजन की तारीख (Date) *</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full bg-amber-950/80 border border-amber-500/40 rounded-xl px-4 py-2.5 text-amber-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Time */}
                      <div>
                        <label className="block text-xs font-semibold text-amber-300/90 mb-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>पहुंचने का समय (Arrival Time) *</span>
                        </label>
                        <input
                          type="time"
                          required
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          className="w-full bg-amber-950/80 border border-amber-500/40 rounded-xl px-4 py-2.5 text-amber-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Venue Preference */}
                    <div>
                      <label className="block text-xs font-semibold text-amber-300/90 mb-2">
                        भोजन का स्थान (Dining Preference)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setCateringType('restaurant')}
                          className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                            cateringType === 'restaurant'
                              ? 'bg-amber-600/30 border-amber-400 text-amber-100 shadow-md'
                              : 'bg-amber-950/40 border-amber-500/20 text-amber-300/70 hover:bg-amber-900/30'
                          }`}
                        >
                          <Utensils className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <div className="font-bold text-xs">रेस्टोरेंट में भोजन</div>
                            <div className="text-[10px] text-amber-400/80">रेस्टोरेंट हॉल व सिटिंग व्यवस्था</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCateringType('catering_service')}
                          className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                            cateringType === 'catering_service'
                              ? 'bg-amber-600/30 border-amber-400 text-amber-100 shadow-md'
                              : 'bg-amber-950/40 border-amber-500/20 text-amber-300/70 hover:bg-amber-900/30'
                          }`}
                        >
                          <ChefHat className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <div className="font-bold text-xs">हमारे स्थान पर (Outdoor Catering)</div>
                            <div className="text-[10px] text-amber-400/80">हलवाई व ऑन-साइट कैटरिंग टीम</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Next Step Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold font-serif rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                      >
                        <span>आगे बढ़ें: खाना व मात्रा चुनें (Next: Select Menu & Quantities)</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-amber-400" />
                        <span>व्यंजन व मात्रा चुनें (Select Dishes & Set Quantity)</span>
                      </h3>

                      <button
                        type="button"
                        onClick={handleSelectAllRecommended}
                        className="text-xs bg-amber-800/60 hover:bg-amber-700 text-amber-200 px-3 py-1 rounded-lg border border-amber-600/40 transition"
                      >
                        शाही स्पेशल व्यंजन जोड़ें
                      </button>
                    </div>

                    {/* SEARCH BAR INPUT */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="व्यंजन खोजें... (उदा: पनीर, गट्टे, बाटी, लस्सी, कचौरी)"
                        className="w-full bg-amber-950/90 border border-amber-500/50 rounded-xl pl-10 pr-9 py-2.5 text-xs text-amber-100 placeholder-amber-500/80 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-amber-400 hover:text-white transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* CATEGORY FILTER PILLS */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {(() => {
                        const defaultCats = [
                          { id: 'all', label: 'सभी (All)' },
                          { id: 'mains', label: 'सब्जी व दाल (Mains)' },
                          { id: 'starters', label: 'नाश्ता (Starters)' },
                          { id: 'breads', label: 'रोटी/बाटी (Breads)' },
                          { id: 'desserts', label: 'मीठा (Desserts)' },
                          { id: 'beverages', label: 'पेय (Beverages)' }
                        ];
                        const defaultIds = ['all', 'mains', 'starters', 'breads', 'desserts', 'beverages', 'specials'];
                        const customCategoryList = Array.from(
                          new Set(menuItems.map(m => m.category).filter(c => c && !defaultIds.includes(c)))
                        );
                        const allPills = [
                          ...defaultCats,
                          ...customCategoryList.map(c => ({ id: c, label: c }))
                        ];
                        return allPills.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                              selectedCategory === cat.id
                                ? 'bg-amber-500 text-amber-950 font-bold shadow'
                                : 'bg-amber-950/50 text-amber-300/80 border border-amber-500/20 hover:bg-amber-900/40'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ));
                      })()}
                    </div>

                    {/* Quick Dish Selection Grid */}
                    <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto p-2 bg-amber-950/90 rounded-xl border border-amber-500/30">
                      {menuItems.filter(item => {
                        const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
                        const q = searchQuery.toLowerCase().trim();
                        const matchesQuery = !q || 
                          item.name.toLowerCase().includes(q) || 
                          (item.hindiName && item.hindiName.toLowerCase().includes(q)) || 
                          (item.description && item.description.toLowerCase().includes(q));
                        return matchesCat && matchesQuery;
                      }).length === 0 ? (
                        <div className="text-center py-8 text-amber-400/70 text-xs font-serif space-y-1">
                          <p>🔍 कोई व्यंजन नहीं मिला ('{searchQuery}')</p>
                          <p className="text-[11px] text-amber-300/60">यदि आपका पसंदीदा व्यंजन सूची में नहीं है, तो नीचे 'विशेष भोजन निर्देश' में लिखें।</p>
                        </div>
                      ) : (
                        menuItems.filter(item => {
                          const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
                          const q = searchQuery.toLowerCase().trim();
                          const matchesQuery = !q || 
                            item.name.toLowerCase().includes(q) || 
                            (item.hindiName && item.hindiName.toLowerCase().includes(q)) || 
                            (item.description && item.description.toLowerCase().includes(q));
                          return matchesCat && matchesQuery;
                        }).map((item) => {
                          const isSelected = item.name in itemQuantities;
                          const qty = itemQuantities[item.name] || 0;

                          return (
                            <div
                              key={item.id}
                              className={`p-3 rounded-xl border transition-all ${
                                isSelected
                                  ? 'bg-amber-900/50 border-amber-400 text-amber-100 shadow-md'
                                  : 'bg-amber-950/40 border-amber-500/20 text-amber-300/80 hover:bg-amber-900/30'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                {/* Left details + Checkbox */}
                                <div
                                  onClick={() => toggleMenuItem(item.name)}
                                  className="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden"
                                >
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-amber-500 border-amber-300 text-amber-950' : 'border-amber-500/40'
                                  }`}>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                                  </div>

                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-md object-cover border border-amber-500/30 shrink-0"
                                  />

                                  <div className="truncate">
                                    <div className="font-semibold text-xs text-amber-100 truncate">{item.name}</div>
                                    {item.hindiName && (
                                      <div className="text-[10px] text-amber-400/80 truncate">{item.hindiName}</div>
                                    )}
                                  </div>
                                </div>

                                {/* Right Quantity Control (Shown when selected) */}
                                {isSelected ? (
                                  <div className="flex items-center gap-1.5 shrink-0 bg-amber-950/80 p-1 rounded-lg border border-amber-500/40">
                                    <span className="text-[10px] text-amber-400 font-semibold px-1">मात्रा:</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateQuantity(item.name, Math.max(1, qty - (qty > 50 ? 10 : 1)));
                                      }}
                                      className="w-7 h-7 bg-amber-800 hover:bg-amber-700 text-amber-100 font-bold rounded flex items-center justify-center text-sm border border-amber-600/40 cursor-pointer"
                                    >
                                      -
                                    </button>

                                    <input
                                      type="number"
                                      min={1}
                                      value={qty}
                                      onChange={(e) => updateQuantity(item.name, Number(e.target.value))}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-14 text-center font-mono font-bold text-amber-100 bg-amber-900/90 border border-amber-500/50 rounded py-0.5 text-xs focus:outline-none focus:border-amber-300"
                                    />

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateQuantity(item.name, qty + (qty >= 50 ? 10 : 1));
                                      }}
                                      className="w-7 h-7 bg-amber-800 hover:bg-amber-700 text-amber-100 font-bold rounded flex items-center justify-center text-sm border border-amber-600/40 cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => toggleMenuItem(item.name)}
                                    className="px-2.5 py-1 text-xs bg-amber-800/40 hover:bg-amber-700/60 text-amber-300 rounded border border-amber-600/30 shrink-0 cursor-pointer"
                                  >
                                    चुनें (Select)
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Custom Food Instructions ("क्या क्या खाने में रखना है") */}
                    <div>
                      <label className="block text-xs font-semibold text-amber-300/90 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>विशेष भोजन निर्देश व अतिरिक्त विवरण (Custom Menu Requirements)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={customFoodNotes}
                        onChange={(e) => setCustomFoodNotes(e.target.value)}
                        placeholder="जैसे: शाही पनीर 10 प्लेट, रोटी 50 नग, बाटी शुद्ध घी की होनी चाहिए, 250 लोगों के लिए 7:30 बजे गरमा-गरम परोसना है।"
                        className="w-full bg-amber-950/80 border border-amber-500/40 rounded-xl p-3 text-amber-100 placeholder-amber-600 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Summary Quick Preview */}
                    <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-3 text-xs space-y-1.5">
                      <div className="flex justify-between font-bold text-amber-200">
                        <span>इवेंट: {getEventTypeName(eventType)} ({guestCount} लोग){customerName ? ` • ${customerName}` : ''}</span>
                        <span>{eventDate || 'तारीख चुनें'}</span>
                      </div>
                      <div className="text-amber-300/80 leading-normal">
                        <span className="font-bold text-amber-200 block mb-2">📋 चुने गए व्यंजन ({Object.keys(itemQuantities).length}):</span>
                        {Object.entries(itemQuantities).length > 0 
                          ? (
                            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                              {Object.entries(itemQuantities).map(([name, qty], idx) => {
                                const itemMatch = menuItems.find(m => m.name === name);
                                return (
                                  <div key={name} className="flex items-center justify-between gap-2 bg-amber-950/90 px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-100 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                                        {idx + 1}
                                      </span>
                                      <span className="font-semibold">{name}</span>
                                      {itemMatch?.hindiName && <span className="text-amber-400/70 text-[11px]">/ {itemMatch.hindiName}</span>}
                                    </div>
                                    <span className="text-amber-400 font-bold font-mono bg-amber-900/80 px-2 py-0.5 rounded text-xs shrink-0">
                                      {qty} मात्रा/प्लेट
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )
                          : <span className="text-amber-500/60 italic">कोई व्यंजन नहीं चुना गया</span>}
                      </div>
                    </div>

                    {/* Error message preview on Step 2 if validation fails */}
                    {errorMsg && (
                      <div className="p-3 rounded-lg bg-red-900/80 border border-red-500 text-red-100 text-xs font-semibold flex items-center gap-2 animate-pulse">
                        <Flame className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Submit Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-3 bg-amber-900/60 hover:bg-amber-800 text-amber-300 font-semibold rounded-xl transition border border-amber-600/40 cursor-pointer"
                      >
                        पीछे जाएं (Back)
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSubmit(e);
                        }}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold font-serif text-base rounded-xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        {isSubmitting ? (
                          <span>बुकिंग भेजी जा रही है...</span>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>बुकिंग सबमिट करें (Submit Booking)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            )}

          </div>

          {/* Footer Note */}
          <div className="bg-amber-950/90 border-t border-amber-500/20 px-6 py-2.5 text-center text-[11px] text-amber-400/70 font-serif">
            👑 माजीसा रेस्टोरेंट कैटरिंग सेवा - शादी, बंडोला व राजस्थानी शाही दावतों का विश्वसनीय नाम
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
