import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, ShieldAlert, Mail, Phone, MapPin, Calendar, 
  Trash2, Plus, Edit3, Check, X, Sparkles, RefreshCw, Layers, Award,
  Image as ImageIcon, Eye, Upload, Send, Clock, CheckCircle2, Archive, Star
} from 'lucide-react';
import { Service } from '../types';
import { uploadBase64ToStorage } from '../firebaseStorage';
import JacksLogo from './JacksLogo';

const DEFAULT_VISUALS: Record<string, { beforeImg: string; afterImg: string; beforeDesc: string; afterDesc: string }> = {
  'service-l-mowing': {
    beforeImg: '/src/assets/images/lawn_mowing_before_1779586168566.png',
    afterImg: '/src/assets/images/lawn_mowing_after_1779586183040.png',
    beforeDesc: 'Overgrown, un-mowed residential grass lawn needing precision deck cut and formal line trimming around the garden borders.',
    afterDesc: 'Lawn manicured precisely with professional diagonal striping geometry, clear line-trimming, and fully blown clean perimeter paths.'
  },
  'service-l-cleanup': {
    beforeImg: 'https://images.unsplash.com/photo-1508781197106-d8c535dcf276?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1534710951274-1851d3061271?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Dense leaf pile-up blocking soil sunlight, inviting root dampness, and clogging residential entrance channels.',
    afterDesc: 'Perfect, debris-free turf and cleared garden beds. All leaves vacuum-collected and processed into high-grade compost.'
  },
  'service-l-landscape': {
    beforeImg: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1558904541-efa8c1a68fa6?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Amorphous clay slope with dry soil weeds, old rotten wood borders, and zero ornamental definition.',
    afterDesc: 'Premium curated garden bed structured by custom curved cedar boundaries, lush evergreens, organic weed barrier compost, and localized irrigation.'
  },
  'service-l-hedge': {
    beforeImg: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Shaggy, uneven evergreen boxwoods protruding onto walkways and obstructing natural light.',
    afterDesc: 'Laser-sharp geometric hedging with clean corners, encouraging thick inner branch networks and crisp border symmetry.'
  },
  'service-l-mulch': {
    beforeImg: 'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Dry, cracking topsoil base with fading legacy wood fragments and persistent dandelion growth.',
    afterDesc: 'Immaculate 3-inch top coat of dark organic triple-shred cedar bark, insulating root systems and blocking weed seeds.'
  },
  'service-l-weed': {
    beforeImg: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1507036066871-b708937449ab?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Aggressive root clover, dandelion, and crabgrass weeds dominating garden borders and paver joints.',
    afterDesc: 'Pristine, 100% root-pulled neat stone joint lines and bed bottoms treated with our pet-friendly pre-emergent root barrier.'
  },
  'service-l-fertilizer': {
    beforeImg: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Nutrient-starved, yellowish grass suffering from shallow roots and structural drought stress.',
    afterDesc: 'Vivid, thick forest-green lawn holding dense deep chlorophyll layers and strong, drought-resilient subterranean root blocks.'
  },
  'service-l-restoration': {
    beforeImg: 'https://images.unsplash.com/photo-1533460004989-cef01064af7e?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Dry, highly compacted hard dirt patches with dead thatch layers and zero grass seed germination.',
    afterDesc: 'Aerated soil plugs with premium hybrid fescue turf seed, rich compost topseal, and flawless healthy recovery.'
  }
};

interface ImageUploadSelectorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onFileChange: (file: File) => void;
  placeholder: string;
  isUploading?: boolean;
}

function ImageUploadSelector({
  label,
  value,
  onChange,
  onFileChange,
  placeholder,
  isUploading = false
}: ImageUploadSelectorProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const isUploaded = !!value && value.trim().length > 0;

  return (
    <div className="space-y-1.5 text-left">
      <label className="text-[10px] font-mono text-stone-650 block uppercase font-bold tracking-wider">{label}</label>
      
      {/* File Drop/Click Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4.5 text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
          isUploading
            ? 'border-emerald-300 bg-emerald-50/20 cursor-wait'
            : isDragActive 
              ? 'border-emerald-600 bg-emerald-50/50 cursor-pointer' 
              : isUploaded 
                ? 'border-emerald-200 bg-emerald-50/10 hover:border-emerald-450 cursor-pointer' 
                : 'border-stone-250 hover:border-emerald-600 bg-stone-50/30 hover:bg-white cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
        ) : (
          <Upload className={`w-5 h-5 ${isDragActive || isUploaded ? 'text-emerald-600' : 'text-stone-400'}`} />
        )}
        
        {isUploading ? (
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-emerald-850 block animate-pulse">Uploading and writing to server disk...</span>
            <span className="text-[9px] text-stone-500 block font-mono">Bypassing browser quotas safely</span>
          </div>
        ) : isUploaded ? (
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-emerald-800 block">✓ Custom Image Loaded</span>
            <span className="text-[9px] text-stone-550 block font-mono">
              {value?.startsWith('data:') 
                ? 'Cached as embedded browser data URL' 
                : 'Saved permanently to server storage directory'}
            </span>
          </div>
        ) : (
          <div className="space-y-0.5">
            <span className="text-xs font-light text-stone-700 block text-center">
              Drag &amp; drop your landscaping photo here, or <strong className="font-semibold text-emerald-700">browse</strong>
            </span>
            <span className="text-[9px] text-stone-400 block font-mono">Supports PNG, JPG, WEBP</span>
          </div>
        )}
      </div>

      {/* Manual Input Field (starts with or is direct path) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-stone-500 uppercase">Or provide a custom image path/URL</span>
          {isUploaded && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[9px] font-mono text-stone-450 hover:text-red-700 underline cursor-pointer"
            >
              Clear photo
            </button>
          )}
        </div>
        <input
          type="text"
          value={value?.startsWith('data:') ? '' : value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={value?.startsWith('data:') ? 'Using uploaded local file. Paste a URL or clear to override.' : placeholder}
          className="w-full px-3.5 py-1.5 bg-white border border-stone-250 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs placeholder:text-stone-400"
          disabled={isUploading}
        />
      </div>
    </div>
  );
}

interface AdminDashboardProps {
  services: Service[];
  onSaveServices: (updated: Service[]) => void;
  onRestoreDefaults: () => void;
  coverPhoto?: string;
  onSaveCoverPhoto?: (url: string) => void;
  logoConfig?: {
    logoType: 'svg' | 'image';
    imageUrl: string;
    svgTextTop: string;
    svgTextBottom: string;
    svgColor: string;
  };
  onSaveLogoConfig?: (config: any) => void;
  contactInfo?: {
    phone: string;
    phoneRaw: string;
    email: string;
    location: string;
    description: string;
  };
  onSaveContactInfo?: (info: any) => void;
}

interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  timeframe: string;
  notes: string;
  services: string[];
  createdAt: string;
  status: 'new' | 'contacted' | 'completed' | 'archived';
}

export default function AdminDashboard({
  services,
  onSaveServices,
  onRestoreDefaults,
  coverPhoto,
  onSaveCoverPhoto,
  logoConfig,
  onSaveLogoConfig,
  contactInfo,
  onSaveContactInfo
}: AdminDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthed, setIsAuthed] = useState(() => {
    return sessionStorage.getItem('jacks_admin_authed') === 'true';
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'services' | 'photos' | 'email' | 'reviews'>('leads');

  // Email Notification States
  const [recipientEmail, setRecipientEmail] = useState('jacks.mowing.and.more1@gmail.com');
  const [smtpUser, setSmtpUser] = useState('jacks.mowing.and.more1@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [isEmailConfigured, setIsEmailConfigured] = useState(true);
  const [emailSettingsSavedStatus, setEmailSettingsSavedStatus] = useState('');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState('');
  
  // Service Creator/Editor States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    title: '',
    category: '',
    description: '',
    features: [],
    iconName: 'sparkles'
  });
  const [featureInput, setFeatureInput] = useState('');

  // Before-and-After Photos States
  const [customVisuals, setCustomVisuals] = useState<Record<string, { beforeImg: string; afterImg: string; beforeDesc?: string; afterDesc?: string }>>({});
  const [editingVisualsId, setEditingVisualsId] = useState<string | null>(null);
  const [visualsForm, setVisualsForm] = useState({
    beforeImg: '',
    afterImg: '',
    beforeDesc: '',
    afterDesc: ''
  });
  const [isUploading, setIsUploading] = useState<{ beforeImg: boolean; afterImg: boolean }>({
    beforeImg: false,
    afterImg: false
  });

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleUploadLogoFile = (file: File) => {
    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/png', 0.90);

            // Attempt to upload to persistent Firebase Storage container first
            const uniqueName = `branding/logo_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
            uploadBase64ToStorage(compressedDataUrl, uniqueName)
              .then(downloadUrl => {
                if (onSaveLogoConfig && logoConfig) {
                  onSaveLogoConfig({
                    ...logoConfig,
                    imageUrl: downloadUrl
                  });
                }
              })
              .catch(err => {
                console.warn('Firebase Storage brand logo upload failed, trying local disk:', err);
                return fetch('/api/upload-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ base64: compressedDataUrl, fileName: file.name })
                })
                .then(res => {
                  if (!res.ok) throw new Error('File upload script failed');
                  return res.json();
                })
                .then(data => {
                  if (data.imageUrl && onSaveLogoConfig && logoConfig) {
                    onSaveLogoConfig({
                      ...logoConfig,
                      imageUrl: data.imageUrl
                    });
                  }
                });
              })
              .catch(finalErr => {
                console.error('All uploader attempts failed, caching as base64 asset:', finalErr);
                if (onSaveLogoConfig && logoConfig) {
                  onSaveLogoConfig({
                    ...logoConfig,
                    imageUrl: compressedDataUrl
                  });
                }
              })
              .finally(() => {
                setIsUploadingLogo(false);
              });
          } else {
            setIsUploadingLogo(false);
          }
        };
        img.onerror = () => {
          console.error('Logo image load failed');
          setIsUploadingLogo(false);
        };
        img.src = event.target.result;
      } else {
        setIsUploadingLogo(false);
      }
    };
    reader.onerror = () => {
      console.error('Logo file reading failed');
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  // Interactive slider configuration states
  const [sliderConfig, setSliderConfig] = useState({
    beforeImg: "/src/assets/images/garden_beds_1779327341663.png",
    beforeLabel: "Dry Weedy Clay Lot (Before)",
    afterImg: "/src/assets/images/garden_beds_1779327341663.png",
    afterLabel: "Lined Botanical Walkway (After)"
  });
  const [isUploadingSliderBefore, setIsUploadingSliderBefore] = useState(false);
  const [isUploadingSliderAfter, setIsUploadingSliderAfter] = useState(false);

  // Service grid card category thumbnail images
  const [serviceCardImages, setServiceCardImages] = useState<Record<string, string>>({});
  const [isUploadingCardImage, setIsUploadingCardImage] = useState<Record<string, boolean>>({});

  const handleUploadCoverFile = (file: File) => {
    setIsUploadingCover(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            
            // Attempt to upload first to persistent Firebase Storage
            const uniqueName = `covers/cover_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
            uploadBase64ToStorage(compressedDataUrl, uniqueName)
              .then(downloadUrl => {
                if (onSaveCoverPhoto) {
                  onSaveCoverPhoto(downloadUrl);
                }
              })
              .catch(err => {
                console.warn('Firebase Storage upload failed, trying local disk uploader:', err);
                return fetch('/api/upload-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ base64: compressedDataUrl, fileName: file.name })
                })
                .then(res => {
                  if (!res.ok) throw new Error('File upload script failed');
                  return res.json();
                })
                .then(data => {
                  if (data.imageUrl && onSaveCoverPhoto) {
                    onSaveCoverPhoto(data.imageUrl);
                  } else {
                    throw new Error('Image URL undefined in response');
                  }
                });
              })
              .catch(finalErr => {
                console.error('All persistent upload pathways failed, saving as client-side base64:', finalErr);
                if (onSaveCoverPhoto) {
                  onSaveCoverPhoto(compressedDataUrl);
                }
              })
              .finally(() => {
                setIsUploadingCover(false);
              });
          } else {
            setIsUploadingCover(false);
          }
        };
        img.onerror = () => {
          console.error('Cover image loading failed');
          setIsUploadingCover(false);
        };
        img.src = event.target.result;
      } else {
        setIsUploadingCover(false);
      }
    };
    reader.onerror = () => {
      console.error('Cover file reading failed');
      setIsUploadingCover(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadFile = (file: File, field: 'beforeImg' | 'afterImg') => {
    setIsUploading(prev => ({ ...prev, [field]: true }));
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to standard JPEG format (0.80 quality)
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.80);
            
            // Try Firebase Storage first
            const uniqueName = `portfolio/portfolio_${field}_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
            uploadBase64ToStorage(compressedDataUrl, uniqueName)
              .then(downloadUrl => {
                setVisualsForm(prev => ({
                  ...prev,
                  [field]: downloadUrl
                }));
              })
              .catch(err => {
                console.warn('Firebase Storage upload failed for portfolio visual, trying local server disk:', err);
                // Post to the backend persistent image uploader API
                return fetch('/api/upload-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ base64: compressedDataUrl, fileName: file.name })
                })
                .then(res => {
                  if (!res.ok) throw new Error('File upload script failed');
                  return res.json();
                })
                .then(data => {
                  if (data.imageUrl) {
                    setVisualsForm(prev => ({
                      ...prev,
                      [field]: data.imageUrl
                    }));
                  } else {
                    throw new Error('Image URL undefined in response');
                  }
                });
              })
              .catch(finalErr => {
                console.error('All portfolio asset uploads failed, falling back to client-sided base64:', finalErr);
                setVisualsForm(prev => ({
                  ...prev,
                  [field]: compressedDataUrl
                }));
              })
              .finally(() => {
                setIsUploading(prev => ({ ...prev, [field]: false }));
              });
          } else {
            // Fallback for canvas context issue
            setVisualsForm(prev => ({
              ...prev,
              [field]: event.target?.result as string
            }));
            setIsUploading(prev => ({ ...prev, [field]: false }));
          }
        };
        img.onerror = () => {
          console.error('Portfolio image loading failed');
          setIsUploading(prev => ({ ...prev, [field]: false }));
        };
        img.src = event.target.result;
      } else {
        setIsUploading(prev => ({ ...prev, [field]: false }));
      }
    };
    reader.onerror = () => {
      setIsUploading(prev => ({ ...prev, [field]: false }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSliderFile = (file: File, field: 'beforeImg' | 'afterImg') => {
    if (field === 'beforeImg') setIsUploadingSliderBefore(true);
    else setIsUploadingSliderAfter(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

            // Upload via Firebase Storage
            const uniqueName = `slider/slider_${field}_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
            uploadBase64ToStorage(compressedDataUrl, uniqueName)
              .then(downloadUrl => {
                const updated = { ...sliderConfig, [field]: downloadUrl };
                setSliderConfig(updated);
                saveSliderConfigToServer(updated);
              })
              .catch(err => {
                console.warn('Firebase Storage upload failed for slider, trying server filesystem:', err);
                return fetch('/api/upload-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ base64: compressedDataUrl, fileName: file.name })
                })
                .then(res => {
                  if (!res.ok) throw new Error('File upload script failed');
                  return res.json();
                })
                .then(data => {
                  if (data.imageUrl) {
                    const updated = { ...sliderConfig, [field]: data.imageUrl };
                    setSliderConfig(updated);
                    saveSliderConfigToServer(updated);
                  }
                });
              })
              .catch(finalErr => {
                console.error('All slider upload avenues failed, saving base64:', finalErr);
                const updated = { ...sliderConfig, [field]: compressedDataUrl };
                setSliderConfig(updated);
                saveSliderConfigToServer(updated);
              })
              .finally(() => {
                if (field === 'beforeImg') setIsUploadingSliderBefore(false);
                else setIsUploadingSliderAfter(false);
              });
          } else {
            if (field === 'beforeImg') setIsUploadingSliderBefore(false);
            else setIsUploadingSliderAfter(false);
          }
        };
        img.onerror = () => {
          console.error('Slider image loading failed');
          if (field === 'beforeImg') setIsUploadingSliderBefore(false);
          else setIsUploadingSliderAfter(false);
        };
        img.src = event.target.result;
      } else {
        if (field === 'beforeImg') setIsUploadingSliderBefore(false);
        else setIsUploadingSliderAfter(false);
      }
    };
    reader.onerror = () => {
      console.error('Slider file reading failed');
      if (field === 'beforeImg') setIsUploadingSliderBefore(false);
      else setIsUploadingSliderAfter(false);
    };
    reader.readAsDataURL(file);
  };

  const saveSliderConfigToServer = (updated: typeof sliderConfig) => {
    fetch('/api/portfolio-slider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save slider config');
      return res.json();
    })
    .catch(err => console.error('Save slider config failed:', err));
  };

  const handleUploadCardImageFile = (file: File, serviceId: string) => {
    setIsUploadingCardImage(prev => ({ ...prev, [serviceId]: true }));

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

            // Upload via Firebase Storage
            const uniqueName = `service-cards/card_${serviceId}_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
            uploadBase64ToStorage(compressedDataUrl, uniqueName)
              .then(downloadUrl => {
                saveServiceCardImageToServer(serviceId, downloadUrl);
              })
              .catch(err => {
                console.warn('Firebase Storage upload failed for card, trying server filesystem:', err);
                return fetch('/api/upload-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ base64: compressedDataUrl, fileName: file.name })
                })
                .then(res => {
                  if (!res.ok) throw new Error('File upload script failed');
                  return res.json();
                })
                .then(data => {
                  if (data.imageUrl) {
                    saveServiceCardImageToServer(serviceId, data.imageUrl);
                  }
                });
              })
              .catch(finalErr => {
                console.error('All card uploader avenues failed, saving base64:', finalErr);
                saveServiceCardImageToServer(serviceId, compressedDataUrl);
              })
              .finally(() => {
                setIsUploadingCardImage(prev => ({ ...prev, [serviceId]: false }));
              });
          } else {
            setIsUploadingCardImage(prev => ({ ...prev, [serviceId]: false }));
          }
        };
        img.onerror = () => {
          console.error('Card image loading failed');
          setIsUploadingCardImage(prev => ({ ...prev, [serviceId]: false }));
        };
        img.src = event.target.result;
      } else {
        setIsUploadingCardImage(prev => ({ ...prev, [serviceId]: false }));
      }
    };
    reader.onerror = () => {
      console.error('Card image file reading failed');
      setIsUploadingCardImage(prev => ({ ...prev, [serviceId]: false }));
    };
    reader.readAsDataURL(file);
  };

  const saveServiceCardImageToServer = (serviceId: string, url: string) => {
    const updated = { ...serviceCardImages, [serviceId]: url };
    setServiceCardImages(updated);

    fetch('/api/service-card-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save service card image');
      return res.json();
    })
    .catch(err => console.error('Save service card image failed:', err));
  };

  // Load email configuration from the server
  const loadEmailConfig = () => {
    fetch('/api/email-config')
      .then(res => res.json())
      .then(data => {
        if (data.recipientEmail) setRecipientEmail(data.recipientEmail);
        if (data.smtpUser) setSmtpUser(data.smtpUser);
        setIsEmailConfigured(!!data.smtpPass);
      })
      .catch(err => {
        console.error("Could not load email configuration:", err);
        setIsEmailConfigured(false);
      });
  };

  // Load leads from LocalStorage and synchronise with the backend server
  const loadLeadsInput = () => {
    try {
      const saved = localStorage.getItem('jacks_booking_leads');
      let localLeads: Lead[] = [];
      if (saved) {
        localLeads = JSON.parse(saved);
        setLeads(localLeads);
      } else {
        // Create 2 mock initial leads if empty so the dashboard has something beautiful to show!
        localLeads = [
          {
            id: 'lead-1',
            fullName: 'Sarah Jenkins',
            email: 'sarah.j@example.com',
            phone: '(503) 555-1294',
            address: '412 Maple Terrace, Milltown',
            timeframe: 'Next 1-2 Months',
            notes: 'Looking to completely redesign my front yard garden beds with premium mulch, low-maintenance native plants, and custom stone edging.',
            services: ['Landscape Design & Installation', 'Mulch Installation'],
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
            status: 'new'
          },
          {
            id: 'lead-2',
            fullName: 'Robert Miller',
            email: 'bob.miller@example.com',
            phone: '(503) 555-3810',
            address: '891 Oak Lane, Milltown',
            timeframe: 'Immediate (< 2 weeks)',
            notes: 'Urgent weed removal and lawn restoration after the heavy storm. My backyard beds are taken over.',
            services: ['Weed Removal', 'Lawn Restoration'],
            createdAt: new Date(Date.now() - 3600000 * 25).toISOString(), // 25 hours ago
            status: 'contacted'
          }
        ];
        localStorage.setItem('jacks_booking_leads', JSON.stringify(localLeads));
        setLeads(localLeads);
      }

      // Query the server for ground truth
      fetch('/api/bookings')
        .then(res => res.json())
        .then(serverLeads => {
          if (Array.isArray(serverLeads) && serverLeads.length > 0) {
            // Merge both: we prioritize serverLeads as ground truth but include any unique local leads
            const merged = [...serverLeads];
            localLeads.forEach((localL) => {
              const matched = merged.some(sl => sl.id === localL.id || (sl.fullName === localL.fullName && sl.createdAt === localL.createdAt));
              if (!matched) {
                merged.push(localL);
              }
            });
            // Sort by creation time
            merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setLeads(merged);
            localStorage.setItem('jacks_booking_leads', JSON.stringify(merged));
          } else if (localLeads.length > 0) {
            // Backup/Seed the server since it has 0 leads
            fetch('/api/bookings/save-all', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ leads: localLeads })
            }).catch(e => console.error(e));
          }
        })
        .catch(err => {
          console.error("Could not reach bookings API server, utilizing local state:", err);
        });
    } catch (e) {
      console.error(e);
    }
  };

  const loadVisuals = () => {
    fetch('/api/visuals')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setCustomVisuals(data);
        } else {
          const saved = localStorage.getItem('jacks_service_visuals');
          if (saved) {
            setCustomVisuals(JSON.parse(saved));
          } else {
            setCustomVisuals({});
          }
        }
      })
      .catch(err => {
        console.error("API failed to load visuals inside admin:", err);
        const saved = localStorage.getItem('jacks_service_visuals');
        if (saved) {
          setCustomVisuals(JSON.parse(saved));
        } else {
          setCustomVisuals({});
        }
      });
  };

  const loadReviewsInput = () => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch(err => console.error("Could not load reviews under Admin Panel:", err));
  };

  const loadSliderConfig = () => {
    fetch('/api/portfolio-slider')
      .then(res => res.json())
      .then(data => {
        if (data && (data.beforeImg || data.afterImg)) {
          setSliderConfig({
            beforeImg: data.beforeImg || "/src/assets/images/garden_beds_1779327341663.png",
            beforeLabel: data.beforeLabel || "Dry Weedy Clay Lot (Before)",
            afterImg: data.afterImg || "/src/assets/images/garden_beds_1779327341663.png",
            afterLabel: data.afterLabel || "Lined Botanical Walkway (After)"
          });
        }
      })
      .catch(err => console.error("Could not load slider config in Admin:", err));
  };

  const loadServiceCardImages = () => {
    fetch('/api/service-card-images')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setServiceCardImages(data);
        }
      })
      .catch(err => console.error("Could not load service card images in Admin:", err));
  };

  useEffect(() => {
    loadLeadsInput();
    loadVisuals();
    loadEmailConfig();
    loadReviewsInput();
    loadSliderConfig();
    loadServiceCardImages();
    // Handle state update when a new lead or photo is saved in real-time
    const handleStorageChange = () => {
      loadLeadsInput();
      loadVisuals();
      loadReviewsInput();
      loadSliderConfig();
      loadServiceCardImages();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = password.trim().toUpperCase();
    if (cleanPassword === 'RIDSTARBOY' || cleanPassword === 'TWO' || cleanPassword === '2' || cleanPassword === 'TOO') {
      setIsAuthed(true);
      setErrorMsg('');
      sessionStorage.setItem('jacks_admin_authed', 'true');
    } else {
      setErrorMsg('Unauthorized Password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthed(false);
    setPassword('');
    sessionStorage.removeItem('jacks_admin_authed');
  };

  // Lead Actions
  const handleUpdateLeadStatus = (id: string, nextStatus: Lead['status']) => {
    const nextLeads = leads.map((l) => 
      l.id === id ? { ...l, status: nextStatus } : l
    );
    setLeads(nextLeads);
    localStorage.setItem('jacks_booking_leads', JSON.stringify(nextLeads));

    // Save persistently to server
    fetch('/api/bookings/save-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads: nextLeads })
    })
      .then(res => res.json())
      .catch(err => console.error("Failed to update status on server:", err));
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm('Are you statistics-sure you want to purge this submission track?')) {
      const nextLeads = leads.filter((l) => l.id !== id);
      setLeads(nextLeads);
      localStorage.setItem('jacks_booking_leads', JSON.stringify(nextLeads));

      // Save persistently to server
      fetch('/api/bookings/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: nextLeads })
      })
        .then(res => res.json())
        .catch(err => console.error("Failed to delete lead from server:", err));
    }
  };

  const handleClearAllLeads = () => {
    if (window.confirm('Delete every single lead submission in this buffer?')) {
      setLeads([]);
      localStorage.setItem('jacks_booking_leads', JSON.stringify([]));

      // Save persistently to server
      fetch('/api/bookings/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: [] })
      })
        .then(res => res.json())
        .catch(err => console.error("Failed to clear leads from server:", err));
    }
  };

  // Service Catalog Actions
  const handleStartEditService = (svc: Service) => {
    setEditingId(svc.id);
    setIsAdding(false);
    setServiceForm({ ...svc });
    setFeatureInput(svc.features?.join(', ') || '');
  };

  const handleStartAddService = () => {
    setEditingId(null);
    setIsAdding(true);
    setServiceForm({
      id: 'service-' + Date.now(),
      title: '',
      category: '',
      description: '',
      features: [],
      iconName: 'sparkles'
    });
    setFeatureInput('');
  };

  const handleSaveServiceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.category || !serviceForm.description) {
      alert('Please fill out the Title, Category, and Description fields!');
      return;
    }

    const cleanedFeatures = featureInput
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const fullForm: Service = {
      id: serviceForm.id || 'service-' + Date.now(),
      title: serviceForm.title,
      category: serviceForm.category,
      description: serviceForm.description,
      features: cleanedFeatures,
      iconName: serviceForm.iconName || 'sparkles'
    };

    let updatedServices: Service[];
    if (editingId) {
      updatedServices = services.map(s => s.id === editingId ? fullForm : s);
    } else {
      updatedServices = [...services, fullForm];
    }

    onSaveServices(updatedServices);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDeleteService = (id: string) => {
    if (services.length <= 1) {
      alert('You must keep at least one core service in the catalog.');
      return;
    }
    if (window.confirm('Are you absolutely sure you want to delete this service card from your main catalogue?')) {
      const updated = services.filter(s => s.id !== id);
      onSaveServices(updated);
    }
  };

  // Before-and-After Photos Actions
  const handleStartEditVisuals = (serviceId: string) => {
    setEditingVisualsId(serviceId);
    const existing = customVisuals[serviceId] || DEFAULT_VISUALS[serviceId] || {
      beforeImg: '',
      afterImg: '',
      beforeDesc: 'Standard overgrown landscape pre-treatment state.',
      afterDesc: 'Dramatically cleaned, trimmed, and landscaped after treatment.'
    };
    setVisualsForm({
      beforeImg: existing.beforeImg || '',
      afterImg: existing.afterImg || '',
      beforeDesc: existing.beforeDesc || '',
      afterDesc: existing.afterDesc || ''
    });
  };

  const handleSaveVisualsForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisualsId) return;

    const nextVisuals = {
      ...customVisuals,
      [editingVisualsId]: {
        beforeImg: visualsForm.beforeImg,
        afterImg: visualsForm.afterImg,
        beforeDesc: visualsForm.beforeDesc,
        afterDesc: visualsForm.afterDesc
      }
    };

    try {
      setCustomVisuals(nextVisuals);
      localStorage.setItem('jacks_service_visuals', JSON.stringify(nextVisuals));
    } catch (err: any) {
      console.warn('LocalStorage save is full or failed, proceeding with server-only backup:', err);
    }

    fetch('/api/visuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextVisuals)
    })
      .then(res => {
        if (!res.ok) throw new Error('API server write failure');
        return res.json();
      })
      .then(() => {
        setEditingVisualsId(null);
        window.dispatchEvent(new Event('storage'));
      })
      .catch(err => {
        console.error('Server persistent save error for service visuals:', err);
        setEditingVisualsId(null);
        window.dispatchEvent(new Event('storage'));
      });
  };

  const handleResetVisuals = (serviceId: string) => {
    if (window.confirm('Clear custom photos and set to blank?')) {
      const nextVisuals = { ...customVisuals };
      delete nextVisuals[serviceId];
      
      try {
        setCustomVisuals(nextVisuals);
        localStorage.setItem('jacks_service_visuals', JSON.stringify(nextVisuals));
      } catch (err) {
        console.warn('LocalStorage update warning:', err);
      }

      fetch('/api/visuals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextVisuals)
      })
        .then(() => {
          window.dispatchEvent(new Event('storage'));
        })
        .catch(err => {
          console.error('Server deletion error for service visuals:', err);
          window.dispatchEvent(new Event('storage'));
        });
    }
  };

  return (
    <section className="bg-white border-t border-stone-200 pb-16 pt-8 z-20 relative font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Toggle Bar */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setErrorMsg('');
            }}
            id="admin-dashboard-btn"
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
              isOpen 
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 shadow-xs' 
                : 'bg-black text-white hover:bg-stone-900 border-black shadow-md'
            }`}
          >
            {isAuthed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {isOpen ? 'Close Admin Portal' : '🔒 Administrator Portal'}
          </button>
        </div>

        {/* Dynamic Admin Body */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="border border-stone-200 rounded-2xl bg-stone-50 p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in font-sans">
                
                {/* 1. LOCK SCREEN IF NOT AUTHENTICATED */}
                {!isAuthed ? (
                  <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto py-12 text-center space-y-6">
                    <div className="w-12 h-12 rounded-full bg-white border border-stone-250 flex items-center justify-center mx-auto text-emerald-700 animate-pulse shadow-xs">
                      <Lock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xl text-stone-900 uppercase tracking-tight">
                        Protected Console
                      </h4>
                      <p className="text-stone-600 text-xs font-light mt-1">
                        Please provide your administrative security pattern to gain database writes catalog config.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="ENTER PASSWORD"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-center px-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-405 focus:outline-none focus:border-emerald-600 font-mono text-sm tracking-widest uppercase focus:ring-1 focus:ring-emerald-600 shadow-xs"
                        autoFocus
                      />
                      {errorMsg && (
                        <div className="flex items-center gap-1.5 justify-center text-[11px] text-red-600 font-semibold bg-red-100/50 p-2 border border-red-250 rounded-lg">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-650" />
                          <span>{errorMsg}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-black hover:bg-stone-900 border border-black text-white rounded-xl font-mono text-xs font-bold uppercase transition-all shadow-md active:scale-98 cursor-pointer"
                    >
                      Authenticate Access
                    </button>
                  </form>
                ) : (
                  
                  /* 2. AUTHENTICATED ADMIN DECK */
                  <div className="space-y-6">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl animate-pulse shadow-xs">
                          <Unlock className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-lg text-stone-900 leading-tight block uppercase">
                            Jack's Command Deck
                          </h4>
                          <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-mono font-bold">
                            Level: Root Executive Controller
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={handleLogout}
                          className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-250 text-stone-605 hover:text-stone-900 rounded-lg text-xs font-mono transition-all cursor-pointer font-bold uppercase shadow-xs"
                        >
                          Revoke Session
                        </button>
                      </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                      <button
                        onClick={() => {
                          setActiveTab('leads');
                          setEditingId(null);
                          setIsAdding(false);
                        }}
                        className={`px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                          activeTab === 'leads'
                            ? 'bg-black text-white'
                            : 'bg-white border border-stone-200 hover:bg-stone-50 text-stone-600'
                        }`}
                      >
                        Leads Inbox ({leads.length})
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('services');
                          setEditingId(null);
                          setIsAdding(false);
                        }}
                        className={`px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                          activeTab === 'services'
                            ? 'bg-black text-white'
                            : 'bg-white border border-stone-200 hover:bg-stone-50 text-stone-600'
                        }`}
                      >
                        Services Manager ({services.length})
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('photos');
                          setEditingId(null);
                          setIsAdding(false);
                          setEditingVisualsId(null);
                        }}
                        className={`px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                          activeTab === 'photos'
                            ? 'bg-black text-white'
                            : 'bg-white border border-stone-200 hover:bg-stone-50 text-stone-600'
                        }`}
                      >
                        Photos & Website Decor
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('email');
                          setEditingId(null);
                          setIsAdding(false);
                          setEditingVisualsId(null);
                        }}
                        className={`px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                          activeTab === 'email'
                            ? 'bg-black text-white'
                            : 'bg-white border border-stone-200 hover:bg-stone-50 text-stone-600'
                        }`}
                      >
                        Email Alerts Settings
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('reviews');
                          setEditingId(null);
                          setIsAdding(false);
                          setEditingVisualsId(null);
                        }}
                        className={`px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                          activeTab === 'reviews'
                            ? 'bg-black text-white'
                            : 'bg-white border border-stone-200 hover:bg-stone-50 text-stone-600'
                        }`}
                      >
                        Reviews Manager ({reviews.length})
                      </button>
                    </div>

                    {/* CONTENT - TAB: LEADS INBOX */}
                    {activeTab === 'leads' && (
                      <div className="space-y-4">
                        {!isEmailConfigured && (
                          <div className="p-4 bg-amber-50 border border-amber-250 rounded-2xl text-amber-900 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-3xs text-left">
                            <div className="flex items-center gap-2.5">
                              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                              <p className="font-light leading-relaxed">
                                <strong className="font-semibold text-amber-950 uppercase">Email Leads Forwarding Offline:</strong> You will not receive inbox email alerts when prospective clients submit quotes. Set up your Gmail and App Password to enable forwarding.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveTab('email')}
                              className="px-3.5 py-1.5 bg-amber-950 hover:bg-amber-900 text-stone-100 rounded-lg text-[10px] uppercase font-mono tracking-widest font-bold font-sans cursor-pointer shrink-0 transition-all active:scale-95 shadow-2xs"
                            >
                              Configure Now
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <h5 className="font-display font-bold text-stone-900 text-sm uppercase">Customer Requests Queue</h5>
                            <p className="text-stone-500 text-[11px] font-light font-sans">Leads logged instantly via customer contact quotes form.</p>
                          </div>
                          {leads.length > 0 && (
                            <button
                              onClick={handleClearAllLeads}
                              className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded text-[11px] font-mono font-bold transition-all cursor-pointer"
                            >
                              Flush Log
                            </button>
                          )}
                        </div>

                        {leads.length === 0 ? (
                          <div className="py-16 text-center border border-dashed border-stone-200 rounded-xl bg-white shadow-3xs">
                            <Mail className="w-8 h-8 text-stone-400 mx-auto mb-2 animate-pulse" />
                            <p className="text-stone-600 text-xs font-semibold font-sans">No pending leads or requests stored in local buffer yet.</p>
                            <p className="text-stone-400 text-[10px] mt-1 font-mono">Submit requests above to populate.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
                            {leads.map((lead) => (
                              <div 
                                key={lead.id}
                                className={`p-5 rounded-xl border transition-all text-left space-y-4 ${
                                  lead.status === 'new'
                                    ? 'bg-white border-emerald-250 shadow-xs'
                                    : lead.status === 'archived'
                                      ? 'bg-stone-100/50 border-stone-250 opacity-65 font-sans'
                                      : 'bg-stone-50/75 border-stone-200 opacity-85 font-sans'
                                }`}
                              >
                                {/* Lead Meta heading */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3 font-sans">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h6 className="font-display font-bold text-sm text-stone-900 uppercase">{lead.fullName}</h6>
                                      {lead.status === 'new' ? (
                                        <motion.span
                                          whileHover={{ scale: 1.05, y: -1 }}
                                          className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[9px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider shadow-3xs flex items-center gap-1.5 text-emerald-805 transition-colors cursor-default"
                                        >
                                          <Clock className="w-3 h-3 text-emerald-600 animate-[spin_10s_linear_infinite]" />
                                          NEW INQUIRY
                                        </motion.span>
                                      ) : lead.status === 'contacted' ? (
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <motion.span
                                            whileHover={{ scale: 1.05, y: -1 }}
                                            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[9px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider flex items-center gap-1.5 text-blue-800 transition-colors cursor-default"
                                          >
                                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                            CONTACTED
                                          </motion.span>
                                          <motion.span
                                            whileHover={{ scale: 1.05, y: -1 }}
                                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[9px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider flex items-center gap-1.5 text-emerald-855 animate-pulse shadow-3xs transition-colors cursor-default"
                                          >
                                            <Send className="w-2.5 h-2.5 text-emerald-600" />
                                            EMAIL SENT
                                          </motion.span>
                                        </div>
                                      ) : (
                                        <motion.span
                                          whileHover={{ scale: 1.05, y: -1 }}
                                          className="bg-stone-100 hover:bg-stone-200 border border-stone-250 text-[9px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider flex items-center gap-1.5 text-stone-600 transition-colors cursor-default"
                                        >
                                          <Archive className="w-3 h-3 text-stone-500" />
                                          ARCHIVED
                                        </motion.span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                                      <Calendar className="w-3 h-3 text-stone-400" />
                                      <span>{new Date(lead.createdAt).toLocaleString()}</span>
                                    </div>
                                  </div>

                                  {/* Action dropdowns/buttons */}
                                  <div className="flex items-center gap-1.5 pt-1 sm:pt-0 font-mono">
                                    {lead.status !== 'contacted' && (
                                      <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => handleUpdateLeadStatus(lead.id, 'contacted')}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-805 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer uppercase tracking-wider shadow-3xs"
                                        title="Mark as Contacted"
                                      >
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        Mark Call/Done
                                      </motion.button>
                                    )}
                                    {lead.status !== 'archived' && (
                                      <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => handleUpdateLeadStatus(lead.id, 'archived')}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-250 text-stone-605 hover:text-stone-900 rounded-lg text-[10px] font-bold transition-all cursor-pointer uppercase tracking-wider shadow-3xs"
                                        title="Archive Lead"
                                      >
                                        <Archive className="w-3 h-3 text-stone-500" />
                                        Archive
                                      </motion.button>
                                    )}
                                    <motion.button
                                      whileHover={{ scale: 1.15 }}
                                      whileTap={{ scale: 0.85 }}
                                      onClick={() => handleDeleteLead(lead.id)}
                                      className="p-1.5 text-stone-400 hover:text-red-655 transition-colors cursor-pointer"
                                      title="Purge"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </motion.button>
                                  </div>
                                </div>

                                {/* Contact + Specific details */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-stone-700 font-sans">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                    <span className="truncate">{lead.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                    <span>{lead.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                    <span className="truncate">{lead.address}</span>
                                  </div>
                                </div>

                                {/* Services list + notes */}
                                <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-205 space-y-2 font-sans text-left">
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className="text-[10px] font-mono text-stone-550 uppercase flex items-center justify-center pt-0.5 pr-1 font-bold">
                                      SERVICES IN ESTIMATOR:
                                    </span>
                                    {lead.services.length === 0 ? (
                                      <span className="text-[10px] text-stone-500 italic">No services explicitly chosen</span>
                                    ) : (
                                      lead.services.map((svc_title, index) => (
                                        <span 
                                          key={index}
                                          className="text-[10px] bg-white border border-emerald-200 px-2.5 py-0.5 rounded text-emerald-805 font-bold whitespace-nowrap shadow-3xs"
                                        >
                                          {svc_title}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                  {lead.notes && (
                                    <div className="text-[11px] leading-relaxed text-stone-705 pt-1.5 border-t border-stone-200">
                                      <span className="text-stone-550 font-bold block text-[10px] font-mono uppercase tracking-wide">CLIENT NOTES:</span>
                                      <p className="font-light mt-0.5">{lead.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CONTENT - TAB: SERVICES MANAGER */}
                    {activeTab === 'services' && (
                      <div className="space-y-4 font-sans">
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <h5 className="font-display font-bold text-stone-900 text-sm uppercase">Services Catalog Database</h5>
                            <p className="text-stone-500 text-[11px] font-light">Direct catalog overrides. Editing details instantly reflects in the pricing tables & quote builder.</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={onRestoreDefaults}
                              className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-250 text-stone-600 font-bold hover:text-stone-900 rounded text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <RefreshCw className="w-3 h-3 text-stone-400" />
                              Restore Defaults
                            </button>
                            <button
                              onClick={handleStartAddService}
                              className="px-3 py-1.5 bg-black hover:bg-stone-900 border border-black text-white rounded text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-md"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Service
                            </button>
                          </div>
                        </div>

                        {/* Editor Forms Area */}
                        {(isAdding || editingId) && (
                          <form onSubmit={handleSaveServiceForm} className="bg-white rounded-xl p-5 border border-stone-200 space-y-4 text-left animate-fade-in shadow-sm font-sans">
                            <h6 className="font-display font-bold text-xs text-stone-900 uppercase tracking-widest text-emerald-805 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-emerald-750 animate-pulse" />
                              {editingId ? 'Edit Landscaping Solution' : 'Introduce New Landscape Offering'}
                            </h6>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[11px] font-mono text-stone-500 block uppercase">Service Title</label>
                                <input
                                  type="text"
                                  value={serviceForm.title || ''}
                                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                                  placeholder="e.g. Lawn Mowing"
                                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-mono text-stone-500 block uppercase">Category</label>
                                <input
                                  type="text"
                                  value={serviceForm.category || ''}
                                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                                  placeholder="e.g. Property Care"
                                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-mono text-stone-500 block uppercase">Description</label>
                              <textarea
                                value={serviceForm.description || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                placeholder="Precision clipping, concrete lines edging..."
                                className="w-full px-3.5 py-2 h-16 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[11px] font-mono text-stone-500 block uppercase">Service Icon</label>
                                <select
                                  value={serviceForm.iconName || 'sparkles'}
                                  onChange={(e) => setServiceForm({ ...serviceForm, iconName: e.target.value as any })}
                                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs focus:outline-none focus:border-emerald-650 cursor-pointer shadow-3xs"
                                >
                                  <option value="sparkles">Sparkles (Quality/Precision)</option>
                                  <option value="tree">Tree (Landscape/Hedges)</option>
                                  <option value="shovel">Shovel (Soil/Mulch/Debris)</option>
                                  <option value="hammer">Hammer (Hardscaping/Weed out)</option>
                                  <option value="droplet">Droplet (Watering/Aqueous)</option>
                                  <option value="sun">Sun (Fertilizing/Nutrition)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-mono text-stone-500 block uppercase">
                                  Key Features / Bullet Points (Comma Separated)
                                </label>
                                <input
                                  type="text"
                                  value={featureInput}
                                  onChange={(e) => setFeatureInput(e.target.value)}
                                  placeholder="Licensed cut geometry, Premium string edging, Sidewalk blow-off"
                                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2.5 justify-end pt-4 border-t border-stone-200">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(null);
                                  setIsAdding(false);
                                }}
                                className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-250 text-stone-600 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-black hover:bg-stone-900 border border-black text-white font-bold rounded-lg text-xs font-mono transition-colors uppercase tracking-wider cursor-pointer flex items-center gap-1 shadow-md"
                              >
                                <Check className="w-4 h-4" />
                                Save Service
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Services List Table */}
                        <div className="border border-stone-205 rounded-xl overflow-hidden bg-white max-h-[500px] overflow-y-auto shadow-3xs">
                          <table className="w-full border-collapse text-left text-xs text-stone-700 font-sans">
                            <thead>
                              <tr className="border-b border-stone-200 uppercase font-mono text-[9px] tracking-wider text-stone-600 bg-stone-50 font-bold">
                                <th className="p-4">Service</th>
                                <th className="p-4 hidden md:table-cell">Category</th>
                                <th className="p-4 font-normal">Key highlights</th>
                                <th className="p-4 text-center font-normal">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-150">
                              {services.map((svc) => (
                                <tr key={svc.id} className="hover:bg-stone-50/50 transition-colors">
                                  <td className="p-4">
                                    <div className="flex flex-col">
                                      <span className="font-display font-bold text-stone-900 text-sm uppercase">{svc.title}</span>
                                      <span className="text-[10px] text-stone-500 block md:hidden mt-0.5 font-mono">{svc.category}</span>
                                    </div>
                                  </td>
                                  <td className="p-4 hidden md:table-cell font-mono text-stone-700 font-medium uppercase text-[11px]">
                                    {svc.category}
                                  </td>
                                  <td className="p-4 max-w-xs font-mono text-[10px] text-stone-500">
                                    {svc.features?.slice(0, 2).join(', ')}...
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => handleStartEditService(svc)}
                                        className="p-1.5 text-stone-450 hover:text-emerald-708 transition-colors cursor-pointer"
                                        title="Edit Service Details"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteService(svc.id)}
                                        className="p-1.5 text-stone-400 hover:text-red-655 transition-colors cursor-pointer"
                                        title="Delete Service"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                      </div>
                    )}

                    {/* CONTENT - TAB: BEFORE & AFTER PHOTOS */}
                    {activeTab === 'photos' && (
                      <div className="space-y-6 font-sans">
                        <div className="text-left border-b border-stone-200 pb-4">
                          <h5 className="font-display font-bold text-stone-900 text-sm uppercase flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-emerald-650" />
                            Before & After Performance Showcases
                          </h5>
                          <p className="text-stone-500 text-[11px] font-light mt-1">
                            Set physical image paths/URLs and descriptive captions for each landscape treatment. The split-screen slider on detailed service pages loads these values in real-time.
                          </p>
                        </div>

                        {/* Website Cover Configuration Panel */}
                        <div className="bg-emerald-50/15 border border-emerald-255 rounded-2xl p-5 sm:p-6 space-y-5 text-left font-sans mb-8">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                            <div>
                              <h6 className="font-display font-bold text-sm text-stone-900 uppercase flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-700 font-bold" />
                                Main Website Cover Photo
                              </h6>
                              <p className="text-stone-505 text-[11px] font-light mt-0.5">Customize the primary background image displayed at the very top of the website (Hero Header).</p>
                            </div>
                            {coverPhoto !== '/src/assets/images/landscape_hero_1779327295782.png' && onSaveCoverPhoto && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm('Reset the website cover background to the default golden hour landscape photo?')) {
                                    onSaveCoverPhoto('/src/assets/images/landscape_hero_1779327295782.png');
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-red-50 text-red-705 border border-red-200 hover:bg-red-100/70 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-3xs"
                              >
                                Reset Primary
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Selector Input */}
                            <div className="space-y-4">
                              <ImageUploadSelector
                                label="Upload New Cover Photo or Enter URL"
                                value={coverPhoto || ''}
                                onChange={(val) => onSaveCoverPhoto && onSaveCoverPhoto(val)}
                                onFileChange={handleUploadCoverFile}
                                placeholder="e.g. /src/assets/images/landscape_hero_1779327295782.png or custom Unsplash URL"
                                isUploading={isUploadingCover}
                              />
                            </div>

                            {/* Live Simulated Mobile Preview */}
                            <div className="bg-stone-900 border border-stone-800 p-4.5 rounded-xl text-stone-200 flex flex-col justify-between h-full relative overflow-hidden min-h-[160px] shadow-3xs">
                              {/* Image Background */}
                              <div className="absolute inset-0 z-0 bg-stone-950">
                                <img
                                  src={coverPhoto || '/src/assets/images/landscape_hero_1779327295782.png'}
                                  alt="Live cover background"
                                  className="w-full h-full object-cover opacity-45 scale-102 filter brightness-[0.7] contrast-[1.05]"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />
                              </div>

                              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-[8px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    LIVE HERO PREVIEW
                                  </span>
                                  <span className="text-[8px] font-mono text-stone-400 uppercase tracking-widest">
                                    JACK’S MOWING &amp; MORE
                                  </span>
                                </div>

                                <div className="text-left space-y-1 max-w-[280px]">
                                  <h5 className="font-display font-black text-xs sm:text-sm text-white leading-tight uppercase tracking-tight">
                                    At Jack’s Mowing and More, we provide dependable lawn care...
                                  </h5>
                                </div>

                                <div className="flex gap-2">
                                  <div className="h-4.5 w-18 rounded bg-white text-[7px] font-bold text-stone-900 flex items-center justify-center font-mono uppercase tracking-widest shadow-2xs">RATE</div>
                                  <div className="h-4.5 w-18 rounded bg-transparent border border-white/20 text-[7px] font-bold text-white flex items-center justify-center font-mono uppercase tracking-widest">SERVICES</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Website Logo and Branding Configuration Card */}
                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-5 text-left font-sans mb-8">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                            <div>
                              <h6 className="font-display font-bold text-sm text-stone-900 uppercase flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-700 font-bold" />
                                Website Brand Logo &amp; Name
                              </h6>
                              <p className="text-stone-550 text-[11px] font-light mt-0.5">
                                Toggle between our high-fidelity handcrafted vector emblem logo or upload your customized brand logo files. Your preferences build synchronously in navigation bar and footer elements in real-time.
                              </p>
                            </div>
                            {logoConfig && onSaveLogoConfig && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm("Reset your logo layout back to Jack's premium default SVG design?")) {
                                    onSaveLogoConfig({
                                      logoType: 'svg',
                                      imageUrl: '',
                                      svgTextTop: "Jack's",
                                      svgTextBottom: "Mowing & More",
                                      svgColor: '#dc2626'
                                    });
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-stone-100 text-stone-605 border border-stone-250 hover:bg-stone-200 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-3xs"
                              >
                                Restore Classic Brand
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            {/* Control form panel */}
                            <div className="md:col-span-7 space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-stone-500 block uppercase font-bold tracking-wider">
                                  Logo Representation Type
                                </label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onSaveLogoConfig && logoConfig) {
                                        onSaveLogoConfig({ ...logoConfig, logoType: 'svg' });
                                      }
                                    }}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                                      (logoConfig?.logoType || 'svg') === 'svg'
                                        ? 'bg-stone-900 border-stone-900 text-white shadow-3xs'
                                        : 'bg-white border-stone-250 text-stone-600 hover:bg-stone-50'
                                    }`}
                                  >
                                    Vector SVG Emblem
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onSaveLogoConfig && logoConfig) {
                                        onSaveLogoConfig({ ...logoConfig, logoType: 'image' });
                                      }
                                    }}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                                      logoConfig?.logoType === 'image'
                                        ? 'bg-stone-900 border-stone-900 text-white shadow-3xs'
                                        : 'bg-white border-stone-250 text-stone-600 hover:bg-stone-50'
                                    }`}
                                  >
                                    Custom Image File
                                  </button>
                                </div>
                              </div>

                              {/* CONDITIONAL CONTROLS: SVG REMODELER */}
                              {(logoConfig?.logoType || 'svg') === 'svg' && (
                                <div className="space-y-4 p-4.5 bg-white border border-stone-200 rounded-xl shadow-3xs animate-fade-in">
                                  <span className="text-[9px] font-mono bg-emerald-50 text-emerald-805 px-2 py-0.5 border border-emerald-150 rounded uppercase font-bold tracking-wider block w-max mb-1">
                                    Vector Customizer Fields
                                  </span>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-stone-600 block uppercase font-semibold">Brand Moniker (Top)</label>
                                      <input
                                        type="text"
                                        value={logoConfig?.svgTextTop || "Jack's"}
                                        onChange={(e) => {
                                          if (onSaveLogoConfig && logoConfig) {
                                            onSaveLogoConfig({ ...logoConfig, svgTextTop: e.target.value });
                                          }
                                        }}
                                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                        placeholder="e.g. Jack's"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-stone-600 block uppercase font-semibold">Specialty Tagline (Bottom)</label>
                                      <input
                                        type="text"
                                        value={logoConfig?.svgTextBottom || "Mowing & More"}
                                        onChange={(e) => {
                                          if (onSaveLogoConfig && logoConfig) {
                                            onSaveLogoConfig({ ...logoConfig, svgTextBottom: e.target.value });
                                          }
                                        }}
                                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                        placeholder="e.g. Mowing & More"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-stone-600 block uppercase font-semibold">Wheel & mower accent color</label>
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="color"
                                        value={logoConfig?.svgColor || "#dc2626"}
                                        onChange={(e) => {
                                          if (onSaveLogoConfig && logoConfig) {
                                            onSaveLogoConfig({ ...logoConfig, svgColor: e.target.value });
                                          }
                                        }}
                                        className="w-10 h-10 border border-stone-300 rounded cursor-pointer p-0.5 bg-white shrink-0"
                                      />
                                      <div className="space-y-0.5 text-left">
                                        <input
                                          type="text"
                                          value={logoConfig?.svgColor || "#dc2626"}
                                          onChange={(e) => {
                                            if (onSaveLogoConfig && logoConfig) {
                                              onSaveLogoConfig({ ...logoConfig, svgColor: e.target.value });
                                            }
                                          }}
                                          className="px-2 py-1 bg-white border border-stone-300 rounded text-stone-800 font-mono text-[11px] focus:outline-none focus:border-emerald-650 w-24"
                                        />
                                        <span className="text-[9px] text-stone-400 block">Click square color picker or enter HEX</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* CONDITIONAL CONTROLS: FILE ATTACHED UPLOADER */}
                              {logoConfig?.logoType === 'image' && (
                                <div className="space-y-4 p-4.5 bg-white border border-stone-200 rounded-xl shadow-3xs animate-fade-in">
                                  <span className="text-[9px] font-mono bg-blue-50 text-blue-805 px-2 py-0.5 border border-blue-150 rounded uppercase font-bold tracking-wider block w-max mb-1">
                                    Brand Graphic File
                                  </span>

                                  <ImageUploadSelector
                                    label="Upload Brand Logo File"
                                    value={logoConfig?.imageUrl || ''}
                                    onChange={(val) => {
                                      if (onSaveLogoConfig && logoConfig) {
                                        onSaveLogoConfig({ ...logoConfig, imageUrl: val });
                                      }
                                    }}
                                    onFileChange={handleUploadLogoFile}
                                    placeholder="Click to browse your hard drive, drag a PNG/JPG, or paste a URL"
                                    isUploading={isUploadingLogo}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Live high-fidelity brand preview panel */}
                            <div className="md:col-span-5 h-full flex flex-col">
                              <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[220px] shadow-3xs flex-1 text-center relative overflow-hidden">
                                <div className="absolute top-3 left-3">
                                  <span className="text-[8px] font-mono bg-stone-900 text-stone-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider flex items-center gap-1">
                                    <Eye className="w-3 h-3 text-emerald-450" />
                                    Live Logo Preview
                                  </span>
                                </div>

                                <div className="p-4 bg-stone-50 border border-dashed border-stone-250 rounded-xl flex items-center justify-center w-36 h-36 mt-4">
                                  <JacksLogo 
                                    size={96}
                                    logoType={logoConfig?.logoType || 'svg'}
                                    imageUrl={logoConfig?.imageUrl}
                                    svgTextTop={logoConfig?.svgTextTop}
                                    svgTextBottom={logoConfig?.svgTextBottom}
                                    svgColor={logoConfig?.svgColor}
                                  />
                                </div>

                                <div className="mt-4 text-center">
                                  <h6 className="font-serif font-black text-stone-950 text-base leading-none">
                                    {logoConfig?.svgTextTop || "Jack's"}
                                  </h6>
                                  <span className="text-[10px] font-mono text-emerald-700 uppercase font-semibold tracking-widest mt-1 block">
                                    {logoConfig?.svgTextBottom || "Mowing & More"}
                                  </span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Dynamic Website Contact Info Configuration Card */}
                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-5 text-left font-sans mb-8">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                            <div>
                              <h6 className="font-display font-bold text-sm text-stone-900 uppercase flex items-center gap-2">
                                <Mail className="w-4 h-4 text-emerald-700 font-bold" />
                                Contact Coordinates &amp; Footer Info
                              </h6>
                              <p className="text-stone-550 text-[11px] font-light mt-0.5">
                                Customize support phone, click-to-call raw paths, business email accounts, and location descriptions rendered globally across header callouts and footer directory boards.
                              </p>
                            </div>
                            {contactInfo && onSaveContactInfo && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm("Reset contact credentials and local directory information back to Jack's premium defaults?")) {
                                    onSaveContactInfo({
                                      phone: "+1 (732) 790-9789",
                                      phoneRaw: "1-732-790-9789",
                                      email: "estimates@jacksmowing.com",
                                      location: "Milltown, NJ",
                                      description: "Architectural landscape design, precision lawn mowing, lawn recovery, and custom stonemasonry. Serving Milltown with pride and premium cleanup."
                                    });
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-stone-100 text-stone-605 border border-stone-250 hover:bg-stone-200 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-3xs"
                              >
                                Restore Classic Address
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            {/* Main editing controls */}
                            <div className="md:col-span-7 space-y-4">
                              {contactInfo && onSaveContactInfo ? (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-stone-500 block uppercase font-bold tracking-wider">
                                        Phone Number (Display)
                                      </label>
                                      <input
                                        type="text"
                                        value={contactInfo.phone || ''}
                                        onChange={(e) => onSaveContactInfo({ ...contactInfo, phone: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                        placeholder="e.g. +1 (732) 790-9789"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-stone-500 block uppercase font-bold tracking-wider">
                                        Raw Phone Links (tel: link)
                                      </label>
                                      <input
                                        type="text"
                                        value={contactInfo.phoneRaw || ''}
                                        onChange={(e) => onSaveContactInfo({ ...contactInfo, phoneRaw: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                        placeholder="e.g. 1-732-790-9789"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-stone-500 block uppercase font-bold tracking-wider">
                                        Email Coordinates
                                      </label>
                                      <input
                                        type="email"
                                        value={contactInfo.email || ''}
                                        onChange={(e) => onSaveContactInfo({ ...contactInfo, email: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                        placeholder="e.g. estimates@jacksmowing.com"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-stone-500 block uppercase font-bold tracking-wider">
                                        Town / Operating Area
                                      </label>
                                      <input
                                        type="text"
                                        value={contactInfo.location || ''}
                                        onChange={(e) => onSaveContactInfo({ ...contactInfo, location: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                        placeholder="e.g. Milltown, NJ"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-stone-500 block uppercase font-bold tracking-wider">
                                      Branding Bio Description (Footer Column)
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={contactInfo.description || ''}
                                      onChange={(e) => onSaveContactInfo({ ...contactInfo, description: e.target.value })}
                                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs resize-none"
                                      placeholder="Explain your specialties and territory area here..."
                                    />
                                  </div>
                                </div>
                              ) : (
                                <p className="text-stone-400 text-xs italic">Unable to read contact states dynamically.</p>
                              )}
                            </div>

                            {/* Live high-fidelity address preview card */}
                            <div className="md:col-span-5 h-full flex flex-col">
                              {contactInfo ? (
                                <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-center min-h-[220px] shadow-3xs flex-1 relative overflow-hidden text-left bg-stone-50/50">
                                  <div className="absolute top-3 left-3">
                                    <span className="text-[8px] font-mono bg-stone-900 text-stone-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider flex items-center gap-1">
                                      <Eye className="w-3 h-3 text-emerald-450" />
                                      Live Footer preview card
                                    </span>
                                  </div>

                                  <div className="space-y-4 pt-4 text-stone-800">
                                    <div>
                                      <h6 className="font-display font-semibold text-stone-650 text-[10px] uppercase tracking-wider">Company Bio column</h6>
                                      <p className="text-stone-500 text-[11px] leading-relaxed mt-1 font-light italic">
                                        "{contactInfo.description}"
                                      </p>
                                    </div>

                                    <div className="border-t border-stone-150 pt-3">
                                      <h6 className="font-display font-semibold text-stone-650 text-[10px] uppercase tracking-wider">Contact Column</h6>
                                      <div className="space-y-1.5 mt-1.5 text-[11px] text-stone-605">
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-3.5 h-3.5 text-stone-405 shrink-0" />
                                          <span className="font-medium text-stone-750">{contactInfo.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Mail className="w-3.5 h-3.5 text-stone-405 shrink-0" />
                                          <span className="hover:underline text-emerald-700">{contactInfo.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <MapPin className="w-3.5 h-3.5 text-stone-405 shrink-0" />
                                          <span>{contactInfo.location}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-white border border-stone-200 rounded-xl p-6 flex items-center justify-center min-h-[220px]">
                                  <p className="text-stone-400 text-xs italic">Missing preview data</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Portfolio Slider Configuration Panel */}
                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-5 text-left font-sans mb-8">
                          <div>
                            <h6 className="font-display font-bold text-sm text-stone-900 uppercase flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 text-emerald-700 font-bold" />
                              Interactive Before-and-After Slider (Homepage Portfolio Slider)
                            </h6>
                            <p className="text-stone-500 text-[11px] font-light mt-0.5">
                              Customize the interactive comparison slider shown in the portfolio section of the main page. Update image URLs/uploads and custom corner labels.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Side: Before Info */}
                            <div className="space-y-4 p-4 bg-white rounded-xl border border-stone-150 shadow-3xs">
                              <span className="text-[10px] font-mono text-amber-805 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded font-bold uppercase tracking-wider block w-max">
                                Left Slider / Before Settings
                              </span>
                              <ImageUploadSelector
                                label="Before View Image"
                                value={sliderConfig.beforeImg}
                                onChange={(val) => {
                                  const updated = { ...sliderConfig, beforeImg: val };
                                  setSliderConfig(updated);
                                  saveSliderConfigToServer(updated);
                                }}
                                onFileChange={(file) => handleUploadSliderFile(file, 'beforeImg')}
                                placeholder="Upload or URL for Before image"
                                isUploading={isUploadingSliderBefore}
                              />
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-stone-605 block uppercase font-bold tracking-wider">Before Label / Caption</label>
                                <input
                                  type="text"
                                  value={sliderConfig.beforeLabel}
                                  onChange={(e) => {
                                    const updated = { ...sliderConfig, beforeLabel: e.target.value };
                                    setSliderConfig(updated);
                                    saveSliderConfigToServer(updated);
                                  }}
                                  placeholder="e.g. Dry Weedy Clay Lot (Before)"
                                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                />
                              </div>
                            </div>

                            {/* Right Side: After Info */}
                            <div className="space-y-4 p-4 bg-white rounded-xl border border-stone-150 shadow-3xs">
                              <span className="text-[10px] font-mono text-emerald-805 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded font-bold uppercase tracking-wider block w-max">
                                Right Slider / After Settings
                              </span>
                              <ImageUploadSelector
                                label="After View Image"
                                value={sliderConfig.afterImg}
                                onChange={(val) => {
                                  const updated = { ...sliderConfig, afterImg: val };
                                  setSliderConfig(updated);
                                  saveSliderConfigToServer(updated);
                                }}
                                onFileChange={(file) => handleUploadSliderFile(file, 'afterImg')}
                                placeholder="Upload or URL for After image"
                                isUploading={isUploadingSliderAfter}
                              />
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-stone-605 block uppercase font-bold tracking-wider">After Label / Caption</label>
                                <input
                                  type="text"
                                  value={sliderConfig.afterLabel}
                                  onChange={(e) => {
                                    const updated = { ...sliderConfig, afterLabel: e.target.value };
                                    setSliderConfig(updated);
                                    saveSliderConfigToServer(updated);
                                  }}
                                  placeholder="e.g. Lined Botanical Walkway (After)"
                                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Service Card Thumbnail Images Panel */}
                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-5 text-left font-sans mb-8">
                          <div>
                            <h6 className="font-display font-bold text-sm text-stone-900 uppercase flex items-center gap-2">
                              <Layers className="w-4 h-4 text-emerald-700 font-bold" />
                              Primary Service Card Thumbnail Images (Homepage Grid)
                            </h6>
                            <p className="text-stone-500 text-[11px] font-light mt-0.5">
                              Modify the cover thumbnails loaded directly within each service's general summary card displayed on your homepage.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {services.map((svc) => {
                              const CARD_DEFAULTS: Record<string, string> = {
                                'service-l-mowing': '/src/assets/images/lawn_mowing_after_1779586183040.png',
                                'service-l-cleanup': 'https://images.unsplash.com/photo-1534710951274-1851d3061271?auto=format&fit=crop&q=80&w=800',
                                'service-l-landscape': 'https://images.unsplash.com/photo-1558904541-efa8c1a68fa6?auto=format&fit=crop&q=80&w=800',
                                'service-l-hedge': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
                                'service-l-mulch': 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=800',
                                'service-l-weed': 'https://images.unsplash.com/photo-1507036066871-b708937449ab?auto=format&fit=crop&q=80&w=800',
                                'service-l-fertilizer': 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&q=80&w=800',
                                'service-l-restoration': 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&q=80&w=800'
                              };
                              const currentUrl = serviceCardImages[svc.id] || CARD_DEFAULTS[svc.id] || '';
                              return (
                                <div key={svc.id} className="bg-white border border-stone-200 p-4 rounded-xl space-y-3 shadow-3xs flex flex-col justify-between">
                                  <div className="space-y-2">
                                    <div className="space-y-0.5 text-left">
                                      <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider">{svc.category}</span>
                                      <h6 className="text-[11px] font-display font-bold uppercase text-stone-900 truncate">{svc.title}</h6>
                                    </div>

                                    {/* Thumbnail Preview */}
                                    <div className="aspect-video rounded bg-stone-100 overflow-hidden relative border border-stone-200 shadow-3xs flex items-center justify-center">
                                      {currentUrl ? (
                                        <img 
                                          src={currentUrl} 
                                          alt={svc.title} 
                                          className="w-full h-full object-cover"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        <span className="text-[8px] font-mono text-stone-400">No image assigned</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-2">
                                    <ImageUploadSelector
                                      label=""
                                      value={currentUrl}
                                      onChange={(val) => saveServiceCardImageToServer(svc.id, val)}
                                      onFileChange={(file) => handleUploadCardImageFile(file, svc.id)}
                                      placeholder="Thumbnail URL or Upload"
                                      isUploading={!!isUploadingCardImage[svc.id]}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Editor Forms Area */}
                        {editingVisualsId && (
                          <form onSubmit={handleSaveVisualsForm} className="bg-white rounded-xl p-5 border border-stone-200 space-y-4 text-left animate-fade-in shadow-sm font-sans">
                            <div className="flex items-center justify-between border-b border-stone-150 pb-2.5">
                              <h6 className="font-display font-bold text-xs text-stone-900 uppercase tracking-widest text-emerald-805 flex items-center gap-1.5">
                                <Edit3 className="w-3.5 h-3.5 text-emerald-750 animate-pulse" />
                                Edit Showcase Photo: {services.find(s => s.id === editingVisualsId)?.title || editingVisualsId}
                              </h6>
                              <button
                                type="button"
                                onClick={() => setEditingVisualsId(null)}
                                className="text-stone-400 hover:text-stone-700 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Two-Column split for Inputs and Live Previews */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Left Column: Form Fields */}
                              <div className="space-y-4">
                                <ImageUploadSelector
                                  label="Before Image (Upload or URL)"
                                  value={visualsForm.beforeImg}
                                  onChange={(val) => setVisualsForm({ ...visualsForm, beforeImg: val })}
                                  onFileChange={(file) => handleUploadFile(file, 'beforeImg')}
                                  placeholder="e.g. /src/assets/images/lawn_mowing_before_1779586168566.png or Unsplash URL"
                                  isUploading={isUploading.beforeImg}
                                />

                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-stone-650 block uppercase font-bold tracking-wider">Before State Description</label>
                                  <textarea
                                    value={visualsForm.beforeDesc}
                                    onChange={(e) => setVisualsForm({ ...visualsForm, beforeDesc: e.target.value })}
                                    placeholder="e.g. Overgrown, weedy residential grass lawn needing precision deck trim..."
                                    className="w-full px-3.5 py-2 h-16 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs hover:border-emerald-650"
                                    rows={2}
                                  />
                                </div>

                                <ImageUploadSelector
                                  label="After Image (Upload or URL)"
                                  value={visualsForm.afterImg}
                                  onChange={(val) => setVisualsForm({ ...visualsForm, afterImg: val })}
                                  onFileChange={(file) => handleUploadFile(file, 'afterImg')}
                                  placeholder="e.g. /src/assets/images/lawn_mowing_after_1779586183040.png or Unsplash URL"
                                  isUploading={isUploading.afterImg}
                                />

                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-stone-650 block uppercase font-bold tracking-wider">After State Description</label>
                                  <textarea
                                    value={visualsForm.afterDesc}
                                    onChange={(e) => setVisualsForm({ ...visualsForm, afterDesc: e.target.value })}
                                    placeholder="e.g. Lawn manicured precisely with professional diagonal striping geometry..."
                                    className="w-full px-3.5 py-2 h-16 bg-white border border-stone-300 rounded-lg text-stone-900 font-light text-xs focus:outline-none focus:border-emerald-650 shadow-3xs hover:border-emerald-650"
                                    rows={2}
                                  />
                                </div>
                              </div>

                              {/* Right Column: Live Side-by-Side Previews */}
                              <div className="bg-stone-50 p-4 border border-stone-200 rounded-xl flex flex-col justify-between">
                                <div className="space-y-4">
                                  <span className="text-[10px] font-mono text-stone-500 uppercase font-bold tracking-wider block text-left">🔴 Live Side-by-Side Verification Previews</span>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    {/* Before Preview */}
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-mono text-amber-750 font-bold block bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 text-center uppercase">Before View</span>
                                      <div className="aspect-video w-full rounded-lg bg-stone-200 overflow-hidden relative border border-stone-300 shadow-3xs">
                                        {visualsForm.beforeImg ? (
                                          <img 
                                            src={visualsForm.beforeImg} 
                                            alt="Before preview" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=300';
                                            }}
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-500 font-mono">No Image</div>
                                        )}
                                      </div>
                                    </div>

                                    {/* After Preview */}
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-mono text-emerald-750 font-bold block bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 text-center uppercase">After View</span>
                                      <div className="aspect-video w-full rounded-lg bg-stone-200 overflow-hidden relative border border-stone-300 shadow-3xs">
                                        {visualsForm.afterImg ? (
                                          <img 
                                            src={visualsForm.afterImg} 
                                            alt="After preview" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?auto=format&fit=crop&q=80&w=300';
                                            }}
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-500 font-mono">No Image</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-[10px] text-stone-600 text-left border-t border-stone-200 pt-3 flex flex-col gap-1 leading-relaxed">
                                    <span className="font-bold uppercase font-mono tracking-wider text-stone-550 block">💡 Photo Pro-Tips:</span>
                                    <span>• You can paste direct links from Unsplash, Imgur, or absolute paths inside your app (e.g. <code className="font-mono bg-stone-200 px-1 py-0.5 rounded">/src/assets/images/...</code>)</span>
                                    <span>• Image parameters are auto-applied on save across all customer interfaces.</span>
                                  </div>
                                </div>

                                <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-stone-205">
                                  <button
                                    type="button"
                                    onClick={() => setEditingVisualsId(null)}
                                    className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-250 text-stone-605 rounded-lg text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                                  >
                                    Close Editor
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 border border-emerald-700 text-white font-bold rounded-lg text-xs font-mono transition-colors uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm"
                                  >
                                    <Check className="w-4 h-4" />
                                    Confirm & Save Photos
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        )}

                        {/* List Grid of service visual configuration cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {services.map((svc) => {
                            const custom = customVisuals[svc.id];
                            const def = DEFAULT_VISUALS[svc.id] || {
                              beforeImg: '',
                              afterImg: '',
                              beforeDesc: 'Standard overgrown landscape pre-treatment state.',
                              afterDesc: 'Dramatically cleaned, trimmed, and landscaped after treatment.'
                            };
                            
                            const beforeImg = custom?.beforeImg || def.beforeImg;
                            const afterImg = custom?.afterImg || def.afterImg;
                            const isCustomized = !!custom;

                            return (
                              <div key={svc.id} className="p-4 bg-white border border-stone-200 rounded-xl text-left space-y-4 shadow-3xs flex flex-col justify-between">
                                <div>
                                  {/* Service title and status tag */}
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-0.5">
                                      <h6 className="font-display font-bold text-sm uppercase text-stone-900 leading-tight">{svc.title}</h6>
                                      <span className="text-[10px] text-stone-500 font-mono block">{svc.category}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {isCustomized ? (
                                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-fade-in">
                                          CUSTOMIZED BY OWNER
                                        </span>
                                      ) : (
                                        <span className="bg-stone-550/10 text-stone-600 border border-stone-200 text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                          NO DESIGN PHOTOS YET
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Twin mini preview windows */}
                                  <div className="grid grid-cols-2 gap-2 mt-3.5 relative">
                                    {/* Mini Before preview */}
                                    <div className="space-y-0.5">
                                      <div className="aspect-video rounded bg-stone-100 border border-stone-250 overflow-hidden relative shadow-3xs flex items-center justify-center">
                                        {beforeImg ? (
                                          <img 
                                            src={beforeImg} 
                                            alt="Mini Before" 
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <div className="text-[8px] font-mono text-stone-400 text-center flex flex-col items-center justify-center p-1">
                                            <ImageIcon className="w-4 h-4 text-stone-300 mb-0.5" />
                                            <span>No Before Photo</span>
                                          </div>
                                        )}
                                        <div className="absolute left-1 bottom-1 bg-black/75 px-1 py-0.5 rounded text-[8px] font-mono text-stone-250 uppercase font-bold">Before</div>
                                      </div>
                                    </div>

                                    {/* Mini After preview */}
                                    <div className="space-y-0.5">
                                      <div className="aspect-video rounded bg-stone-100 border border-stone-250 overflow-hidden relative shadow-3xs flex items-center justify-center">
                                        {afterImg ? (
                                          <img 
                                            src={afterImg} 
                                            alt="Mini After" 
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <div className="text-[8px] font-mono text-stone-400 text-center flex flex-col items-center justify-center p-1">
                                            <ImageIcon className="w-4 h-4 text-stone-300 mb-0.5" />
                                            <span>No After Photo</span>
                                          </div>
                                        )}
                                        <div className="absolute right-1 bottom-1 bg-emerald-950/90 text-emerald-400 border border-emerald-900 px-1 py-0.5 rounded text-[8px] font-mono uppercase font-bold">After</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
                                  {isCustomized ? (
                                    <button
                                      type="button"
                                      onClick={() => handleResetVisuals(svc.id)}
                                      className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shadow-3xs"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      Reset Default
                                    </button>
                                  ) : (
                                    <div />
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleStartEditVisuals(svc.id)}
                                    className="px-3 py-1.5 bg-black hover:bg-stone-905 border border-black text-white text-[10px] font-mono rounded font-bold transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1 shadow-xs"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Change Pictures
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeTab === 'email' && (
                      <div className="space-y-6 font-sans text-left pb-4">
                        <div className="border-b border-stone-200 pb-4">
                          <h5 className="font-display font-bold text-stone-900 text-sm uppercase flex items-center gap-2">
                            <Mail className="w-4 h-4 text-emerald-650" />
                            Email Alerts Configuration & Test Deck
                          </h5>
                          <p className="text-stone-500 text-[11px] font-light mt-1">
                            Configure automatic email forwarding for customer consultation quotes so they route directly to your inbox.
                          </p>
                        </div>

                        {/* Informational Guidance Panel */}
                        <div className="bg-emerald-50/20 border border-emerald-250 p-4 rounded-xl text-stone-700 text-xs space-y-3.5 leading-relaxed">
                          <p className="font-bold text-emerald-900 flex items-center gap-1.5 font-display text-xs uppercase">
                            💡 Setup Guidance for Google App Passwords
                          </p>
                          <div className="space-y-1.5 font-light text-stone-650">
                            <p>To authorize this lander to safely forward leads using your Gmail account, you must generate a secure Google App Password on Google:</p>
                            <ol className="list-decimal list-inside pl-1 space-y-1 text-[11px]">
                              <li>Go to your Google Account (myaccount.google.com)</li>
                              <li>In the search box, find or type "App Passwords" (or enable 2-Step Verification first under Security tab)</li>
                              <li>Select App name as "Other (Custom Name)" and input "Jacks Landscape Mowing"</li>
                              <li>Click Generate to reveal the 16-character secure code (e.g. "xxxx xxxx xxxx xxxx")</li>
                              <li>Paste that 16-character code into the SMTP password field below!</li>
                            </ol>
                          </div>
                        </div>

                        <form onSubmit={(e) => {
                          e.preventDefault();
                          setEmailSettingsSavedStatus('Saving settings on server...');
                          fetch('/api/email-config', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ recipientEmail, smtpUser, smtpPass })
                          })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                setEmailSettingsSavedStatus('Settings saved successfully!');
                                loadEmailConfig();
                                setTimeout(() => setEmailSettingsSavedStatus(''), 4000);
                              } else {
                                setEmailSettingsSavedStatus('Failed to update: ' + data.error);
                              }
                            })
                            .catch(err => {
                              setEmailSettingsSavedStatus('Failed to update configurations: ' + err.message);
                            });
                        }} className="space-y-4">
                          
                          {/* Destination Recipient */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block text-left">Notification Destination Email (Receiver Email)</label>
                            <input
                              type="email"
                              required
                              value={recipientEmail}
                              onChange={(e) => setRecipientEmail(e.target.value)}
                              placeholder="jacks.mowing.and.more1@gmail.com"
                              className="w-full px-3.5 py-2.5 bg-white border border-stone-250 focus:border-emerald-650 focus:outline-none rounded-xl text-xs font-mono text-stone-900 focus:ring-1 focus:ring-emerald-600/30"
                            />
                            <p className="text-[10px] text-stone-500 font-light font-sans">Every completed booking form submission will be instantly forwarded/copied to this recipient.</p>
                          </div>

                          {/* SMTP User Email */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block text-left">SMTP Send-From Gmail Address (Sender Email)</label>
                            <input
                              type="email"
                              required
                              value={smtpUser}
                              onChange={(e) => setSmtpUser(e.target.value)}
                              placeholder="jacks.mowing.and.more1@gmail.com"
                              className="w-full px-3.5 py-2.5 bg-white border border-stone-250 focus:border-emerald-650 focus:outline-none rounded-xl text-xs font-mono text-stone-900 focus:ring-1 focus:ring-emerald-600/30"
                            />
                            <p className="text-[10px] text-stone-500 font-light font-sans">The Gmail address used by Nodemailer to authenticate and transmit the email notifications.</p>
                          </div>

                          {/* SMTP Password */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-700 block text-left">Google App Password (16-Character Secure Code)</label>
                            <input
                              type="password"
                              value={smtpPass}
                              onChange={(e) => setSmtpPass(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full px-3.5 py-2.5 bg-white border border-stone-250 focus:border-emerald-650 focus:outline-none rounded-xl text-xs font-mono text-stone-900 tracking-widest focus:ring-1 focus:ring-emerald-600/30"
                            />
                            <p className="text-[10px] text-stone-500 font-light font-sans">For security, existing passwords are masked as dots. This key persists strictly in backend files and is never exposed to visitors.</p>
                          </div>

                          {/* Status and Action bar */}
                          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-4">
                            <span className="text-[11px] font-mono text-emerald-705 font-bold">
                              {emailSettingsSavedStatus}
                            </span>
                            <button
                              type="submit"
                              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 border border-emerald-700 text-white rounded-xl text-xs font-mono font-bold transition-all uppercase tracking-wider cursor-pointer shadow-xs"
                            >
                              Save Mail Settings
                            </button>
                          </div>

                        </form>

                        {/* Live Testing Facility Card */}
                        <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl relative space-y-3">
                          <h6 className="font-display font-bold text-xs text-stone-900 uppercase">
                            📬 SMTP Diagnostic & Layout Visualizer
                          </h6>
                          <p className="text-[11px] text-stone-500 leading-normal font-light">
                            Generate a fully-styled simulation quote notification and dispatch it instantly to the current system receiver email using your authentication tokens.
                          </p>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                            <p className="text-[10px] text-stone-605 font-mono font-bold break-all max-w-[70%] text-left">
                              {testEmailStatus}
                            </p>
                            <button
                              type="button"
                              disabled={testEmailSending}
                              onClick={() => {
                                setTestEmailSending(true);
                                setTestEmailStatus('Compiling mock lead and forwarding via Gmail...');
                                
                                const testLead = {
                                  id: 'test-lead-' + Date.now(),
                                  fullName: "Arthur Dent (Test)",
                                  email: "arthur@galaxy.org",
                                  phone: "+1 (555) 420-2026",
                                  address: "742 Evergreen Meadows (Diagnostic Test)",
                                  timeframe: "Immediate (< 2 weeks)",
                                  notes: "This is a real SMTP email notification check to ensure that the landscape quote forwarding system is operating perfectly.",
                                  services: ["Landscape Design & Installation", "Professional Lawn Restoration", "Weed Removal"],
                                  createdAt: new Date().toISOString(),
                                  status: 'new'
                                };

                                fetch('/api/bookings', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ lead: testLead })
                                })
                                  .then(res => res.json())
                                  .then(data => {
                                    setTestEmailSending(false);
                                    if (data.emailSent) {
                                      setTestEmailStatus('🎉 Diagnostic email dispatched successfully! Please check your inbox.');
                                    } else {
                                      setTestEmailStatus('⚠️ Lead saved on server, but mail skipped: ' + (data.emailError || 'Auth error'));
                                    }
                                    loadLeadsInput(); // Refresh lead queue
                                  })
                                  .catch(err => {
                                    setTestEmailSending(false);
                                    setTestEmailStatus('❌ Error: ' + err.message);
                                  });
                              }}
                              className={`px-4.5 py-2.5 rounded-lg border border-stone-300 text-xs font-mono font-bold hover:bg-stone-100 transition-all cursor-pointer ${
                                testEmailSending ? 'opacity-50 pointer-events-none' : ''
                              }`}
                            >
                              {testEmailSending ? 'Dispatching...' : 'Send Live Test Email'}
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                    {activeTab === 'reviews' && (
                      <div className="space-y-6 font-sans text-left pb-4">
                        <div className="border-b border-stone-200 pb-4">
                          <h5 className="font-display font-bold text-stone-900 text-sm uppercase flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            Client Reviews Manager & Moderation Desk
                          </h5>
                          <p className="text-stone-500 text-[11px] font-light mt-1">
                            Moderator list of all testimonials saved directly on this web portal. Deleting reviews here wipes them permanently from both the front-end carousels and backend persistent storage.
                          </p>
                        </div>

                        {reviews.length === 0 ? (
                          <div className="py-16 text-center border border-dashed border-stone-200 rounded-xl bg-white shadow-3xs">
                            <Star className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                            <p className="text-stone-650 text-xs font-semibold font-sans">No customer reviews stored in the database yet.</p>
                            <p className="text-stone-400 text-[10px] mt-1 font-mono">Use the Testimonial form on the homepage to publish a review.</p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                            {reviews.map((review) => (
                              <div 
                                key={review.id}
                                className="p-4.5 bg-white border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-emerald-250 transition-all shadow-3xs"
                              >
                                <div className="space-y-2.5 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-display font-bold text-xs text-stone-900 uppercase">
                                      {review.author}
                                    </span>
                                    <span className="text-stone-300 text-xs font-light font-mono">|</span>
                                    <span className="text-[10px] text-stone-500 font-mono">
                                      {review.location}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-emerald-805 font-mono font-semibold">
                                      {review.projectType}
                                    </span>
                                    <span className="text-stone-300 text-xs font-light font-mono">|</span>
                                    <span className="text-[10px] text-stone-400 font-mono">
                                      {review.date || 'Just now'}
                                    </span>
                                  </div>

                                  {/* Star row */}
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => {
                                      const isGold = i < (review.rating || 5);
                                      return (
                                        <Star 
                                          key={i} 
                                          className={`w-3.5 h-3.5 ${isGold ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} 
                                        />
                                      );
                                    })}
                                  </div>

                                  <p className="text-stone-650 text-xs italic font-serif leading-relaxed">
                                    "{review.content}"
                                  </p>
                                </div>

                                <div className="shrink-0 pt-0.5">
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to permanently delete ${review.author}'s review?`)) {
                                        const updatedReviews = reviews.filter(r => r.id !== review.id);
                                        setReviews(updatedReviews);
                                        
                                        fetch('/api/reviews/save-all', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ reviews: updatedReviews })
                                        })
                                          .then(res => res.json())
                                          .then(data => {
                                            if (data.success) {
                                              loadReviewsInput();
                                            }
                                          })
                                          .catch(err => {
                                            console.error("Failed to delete review:", err);
                                            alert("Error updating database!");
                                          });
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-250 text-red-700 font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                    title="Permanently Delete Review"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
