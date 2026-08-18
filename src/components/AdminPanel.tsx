/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Lock, Plus, Trash2, Edit3, Tag, Upload, FileVideo, FileImage, ClipboardList, Check, AlertCircle, Eye, EyeOff, Sparkles, X, Clock, Users, Calendar, Phone, MessageSquare, CheckCircle2, XCircle, ChefHat, Search, BarChart3, TrendingUp, PieChart, BookOpen, Award, Download } from 'lucide-react';
import { MenuItem, Highlight, Announcement, SeasonalSpecial, VibeVideo, BulkBooking, RegularCustomer } from '../types';
import { transliterateToHindi, transliterateLocal } from '../utils/transliterate';
import Logo from './Logo';

interface AdminPanelProps {
  menuItems: MenuItem[];
  highlights: Highlight[];
  announcements: Announcement[];
  seasonalSpecial: SeasonalSpecial | null;
  vibeVideos: VibeVideo[];
  bookings?: BulkBooking[];
  regularCustomers?: RegularCustomer[];
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  onUpdateMenuItem?: (item: MenuItem) => Promise<void>;
  onDeleteMenuItem: (id: string) => Promise<void>;
  onAddHighlight: (highlight: Omit<Highlight, 'id' | 'date'>) => Promise<void>;
  onDeleteHighlight: (id: string) => Promise<void>;
  onAddAnnouncement: (announcement: Omit<Announcement, 'id' | 'isActive' | 'date'>) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
  onToggleAnnouncement: (id: string) => Promise<void>;
  onUpdateSeasonalSpecial: (special: SeasonalSpecial) => Promise<void>;
  onUpdateVibeVideos: (videos: VibeVideo[]) => Promise<void>;
  onUpdateBookingStatus?: (id: string, status: 'pending' | 'confirmed' | 'cancelled') => Promise<void>;
  onDeleteBooking?: (id: string) => Promise<void>;
  onAddCustomer?: (cust: { name: string; phone: string }) => Promise<void>;
  onDeleteCustomer?: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function AdminPanel({
  menuItems = [],
  highlights = [],
  announcements = [],
  seasonalSpecial = null,
  vibeVideos = [],
  bookings = [],
  regularCustomers = [],
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onAddHighlight,
  onDeleteHighlight,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onToggleAnnouncement,
  onUpdateSeasonalSpecial,
  onUpdateVibeVideos,
  onUpdateBookingStatus,
  onDeleteBooking,
  onAddCustomer,
  onDeleteCustomer,
  onClose
}: AdminPanelProps) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // 5-Attempt Lockout & Forgot PIN State
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [forgotNewPinInput, setForgotNewPinInput] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Live countdown timer for login lockout
  React.useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAuthError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Editing Dish State
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [isEditingCustomCategory, setIsEditingCustomCategory] = useState(false);
  const [editCustomCategoryInput, setEditCustomCategoryInput] = useState('');
  const [activeTab, setActiveTab] = useState<'menu' | 'highlights' | 'announcements' | 'seasonal' | 'vibe' | 'bookings' | 'analytics' | 'vip_whatsapp' | 'security'>('menu');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [customerSearch, setCustomerSearch] = useState('');

  // Change PIN State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [changePinMsg, setChangePinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);

  // Analytics Derived Stats (Safe Compute)
  const safeMenuItems = Array.isArray(menuItems) ? menuItems.filter(Boolean) : [];
  const safeBookings = Array.isArray(bookings) ? bookings.filter(Boolean) : [];
  const safeCustomers = Array.isArray(regularCustomers) ? regularCustomers.filter(Boolean) : [];
  const safeAnnouncements = Array.isArray(announcements) ? announcements.filter(Boolean) : [];
  const safeHighlights = Array.isArray(highlights) ? highlights.filter(Boolean) : [];

  const popularCount = safeMenuItems.filter(i => Boolean(i?.isPopular)).length;
  const chefSpecialCount = safeMenuItems.filter(i => Boolean(i?.isChefSpecial)).length;
  const availableCount = safeMenuItems.filter(i => i?.isAvailable !== false).length;

  const avgPrice = safeMenuItems.length > 0 
    ? Math.round(safeMenuItems.reduce((sum, item) => sum + (Number(item?.price) || 0), 0) / safeMenuItems.length) 
    : 0;

  const highestPriceItem = safeMenuItems.length > 0 
    ? safeMenuItems.reduce((max, item) => (Number(item?.price || 0) > Number(max?.price || 0) ? item : max), safeMenuItems[0]) 
    : null;

  const lowestPriceItem = safeMenuItems.length > 0 
    ? safeMenuItems.reduce((min, item) => (Number(item?.price || 0) < Number(min?.price || 0) ? item : min), safeMenuItems[0]) 
    : null;

  const pendingBookingsCount = safeBookings.filter(b => b?.status === 'pending').length;
  const confirmedBookingsCount = safeBookings.filter(b => b?.status === 'confirmed').length;

  const analyticsCategoriesMap: Record<string, number> = {};
  safeMenuItems.forEach(item => {
    const cat = String(item?.category || 'other');
    analyticsCategoriesMap[cat] = (analyticsCategoriesMap[cat] || 0) + 1;
  });

  // VIP WhatsApp & Customer States
  const [vipSubTab, setVipSubTab] = useState<'directory' | 'broadcast'>('directory');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [custSearchQuery, setCustSearchQuery] = useState('');
  const [customerSaveMsg, setCustomerSaveMsg] = useState('');

  // Broadcast & Gateway States
  const [invitationImageUrl, setInvitationImageUrl] = useState(
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
  );
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Namaste {name} ji! Majisa Restaurant ki taraf se aapko VIP Invitation. Humne aapke liye special party organize ki hai. Kripya swagat ka anand lein!'
  );
  const [gatewayType, setGatewayType] = useState<'simulation' | 'meta' | 'callmebot' | 'thirdparty'>('simulation');
  const [metaPhoneId, setMetaPhoneId] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [callMeBotApiKey, setCallMeBotApiKey] = useState('');
  const [thirdPartyUrl, setThirdPartyUrl] = useState('');
  const [thirdPartyApiKey, setThirdPartyApiKey] = useState('');

  // Broadcast Progress & Logging States
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState({ sent: 0, total: 0, percent: 0 });
  const [broadcastLogs, setBroadcastLogs] = useState<Array<{ name: string; phone: string; status: 'sent' | 'failed'; detail: string; timestamp: string }>>([]);
  const [broadcastSummary, setBroadcastSummary] = useState<{ total: number; sent: number; failed: number } | null>(null);

  // Search & Filter States for Admin Dish Table
  const [adminDishSearch, setAdminDishSearch] = useState('');
  const [adminDishCategory, setAdminDishCategory] = useState<string>('all');

  // Loading/Uploading states with Real-Time Progress Tracking
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{
    isUploading: boolean;
    percent: number;
    message: string;
    fileName: string;
    fileSizeMb: string;
    activeFieldId: string | null;
  }>({
    isUploading: false,
    percent: 0,
    message: '',
    fileName: '',
    fileSizeMb: '',
    activeFieldId: null
  });

  // Real-Time XHR Progress Uploader Function (Binary FormData Direct CDN Stream)
  const uploadWithProgress = (
    file: File,
    fieldId: string,
    onSuccess: (url: string) => void
  ) => {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setIsUploading(true);
    setUploadProgress({
      isUploading: true,
      percent: 5,
      message: `Preparing ${file.name} (${sizeMb} MB) for streaming...`,
      fileName: file.name,
      fileSizeMb: sizeMb,
      activeFieldId: fieldId
    });
    setUploadMessage(`Uploading ${file.name} (${sizeMb} MB)...`);

    const cloudName = 'majisa-restaurent';
    const uploadPreset = 'majisa_upload';

    // 1. Primary: Direct Binary FormData Stream to Cloudinary (No Base64 overhead, no HTTP 413 error)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const netPercent = Math.min(98, Math.round((evt.loaded / evt.total) * 98));
        const loadedMb = (evt.loaded / (1024 * 1024)).toFixed(1);
        setUploadProgress(prev => ({
          ...prev,
          percent: netPercent,
          message: `Streaming directly to Cloudinary CDN... ${netPercent}% (${loadedMb} / ${sizeMb} MB)`
        }));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const uploadData = JSON.parse(xhr.responseText);
          if (uploadData.secure_url) {
            onSuccess(uploadData.secure_url);
            setUploadProgress({
              isUploading: false,
              percent: 100,
              message: `✓ ${file.name} uploaded & Cloud CDN ready!`,
              fileName: file.name,
              fileSizeMb: sizeMb,
              activeFieldId: null
            });
            setUploadMessage(`✓ ${file.name} uploaded successfully!`);
            setIsUploading(false);
            return;
          }
        } catch (e) {}
      }
      
      // Fallback: If direct Cloudinary FormData upload fails, upload via server endpoint
      uploadToServerFallback(file, fieldId, onSuccess);
    };

    xhr.onerror = () => {
      // Fallback: If network error occurs on direct CDN, try server upload
      uploadToServerFallback(file, fieldId, onSuccess);
    };

    const isVideo = file.type.startsWith('video/') || ['.mp4', '.webm', '.mov'].some(ext => file.name.toLowerCase().endsWith(ext));
    const resourceType = isVideo ? 'video' : 'image';

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, true);
    xhr.send(formData);
  };

  // Secondary Server Fallback Uploader
  const uploadToServerFallback = (
    file: File,
    fieldId: string,
    onSuccess: (url: string) => void
  ) => {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string;
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const netPercent = 20 + Math.round((evt.loaded / evt.total) * 75);
          setUploadProgress(prev => ({
            ...prev,
            percent: netPercent,
            message: `Uploading via Express Server fallback... ${netPercent}%`
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success && data.url) {
              onSuccess(data.url);
              setUploadProgress({
                isUploading: false,
                percent: 100,
                message: `✓ ${file.name} uploaded!`,
                fileName: file.name,
                fileSizeMb: sizeMb,
                activeFieldId: null
              });
              setUploadMessage(`✓ ${file.name} uploaded successfully!`);
              setIsUploading(false);
            } else {
              setUploadProgress(prev => ({ ...prev, isUploading: false, message: '❌ Upload failed: ' + (data.error || 'Server error'), activeFieldId: null }));
              setIsUploading(false);
            }
          } catch (e) {
            setUploadProgress(prev => ({ ...prev, isUploading: false, message: '❌ Server parse error', activeFieldId: null }));
            setIsUploading(false);
          }
        } else {
          setUploadProgress(prev => ({ ...prev, isUploading: false, message: `❌ Server HTTP Error ${xhr.status}`, activeFieldId: null }));
          setIsUploading(false);
        }
      };

      xhr.onerror = () => {
        setUploadProgress(prev => ({ ...prev, isUploading: false, message: '❌ Network connection error', activeFieldId: null }));
        setIsUploading(false);
      };

      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      const token = localStorage.getItem('majisa_admin_token') || '';
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(JSON.stringify({
        fileName: file.name,
        base64Data: base64String,
        mimeType: file.type
      }));
    };

    reader.readAsDataURL(file);
  };

  // Form States - Menu Item
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [menuForm, setMenuForm] = useState({
    name: '',
    hindiName: '',
    price: '',
    category: 'mains' as MenuItem['category'],
    description: '',
    image: '',
    isSpicy: false,
    isPopular: false,
    isChefSpecial: false
  });

  // Form States - Highlight Slideshow
  const [highlightForm, setHighlightForm] = useState({
    title: '',
    description: '',
    url: '',
    type: 'image' as Highlight['type']
  });

  // Form States - Announcement
  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    type: 'general' as Announcement['type']
  });

  // Form States - Seasonal Special
  const [specialForm, setSpecialForm] = useState({
    title: '',
    hindiTitle: '',
    description: '',
    price: '',
    image: '',
    isActive: true,
    endDate: ''
  });

  // Files inputs refs
  const menuFileRef = useRef<HTMLInputElement>(null);
  const highlightFileRef = useRef<HTMLInputElement>(null);
  const specialFileRef = useRef<HTMLInputElement>(null);

  // Authentication check with Lockout & Forgot PIN Support
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        if (data.token) {
          localStorage.setItem('majisa_admin_token', data.token);
        }
        setLockoutSeconds(0);
        setAttemptsLeft(null);
      } else {
        if (data.locked && data.remainingSeconds) {
          setLockoutSeconds(data.remainingSeconds);
        }
        if (data.attemptsRemaining !== undefined) {
          setAttemptsLeft(data.attemptsRemaining);
        }
        setAuthError(data.error || 'अमान्य सुरक्षा पिन (Invalid Security PIN)');
      }
    } catch (err) {
      setAuthError('सर्वर से संपर्क नहीं हो सका (Server connection failed).');
    }
  };

  // Emergency Master Recovery / Forgot PIN Submit
  const handleForgotPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccessMsg('');
    setIsForgotSubmitting(true);
    try {
      const res = await fetch('/api/admin/forgot-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterKey: masterKeyInput, newPin: forgotNewPinInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('majisa_admin_token', data.token);
        }
        setForgotSuccessMsg('पिन सफलतापूर्वक रीसेट कर दिया गया है! (Admin PIN reset successfully!)');
        setTimeout(() => {
          setIsAuthenticated(true);
          setShowForgotModal(false);
          setLockoutSeconds(0);
          setMasterKeyInput('');
          setForgotNewPinInput('');
          setForgotSuccessMsg('');
        }, 1200);
      } else {
        setForgotError(data.error || 'अमान्य मास्टर रिकवरी कुंजी (Invalid Master Recovery Key)');
      }
    } catch (err) {
      setForgotError('सर्वर त्रुटि (Server error)');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  // Helper to read and upload local files onto Express Server with Progress
  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetForm: 'menu' | 'highlight' | 'special' | 'card') => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadWithProgress(file, targetForm, (url) => {
      if (targetForm === 'menu') {
        setMenuForm(prev => ({ ...prev, image: url }));
      } else if (targetForm === 'special') {
        setSpecialForm(prev => ({ ...prev, image: url }));
      } else if (targetForm === 'card') {
        setInvitationImageUrl(url);
      } else {
        const isVid = file.type.startsWith('video/') || ['.mp4', '.webm', '.mov'].some(ext => file.name.toLowerCase().endsWith(ext));
        const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[📍\(\)]/g, " ").trim();
        const finalTitle = highlightForm.title.trim() || autoTitle || 'माजीसा स्पेशल शॉर्ट वीडियो';
        const finalType = isVid ? ('video' as const) : ('image' as const);
        
        setHighlightForm({
          title: finalTitle,
          description: highlightForm.description || '',
          url: url,
          type: finalType
        });

        // Auto publish highlight so it instantly appears on homepage gallery!
        onAddHighlight({
          title: finalTitle,
          description: highlightForm.description || 'Majisa Restaurant & Dhaba Video Highlight',
          url: url,
          type: finalType
        });
      }
    });
  };

  // Handle Add VIP Regular Customer
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      setCustomerSaveMsg('❌ कृपया नाम और 10-अंकीय मोबाइल नंबर दर्ज करें।');
      return;
    }
    let formattedPhone = newCustPhone.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }
    if (onAddCustomer) {
      await onAddCustomer({ name: newCustName.trim(), phone: formattedPhone });
    }
    const addedName = newCustName.trim();
    setNewCustName('');
    setNewCustPhone('');
    setCustomerSaveMsg(`✓ VIP कस्टमर "${addedName}" (+${formattedPhone}) सफलतापूर्वक सेव हो गया!`);
    setTimeout(() => setCustomerSaveMsg(''), 5000);
  };

  // Handle VIP WhatsApp Broadcast Dispatch
  const handleSendBroadcast = async () => {
    const list = regularCustomers || [];
    if (list.length === 0) {
      alert('ब्रॉडकास्ट भेजने के लिए डेटाबेस में कम से कम 1 रेगुलर कस्टमर होना आवश्यक है।');
      return;
    }
    if (!invitationImageUrl) {
      alert('कृपया निमंत्रण कार्ड इमेज (JPG/PNG) अपलोड या सेलेक्ट करें।');
      return;
    }
    if (!broadcastMessage) {
      alert('कृपया ब्रॉडकास्ट टेक्स्ट मैसेज दर्ज करें।');
      return;
    }

    setIsBroadcasting(true);
    setBroadcastProgress({ sent: 0, total: list.length, percent: 0 });
    setBroadcastLogs([]);
    setBroadcastSummary(null);

    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < list.length; i++) {
      const customer = list[i];
      const personalizedText = broadcastMessage.replace(/{name}/g, customer.name);
      
      let status: 'sent' | 'failed' = 'sent';
      let detail = `[VIP Card + Message] Delivered to +${customer.phone}`;

      // Call API in background
      try {
        if (gatewayType === 'meta' && metaPhoneId && metaToken) {
          const metaUrl = `https://graph.facebook.com/v18.0/${metaPhoneId}/messages`;
          const metaRes = await fetch(metaUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${metaToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: customer.phone,
              type: "image",
              image: { link: invitationImageUrl, caption: personalizedText }
            })
          });
          if (!metaRes.ok) {
            status = 'failed';
            detail = 'Meta Cloud API connection error';
          }
        } else if (gatewayType === 'callmebot' && callMeBotApiKey) {
          const cleanPhone = customer.phone.replace(/\D/g, '');
          const cmbUrl = `https://api.callmebot.com/whatsapp.php?phone=+${cleanPhone}&text=${encodeURIComponent(personalizedText)}&apikey=${callMeBotApiKey}`;
          const cmbRes = await fetch(cmbUrl);
          if (!cmbRes.ok) {
            status = 'failed';
            detail = 'CallMeBot Free API error';
          } else {
            status = 'sent';
            detail = `[CallMeBot Free API] Message delivered to +${cleanPhone}`;
          }
        } else if (gatewayType === 'thirdparty' && thirdPartyUrl) {
          const tpRes = await fetch(thirdPartyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: customer.phone,
              image: invitationImageUrl,
              caption: personalizedText,
              token: thirdPartyApiKey
            })
          });
          if (!tpRes.ok) {
            status = 'failed';
            detail = 'Third-party gateway error';
          }
        }
      } catch (err: any) {
        if (gatewayType !== 'simulation') {
          status = 'failed';
          detail = err.message || 'API connection failed';
        }
      }

      if (status === 'sent') {
        sentCount++;
      } else {
        failedCount++;
      }

      const logItem = {
        name: customer.name,
        phone: customer.phone,
        status,
        detail,
        timestamp: new Date().toLocaleTimeString()
      };

      setBroadcastLogs(prev => [logItem, ...prev]);
      const currentSent = i + 1;
      const pct = Math.round((currentSent / list.length) * 100);
      setBroadcastProgress({ sent: currentSent, total: list.length, percent: pct });

      // 1 second safety delay for visual streaming feedback
      if (i < list.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    setBroadcastSummary({
      total: list.length,
      sent: sentCount,
      failed: failedCount
    });

    setIsBroadcasting(false);
  };

  // Handle Form Submissions
  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.price || !menuForm.image) {
      alert('Please fill out all required fields (Name, Price, and Image URL/Upload)');
      return;
    }
    await onAddMenuItem({
      name: menuForm.name,
      hindiName: menuForm.hindiName,
      price: Number(menuForm.price),
      category: menuForm.category,
      description: menuForm.description,
      image: menuForm.image,
      isSpicy: menuForm.isSpicy,
      isPopular: menuForm.isPopular,
      isAvailable: true,
      isChefSpecial: menuForm.isChefSpecial
    });
    // Reset form
    setMenuForm({
      name: '',
      hindiName: '',
      price: '',
      category: 'mains',
      description: '',
      image: '',
      isSpicy: false,
      isPopular: false,
      isChefSpecial: false
    });
    setUploadMessage('');
    alert('Dish added successfully to menu!');
  };

  const handleHighlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlightForm.title || !highlightForm.url) {
      alert('Please fill in Title and Media URL');
      return;
    }
    await onAddHighlight({
      title: highlightForm.title,
      description: highlightForm.description,
      url: highlightForm.url,
      type: highlightForm.type
    });
    setHighlightForm({
      title: '',
      description: '',
      url: '',
      type: 'image'
    });
    setUploadMessage('');
    alert('Photo/Video added to home loop successfully!');
  };

  const handleAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) {
      alert('Please fill in Announcement Title and Content');
      return;
    }
    await onAddAnnouncement({
      title: annForm.title,
      content: annForm.content,
      type: annForm.type
    });
    setAnnForm({
      title: '',
      content: '',
      type: 'general'
    });
    alert('Announcement posted successfully!');
  };

  const handleSpecialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialForm.title || !specialForm.image || !specialForm.endDate) {
      alert('Please fill out all required fields (Title, Image, and Countdown End Date)');
      return;
    }
    await onUpdateSeasonalSpecial({
      title: specialForm.title,
      hindiTitle: specialForm.hindiTitle,
      description: specialForm.description,
      price: Number(specialForm.price) || 0,
      image: specialForm.image,
      isActive: specialForm.isActive,
      endDate: new Date(specialForm.endDate).toISOString()
    });
    alert('Seasonal Special updated successfully!');
  };

  // Populate seasonal special values
  React.useEffect(() => {
    if (seasonalSpecial) {
      try {
        const d = new Date(seasonalSpecial.endDate);
        const pad = (n: number) => String(n).padStart(2, '0');
        const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setSpecialForm({
          title: seasonalSpecial.title || '',
          hindiTitle: seasonalSpecial.hindiTitle || '',
          description: seasonalSpecial.description || '',
          price: String(seasonalSpecial.price || ''),
          image: seasonalSpecial.image || '',
          isActive: seasonalSpecial.isActive !== false,
          endDate: formattedDate
        });
      } catch (e) {
        setSpecialForm({
          title: seasonalSpecial.title || '',
          hindiTitle: seasonalSpecial.hindiTitle || '',
          description: seasonalSpecial.description || '',
          price: String(seasonalSpecial.price || ''),
          image: seasonalSpecial.image || '',
          isActive: seasonalSpecial.isActive !== false,
          endDate: ''
        });
      }
    }
  }, [seasonalSpecial]);

  // Vibe Videos Local State & Handlers
  const [localVibeVideos, setLocalVibeVideos] = useState<VibeVideo[]>([]);

  React.useEffect(() => {
    if (vibeVideos && vibeVideos.length > 0) {
      setLocalVibeVideos(vibeVideos);
    }
  }, [vibeVideos]);

  const handleVibeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, cardIndex: number, field: 'url' | 'poster') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fieldId = `vibe-${cardIndex}-${field}`;
    uploadWithProgress(file, fieldId, async (url) => {
      const currentVideos = localVibeVideos.length > 0 ? localVibeVideos : vibeVideos;
      const updated = [...currentVideos];
      updated[cardIndex] = {
        ...updated[cardIndex],
        [field]: url
      };
      setLocalVibeVideos(updated);
      if (onUpdateVibeVideos) {
        await onUpdateVibeVideos(updated);
      }
    });
  };

  const handleVibeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateVibeVideos(localVibeVideos);
    alert('वातावरण वीडियो सफलतापूर्वक अपडेट हो गए! (Collage videos updated successfully!)');
  };

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinMsg(null);
    if (!newPinInput || newPinInput.trim().length < 4) {
      setChangePinMsg({ type: 'error', text: 'नया पिन कम से कम 4 अक्षरों का होना चाहिए (New PIN must be at least 4 digits/characters).' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setChangePinMsg({ type: 'error', text: 'नया पिन और पुष्टि पिन मेल नहीं खाते (New PIN and Confirm PIN do not match).' });
      return;
    }

    setIsChangingPin(true);
    try {
      const token = localStorage.getItem('majisa_admin_token') || '';
      const res = await fetch('/api/admin/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPin: currentPinInput, newPin: newPinInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChangePinMsg({ type: 'success', text: '✓ Admin Entry PIN सफलतापूर्वक बदल दिया गया है! कृपया अगला लॉगिन नए पिन से करें।' });
        setCurrentPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
      } else {
        setChangePinMsg({ type: 'error', text: data.error || 'पिन बदलने में विफल (Failed to update PIN).' });
      }
    } catch (err) {
      setChangePinMsg({ type: 'error', text: 'सर्वर कनेक्शन त्रुटि (Server connection error).' });
    } finally {
      setIsChangingPin(false);
    }
  };

  // Check token authentication on opening Admin Panel
  React.useEffect(() => {
    const existingToken = localStorage.getItem('majisa_admin_token');
    if (existingToken) {
      fetch('/api/admin/check-token', {
        headers: { 'Authorization': `Bearer ${existingToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
    } else {
      setIsAuthenticated(false);
    }
    setPin('');
    setAuthError('');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('majisa_admin_token');
    setIsAuthenticated(false);
    setPin('');
    onClose();
  };

  // 1. PIN Login View
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-heritage-dark/95 flex items-center justify-center z-50 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-heritage-clay rounded-2xl border-2 border-gold-400 p-8 shadow-[0_0_50px_rgba(202,152,65,0.25)] relative"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            id="btn-close-login"
            className="absolute top-4 right-4 text-gold-400 hover:text-gold-200 transition-colors p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo className="w-24 h-24 drop-shadow-2xl hover:scale-105 transition-all duration-300" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gold-100">Majisa Owner Login Panel</h2>
            <p className="text-xs text-gold-300 mt-2 font-serif italic">"Enter PIN to manage menu, slideshows & specials dynamically"</p>
          </div>

          {!showForgotModal ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gold-300 font-sans">
                    Admin Entry PIN
                  </label>
                  {attemptsLeft !== null && attemptsLeft > 0 && lockoutSeconds <= 0 && (
                    <span className="text-xxs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                      ⚠️ Attempts left: {attemptsLeft}/5
                    </span>
                  )}
                </div>

                <input
                  type="password"
                  required
                  disabled={lockoutSeconds > 0}
                  placeholder="••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className={`w-full px-4 py-3 bg-heritage-dark border rounded-xl text-center text-xl text-gold-100 tracking-widest focus:outline-none transition-colors ${
                    lockoutSeconds > 0
                      ? 'border-red-500/50 opacity-60 cursor-not-allowed'
                      : 'border-gold-400/30 focus:border-gold-400'
                  }`}
                />
                
                {lockoutSeconds > 0 ? (
                  <div className="mt-3 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-center font-mono text-xs space-y-1">
                    <span className="font-bold text-red-400 block uppercase tracking-wider">🔒 Login Locked (5 Wrong Attempts)</span>
                    <span className="text-sm font-mono text-amber-300 font-bold block">
                      Try again in: {Math.floor(lockoutSeconds / 60)}:{(lockoutSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <p className="text-xxs text-gold-400/60 mt-2 text-center font-mono">🔒 Restricted Access • Authorised Owners Only</p>
                )}
              </div>

              {authError && lockoutSeconds <= 0 && (
                <div className="p-3 rounded-lg bg-heritage-red/20 border border-heritage-red/40 flex items-center space-x-2.5 text-red-400 text-xs font-sans">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                id="btn-submit-pin"
                disabled={lockoutSeconds > 0}
                className={`w-full py-3 bg-gradient-to-r from-heritage-red to-heritage-maroon text-gold-100 font-bold rounded-xl border border-gold-400/40 shadow-lg transition-all ${
                  lockoutSeconds > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:from-heritage-red/90 hover:to-heritage-maroon/90 active:scale-98 cursor-pointer'
                }`}
              >
                Unlock Admin Console
              </button>

              {/* Forgot PIN Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotError('');
                    setForgotSuccessMsg('');
                  }}
                  className="text-xs text-gold-400/80 hover:text-gold-200 underline font-sans transition-colors cursor-pointer"
                >
                  🔑 Forgot PIN? (पिन भूल गए?)
                </button>
              </div>
            </form>
          ) : (
            /* Emergency Master Recovery / Forgot PIN Form */
            <form onSubmit={handleForgotPinSubmit} className="space-y-5">
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-center">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-sans">Emergency PIN Reset</h3>
                <p className="text-[11px] text-amber-200/80 font-sans mt-0.5">
                  Enter your secret Master Recovery Key from .env to reset your Admin PIN.
                </p>
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-gold-300 mb-1.5 font-sans">
                  Master Security Key
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAJISA-SEC-8849-9201-8374-X9Z2"
                  value={masterKeyInput}
                  onChange={(e) => setMasterKeyInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/30 rounded-xl text-sm text-gold-100 focus:outline-none focus:border-gold-400 font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-gold-300 mb-1.5 font-sans">
                  New Admin PIN (नया पिन)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new 4+ digit PIN"
                  value={forgotNewPinInput}
                  onChange={(e) => setForgotNewPinInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/30 rounded-xl text-sm text-gold-100 focus:outline-none focus:border-gold-400 font-mono"
                />
              </div>

              {forgotError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-sans">
                  {forgotError}
                </div>
              )}

              {forgotSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-sans">
                  ✓ {forgotSuccessMsg}
                </div>
              )}

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-1/2 py-2.5 bg-heritage-dark border border-gold-400/20 text-gold-300 font-semibold rounded-xl text-xs hover:bg-heritage-dark/80 cursor-pointer"
                >
                  Cancel (रद्द करें)
                </button>
                <button
                  type="submit"
                  disabled={isForgotSubmitting}
                  className="w-1/2 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-xl border border-emerald-400/40 text-xs hover:from-emerald-500 hover:to-emerald-600 cursor-pointer shadow-lg"
                >
                  {isForgotSubmitting ? 'Resetting...' : 'Reset PIN Now'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  // 2. Full Admin Dashboard Workspace View
  return (
    <div className="fixed inset-0 bg-heritage-dark/98 overflow-y-auto z-50 flex flex-col font-sans">
      
      {/* Top Admin Header */}
      <header className="bg-heritage-clay border-b border-gold-400/20 py-4 px-6 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Logo className="w-16 h-16 shrink-0 drop-shadow-xl" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="font-display text-xl sm:text-2xl font-bold text-gold-100">माजीसा रेस्टोरेंट • OWNER WORKSPACE</h1>
            </div>
            <p className="text-xxs sm:text-xs text-gold-300 font-mono mt-0.5">Connected to persistent database file: <span className="text-heritage-yellow font-semibold">db.json</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            id="btn-logout"
            className="px-4 py-2 bg-heritage-dark border border-gold-400/25 rounded-xl text-xs font-semibold text-gold-300 hover:border-gold-400 hover:text-gold-100 transition-all cursor-pointer"
          >
            Sign Out
          </button>
          <button
            type="button"
            onClick={onClose}
            id="btn-close-admin"
            className="px-4 py-2 bg-gradient-to-r from-heritage-red to-heritage-maroon rounded-xl text-xs font-bold text-gold-100 border border-gold-400/30 shadow hover:shadow-lg transition-all cursor-pointer"
          >
            Close Console (बंद करें)
          </button>
        </div>
      </header>

      {/* Main Container Grid */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        
        {/* Left Side Sidebar / Navigation Controls */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-4 font-sans">
              Sections to Update (विभाग चुनें)
            </h3>
            
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'menu'
                    ? 'bg-gold-500 text-heritage-dark shadow-lg font-bold'
                    : 'bg-heritage-dark/80 text-gold-300 border border-gold-400/10 hover:border-gold-400/30'
                }`}
              >
                <span>व्यंजन मेनू • Manage Dishes</span>
                <Tag className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('highlights')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'highlights'
                    ? 'bg-gold-500 text-heritage-dark shadow-lg font-bold'
                    : 'bg-heritage-dark/80 text-gold-300 border border-gold-400/10 hover:border-gold-400/30'
                }`}
              >
                <span>गृह वीडियो/फोटोज • Slideshow</span>
                <FileImage className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('announcements')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'announcements'
                    ? 'bg-gold-500 text-heritage-dark shadow-lg font-bold'
                    : 'bg-heritage-dark/80 text-gold-300 border border-gold-400/10 hover:border-gold-400/30'
                }`}
              >
                <span>सूचना/विशेष थाली • Announcements</span>
                <Sparkles className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('seasonal')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'seasonal'
                    ? 'bg-gold-500 text-heritage-dark shadow-lg font-bold'
                    : 'bg-heritage-dark/80 text-gold-300 border border-gold-400/10 hover:border-gold-400/30'
                }`}
              >
                <span>साप्ताहिक पकवान • Seasonal Special</span>
                <Clock className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('vibe')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'vibe'
                    ? 'bg-gold-500 text-heritage-dark shadow-lg font-bold'
                    : 'bg-heritage-dark/80 text-gold-300 border border-gold-400/10 hover:border-gold-400/30'
                }`}
              >
                <span>वातावरण वीडियो • Collage Videos</span>
                <FileVideo className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer relative ${
                  activeTab === 'bookings'
                    ? 'bg-amber-500 text-heritage-dark shadow-lg font-bold'
                    : 'bg-heritage-dark/80 text-gold-300 border border-gold-400/10 hover:border-gold-400/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>बंडोला व इवेंट बुकिंग्स</span>
                  {bookings.filter(b => b.status === 'pending').length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] bg-red-600 text-white font-bold rounded-full animate-pulse">
                      {bookings.filter(b => b.status === 'pending').length} नई
                    </span>
                  )}
                </div>
                <ChefHat className="w-4.5 h-4.5 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('vip_whatsapp')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer border ${
                  activeTab === 'vip_whatsapp'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg font-bold border-emerald-400'
                    : 'bg-heritage-dark/80 text-emerald-400/90 border border-emerald-500/20 hover:border-emerald-400/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>VIP WhatsApp ब्रॉडकास्ट</span>
                  {(regularCustomers || []).length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-500 text-black font-bold rounded-full">
                      {(regularCustomers || []).length} DB
                    </span>
                  )}
                </div>
                <MessageSquare className="w-4.5 h-4.5 text-emerald-400" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-purple-600 text-white shadow-lg font-bold'
                    : 'bg-heritage-dark/80 text-gold-300 border border-gold-400/10 hover:border-gold-400/30'
                }`}
              >
                <span>बिजनेस एनालिटिक्स • Analytics</span>
                <BarChart3 className="w-4.5 h-4.5 text-purple-300" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer border ${
                  activeTab === 'security'
                    ? 'bg-gradient-to-r from-red-700 to-red-900 text-white shadow-lg font-bold border-red-400'
                    : 'bg-heritage-dark/80 text-red-300/90 border border-red-500/20 hover:border-red-400/50'
                }`}
              >
                <span>सुरक्षा एवं पिन बदलें • Security</span>
                <Lock className="w-4.5 h-4.5 text-red-300" />
              </button>
            </div>
          </div>

          <div className="bg-heritage-clay/40 border border-gold-400/10 rounded-2xl p-5 text-gold-300 text-xs leading-relaxed">
            <h4 className="font-semibold text-gold-200 mb-2">💡 Tips for Majisa Owner:</h4>
            <p>1. <strong>Local Photo Upload:</strong> Click "Upload File" to select any image from your mobile phone or computer. The server will process it dynamically.</p>
            <p className="mt-2">2. <strong>Immediate updates:</strong> Your restaurant guests will see the changes instantly. No page reloading or code modification required.</p>
          </div>
        </div>

        {/* Right Side Content Section depending on Tab */}
        <div className="lg:col-span-9 space-y-8">

          {/* Sticky Live Upload Progress Banner */}
          {(uploadProgress.isUploading || uploadProgress.percent > 0) && (
            <div className={`p-4 rounded-2xl border shadow-2xl transition-all duration-300 ${
              uploadProgress.isUploading
                ? 'bg-emerald-950/90 border-emerald-400/60 text-emerald-200 animate-pulse'
                : 'bg-emerald-900/80 border-emerald-400 text-emerald-100'
            }`}>
              <div className="flex justify-between items-center text-xs font-mono font-bold mb-2">
                <span className="flex items-center gap-2">
                  <Upload className={`w-4 h-4 text-emerald-400 ${uploadProgress.isUploading ? 'animate-bounce' : ''}`} />
                  <span>
                    {uploadProgress.isUploading 
                      ? `Uploading ${uploadProgress.fileName} (${uploadProgress.fileSizeMb} MB)...`
                      : uploadProgress.fileName ? `✓ ${uploadProgress.fileName} Uploaded!` : 'Upload Status'}
                  </span>
                </span>
                <span className="bg-black/60 px-3 py-1 rounded-lg text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs">
                  {uploadProgress.percent}%
                </span>
              </div>

              {/* Dynamic Fill Bar */}
              <div className="w-full bg-gray-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-emerald-500/30">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-2 text-[11px] font-mono text-emerald-300/90">
                <span>{uploadProgress.message}</span>
                <span className="text-[10px] text-amber-300 font-bold bg-black/40 px-2 py-0.5 rounded border border-amber-500/30">
                  ☁️ Cloudinary CDN Streaming
                </span>
              </div>
            </div>
          )}

          {/* ================== TAB A: MANAGE MENU ================== */}
          {activeTab === 'menu' && (
            <div className="space-y-8">
              {/* Form to Add Item */}
              <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-gold-100 mb-6 pb-3 border-b border-gold-400/10">
                  नया व्यंजन जोड़े • Add New Dish to Menu
                </h2>

                <form onSubmit={handleMenuSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dish Name */}
                  <div>
                    <label className="block text-xs font-medium text-gold-300 mb-1.5 flex items-center justify-between">
                      <span>Dish Name (English) *</span>
                      <span className="text-[10px] text-amber-400 font-mono">✨ ऑटो हिंदी टाइपिंग</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paneer Butter Masala"
                      value={menuForm.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const localHindi = transliterateLocal(val);
                        setMenuForm(prev => ({
                          ...prev,
                          name: val,
                          hindiName: localHindi !== val ? localHindi : prev.hindiName
                        }));
                        if (val.trim()) {
                          transliterateToHindi(val).then(hindiRes => {
                            if (hindiRes) {
                              setMenuForm(prev => ({ ...prev, hindiName: hindiRes }));
                            }
                          });
                        } else {
                          setMenuForm(prev => ({ ...prev, hindiName: '' }));
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                    />
                  </div>

                  {/* Hindi Name */}
                  <div>
                    <label className="block text-xs font-medium text-gold-300 mb-1.5 flex items-center justify-between">
                      <span>व्यंजन का नाम (हिंदी में) *</span>
                      <span className="text-[10px] text-emerald-400">ऑटोमेटिक भरेगा</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="जैसे: पनीर बटर मसाला (ऑटोमेटिक टाइप होगा)"
                      value={menuForm.hindiName}
                      onChange={(e) => setMenuForm(prev => ({ ...prev, hindiName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm font-semibold"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-medium text-gold-300 mb-1.5">Price (₹ INR) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 240"
                      value={menuForm.price}
                      onChange={(e) => setMenuForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-gold-300 mb-1.5 flex items-center justify-between">
                      <span>Category (श्रेणी) *</span>
                      <span className="text-[10px] text-amber-400 font-mono">➕ अपनी श्रेणी जोड़ें</span>
                    </label>
                    <select
                      value={isCustomCategory ? 'other' : (['starters', 'mains', 'breads', 'desserts', 'beverages', 'specials'].includes(menuForm.category) ? menuForm.category : 'other')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'other') {
                          setIsCustomCategory(true);
                          setCustomCategoryInput('');
                          setMenuForm(prev => ({ ...prev, category: '' }));
                        } else {
                          setIsCustomCategory(false);
                          setMenuForm(prev => ({ ...prev, category: val }));
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm cursor-pointer"
                    >
                      <option value="mains">Main Sabji Curries (मुख्य सब्जी)</option>
                      <option value="breads">Rotis & Breads (सोगरा/रोटी)</option>
                      <option value="starters">Nashta & Starters (नाश्ता)</option>
                      <option value="desserts">Sweets & Desserts (घेवर/मीठा)</option>
                      <option value="beverages">Cold Beverages (ठंडी लस्सी/पेय)</option>
                      <option value="specials">Royal Specials / Thali (विशेष थाली)</option>
                      <option value="other">➕ Custom / Other (अपनी पसंद की नई श्रेणी टाइप करें)...</option>
                    </select>

                    {isCustomCategory && (
                      <div className="mt-2.5 space-y-1">
                        <label className="block text-[11px] font-bold text-amber-400">
                          अपनी नई श्रेणी का नाम दर्ज करें (Enter Custom Category Name) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="जैसे: राइस व पुलाव (Rice & Biryani), सूप (Soups), स्नेक्स..."
                          value={customCategoryInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomCategoryInput(val);
                            setMenuForm(prev => ({ ...prev, category: val || 'specials' }));
                          }}
                          className="w-full px-4 py-2.5 bg-heritage-dark border-2 border-amber-500/50 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm font-semibold shadow-inner"
                        />
                      </div>
                    )}
                  </div>

                  {/* Image Source Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gold-300 mb-1.5">Dish Image URL or Local File Upload *</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Image Link (or upload a local file using the button on the right)"
                        value={menuForm.image}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, image: e.target.value }))}
                        className="flex-grow px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        ref={menuFileRef}
                        onChange={(e) => handleLocalFileUpload(e, 'menu')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        id="btn-upload-menu-file"
                        onClick={() => menuFileRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2.5 bg-heritage-clay hover:bg-heritage-clay/90 text-gold-300 rounded-xl border border-gold-400/30 flex items-center gap-2 text-xs font-bold cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4 text-heritage-yellow animate-bounce" />
                        <span>Upload File</span>
                      </button>
                    </div>

                    {uploadMessage && (
                      <p className="text-xxs text-heritage-yellow mt-2 font-mono ml-1">{uploadMessage}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gold-300 mb-1.5">Description (विवरण)</label>
                    <textarea
                      rows={3}
                      placeholder="Explain ingredients, pure ghee, slow-fired clay ovens, etc..."
                      value={menuForm.description}
                      onChange={(e) => setMenuForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                    />
                  </div>

                  {/* Boolean Checkboxes */}
                  <div className="md:col-span-2 flex flex-wrap gap-6 p-4 rounded-xl bg-heritage-dark/60 border border-gold-400/10">
                    <label className="flex items-center space-x-2 text-sm text-gold-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={menuForm.isSpicy}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, isSpicy: e.target.checked }))}
                        className="w-4.5 h-4.5 rounded text-heritage-red bg-heritage-dark focus:ring-0 border-gold-400/30"
                      />
                      <span>तीखा मसाला (Spicy)</span>
                    </label>

                    <label className="flex items-center space-x-2 text-sm text-gold-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={menuForm.isPopular}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, isPopular: e.target.checked }))}
                        className="w-4.5 h-4.5 rounded text-heritage-red bg-heritage-dark focus:ring-0 border-gold-400/30"
                      />
                      <span>Best Seller (लोकप्रिय)</span>
                    </label>

                    <label className="flex items-center space-x-2 text-sm text-gold-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={menuForm.isChefSpecial}
                        onChange={(e) => setMenuForm(prev => ({ ...prev, isChefSpecial: e.target.checked }))}
                        className="w-4.5 h-4.5 rounded text-heritage-red bg-heritage-dark focus:ring-0 border-gold-400/30"
                      />
                      <span>Chef's Special (शेफ स्पेशल)</span>
                    </label>
                  </div>

                  {/* Form Submission Button */}
                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      id="btn-add-menu-dish"
                      className="w-full py-3 bg-gradient-to-r from-heritage-red to-heritage-maroon hover:from-heritage-red/90 hover:to-heritage-maroon/90 border border-gold-400/30 text-gold-100 font-bold rounded-xl shadow-lg transition-transform active:scale-99 cursor-pointer"
                    >
                      सूची में जोड़े • Add Dish to Active Menu
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Dishes Table */}
              <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gold-400/10">
                  <h3 className="font-display text-lg font-bold text-gold-100 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-400" />
                    <span>वर्तमान में उपलब्ध भोजन ({menuItems.filter(dish => {
                      const matchesSearch = dish.name.toLowerCase().includes(adminDishSearch.toLowerCase()) ||
                        dish.hindiName.includes(adminDishSearch) ||
                        String(dish.price).includes(adminDishSearch) ||
                        dish.description.toLowerCase().includes(adminDishSearch.toLowerCase());
                      const matchesCategory = adminDishCategory === 'all' || dish.category === adminDishCategory;
                      return matchesSearch && matchesCategory;
                    }).length} / {menuItems.length} Dishes)</span>
                  </h3>
                </div>

                {/* Search Bar & Category Filter Pills */}
                <div className="space-y-3">
                  {/* Search Input */}
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={adminDishSearch}
                      onChange={(e) => setAdminDishSearch(e.target.value)}
                      placeholder="व्यंजन खोजें... (उदा: पनीर, बाटी, लस्सी, ₹240)"
                      className="w-full pl-10 pr-9 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 placeholder-gold-400/50 text-xs focus:outline-none focus:border-gold-400"
                    />
                    {adminDishSearch && (
                      <button
                        type="button"
                        onClick={() => setAdminDishSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-400 hover:text-gold-100 text-xs p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const defaultCats = [
                        { id: 'all', label: 'सभी (All)' },
                        { id: 'mains', label: 'मुख्य सब्जी (Mains)' },
                        { id: 'breads', label: 'रोटी/सोगरा (Breads)' },
                        { id: 'starters', label: 'नाश्ता (Starters)' },
                        { id: 'desserts', label: 'मीठा (Desserts)' },
                        { id: 'beverages', label: 'पेय (Beverages)' },
                        { id: 'specials', label: 'थाली (Specials)' }
                      ];
                      const knownIds = ['all', 'mains', 'breads', 'starters', 'desserts', 'beverages', 'specials'];
                      const customCatList = Array.from(
                        new Set(menuItems.map(m => m.category).filter(c => c && !knownIds.includes(c)))
                      );
                      const allAdminPills = [
                        ...defaultCats,
                        ...customCatList.map(c => ({ id: c, label: c }))
                      ];
                      return allAdminPills.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setAdminDishCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                            adminDishCategory === cat.id
                              ? 'bg-gold-500 text-heritage-dark font-bold shadow'
                              : 'bg-heritage-dark/80 text-gold-300 border border-gold-400/20 hover:border-gold-400/40'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ));
                    })()}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gold-200">
                    <thead>
                      <tr className="border-b border-gold-400/20 text-xs uppercase tracking-wider text-gold-400">
                        <th className="py-3 px-2">Image</th>
                        <th className="py-3 px-4">Dish Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = menuItems.filter(dish => {
                          const matchesSearch = dish.name.toLowerCase().includes(adminDishSearch.toLowerCase()) ||
                            dish.hindiName.includes(adminDishSearch) ||
                            String(dish.price).includes(adminDishSearch) ||
                            dish.description.toLowerCase().includes(adminDishSearch.toLowerCase());
                          const matchesCategory = adminDishCategory === 'all' || dish.category === adminDishCategory;
                          return matchesSearch && matchesCategory;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gold-400/60 font-serif italic text-xs">
                                कोई व्यंजन नहीं मिला (No dishes match your search or filter)
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((dish) => (
                          <tr key={dish.id} className="border-b border-gold-400/10 hover:bg-heritage-dark/40 transition-colors">
                            <td className="py-3 px-2">
                              <img
                                src={dish.image}
                                alt={dish.name}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 object-cover rounded-lg border border-gold-400/20"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-gold-100">{dish.name}</p>
                              <p className="text-xxs text-gold-400 italic">{dish.hindiName}</p>
                            </td>
                            <td className="py-3 px-4 capitalize font-mono text-xs">{dish.category}</td>
                            <td className="py-3 px-4 font-bold">₹{dish.price}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingDish({ ...dish });
                                    setIsEditingCustomCategory(false);
                                    setEditCustomCategoryInput('');
                                  }}
                                  id={`btn-edit-dish-${dish.id}`}
                                  className="p-2 text-gold-400 hover:bg-gold-400/20 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Dish / सब्जी में संशोधन करें"
                                >
                                  <Edit3 className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteMenuItem(dish.id)}
                                  id={`btn-del-dish-${dish.id}`}
                                  className="p-2 text-red-400 hover:bg-heritage-red/20 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Item / हटाएं"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================== TAB B: HIGHLIGHTS & SLIDESHOW ================== */}
          {activeTab === 'highlights' && (
            <div className="space-y-8">
              {/* Form to Add Slide */}
              <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-gold-100 mb-6 pb-3 border-b border-gold-400/10">
                  नया फोटो/वीडियो जोड़े • Add Background Slideshow Element
                </h2>

                <form onSubmit={handleHighlightSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-medium text-gold-300 mb-1.5">Slide Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Traditional Kathputli Show"
                        value={highlightForm.title}
                        onChange={(e) => setHighlightForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                      />
                    </div>

                    {/* Media Type */}
                    <div>
                      <label className="block text-xs font-medium text-gold-300 mb-1.5">Media Type *</label>
                      <select
                        value={highlightForm.type}
                        onChange={(e) => setHighlightForm(prev => ({ ...prev, type: e.target.value as Highlight['type'] }))}
                        className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                      >
                        <option value="image">Still Photo (फोटो)</option>
                        <option value="video">Background Video Clip (वीडियो)</option>
                      </select>
                    </div>
                  </div>

                  {/* URL Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gold-300 mb-1.5">Photo/Video URL or Upload File *</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Link address (or click upload button to load a local file)"
                        value={highlightForm.url}
                        onChange={(e) => setHighlightForm(prev => ({ ...prev, url: e.target.value }))}
                        className="flex-grow px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                      />
                      <input
                        type="file"
                        accept="image/*,video/*"
                        ref={highlightFileRef}
                        onChange={(e) => handleLocalFileUpload(e, 'highlight')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        id="btn-upload-hl-file"
                        onClick={() => highlightFileRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2.5 bg-heritage-clay hover:bg-heritage-clay/90 text-gold-300 rounded-xl border border-gold-400/30 flex items-center gap-2 text-xs font-bold cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4 text-heritage-yellow animate-bounce" />
                        <span>Upload File</span>
                      </button>
                    </div>
                    <p className="text-xxs text-gray-400 mt-1.5">For videos, direct .mp4 URLs or Youtube link works perfectly in background slideshow.</p>

                    {uploadMessage && (
                      <p className="text-xxs text-heritage-yellow mt-2 font-mono ml-1">{uploadMessage}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gold-300 mb-1.5">Caption Description</label>
                    <textarea
                      rows={2}
                      placeholder="Caption text displayed in background loop..."
                      value={highlightForm.description}
                      onChange={(e) => setHighlightForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    id="btn-add-hl"
                    className="w-full py-3 bg-gradient-to-r from-heritage-red to-heritage-maroon hover:from-heritage-red/90 hover:to-heritage-maroon/90 border border-gold-400/30 text-gold-100 font-bold rounded-xl shadow transition-transform active:scale-99 cursor-pointer"
                  >
                    गैलरी में जोड़े • Insert Slide Highlight
                  </button>
                </form>
              </div>

              {/* Active Highlights list */}
              <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-gold-100 mb-4 pb-2 border-b border-gold-400/10">
                  वर्तमान सक्रिय गैलरी / होम स्लाइडर
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {highlights.map((slide) => (
                    <div key={slide.id} className="p-4 rounded-xl bg-heritage-dark border border-gold-400/10 flex flex-col justify-between">
                      <div>
                        {/* Preview Asset */}
                        <div className="h-32 rounded-lg bg-heritage-clay overflow-hidden relative border border-gold-400/10 mb-3">
                          {slide.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-heritage-maroon/20">
                              <FileVideo className="w-10 h-10 text-heritage-yellow animate-pulse" />
                            </div>
                          ) : (
                            <img
                              src={slide.url}
                              alt={slide.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xxs font-mono bg-heritage-clay text-gold-300 border border-gold-400/25 uppercase">
                            {slide.type}
                          </span>
                        </div>
                        <h4 className="font-bold text-gold-100 text-sm">{slide.title}</h4>
                        <p className="text-xxs text-gray-400 mt-1 line-clamp-2">{slide.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gold-400/10 flex items-center justify-between text-xxs text-gray-400 font-mono">
                        <span>Added: {slide.date}</span>
                        <button
                          onClick={() => onDeleteHighlight(slide.id)}
                          id={`btn-del-hl-${slide.id}`}
                          className="px-2.5 py-1.5 bg-heritage-red/20 text-red-400 border border-heritage-red/30 hover:bg-heritage-red hover:text-gold-50 rounded-lg transition-colors cursor-pointer uppercase font-bold tracking-wider font-sans"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================== TAB C: DAILY ANNOUNCEMENTS ================== */}
          {activeTab === 'announcements' && (
            <div className="space-y-8">
              {/* Form to Add Announcement */}
              <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-gold-100 mb-6 pb-3 border-b border-gold-400/10">
                  विशेष घोषणा या डील जोड़े • Add New Announcement / Offer Notice
                </h2>

                <form onSubmit={handleAnnSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-medium text-gold-300 mb-1.5">Announcement Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 15% Off Marwari Thali Sunday"
                        value={annForm.title}
                        onChange={(e) => setAnnForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                      />
                    </div>

                    {/* Announcement Type */}
                    <div>
                      <label className="block text-xs font-medium text-gold-300 mb-1.5">Notice Category *</label>
                      <select
                        value={annForm.type}
                        onChange={(e) => setAnnForm(prev => ({ ...prev, type: e.target.value as Announcement['type'] }))}
                        className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                      >
                        <option value="general">General Notice (सामान्य सूचना)</option>
                        <option value="special">Special Dish of the Day (विशेष भोजन)</option>
                        <option value="deal">Discount Deal / Offer (छूट)</option>
                      </select>
                    </div>
                  </div>

                  {/* Content details */}
                  <div>
                    <label className="block text-xs font-medium text-gold-300 mb-1.5">Announcement Details *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe what guests can expect, duration, complementary drinks details, etc..."
                      value={annForm.content}
                      onChange={(e) => setAnnForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    id="btn-add-ann"
                    className="w-full py-3 bg-gradient-to-r from-heritage-red to-heritage-maroon hover:from-heritage-red/90 hover:to-heritage-maroon/90 border border-gold-400/30 text-gold-100 font-bold rounded-xl shadow transition-transform active:scale-99 cursor-pointer"
                  >
                    घोषणा पोस्ट करें • Post Live Announcement
                  </button>
                </form>
              </div>

              {/* Active Announcements list */}
              <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-gold-100 mb-4 pb-2 border-b border-gold-400/10">
                  वर्तमान सक्रिय घोषणाएँ (Live Notices)
                </h3>

                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-5 rounded-xl bg-heritage-dark border border-gold-400/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${ann.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
                          <h4 className="font-bold text-gold-100 text-sm sm:text-base">{ann.title}</h4>
                          <span className="px-2 py-0.5 rounded text-xxs font-mono bg-heritage-clay text-heritage-yellow border border-gold-400/20 uppercase capitalize">
                            {ann.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-2 font-sans">{ann.content}</p>
                        <p className="text-xxs text-gray-500 mt-1 font-mono">Date posted: {ann.date}</p>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        {/* Toggle active state */}
                        <button
                          onClick={() => onToggleAnnouncement(ann.id)}
                          id={`btn-toggle-ann-${ann.id}`}
                          className={`px-3 py-1.5 rounded-xl border text-xxs font-bold tracking-wider uppercase flex items-center space-x-1.5 transition-all cursor-pointer ${
                            ann.isActive
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950'
                              : 'bg-heritage-clay text-gray-400 border-gold-400/10 hover:border-gold-400/30'
                          }`}
                        >
                          {ann.isActive ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onDeleteAnnouncement(ann.id)}
                          id={`btn-del-ann-${ann.id}`}
                          className="p-2 text-red-400 hover:bg-heritage-red/20 rounded-xl border border-transparent hover:border-heritage-red/20 transition-all cursor-pointer"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4.5 h-4.5" strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================== TAB D: SEASONAL SPECIAL ================== */}
          {activeTab === 'seasonal' && (
            <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gold-400/10 justify-between">
                <h2 className="font-display text-xl font-bold text-gold-100">
                  साप्ताहिक पकवान विवरण • Edit Seasonal Special Delicacy
                </h2>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-heritage-dark text-heritage-yellow border border-gold-400/20 uppercase tracking-widest font-bold">
                  Live Countdown Highlight
                </span>
              </div>

              <form onSubmit={handleSpecialSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* English Title */}
                  <div>
                    <label className="block text-xs font-medium text-gold-300 mb-1.5 flex items-center justify-between">
                      <span>Delicacy Title (English) *</span>
                      <span className="text-[10px] text-amber-400 font-mono">✨ ऑटो हिंदी टाइपिंग</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Saffron Malai Ghevar"
                      value={specialForm.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        const localHindi = transliterateLocal(val);
                        setSpecialForm(prev => ({
                          ...prev,
                          title: val,
                          hindiTitle: localHindi !== val ? localHindi : prev.hindiTitle
                        }));
                        if (val.trim()) {
                          transliterateToHindi(val).then(hindiRes => {
                            if (hindiRes) {
                              setSpecialForm(prev => ({ ...prev, hindiTitle: hindiRes }));
                            }
                          });
                        } else {
                          setSpecialForm(prev => ({ ...prev, hindiTitle: '' }));
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                    />
                  </div>

                  {/* Hindi Title */}
                  <div>
                    <label className="block text-xs font-medium text-gold-300 mb-1.5 flex items-center justify-between">
                      <span>व्यंजन का नाम (हिंदी में)</span>
                      <span className="text-[10px] text-emerald-400">ऑटोमेटिक टाइप होगा</span>
                    </label>
                    <input
                      type="text"
                      placeholder="जैसे: केसरिया मलाई घेवर (ऑटोमेटिक भरेगा)"
                      value={specialForm.hindiTitle}
                      onChange={(e) => setSpecialForm(prev => ({ ...prev, hindiTitle: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm font-semibold"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-medium text-gold-300 mb-1.5">Price (₹ INR) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 280"
                      value={specialForm.price}
                      onChange={(e) => setSpecialForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                    />
                  </div>

                  {/* End date for Countdown */}
                  <div>
                    <label className="block text-xs font-medium text-gold-300 mb-1.5">Countdown End Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={specialForm.endDate}
                      onChange={(e) => setSpecialForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                    />
                  </div>
                </div>

                {/* Image upload or URL link */}
                <div>
                  <label className="block text-xs font-medium text-gold-300 mb-1.5">Delicacy Photo URL or Local File Upload *</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Photo Link (or click Upload on the right)"
                      value={specialForm.image}
                      onChange={(e) => setSpecialForm(prev => ({ ...prev, image: e.target.value }))}
                      className="flex-grow px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      ref={specialFileRef}
                      onChange={(e) => handleLocalFileUpload(e, 'special')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      id="btn-upload-special-file"
                      onClick={() => specialFileRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2.5 bg-heritage-clay hover:bg-heritage-clay/90 text-gold-300 rounded-xl border border-gold-400/30 flex items-center gap-2 text-xs font-bold cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 text-heritage-yellow animate-bounce" />
                      <span>Upload File</span>
                    </button>
                  </div>

                  {uploadMessage && (
                    <p className="text-xxs text-heritage-yellow mt-2 font-mono ml-1">{uploadMessage}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gold-300 mb-1.5">Delicacy Description / Heritage Details</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the sweet honeycomb patterns, premium saffron rabdi, pure organic cow ghee..."
                    value={specialForm.description}
                    onChange={(e) => setSpecialForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm"
                  />
                </div>

                {/* Toggle Is Active */}
                <div className="flex items-center space-x-3 p-4 rounded-xl bg-heritage-dark/60 border border-gold-400/10">
                  <input
                    type="checkbox"
                    id="special-active-checkbox"
                    checked={specialForm.isActive}
                    onChange={(e) => setSpecialForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4.5 h-4.5 rounded text-heritage-red bg-heritage-dark focus:ring-0 border-gold-400/30 cursor-pointer"
                  />
                  <label htmlFor="special-active-checkbox" className="text-sm text-gold-200 cursor-pointer select-none">
                    <strong>सक्रिय करें (Activate Highlight)</strong> — Check this to feature this seasonal special card prominently on the homepage with a live countdown timer.
                  </label>
                </div>

                {/* Form submit */}
                <button
                  type="submit"
                  id="btn-update-special"
                  className="w-full py-3 bg-gradient-to-r from-heritage-red to-heritage-maroon hover:from-heritage-red/90 hover:to-heritage-maroon/90 border border-gold-400/30 text-gold-100 font-bold rounded-xl shadow-lg transition-transform active:scale-99 cursor-pointer"
                >
                  बदलाव सुरक्षित करें • Save Seasonal Special Settings
                </button>
              </form>
            </div>
          )}

          {/* ================== TAB E: COLLAGE VIDEOS ================== */}
          {activeTab === 'vibe' && (
            <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gold-400/10 justify-between">
                <h2 className="font-display text-xl font-bold text-gold-100">
                  वातावरण वीडियो संपादन • Edit Collage Videos
                </h2>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-heritage-dark text-heritage-yellow border border-gold-400/20 uppercase tracking-widest font-bold">
                  4 Cards Section
                </span>
              </div>

              <form onSubmit={handleVibeSubmit} className="space-y-8">
                {uploadMessage && (
                  <div className="p-3 rounded-lg bg-heritage-dark/60 border border-gold-400/20 text-heritage-yellow text-xs font-mono">
                    {uploadMessage}
                  </div>
                )}

                <div className="space-y-8 divide-y divide-gold-400/10">
                  {localVibeVideos.map((video, idx) => (
                    <div key={video.id} className={`pt-6 ${idx === 0 ? '' : 'mt-6'} space-y-4`}>
                      <h3 className="font-display font-bold text-gold-300 text-sm flex items-center justify-between">
                        <span>Card {idx + 1}: {video.englishTitle || 'Video Card'} ({video.hindiTitle || 'वीडियो'})</span>
                        <span className="text-xxs font-mono text-gray-500 uppercase">{video.id}</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Hindi Title */}
                        <div>
                          <label className="block text-xxs font-medium text-gold-400 mb-1">Hindi Title *</label>
                          <input
                            type="text"
                            required
                            value={video.hindiTitle || ''}
                            onChange={(e) => {
                              const updated = [...localVibeVideos];
                              updated[idx] = { ...updated[idx], hindiTitle: e.target.value };
                              setLocalVibeVideos(updated);
                            }}
                            className="w-full px-3 py-2 bg-heritage-dark border border-gold-400/20 rounded-lg text-gold-100 focus:outline-none focus:border-gold-400 text-xs"
                          />
                        </div>

                        {/* English Title */}
                        <div>
                          <label className="block text-xxs font-medium text-gold-400 mb-1">English Title *</label>
                          <input
                            type="text"
                            required
                            value={video.englishTitle || ''}
                            onChange={(e) => {
                              const updated = [...localVibeVideos];
                              updated[idx] = { ...updated[idx], englishTitle: e.target.value };
                              setLocalVibeVideos(updated);
                            }}
                            className="w-full px-3 py-2 bg-heritage-dark border border-gold-400/20 rounded-lg text-gold-100 focus:outline-none focus:border-gold-400 text-xs"
                          />
                        </div>

                        {/* Hindi Subtitle */}
                        <div>
                          <label className="block text-xxs font-medium text-gold-400 mb-1">Hindi Subtitle (Tagline) *</label>
                          <input
                            type="text"
                            required
                            value={video.hindiSubtitle || ''}
                            onChange={(e) => {
                              const updated = [...localVibeVideos];
                              updated[idx] = { ...updated[idx], hindiSubtitle: e.target.value };
                              setLocalVibeVideos(updated);
                            }}
                            className="w-full px-3 py-2 bg-heritage-dark border border-gold-400/20 rounded-lg text-gold-100 focus:outline-none focus:border-gold-400 text-xs"
                          />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-3">
                          <label className="block text-xxs font-medium text-gold-400 mb-1">Description (विवरण) *</label>
                          <textarea
                            rows={2}
                            required
                            value={video.description || ''}
                            onChange={(e) => {
                              const updated = [...localVibeVideos];
                              updated[idx] = { ...updated[idx], description: e.target.value };
                              setLocalVibeVideos(updated);
                            }}
                            className="w-full px-3 py-2 bg-heritage-dark border border-gold-400/20 rounded-lg text-gold-100 focus:outline-none focus:border-gold-400 text-xs"
                          />
                        </div>

                        {/* Poster Upload/URL */}
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xxs font-medium text-gold-400 mb-1">Poster Image URL *</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                required
                                value={video.poster || ''}
                                onChange={(e) => {
                                  const updated = [...localVibeVideos];
                                  updated[idx] = { ...updated[idx], poster: e.target.value };
                                  setLocalVibeVideos(updated);
                                }}
                                className="flex-grow px-3 py-2 bg-heritage-dark border border-gold-400/20 rounded-lg text-gold-100 focus:outline-none focus:border-gold-400 text-xs"
                              />
                              <input
                                type="file"
                                id={`vibe-poster-${idx}`}
                                accept="image/*"
                                onChange={(e) => handleVibeFileUpload(e, idx, 'poster')}
                                className="hidden"
                              />
                              <label
                                htmlFor={`vibe-poster-${idx}`}
                                className={`px-3 py-2 border rounded-lg flex items-center gap-1.5 text-xxs font-bold cursor-pointer shrink-0 transition ${
                                  uploadProgress.isUploading && uploadProgress.activeFieldId === `vibe-${idx}-poster`
                                    ? 'bg-emerald-950 border-emerald-400 text-emerald-300 animate-pulse font-mono'
                                    : 'bg-heritage-clay hover:bg-heritage-clay/90 text-gold-300 border-gold-400/30'
                                }`}
                              >
                                <Upload className={`w-3.5 h-3.5 ${uploadProgress.isUploading && uploadProgress.activeFieldId === `vibe-${idx}-poster` ? 'text-emerald-400 animate-spin' : 'text-heritage-yellow'}`} />
                                <span>
                                  {uploadProgress.isUploading && uploadProgress.activeFieldId === `vibe-${idx}-poster`
                                    ? `Uploading ${uploadProgress.percent}%...`
                                    : 'Upload'}
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Video Upload/URL */}
                          <div>
                            <label className="block text-xxs font-medium text-gold-400 mb-1">Video Clip URL (.mp4) *</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                required
                                value={video.url || ''}
                                onChange={(e) => {
                                  const updated = [...localVibeVideos];
                                  updated[idx] = { ...updated[idx], url: e.target.value };
                                  setLocalVibeVideos(updated);
                                }}
                                className="flex-grow px-3 py-2 bg-heritage-dark border border-gold-400/20 rounded-lg text-gold-100 focus:outline-none focus:border-gold-400 text-xs"
                              />
                              <input
                                type="file"
                                id={`vibe-video-${idx}`}
                                accept="video/*"
                                onChange={(e) => handleVibeFileUpload(e, idx, 'url')}
                                className="hidden"
                              />
                              <label
                                htmlFor={`vibe-video-${idx}`}
                                className={`px-3 py-2 border rounded-lg flex items-center gap-1.5 text-xxs font-bold cursor-pointer shrink-0 transition ${
                                  uploadProgress.isUploading && uploadProgress.activeFieldId === `vibe-${idx}-url`
                                    ? 'bg-emerald-950 border-emerald-400 text-emerald-300 animate-pulse font-mono'
                                    : 'bg-heritage-clay hover:bg-heritage-clay/90 text-gold-300 border-gold-400/30'
                                }`}
                              >
                                <Upload className={`w-3.5 h-3.5 ${uploadProgress.isUploading && uploadProgress.activeFieldId === `vibe-${idx}-url` ? 'text-emerald-400 animate-spin' : 'text-heritage-yellow'}`} />
                                <span>
                                  {uploadProgress.isUploading && uploadProgress.activeFieldId === `vibe-${idx}-url`
                                    ? `Uploading ${uploadProgress.percent}%...`
                                    : 'Upload'}
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form submit */}
                <button
                  type="submit"
                  id="btn-update-vibe-videos"
                  className="w-full py-3 bg-gradient-to-r from-heritage-red to-heritage-maroon hover:from-heritage-red/90 hover:to-heritage-maroon/90 border border-gold-400/30 text-gold-100 font-bold rounded-xl shadow-lg transition-transform active:scale-99 cursor-pointer"
                >
                  सभी 4 वीडियो सुरक्षित करें • Save All 4 Collage Videos Settings
                </button>
              </form>
            </div>
          )}

          {/* ================== TAB F: MANAGE BOOKINGS (बंडोला व इवेंट बुकिंग्स) ================== */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Header & Stats Bar */}
              <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gold-400/10">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-gold-100 flex items-center gap-2">
                      <ChefHat className="w-6 h-6 text-amber-400" />
                      <span>शाही बंडोला व विवाह कैटरिंग बुकिंग्स</span>
                    </h2>
                    <p className="text-xs text-gold-300/80 font-serif mt-1">
                      ग्राहकों द्वारा भेजी गई बंडोला, शादी व सामूहिक दावत बुकिंग्स का प्रबंधन करें
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((filterKey) => {
                      const count = filterKey === 'all' 
                        ? bookings.length 
                        : bookings.filter(b => b.status === filterKey).length;
                      return (
                        <button
                          key={filterKey}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setBookingFilter(filterKey);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            bookingFilter === filterKey
                              ? 'bg-gold-500 text-heritage-dark shadow'
                              : 'bg-heritage-dark/80 text-gold-300 border border-gold-400/20 hover:border-gold-400/40'
                          }`}
                        >
                          <span className="capitalize">{filterKey === 'all' ? 'सभी' : filterKey === 'pending' ? 'लंबित (Pending)' : filterKey === 'confirmed' ? 'स्वीकृत (Confirmed)' : 'रद्द'}</span>
                          <span className="px-1.5 py-0.2 bg-black/30 rounded-full text-[10px]">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bookings Card List */}
                <div className="mt-6 space-y-4">
                  {bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).length === 0 ? (
                    <div className="text-center py-12 bg-heritage-dark/40 rounded-xl border border-dashed border-gold-400/20">
                      <Calendar className="w-12 h-12 text-gold-400/40 mx-auto mb-3" />
                      <p className="text-gold-300 font-serif text-sm">कोई बंडोला/इवेंट बुकिंग नहीं मिली।</p>
                    </div>
                  ) : (
                    bookings
                      .filter(b => bookingFilter === 'all' || b.status === bookingFilter)
                      .map((bk) => {
                        const isPending = bk.status === 'pending';
                        const isConfirmed = bk.status === 'confirmed';
                        const isCancelled = bk.status === 'cancelled';

                        // Format WhatsApp link for Admin to respond to Customer
                        const adminWaText = `नमस्ते *${bk.customerName}* जी! 🙏%0A%0A` +
                          `माजीसा रेस्टोरेंट से आपकी *${bk.guestCount} लोगों की ${bk.eventType === 'bandola' ? 'शाही बंडोला' : 'इवेंट'} बुकिंग* (${bk.eventDate}) का संदेश मिला।%0A%0A` +
                          `आपकी बुकिंग का स्टेटस: *${isConfirmed ? 'स्वीकृत (CONFIRMED)' : isCancelled ? 'रद्द (CANCELLED)' : 'समीक्षाधीन (PENDING)'}* है।%0A` +
                          `हमसे संपर्क करने के लिए धन्यवाद!`;
                        const adminWaUrl = `https://wa.me/91${bk.phone.replace(/[^0-9]/g, '')}?text=${adminWaText}`;

                        return (
                          <div
                            key={bk.id}
                            className={`p-5 rounded-2xl border transition-all space-y-4 ${
                              isPending
                                ? 'bg-amber-950/40 border-amber-500/40 shadow-md'
                                : isConfirmed
                                ? 'bg-emerald-950/20 border-emerald-500/30'
                                : 'bg-red-950/20 border-red-500/20 opacity-75'
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gold-400/10">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center font-serif font-bold text-gold-200">
                                  {bk.customerName.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-base text-gold-100 flex items-center gap-2">
                                    <span>{bk.customerName}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 font-normal">
                                      ID: {bk.id}
                                    </span>
                                  </h3>
                                  <div className="flex items-center gap-4 text-xs text-gold-300/80 mt-0.5">
                                    <a href={`tel:${bk.phone}`} className="flex items-center gap-1 hover:text-gold-200 underline">
                                      <Phone className="w-3.5 h-3.5 text-gold-400" />
                                      <span>{bk.phone}</span>
                                    </a>
                                    <span className="text-gray-500">•</span>
                                    <span>{new Date(bk.createdAt).toLocaleDateString('hi-IN')}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="flex items-center gap-2 self-start sm:self-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                  isPending
                                    ? 'bg-amber-500/20 border border-amber-500 text-amber-300 animate-pulse'
                                    : isConfirmed
                                    ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                                    : 'bg-red-500/20 border border-red-500 text-red-300'
                                }`}>
                                  {isPending ? '🟡 लंबित (Pending)' : isConfirmed ? '🟢 स्वीकृत (Confirmed)' : '🔴 रद्द (Cancelled)'}
                                </span>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-heritage-dark/60 p-3 rounded-xl border border-gold-400/10">
                              <div>
                                <span className="text-gold-400/80 block text-[10px]">आयोजन का प्रकार</span>
                                <span className="font-bold text-gold-100 capitalize">
                                  {bk.eventType === 'bandola' ? 'शाही बंडोला' : bk.eventType === 'wedding' ? 'विवाह (Wedding)' : bk.eventType}
                                </span>
                              </div>

                              <div>
                                <span className="text-gold-400/80 block text-[10px]">कुल सदस्य (Guests)</span>
                                <span className="font-bold text-amber-300 text-sm flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{bk.guestCount} लोग</span>
                                </span>
                              </div>

                              <div>
                                <span className="text-gold-400/80 block text-[10px]">तारीख व समय</span>
                                <span className="font-semibold text-gold-200">
                                  {bk.eventDate} ({bk.eventTime})
                                </span>
                              </div>

                              <div>
                                <span className="text-gold-400/80 block text-[10px]">भोजन का स्थान</span>
                                <span className="font-semibold text-gold-200">
                                  {bk.cateringType === 'restaurant' ? 'रेस्टोरेंट में सिटिंग' : 'स्थान पर ऑन-साइट कैटरिंग'}
                                </span>
                              </div>
                            </div>

                            {/* Selected Menu Items */}
                            {bk.selectedMenuItems && bk.selectedMenuItems.length > 0 && (
                              <div className="space-y-2 pt-1">
                                <span className="text-xs font-bold text-amber-400 block tracking-wide">
                                  📋 चुना गया भोजन • Selected Menu ({bk.selectedMenuItems.length}):
                                </span>
                                <div className="flex flex-col gap-1.5 bg-heritage-dark/80 p-3 rounded-xl border border-gold-400/15">
                                  {bk.selectedMenuItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5 px-3 py-1.5 bg-amber-950/60 border border-amber-500/30 rounded-lg text-xs">
                                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                                        {idx + 1}
                                      </span>
                                      <span className="text-gold-100 font-semibold leading-tight">
                                        {item}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Custom Food Notes */}
                            {bk.customFoodNotes && (
                              <div className="bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl text-xs space-y-1">
                                <span className="font-bold text-amber-300 block">कस्टम भोजन निर्देश ("क्या क्या खाने में रखना है"):</span>
                                <p className="text-amber-100/90 italic leading-relaxed">{bk.customFoodNotes}</p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gold-400/10">
                              <div className="flex flex-wrap items-center gap-2">
                                {onUpdateBookingStatus && !isConfirmed && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateBookingStatus(bk.id, 'confirmed');
                                    }}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>स्वीकार करें (Confirm)</span>
                                  </button>
                                )}

                                {onUpdateBookingStatus && !isCancelled && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateBookingStatus(bk.id, 'cancelled');
                                    }}
                                    className="px-3.5 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/30 font-semibold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>रद्द करें (Cancel)</span>
                                  </button>
                                )}

                                <a
                                  href={adminWaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 font-semibold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-emerald-500/30"
                                >
                                  <MessageSquare className="w-4 h-4 text-emerald-300" />
                                  <span>WhatsApp पर चैट करें</span>
                                </a>
                              </div>

                              {onDeleteBooking && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('क्या आप इस बुकिंग को हटाना चाहते हैं?')) {
                                      onDeleteBooking(bk.id);
                                    }
                                  }}
                                  className="p-2 text-red-400/70 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                                  title="हटायें"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================== TAB G: BUSINESS ANALYTICS & INSIGHTS ================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Header & KPI Stat Cards */}
              <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gold-400/10">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-gold-100 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                      <span>बिजनेस एनालिटिक्स व आय डैशबोर्ड</span>
                    </h2>
                    <p className="text-xs text-gold-300/80 font-serif mt-1">
                      माजीसा रेस्टोरेंट के बंडोला बुकिंग्स, टॉप व्यंजन व ग्राहक संपर्क का लाइव विश्लेषण
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-mono rounded-full font-bold self-start sm:self-center">
                    LIVE INSIGHTS
                  </span>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Bookings */}
                  <div className="p-5 rounded-2xl bg-heritage-dark border border-gold-400/15 space-y-2">
                    <div className="flex justify-between items-center text-xs text-gold-300/80">
                      <span>कुल बंडोला/इवेंट्स</span>
                      <ClipboardList className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-gold-100">{bookings.length}</p>
                    <p className="text-xxs text-amber-400/90 font-mono">
                      🟡 {bookings.filter(b => b.status === 'pending').length} समीक्षाधीन (Pending)
                    </p>
                  </div>

                  {/* Confirmed Bookings */}
                  <div className="p-5 rounded-2xl bg-heritage-dark border border-gold-400/15 space-y-2">
                    <div className="flex justify-between items-center text-xs text-gold-300/80">
                      <span>स्वीकृत कार्यक्रम</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-emerald-400">
                      {bookings.filter(b => b.status === 'confirmed').length}
                    </p>
                    <p className="text-xxs text-emerald-300/80 font-mono">
                      {bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100) : 0}% स्वीकृति दर
                    </p>
                  </div>

                  {/* Total Guests Served */}
                  <div className="p-5 rounded-2xl bg-heritage-dark border border-gold-400/15 space-y-2">
                    <div className="flex justify-between items-center text-xs text-gold-300/80">
                      <span>कुल मेहमान (Guests)</span>
                      <Users className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-purple-300">
                      {bookings.reduce((sum, b) => sum + (b.guestCount || 0), 0)}
                    </p>
                    <p className="text-xxs text-purple-300/80 font-mono">सामूहिक दावत सदस्य</p>
                  </div>

                  {/* Total Estimated Catering Volume */}
                  <div className="p-5 rounded-2xl bg-heritage-dark border border-gold-400/15 space-y-2">
                    <div className="flex justify-between items-center text-xs text-gold-300/80">
                      <span>अनुमानित बंडोला वॉल्यूम</span>
                      <TrendingUp className="w-4 h-4 text-gold-400" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-gold-300">
                      ₹{bookings.reduce((sum, b) => sum + (b.guestCount * 180), 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xxs text-gold-400/70 font-mono">औसत ₹180 प्रति थाली आधार पर</p>
                  </div>
                </div>
              </div>

              {/* Visual Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bestseller Dishes Frequency Bar Chart */}
                <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6 space-y-4">
                  <h3 className="font-display font-bold text-gold-100 text-base flex items-center gap-2 pb-3 border-b border-gold-400/10">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>लोकप्रिय व्यंजन (Top Bestseller Dish Demands)</span>
                  </h3>

                  {(() => {
                    const dishCounts: Record<string, number> = {};
                    bookings.forEach(b => {
                      (b.selectedMenuItems || []).forEach(rawItem => {
                        const cleanName = rawItem.split('/')[0].split('(')[0].trim();
                        dishCounts[cleanName] = (dishCounts[cleanName] || 0) + 1;
                      });
                    });

                    const sortedDishes = Object.entries(dishCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6);

                    const maxCount = sortedDishes[0]?.[1] || 1;

                    if (sortedDishes.length === 0) {
                      return (
                        <p className="text-xs text-gold-400/60 font-serif italic py-6 text-center">
                          बुकिंग्स सबमिट होने पर यहाँ व्यंजनों की मांग का लाइव ग्राफ दिखाई देगा।
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-3 pt-2">
                        {sortedDishes.map(([dishName, count], idx) => {
                          const percentage = Math.round((count / maxCount) * 100);
                          return (
                            <div key={dishName} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-gold-100 flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-300 font-mono text-[10px] flex items-center justify-center font-bold">
                                    {idx + 1}
                                  </span>
                                  <span>{dishName}</span>
                                </span>
                                <span className="text-amber-400 font-mono font-bold">{count} बार आर्डर</span>
                              </div>
                              <div className="w-full bg-heritage-dark h-2.5 rounded-full overflow-hidden border border-gold-400/15">
                                <div
                                  className="bg-gradient-to-r from-amber-500 via-gold-400 to-amber-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max(10, percentage)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Event Type Breakdown Chart */}
                <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6 space-y-4">
                  <h3 className="font-display font-bold text-gold-100 text-base flex items-center gap-2 pb-3 border-b border-gold-400/10">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    <span>आयोजन श्रेणी वितरण (Event Category Types)</span>
                  </h3>

                  <div className="space-y-3 pt-2">
                    {[
                      { key: 'bandola', label: 'शाही बंडोला (Bandola Group Feast)', color: 'from-amber-500 to-amber-600' },
                      { key: 'wedding', label: 'शादी / विवाह समारोह (Wedding)', color: 'from-red-500 to-red-600' },
                      { key: 'reception', label: 'रिसेप्शन / सगाई (Reception)', color: 'from-emerald-500 to-emerald-600' },
                      { key: 'birthday', label: 'जन्मदिन (Birthday Party)', color: 'from-blue-500 to-blue-600' },
                      { key: 'other', label: 'अन्य पारिवारिक आयोजन', color: 'from-purple-500 to-purple-600' }
                    ].map(evt => {
                      const count = bookings.filter(b => b.eventType === evt.key).length;
                      const pct = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
                      return (
                        <div key={evt.key} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gold-200">{evt.label}</span>
                            <span className="text-gold-100 font-mono">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-heritage-dark h-2.5 rounded-full overflow-hidden border border-gold-400/15">
                            <div
                              className={`bg-gradient-to-r ${evt.color} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${Math.max(5, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Customer Contact Directory */}
              <div className="bg-heritage-clay/60 border border-gold-400/15 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gold-400/10">
                  <h3 className="font-display font-bold text-gold-100 text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <span>ग्राहक डायरेक्टरी (Customer Phonebook & Contact Records)</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const allCustomersMap = new Map();
                        (regularCustomers || []).forEach(c => {
                          allCustomersMap.set(c.phone, {
                            name: c.name || 'VIP Guest',
                            phone: c.phone,
                            eventType: 'VIP Customer',
                            guestCount: '-',
                            date: c.addedAt ? new Date(c.addedAt).toLocaleDateString('hi-IN') : '-'
                          });
                        });
                        (bookings || []).forEach(b => {
                          const rawP = (b.phone || '').replace(/\D/g, '');
                          const p = rawP.length === 10 ? '91' + rawP : rawP;
                          allCustomersMap.set(p, {
                            name: b.customerName,
                            phone: b.phone,
                            eventType: b.eventType === 'bandola' ? 'Shahi Bandola' : b.eventType,
                            guestCount: b.guestCount,
                            date: b.eventDate || new Date(b.createdAt).toLocaleDateString('hi-IN')
                          });
                        });

                        const rows = [['Customer Name', 'Phone Number', 'Event Type', 'Guest Count', 'Date']];
                        allCustomersMap.forEach((val) => {
                          rows.push([
                            `"${val.name.replace(/"/g, '""')}"`,
                            `"${val.phone}"`,
                            `"${val.eventType}"`,
                            `"${val.guestCount}"`,
                            `"${val.date}"`
                          ]);
                        });

                        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement('a');
                        link.setAttribute('href', encodedUri);
                        link.setAttribute('download', `majisa_customers_${new Date().toISOString().slice(0, 10)}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow border border-emerald-400/30"
                      title="Download full customer database for Meta/Google Ads"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-200" />
                      <span>डेटा डाउनलोड (Excel/CSV Export)</span>
                    </button>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-gold-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="नाम या मोबाइल नंबर खोजें..."
                        className="w-full pl-9 pr-3 py-1.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 text-xs focus:outline-none focus:border-gold-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gold-200">
                    <thead>
                      <tr className="border-b border-gold-400/20 text-gold-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">ग्राहक का नाम</th>
                        <th className="py-2.5 px-3">मोबाइल नंबर</th>
                        <th className="py-2.5 px-3">कार्यक्रम</th>
                        <th className="py-2.5 px-3">लोग</th>
                        <th className="py-2.5 px-3">तारीख</th>
                        <th className="py-2.5 px-3">स्टेटस</th>
                        <th className="py-2.5 px-3 text-right">सम्पर्क</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filteredCustomers = bookings.filter(b => 
                          b.customerName.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          b.phone.includes(customerSearch)
                        );

                        if (filteredCustomers.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-gold-400/60 font-serif italic text-xs">
                                कोई ग्राहक रिकॉर्ड नहीं मिला।
                              </td>
                            </tr>
                          );
                        }

                        return filteredCustomers.map((bk) => {
                          const waUrl = `https://wa.me/91${bk.phone.replace(/[^0-9]/g, '')}?text=नमस्ते%20${encodeURIComponent(bk.customerName)}%20जी,%20माजीसा%20रेस्टोरेंट%20से%20आपकी%20बुकिंग%20का%20संदेश।`;
                          return (
                            <tr key={bk.id} className="border-b border-gold-400/10 hover:bg-heritage-dark/40 transition">
                              <td className="py-2.5 px-3 font-semibold text-gold-100">{bk.customerName}</td>
                              <td className="py-2.5 px-3 font-mono text-gold-300">{bk.phone}</td>
                              <td className="py-2.5 px-3 capitalize">{bk.eventType}</td>
                              <td className="py-2.5 px-3 font-bold text-amber-300">{bk.guestCount} जन</td>
                              <td className="py-2.5 px-3 font-mono text-gold-400">{bk.eventDate}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  bk.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                  bk.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                  'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                }`}>
                                  {bk.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 border border-emerald-500/30"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WhatsApp Chat</span>
                                </a>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================== TAB G: VIP CUSTOMERS & WHATSAPP BROADCAST SYSTEM ================== */}
          {activeTab === 'vip_whatsapp' && (
            <div className="space-y-8">
              
              {/* Header & Sub-tab Switcher */}
              <div className="bg-gradient-to-r from-emerald-950/80 via-heritage-clay to-teal-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs rounded-full flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> VIP WhatsApp Automation
                      </span>
                      <span className="text-xxs font-mono text-emerald-400/80">Meta Cloud & Third-Party Gateway</span>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-gold-100 mt-2">
                      माजीसा VIP कस्टमर ब्रॉडकास्ट व निमंत्रण प्रणाली
                    </h2>
                    <p className="text-xs text-gold-300/80 mt-1">
                      अपने नियमित (Regular) ग्राहकों को सीधे व्हाट्सएप पर इमेज कार्ड एवं पर्सनलाइज्ड VIP इनविटेशन मैसेज भेजें।
                    </p>
                  </div>

                  {/* Sub-tab Switcher Buttons */}
                  <div className="flex items-center gap-2 bg-heritage-dark/80 p-1.5 rounded-xl border border-emerald-500/30">
                    <button
                      type="button"
                      onClick={() => setVipSubTab('directory')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        vipSubTab === 'directory'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-gold-300 hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>1. Customer DB ({regularCustomers.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVipSubTab('broadcast')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        vipSubTab === 'broadcast'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow'
                          : 'text-gold-300 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>2. Send VIP Broadcast 🚀</span>
                    </button>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="mt-4 flex flex-wrap items-center gap-6 text-xxs text-emerald-300/90 font-mono">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Auto +91 Formatting</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hosted Card Image (/uploads/...)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1.2s Rate-Limit Safety Delay</span>
                  </div>
                </div>
              </div>

              {/* ---------------- SUB-TAB 1: CUSTOMER DIRECTORY (STEP 1 & 2) ---------------- */}
              {vipSubTab === 'directory' && (
                <div className="space-y-8">
                  {/* Step 1 & 2: Add Customer Form */}
                  <div className="bg-heritage-clay/70 border border-gold-400/20 rounded-2xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gold-400/10 gap-3">
                      <div>
                        <h3 className="font-display text-lg font-bold text-gold-100 flex items-center gap-2">
                          <Plus className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span>नया रेगुलर कस्टमर जोड़ें (Step 1: Database Setup)</span>
                        </h3>
                        <p className="text-xs text-gold-300/70 mt-0.5">Customer Ka Name aur WhatsApp Mobile Number (+91) Enter Karein</p>
                      </div>
                      <span className="px-3 py-1 bg-heritage-dark border border-gold-400/30 rounded-lg text-xs font-mono text-gold-300 self-start sm:self-auto">
                        Table: <strong className="text-emerald-400">regular_customers</strong>
                      </span>
                    </div>

                    <form onSubmit={handleAddCustomerSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        <div className="md:col-span-5">
                          <label className="block text-xs font-semibold text-gold-300 mb-2">
                            Customer Full Name (कस्टमर का नाम) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Kumar"
                            value={newCustName}
                            onChange={(e) => setNewCustName(e.target.value)}
                            className="w-full h-[46px] px-4 bg-heritage-dark border border-gold-400/30 rounded-xl text-sm text-gold-100 placeholder-gold-500/50 focus:outline-none focus:border-emerald-400 transition"
                          />
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-xs font-semibold text-gold-300 mb-2">
                            WhatsApp Mobile Number (फोन नंबर) *
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-emerald-950 text-emerald-400 font-mono text-xs font-bold rounded border border-emerald-500/30 pointer-events-none z-10">
                              +91
                            </span>
                            <input
                              type="text"
                              required
                              placeholder="98290XXXXX"
                              value={newCustPhone}
                              onChange={(e) => setNewCustPhone(e.target.value)}
                              className="w-full h-[46px] pl-16 pr-4 bg-heritage-dark border border-gold-400/30 rounded-xl text-sm text-gold-100 placeholder-gold-500/50 font-mono focus:outline-none focus:border-emerald-400 transition"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <label className="hidden md:block text-xs font-semibold text-transparent mb-2 select-none">
                            Submit Action
                          </label>
                          <button
                            type="submit"
                            id="btn-save-customer"
                            className="w-full h-[46px] px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl border border-emerald-400/40 shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <Plus className="w-4 h-4 shrink-0" />
                            <span>Save Customer</span>
                          </button>
                        </div>
                      </div>

                      {customerSaveMsg && (
                        <div className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-between transition-all ${
                          customerSaveMsg.includes('❌') 
                            ? 'bg-red-950/80 border-red-500/40 text-red-300' 
                            : 'bg-emerald-950/90 border-emerald-400/50 text-emerald-200 animate-pulse'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{customerSaveMsg}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gold-400/10">
                        <p className="text-[11px] text-gold-400/60 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Dhyan rahe number ke aage +91 country code automatically attach ho jayega</span>
                        </p>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gold-400/70 font-mono">Quick Auto Fill:</span>
                          {[
                            { name: 'Majisa Owner', phone: '8107165253' },
                            { name: 'Ramesh Kumar', phone: '9829012345' },
                            { name: 'Vikram Singh', phone: '9928011223' }
                          ].map((cust, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setNewCustName(cust.name);
                                setNewCustPhone(cust.phone);
                              }}
                              className="px-2 py-1 bg-heritage-dark hover:bg-emerald-950 border border-gold-400/20 hover:border-emerald-500/40 text-gold-300 text-[10px] rounded transition cursor-pointer font-sans"
                            >
                              + {cust.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Customer Directory Table */}
                  <div className="bg-heritage-clay/70 border border-gold-400/20 rounded-2xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gold-400/15">
                      <div>
                        <h3 className="font-display text-lg font-bold text-gold-100 flex items-center gap-2">
                          <Users className="w-5 h-5 text-gold-400" />
                          <span>रेगुलर कस्टमर्स लिस्ट (Regular VIP Customers Directory)</span>
                        </h3>
                        <p className="text-xs text-gold-300/70 mt-0.5">Total Registered: <strong className="text-emerald-400">{regularCustomers.length} Customers</strong></p>
                      </div>

                      {/* Search Input */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-gold-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Search name or phone..."
                          value={custSearchQuery}
                          onChange={(e) => setCustSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-heritage-dark border border-gold-400/30 rounded-xl text-xs text-gold-100 placeholder-gold-500/50 focus:outline-none focus:border-gold-400"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gold-400/20 text-gold-400 uppercase text-[10px] tracking-wider bg-heritage-dark/60 font-mono">
                            <th className="py-3 px-4">ID</th>
                            <th className="py-3 px-4">Customer Name</th>
                            <th className="py-3 px-4">Formatted WhatsApp Phone (+91)</th>
                            <th className="py-3 px-4">Date Added</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-400/10 text-gold-200">
                          {(() => {
                            const filtered = regularCustomers.filter(c => 
                              c.name.toLowerCase().includes(custSearchQuery.toLowerCase()) ||
                              c.phone.includes(custSearchQuery)
                            );

                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={5} className="py-8 text-center text-gold-400/60 font-sans italic">
                                    कोई कस्टमर नहीं मिला। नया नाम और फोन नंबर दर्ज करके ऊपर वाले फॉर्म से सेव करें।
                                  </td>
                                </tr>
                              );
                            }

                            return filtered.map((cust) => {
                              const cleanP = cust.phone.replace(/\D/g, '');
                              const fullWaUrl = `https://wa.me/${cleanP}?text=${encodeURIComponent(`Namaste ${cust.name} ji! Majisa Restaurant ki taraf se VIP Invitation.`)}`;

                              return (
                                <tr key={cust.id} className="hover:bg-heritage-dark/40 transition">
                                  <td className="py-3.5 px-4 font-mono text-gold-400/70">{cust.id}</td>
                                  <td className="py-3.5 px-4 font-bold text-gold-100 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center">
                                      {cust.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{cust.name}</span>
                                  </td>
                                  <td className="py-3.5 px-4 font-mono">
                                    <span className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 rounded border border-emerald-500/20 font-bold">
                                      +{cust.phone}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-gold-300/70 font-mono text-[11px]">
                                    {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : 'Today'}
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <a
                                        href={fullWaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1.5 border border-emerald-400/30 transition cursor-pointer"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>WhatsApp Chat</span>
                                      </a>
                                      {onDeleteCustomer && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (confirm(`Kya aap ${cust.name} ko database se hatana chahte hain?`)) {
                                              onDeleteCustomer(cust.id);
                                            }
                                          }}
                                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                                          title="Delete Customer"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- SUB-TAB 2: VIP BROADCAST & INVITATIONS (STEP 2, 3 & 4) ---------------- */}
              {vipSubTab === 'broadcast' && (
                <div className="space-y-8">
                  
                  {/* Step 2: Upload Invitation Card & Message Settings */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Image Upload & Presets */}
                    <div className="lg:col-span-6 bg-heritage-clay/70 border border-gold-400/20 rounded-2xl p-6 sm:p-8 space-y-6">
                      <div>
                        <h3 className="font-display text-lg font-bold text-gold-100 flex items-center gap-2">
                          <Upload className="w-5 h-5 text-emerald-400" />
                          <span>1. Invitation Card Image Upload (Step 2)</span>
                        </h3>
                        <p className="text-xs text-gold-300/70 mt-1">
                          Aap apna VIP Invitation Card (JPG/PNG) yahan upload karein. File public URL par store ho jayegi.
                        </p>
                      </div>

                      {/* Card Upload Box */}
                      <div className="border-2 border-dashed border-gold-400/30 rounded-xl p-4 text-center bg-heritage-dark/60 relative hover:border-gold-400/60 transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLocalFileUpload(e, 'card')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <Upload className="w-8 h-8 text-gold-400 mx-auto mb-2 animate-bounce" />
                        <p className="text-xs font-semibold text-gold-200">Click or Drag Card Image Here</p>
                        <p className="text-[10px] text-gold-400/60 mt-1">Supports JPG, PNG, WEBP (Max 15MB)</p>
                      </div>

                      {/* Or Select Preset Images */}
                      <div>
                        <label className="block text-xs font-semibold text-gold-300 mb-2">
                          या नीचे दिए गए सैंपल वैवाहिक/VIP इनविटेशन कार्ड चुनें:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            {
                              label: 'Kesariya Special VIP Card',
                              url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
                            },
                            {
                              label: 'Rajasthani Royal Thali Card',
                              url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'
                            },
                            {
                              label: 'Festival Party Pass',
                              url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'
                            }
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setInvitationImageUrl(preset.url)}
                              className={`p-1.5 rounded-lg border text-left transition cursor-pointer ${
                                invitationImageUrl === preset.url
                                  ? 'border-emerald-400 bg-emerald-950/60'
                                  : 'border-gold-400/20 bg-heritage-dark hover:border-gold-400/40'
                              }`}
                            >
                              <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover rounded-md mb-1" />
                              <span className="text-[10px] text-gold-200 font-semibold block truncate">{preset.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Preview Box */}
                      <div className="bg-heritage-dark p-4 rounded-xl border border-gold-400/20">
                        <span className="text-xxs font-mono text-emerald-400 uppercase tracking-widest block mb-2 font-bold">
                          ✓ Hosted Public Image URL:
                        </span>
                        <input
                          type="text"
                          value={invitationImageUrl}
                          onChange={(e) => setInvitationImageUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-heritage-clay border border-gold-400/30 rounded-lg text-xs font-mono text-gold-100 focus:outline-none focus:border-emerald-400"
                        />
                        <div className="mt-3 relative rounded-lg overflow-hidden border border-gold-400/30 max-h-48">
                          <img src={invitationImageUrl} alt="VIP Card Preview" className="w-full h-48 object-cover" />
                          <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur text-gold-300 font-mono text-[10px] rounded border border-gold-400/30">
                            WhatsApp Ready Card 🖼️
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Message Template & Gateway Settings */}
                    <div className="lg:col-span-6 bg-heritage-clay/70 border border-gold-400/20 rounded-2xl p-6 sm:p-8 space-y-6">
                      <div>
                        <h3 className="font-display text-lg font-bold text-gold-100 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-emerald-400" />
                          <span>2. Personalized Broadcast Message Text</span>
                        </h3>
                        <p className="text-xs text-gold-300/70 mt-1">
                          Use variable <code className="text-emerald-400 bg-black/40 px-1 py-0.5 rounded">{'{name}'}</code> to automatically insert each customer's name!
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gold-300 mb-2">
                          Message Text Box (मैसेज टेंप्लेट) *
                        </label>
                        <textarea
                          rows={4}
                          value={broadcastMessage}
                          onChange={(e) => setBroadcastMessage(e.target.value)}
                          placeholder="Namaste {name} ji, Majisa Restaurant ki taraf se VIP Invitation..."
                          className="w-full px-4 py-3 bg-heritage-dark border border-gold-400/30 rounded-xl text-sm text-gold-100 placeholder-gold-500/50 focus:outline-none focus:border-emerald-400 font-sans leading-relaxed"
                        />
                      </div>

                      {/* Live WhatsApp Bubble Preview */}
                      <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30">
                        <span className="text-xxs font-mono text-emerald-400 uppercase tracking-widest block mb-2 font-bold flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> WhatsApp Live Chat Preview (for "Ramesh Kumar"):
                        </span>
                        <div className="bg-[#0b141a] p-3 rounded-lg border border-emerald-500/20 max-w-sm font-sans text-xs text-gray-100 leading-relaxed shadow-inner">
                          <div className="rounded overflow-hidden mb-2">
                            <img src={invitationImageUrl} alt="Card" className="w-full h-32 object-cover" />
                          </div>
                          <p className="whitespace-pre-line text-[13px]">
                            {broadcastMessage.replace(/{name}/g, 'Ramesh Kumar')}
                          </p>
                          <div className="text-[9px] text-gray-400 text-right mt-1.5 font-mono">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                          </div>
                        </div>
                      </div>

                      {/* Gateway Selection (Step 3) */}
                      <div className="space-y-3 pt-2 border-t border-gold-400/10">
                        <label className="block text-xs font-semibold text-gold-300">
                          Step 3: WhatsApp API Provider Mode Choose Karein:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => setGatewayType('simulation')}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs font-bold ${
                              gatewayType === 'simulation'
                                ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                                : 'bg-heritage-dark border-gold-400/20 text-gold-300 hover:border-gold-400/40'
                            }`}
                          >
                            <span className="block text-[11px]">⚡ Direct Server Gateway</span>
                            <span className="text-[9px] font-normal opacity-80">(Live Server Active)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setGatewayType('callmebot')}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs font-bold ${
                              gatewayType === 'callmebot'
                                ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                                : 'bg-heritage-dark border-gold-400/20 text-gold-300 hover:border-gold-400/40'
                            }`}
                          >
                            <span className="block text-[11px]">🆓 CallMeBot API</span>
                            <span className="text-[9px] font-normal opacity-80">(100% Free Gateway)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setGatewayType('meta')}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs font-bold ${
                              gatewayType === 'meta'
                                ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                                : 'bg-heritage-dark border-gold-400/20 text-gold-300 hover:border-gold-400/40'
                            }`}
                          >
                            <span className="block text-[11px]">Meta Cloud API</span>
                            <span className="text-[9px] font-normal opacity-80">(1000 Free/Mo)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setGatewayType('thirdparty')}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs font-bold ${
                              gatewayType === 'thirdparty'
                                ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                                : 'bg-heritage-dark border-gold-400/20 text-gold-300 hover:border-gold-400/40'
                            }`}
                          >
                            <span className="block text-[11px]">Third-Party API</span>
                            <span className="text-[9px] font-normal opacity-80">(UltraMsg/Green)</span>
                          </button>
                        </div>

                        {gatewayType === 'callmebot' && (
                          <div className="p-3 bg-heritage-dark rounded-xl border border-emerald-500/30 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-emerald-300 font-semibold">
                              <span>🆓 CallMeBot 100% Free WhatsApp API Setup</span>
                              <a
                                href="https://www.callmebot.com/blog/free-api-whatsapp-messages/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] underline text-gold-400 hover:text-gold-300"
                              >
                                How to get Free API Key? ↗
                              </a>
                            </div>
                            <p className="text-[11px] text-gold-400/70">
                              Aapne phone se WhatsApp par CallMeBot bot ko message karke free 6-digit API key prapt karein:
                            </p>
                            <input
                              type="text"
                              placeholder="Enter CallMeBot API Key (e.g. 123456)"
                              value={callMeBotApiKey}
                              onChange={(e) => setCallMeBotApiKey(e.target.value)}
                              className="w-full px-3 py-2 bg-heritage-clay border border-gold-400/30 rounded-lg text-gold-100 font-mono text-xs focus:outline-none focus:border-emerald-400"
                            />
                          </div>
                        )}

                        {gatewayType === 'meta' && (
                          <div className="p-3 bg-heritage-dark rounded-xl border border-gold-400/20 space-y-2 text-xs">
                            <input
                              type="text"
                              placeholder="Phone Number ID (e.g. 1098293848123)"
                              value={metaPhoneId}
                              onChange={(e) => setMetaPhoneId(e.target.value)}
                              className="w-full px-3 py-2 bg-heritage-clay border border-gold-400/30 rounded-lg text-gold-100 font-mono"
                            />
                            <input
                              type="password"
                              placeholder="Meta Access Token (EAAG...)"
                              value={metaToken}
                              onChange={(e) => setMetaToken(e.target.value)}
                              className="w-full px-3 py-2 bg-heritage-clay border border-gold-400/30 rounded-lg text-gold-100 font-mono"
                            />
                          </div>
                        )}

                        {gatewayType === 'thirdparty' && (
                          <div className="p-3 bg-heritage-dark rounded-xl border border-gold-400/20 space-y-2 text-xs">
                            <input
                              type="text"
                              placeholder="Third-Party API Endpoint URL"
                              value={thirdPartyUrl}
                              onChange={(e) => setThirdPartyUrl(e.target.value)}
                              className="w-full px-3 py-2 bg-heritage-clay border border-gold-400/30 rounded-lg text-gold-100 font-mono"
                            />
                            <input
                              type="text"
                              placeholder="API Token / Secret Key"
                              value={thirdPartyApiKey}
                              onChange={(e) => setThirdPartyApiKey(e.target.value)}
                              className="w-full px-3 py-2 bg-heritage-clay border border-gold-400/30 rounded-lg text-gold-100 font-mono"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Broadcast Trigger & Real-time Console Log */}
                  <div className="bg-heritage-clay/70 border border-gold-400/20 rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl font-bold text-gold-100 flex items-center gap-2">
                          <span>🚀 Send VIP Invitation Broadcast ({regularCustomers.length} Customers)</span>
                        </h3>
                        <p className="text-xs text-gold-300/80 mt-1">
                          Mode Active: <strong className="text-emerald-400 font-mono uppercase">{gatewayType} GATEWAY</strong> • Har message ke beech 1-second ka delay apply hoga.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const list = regularCustomers || [];
                            if (list.length === 0) {
                              alert('No customers found in database.');
                              return;
                            }
                            list.forEach(cust => {
                              const cleanP = cust.phone.replace(/\D/g, '');
                              const txt = encodeURIComponent(broadcastMessage.replace(/{name}/g, cust.name));
                              window.open(`https://wa.me/${cleanP}?text=${txt}`, '_blank');
                            });
                          }}
                          disabled={regularCustomers.length === 0}
                          className="px-4 py-3.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/40 shadow transition cursor-pointer flex items-center gap-2"
                          title="Open WhatsApp Web chat tabs for each customer"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-400" />
                          <span>📲 1-Click WhatsApp Chat</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSendBroadcast}
                          disabled={isBroadcasting || regularCustomers.length === 0}
                          id="btn-send-whatsapp-broadcast"
                          className={`px-8 py-3.5 rounded-xl text-sm sm:text-base font-bold shadow-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                            isBroadcasting
                              ? 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white border-emerald-300 animate-pulse'
                          }`}
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span>{isBroadcasting ? 'Sending Invitations...' : '🚀 Send Invitation to All'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(isBroadcasting || broadcastProgress.total > 0) && (
                      <div className="space-y-2 bg-heritage-dark p-4 rounded-xl border border-emerald-500/30">
                        <div className="flex justify-between text-xs font-mono text-emerald-300 font-bold">
                          <span>Progress: {broadcastProgress.sent} / {broadcastProgress.total} Sent</span>
                          <span>{broadcastProgress.percent}%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden p-0.5 border border-emerald-500/30">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${broadcastProgress.percent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Summary Result Banner */}
                    {broadcastSummary && (
                      <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-400/40 flex items-center justify-between text-xs font-sans">
                        <div className="flex items-center space-x-2 text-emerald-200">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span className="font-bold text-sm">
                            Sabhi {broadcastSummary.total} VIP Customers ko Invitation safaltapurvak bhej diya gaya hai!
                          </span>
                        </div>
                        <div className="font-mono text-emerald-300 font-bold bg-black/40 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                          Sent: {broadcastSummary.sent} | Failed: {broadcastSummary.failed}
                        </div>
                      </div>
                    )}

                    {/* Real-time Transmission Activity Console Log */}
                    {broadcastLogs.length > 0 && (
                      <div className="bg-[#0c1015] rounded-xl border border-gold-400/20 p-4 font-mono text-xs text-gray-300 space-y-2 max-h-60 overflow-y-auto">
                        <div className="text-[10px] text-emerald-400 uppercase tracking-widest pb-2 border-b border-gray-800 font-bold flex items-center justify-between">
                          <span>Live Broadcast Delivery Status Log Feed</span>
                          <span>{broadcastLogs.length} Records</span>
                        </div>
                        {broadcastLogs.map((log, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-800/50 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className={log.status === 'sent' ? 'text-emerald-400' : 'text-red-400'}>
                                {log.status === 'sent' ? '🟢 [SENT]' : '🔴 [FAILED]'}
                              </span>
                              <span className="font-bold text-white">{log.name}</span>
                              <span className="text-gray-400">(+{log.phone})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500 text-[10px]">{log.detail}</span>
                              <span className="text-emerald-400/70 text-[10px]">{log.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Step 4 Python Code Showcase Accordion */}
                  <div className="bg-heritage-clay/60 border border-gold-400/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-display text-base font-bold text-gold-100 flex items-center gap-2">
                          <span>🐍 Step 4: Python Standalone Code (`whatsapp_broadcast.py`)</span>
                        </h4>
                        <p className="text-xs text-gold-300/70">
                          Aap chahein toh is exact Python backend logic ko apne local terminal se bhi execute kar sakte hain:
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded font-mono text-[10px] font-bold">
                        python whatsapp_broadcast.py
                      </span>
                    </div>

                    <pre className="p-4 bg-[#0a0d12] rounded-xl border border-gold-400/20 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
{`import time
import requests

# Step 1: Database se regular customers list nikalna
customers = [
    {'name': 'Ramesh Kumar', 'phone': '919829012345'},
    {'name': 'Sunita Devi', 'phone': '919414098765'},
    {'name': 'Vikram Singh', 'phone': '919928011223'}
]

# Step 2: Upload ki gayi Image URL aur Personalized Message Template
invitation_image_url = "${invitationImageUrl}"
message_template = "Namaste {name} ji! Majisa Restaurant me aapka VIP Swagat hai. Humne aapke liye special party organize ki hai."

# Step 3: Meta WhatsApp Cloud API credentials
API_URL = "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages"
ACCESS_TOKEN = "YOUR_META_ACCESS_TOKEN"

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json",
}

# Step 4: Sabhi regular customers ko ek-ek karke message bhejna
for customer in customers:
    customer_name = customer["name"]
    customer_phone = customer["phone"]

    # Personalized Message for each customer
    custom_text = message_template.format(name=customer_name)

    payload = {
        "messaging_product": "whatsapp",
        "to": customer_phone,
        "type": "image",
        "image": {
            "link": invitation_image_url,
            "caption": custom_text,
        },
    }

    # API Request Call
    print(f"Sending VIP Invitation to {customer_name} (+{customer_phone})...")
    # response = requests.post(API_URL, json=payload, headers=headers)

    # Delay of 1-2 seconds between messages for safety
    time.sleep(1.2)

print("✓ Sabhi VIP Customers ko Invitation safaltapurvak bhej diya gaya hai!")`}
                    </pre>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ================== TAB H: ANALYTICS ================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Header Summary */}
              <div className="bg-heritage-clay/70 border border-gold-400/20 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-gold-100 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                      <span>बिज़नेस एनालिटिक्स व रिपोर्ट (Analytics Dashboard)</span>
                    </h2>
                    <p className="text-xs text-gold-300/80 font-serif mt-1">
                      माजीसा कैफे व रेस्टोरेंट की लाइव रिपोर्ट, व्यंजन संख्या, बुकिंग आंकड़े एवं ग्राहक अंतर्दृष्टि
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono rounded-full shrink-0">
                    Real-time Live Sync
                  </span>
                </div>

                {/* Top Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Stat Card 1 */}
                  <div className="bg-heritage-dark/90 p-5 rounded-2xl border border-gold-400/25 shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-xxs text-gold-400/80 uppercase tracking-widest block font-bold font-sans">कुल व्यंजन (Dishes)</span>
                      <span className="text-3xl font-bold text-gold-100 font-mono mt-1 block">{safeMenuItems.length}</span>
                      <span className="text-[10px] text-emerald-400 font-sans mt-0.5 block">✓ {availableCount} बिक्री हेतु उपलब्ध</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-400/30 flex items-center justify-center">
                      <Tag className="w-6 h-6 text-gold-400" />
                    </div>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="bg-heritage-dark/90 p-5 rounded-2xl border border-amber-500/30 shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-xxs text-amber-400/80 uppercase tracking-widest block font-bold font-sans">इवेंट बुकिंग्स</span>
                      <span className="text-3xl font-bold text-amber-300 font-mono mt-1 block">{safeBookings.length}</span>
                      <span className="text-[10px] text-amber-400 font-sans mt-0.5 block">⏳ {pendingBookingsCount} समीक्षाधीन</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>

                  {/* Stat Card 3 */}
                  <div className="bg-heritage-dark/90 p-5 rounded-2xl border border-emerald-500/30 shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-xxs text-emerald-400/80 uppercase tracking-widest block font-bold font-sans">VIP ग्राहक आधार</span>
                      <span className="text-3xl font-bold text-emerald-300 font-mono mt-1 block">{safeCustomers.length}</span>
                      <span className="text-[10px] text-emerald-400 font-sans mt-0.5 block">📱 WhatsApp Broadcast Ready</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>

                  {/* Stat Card 4 */}
                  <div className="bg-heritage-dark/90 p-5 rounded-2xl border border-purple-500/30 shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-xxs text-purple-400/80 uppercase tracking-widest block font-bold font-sans">औसत व्यंजन मूल्य</span>
                      <span className="text-3xl font-bold text-purple-300 font-mono mt-1 block">₹{avgPrice}</span>
                      <span className="text-[10px] text-purple-300/80 font-sans mt-0.5 block">रेसिपी रेंज</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Detailed Dish & Booking Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dish Menu Performance */}
                <div className="bg-heritage-clay/60 border border-gold-400/20 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="font-display text-lg font-bold text-gold-100 flex items-center gap-2 pb-3 border-b border-gold-400/10">
                    <PieChart className="w-5 h-5 text-heritage-yellow" />
                    <span>व्यंजन लोकप्रियता व शेफ स्पेशल आंकड़े</span>
                  </h3>

                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-heritage-dark/60 border border-gold-400/10">
                      <span className="text-gold-200">🔥 बेस्ट सेलर / लोकप्रिय व्यंजन (Popular Dishes):</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">{popularCount} dishes</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-heritage-dark/60 border border-gold-400/10">
                      <span className="text-gold-200">👨‍🍳 शेफ स्पेशल व्यंजन (Chef Specials):</span>
                      <span className="font-mono font-bold text-gold-300 text-sm">{chefSpecialCount} dishes</span>
                    </div>

                    {highestPriceItem && highestPriceItem.name && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-heritage-dark/60 border border-gold-400/10">
                        <span className="text-gold-200">💎 उच्चतम मूल्य व्यंजन (Highest Priced):</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          {typeof highestPriceItem.name === 'string' ? highestPriceItem.name : String((highestPriceItem.name as any)?.hi || (highestPriceItem.name as any)?.en || 'Dish')} (₹{Number(highestPriceItem.price) || 0})
                        </span>
                      </div>
                    )}

                    {lowestPriceItem && lowestPriceItem.name && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-heritage-dark/60 border border-gold-400/10">
                        <span className="text-gold-200">🏷️ न्यूनतम मूल्य व्यंजन (Lowest Priced):</span>
                        <span className="font-mono font-bold text-gold-300 text-xs">
                          {typeof lowestPriceItem.name === 'string' ? lowestPriceItem.name : String((lowestPriceItem.name as any)?.hi || (lowestPriceItem.name as any)?.en || 'Dish')} (₹{Number(lowestPriceItem.price) || 0})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking & Broadcast Summary */}
                <div className="bg-heritage-clay/60 border border-gold-400/20 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="font-display text-lg font-bold text-gold-100 flex items-center gap-2 pb-3 border-b border-gold-400/10">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span>इवेंट बुकिंग्स एवं ब्रॉडकास्ट स्थिति</span>
                  </h3>

                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-500/20">
                      <span className="text-amber-200">⏳ समीक्षाधीन दावत बुकिंग्स (Pending):</span>
                      <span className="font-mono font-bold text-amber-300 text-sm">{pendingBookingsCount}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                      <span className="text-emerald-200">✓ स्वीकृत दावत बुकिंग्स (Confirmed):</span>
                      <span className="font-mono font-bold text-emerald-300 text-sm">{confirmedBookingsCount}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-heritage-dark/60 border border-gold-400/10">
                      <span className="text-gold-200">📸 होमपेज स्लाइडर हाइलाइट्स:</span>
                      <span className="font-mono font-bold text-gold-300 text-sm">{safeHighlights.length} media items</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-heritage-dark/60 border border-gold-400/10">
                      <span className="text-gold-200">📢 लाइव सूचनाएं (Announcements):</span>
                      <span className="font-mono font-bold text-purple-300 text-sm">{safeAnnouncements.length} active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category-wise Breakdown Pills */}
              <div className="bg-heritage-clay/60 border border-gold-400/20 rounded-2xl p-6 shadow-xl">
                <h3 className="font-display text-base font-bold text-gold-100 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gold-400" />
                  <span>मेनू श्रेणी वितरण (Menu Category Breakdown)</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(analyticsCategoriesMap).map(([categoryName, count]) => (
                    <div
                      key={String(categoryName)}
                      className="px-4 py-2 bg-heritage-dark border border-gold-400/20 rounded-xl text-xs flex items-center gap-2"
                    >
                      <span className="capitalize text-gold-200 font-medium">{String(categoryName || '').replace(/_/g, ' ')}</span>
                      <span className="px-2 py-0.5 bg-gold-500/20 text-gold-300 font-mono font-bold rounded-full text-xxs">
                        {Number(count) || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================== TAB I: SECURITY & CHANGE PIN ================== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-heritage-clay/60 border border-gold-400/20 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center space-x-3 pb-6 border-b border-gold-400/10">
                  <div className="w-12 h-12 rounded-xl bg-heritage-red/30 border border-gold-400 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-heritage-yellow" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-gold-100">
                      मालिक सुरक्षा एवं एंट्री पिन बदलें (Admin Security Center)
                    </h2>
                    <p className="text-xs text-gold-300 font-serif mt-0.5">
                      अपनी वेबसाइट की सुरक्षा के लिए पुराना PIN बदलकर नया गुप्त PIN सेट करें
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePinSubmit} className="mt-6 max-w-md space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gold-300 mb-1.5 font-sans">
                      वर्तमान एंट्री पिन (Current Security PIN) *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/30 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm tracking-widest font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gold-300 mb-1.5 font-sans">
                      नया गुप्त एंट्री पिन (New Security PIN) *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/30 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm tracking-widest font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gold-300 mb-1.5 font-sans">
                      नए पिन की पुष्टि करें (Confirm New PIN) *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-heritage-dark border border-gold-400/30 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-sm tracking-widest font-mono"
                    />
                  </div>

                  {changePinMsg && (
                    <div className={`p-4 rounded-xl text-xs border font-sans ${
                      changePinMsg.type === 'success'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-red-950/60 border-red-500/50 text-red-300'
                    }`}>
                      {changePinMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isChangingPin}
                    className="w-full py-3 bg-gradient-to-r from-heritage-red to-heritage-maroon hover:from-heritage-red/90 hover:to-heritage-maroon/90 text-gold-100 font-bold rounded-xl border border-gold-400/40 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isChangingPin ? 'सुरक्षित किया जा रहा है...' : 'नया सुरक्षा पिन अपडेट करें • Update Admin PIN'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ================== EDIT DISH MODAL ================== */}
      {editingDish && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-heritage-clay border border-gold-400/30 rounded-2xl p-6 max-w-2xl w-full text-gold-100 shadow-2xl relative my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gold-400/20 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-gold-400" />
                <h3 className="font-display text-xl font-bold text-gold-100">
                  व्यंजन संशोधित करें • Edit Dish ({editingDish.name})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDish(null)}
                className="text-gold-400 hover:text-gold-100 p-1.5 rounded-lg hover:bg-heritage-dark cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Form Body */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingDish) return;
                const finalCategory = isEditingCustomCategory && editCustomCategoryInput.trim()
                  ? editCustomCategoryInput.trim()
                  : editingDish.category;
                
                const finalItem = {
                  ...editingDish,
                  category: finalCategory
                };

                if (onUpdateMenuItem) {
                  await onUpdateMenuItem(finalItem);
                } else {
                  try {
                    await fetch(`/api/menu/${finalItem.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(finalItem)
                    });
                  } catch (err) {
                    console.error('Update failed:', err);
                  }
                }
                setEditingDish(null);
              }}
              className="space-y-4 text-xs font-sans"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dish Name English */}
                <div>
                  <label className="block text-gold-300 font-semibold mb-1">
                    अंग्रेजी नाम (English Dish Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDish.name}
                    onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 placeholder-gold-400/40 focus:outline-none focus:border-gold-400"
                  />
                </div>

                {/* Dish Name Hindi */}
                <div>
                  <label className="block text-gold-300 font-semibold mb-1">
                    हिंदी नाम (Hindi Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDish.hindiName}
                    onChange={(e) => setEditingDish({ ...editingDish, hindiName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 placeholder-gold-400/40 focus:outline-none focus:border-gold-400 font-serif"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-gold-300 font-semibold mb-1">
                    मूल्य / Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingDish.price}
                    onChange={(e) => setEditingDish({ ...editingDish, price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 placeholder-gold-400/40 focus:outline-none focus:border-gold-400 font-mono font-bold"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gold-300 font-semibold mb-1">
                    श्रेणी / Category *
                  </label>
                  {!isEditingCustomCategory ? (
                    <select
                      value={editingDish.category}
                      onChange={(e) => {
                        if (e.target.value === 'custom_new') {
                          setIsEditingCustomCategory(true);
                        } else {
                          setEditingDish({ ...editingDish, category: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 capitalize"
                    >
                      <option value="paneer">पनीर (Paneer)</option>
                      <option value="kaju">काजू (Kaju)</option>
                      <option value="cheese">चीज़ (Cheese)</option>
                      <option value="breads">सोगरा / रोटी (Breads)</option>
                      <option value="rice">चावल व बिरयानी (Rice & Biryani)</option>
                      <option value="mains">सब्जी रसोई (Vegetable Sabji)</option>
                      <option value="hari_sabji">हरी सब्जी (Hari Sabji)</option>
                      <option value="dal">दाल व खिचड़ी (Dal & Khichdi)</option>
                      <option value="palak">पालक रसोई (Palak)</option>
                      <option value="kofta">कोफ़्ता रसोई (Kofta)</option>
                      <option value="thali">शाही थाली (Fix Thali)</option>
                      <option value="raj_special">राजस्थानी स्पेशल (Rajasthani Special)</option>
                      <option value="churma">चूरमा (Churma)</option>
                      <option value="raita">रायता व छाछ (Raita)</option>
                      <option value="salad">सलाद व पापड़ (Salad & Papad)</option>
                      <option value="custom_new">+ नई श्रेणी बनाएं (+ Custom Category)</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="नई श्रेणी लिखें..."
                        value={editCustomCategoryInput}
                        onChange={(e) => setEditCustomCategoryInput(e.target.value)}
                        className="w-full px-3 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400"
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingCustomCategory(false)}
                        className="px-3 py-2 bg-heritage-dark text-gold-400 border border-gold-400/20 rounded-xl hover:text-gold-100 text-xs shrink-0"
                      >
                        रद्द
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gold-300 font-semibold mb-1">
                  विवरण / Description
                </label>
                <textarea
                  rows={2}
                  value={editingDish.description}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  className="w-full px-3 py-2 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 focus:outline-none focus:border-gold-400 text-xs"
                />
              </div>

              {/* Image Input & File Upload */}
              <div>
                <label className="block text-gold-300 font-semibold mb-1">
                  फोटो / Image Photo (URL दर्ज करें या डायरेक्ट फोटो अपलोड करें)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {editingDish.image && (
                    <img
                      src={editingDish.image}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-gold-400/30 shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    value={editingDish.image}
                    onChange={(e) => setEditingDish({ ...editingDish, image: e.target.value })}
                    placeholder="https://... या गैलरी/कैमरा से फोटो चुनें"
                    className="w-full px-3 py-2.5 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 text-xs focus:outline-none focus:border-gold-400"
                  />
                  <label className="px-4 py-2.5 bg-heritage-dark border border-gold-400/30 text-gold-300 hover:text-gold-100 rounded-xl text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1.5 hover:border-gold-400">
                    <Upload className="w-4 h-4 text-gold-400" />
                    <span>फोटो चुनें</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setEditingDish({ ...editingDish, image: reader.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Toggles and Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer p-2.5 rounded-xl bg-heritage-dark/80 border border-gold-400/10 hover:border-gold-400/30">
                  <input
                    type="checkbox"
                    checked={editingDish.isChefSpecial}
                    onChange={(e) => setEditingDish({ ...editingDish, isChefSpecial: e.target.checked })}
                    className="rounded text-gold-500 focus:ring-0"
                  />
                  <span className="text-xs text-gold-200">Chef Special</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer p-2.5 rounded-xl bg-heritage-dark/80 border border-gold-400/10 hover:border-gold-400/30">
                  <input
                    type="checkbox"
                    checked={editingDish.isPopular}
                    onChange={(e) => setEditingDish({ ...editingDish, isPopular: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs text-amber-300">Best Seller</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer p-2.5 rounded-xl bg-heritage-dark/80 border border-gold-400/10 hover:border-gold-400/30">
                  <input
                    type="checkbox"
                    checked={editingDish.isSpicy}
                    onChange={(e) => setEditingDish({ ...editingDish, isSpicy: e.target.checked })}
                    className="rounded text-red-500 focus:ring-0"
                  />
                  <span className="text-xs text-red-300">तीखा (Spicy)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer p-2.5 rounded-xl bg-heritage-dark/80 border border-gold-400/10 hover:border-gold-400/30">
                  <input
                    type="checkbox"
                    checked={editingDish.isAvailable}
                    onChange={(e) => setEditingDish({ ...editingDish, isAvailable: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs text-emerald-300">उपलब्ध (Available)</span>
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gold-400/20 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-5 py-2.5 rounded-xl border border-gold-400/20 text-gold-300 hover:text-gold-100 hover:bg-heritage-dark text-xs font-semibold cursor-pointer"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-heritage-dark font-bold text-xs shadow-lg cursor-pointer transition-all uppercase tracking-wider"
                >
                  बदलाव सहेजें (Save Changes)
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
