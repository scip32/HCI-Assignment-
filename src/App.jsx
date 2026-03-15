import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutGrid,
  Lock,
  LogOut,
  MapPin,
  Nfc,
  Plus,
  ScanFace,
  Settings,
  User,
  Wallet,
  X,
} from 'lucide-react';

const AUTH_FEEDBACK_STATES = ['scanning', 'success', 'failed'];

const BACKGROUND_BLOBS = [
  {
    className: 'left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#0F166E]/15',
    style: { animationDuration: '25s' },
  },
  {
    className: 'bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#FFCC40]/20',
    style: { animationDuration: '30s', animationDirection: 'reverse' },
  },
  {
    className: 'left-[60%] top-[40%] h-[400px] w-[400px] rounded-full bg-[#D9B343]/15',
    style: { animationDuration: '20s' },
  },
];

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'rooms', label: 'Rooms', icon: LayoutGrid },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

const TAB_TITLES = {
  home: 'Hi, Amin',
  rooms: 'Live Rooms',
  wallet: 'Wallet',
  profile: 'Profile',
};

const HOME_METRICS = [
  { value: '4', lines: ['Washers', 'Available'] },
  { value: '2', lines: ['Dryers', 'Available'] },
];

const VIEW_MODES = [
  { id: 'map', label: 'Campus Map' },
  { id: 'list', label: 'Grid List' },
];

const CAMPUS_MAP_WIDTH_RATIO = 1.85;
const CAMPUS_MAP_HEIGHT_RATIO = 1.45;
const CAMPUS_MAP_MIN_SCALE = 1;
const CAMPUS_MAP_MAX_SCALE = 2.4;
const CAMPUS_MAP_INITIAL_SCALE = 1.08;
const CURRENT_LOCATION_MARKER = {
  leftClass: 'left-[33%]',
  topClass: 'top-[43%]',
  label: 'You Are Here',
};

const ROOM_MAP_MARKERS = [
  {
    id: 'bota',
    room: 'Bota Hall',
    label: '3 Free',
    className:
      'absolute left-[25%] top-[35%] animate-bounce rounded-full border-2 border-white bg-[#34C759] px-5 py-2.5 text-[13px] font-black uppercase tracking-wider text-white shadow-[0_10px_20px_rgba(52,199,89,0.3)] transition-transform active:scale-95',
  },
  {
    id: 'aman',
    room: 'Aman Hall',
    label: 'Full',
    className:
      'absolute bottom-[35%] right-[25%] rounded-full border-2 border-white bg-[#FF3B30] px-5 py-2.5 text-[13px] font-black uppercase tracking-wider text-white shadow-[0_10px_20px_rgba(255,59,48,0.3)] transition-transform active:scale-95',
  },
];

const ROOM_LIST_ITEMS = [
  {
    id: 'bota',
    room: 'Bota Hall',
    title: 'Bota Hall Basement',
    badge: '3 Free',
    badgeClass: 'bg-[#34C759]/10 text-[#34C759]',
  },
  {
    id: 'aman',
    room: 'Aman Hall',
    title: 'Aman Hall Level 2',
    badge: 'Full',
    badgeClass: 'bg-[#FF3B30]/10 text-[#FF3B30]',
  },
  {
    id: 'cemara',
    room: 'Cemara Hall',
    title: 'Cemara Hall',
    badge: '1 Free',
    badgeClass: 'bg-[#FFCC40]/20 text-[#D9B343]',
  },
];

const ROOM_GRID_CARDS = [
  {
    id: '01',
    number: '01',
    status: 'Open',
    className: 'bg-[#34C759] shadow-[0_12px_30px_rgba(52,199,89,0.25)]',
  },
  {
    id: '03',
    number: '03',
    status: 'Broken',
    className: 'cursor-not-allowed bg-[#48484A] opacity-90 shadow-[0_12px_30px_rgba(0,0,0,0.15)]',
    muted: true,
  },
  {
    id: '04',
    number: '04',
    status: 'Open',
    className: 'bg-[#34C759] shadow-[0_12px_30px_rgba(52,199,89,0.25)]',
  },
];

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampCampusMapOffset(offset, scale, viewportElement) {
  if (!viewportElement) {
    return offset;
  }

  const contentWidth = viewportElement.clientWidth * CAMPUS_MAP_WIDTH_RATIO * scale;
  const contentHeight = viewportElement.clientHeight * CAMPUS_MAP_HEIGHT_RATIO * scale;
  const minX = Math.min(0, viewportElement.clientWidth - contentWidth);
  const minY = Math.min(0, viewportElement.clientHeight - contentHeight);

  return {
    x: clampNumber(offset.x, minX, 0),
    y: clampNumber(offset.y, minY, 0),
  };
}

function getInitialCampusMapTransform(viewportElement) {
  if (!viewportElement) {
    return {
      scale: CAMPUS_MAP_INITIAL_SCALE,
      offset: { x: 0, y: 0 },
    };
  }

  const contentWidth = viewportElement.clientWidth * CAMPUS_MAP_WIDTH_RATIO * CAMPUS_MAP_INITIAL_SCALE;
  const contentHeight = viewportElement.clientHeight * CAMPUS_MAP_HEIGHT_RATIO * CAMPUS_MAP_INITIAL_SCALE;
  const offset = {
    x: -((contentWidth - viewportElement.clientWidth) * 0.18),
    y: -((contentHeight - viewportElement.clientHeight) * 0.12),
  };

  return {
    scale: CAMPUS_MAP_INITIAL_SCALE,
    offset: clampCampusMapOffset(offset, CAMPUS_MAP_INITIAL_SCALE, viewportElement),
  };
}

const INITIAL_TRANSACTIONS = [
  {
    id: 'wash-v5-04',
    title: 'Washer 04, V5 laundry',
    date: 'Today, 2:45 PM',
    amount: '- RM 3.00',
    type: 'expense',
  },
  {
    id: 'dryer-v5-02',
    title: 'Dryer 02, V5 laundry',
    date: 'Yesterday, 8:15 PM',
    amount: '- RM 3.00',
    type: 'expense',
  },
  {
    id: 'topup-oct12',
    title: 'Top Up (Apple Pay)',
    date: 'Oct 12, 10:00 AM',
    amount: '+ RM 20.00',
    type: 'income',
  },
  {
    id: 'wash-v3-01',
    title: 'Washer 01, V3 laundry',
    date: 'Oct 10, 4:20 PM',
    amount: '- RM 3.00',
    type: 'expense',
  },
];

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [authStage, setAuthStage] = useState('idle');
  const scanTimerRef = useRef(null);
  const successTimerRef = useRef(null);

  const clearAuthTimers = () => {
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoaded(true), 150);

    return () => {
      window.clearTimeout(timer);
      clearAuthTimers();
    };
  }, []);

  const resetAuthFlow = () => {
    clearAuthTimers();
    setAuthStage('idle');
  };

  const openSsoSheet = () => {
    clearAuthTimers();
    setAuthStage('sso');
  };

  const authenticate = () => {
    clearAuthTimers();
    setAuthStage('authenticated');
  };

  const startBiometrics = () => {
    clearAuthTimers();
    setAuthStage('scanning');

    scanTimerRef.current = window.setTimeout(() => {
      setAuthStage('success');

      successTimerRef.current = window.setTimeout(() => {
        setAuthStage('authenticated');
      }, 700);
    }, 300);
  };

  const handleBiometricFailure = () => {
    clearAuthTimers();
    setAuthStage('failed');
  };

  const showAuthFeedback = AUTH_FEEDBACK_STATES.includes(authStage);
  const showSsoSheet = authStage === 'sso';

  if (authStage === 'authenticated') {
    return <MainScreen onLogout={resetAuthFlow} />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F4F3F0] font-sans antialiased selection:bg-[#0F166E]/20 md:h-full md:min-h-0">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {BACKGROUND_BLOBS.map((blob) => (
          <div key={blob.className} className={`mesh-blob absolute ${blob.className}`} style={blob.style} />
        ))}
      </div>

      <div className="relative z-10 flex h-full min-h-screen flex-col items-center justify-between px-6 pb-20 pt-[15vh] md:min-h-0">
        <div className="flex w-full flex-col items-center justify-center">
          <div
            className={`ease-spring relative flex h-36 w-36 items-center justify-center rounded-[2.5rem] border border-white/60 bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-all ${
              isLoaded ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-[20vh] scale-150 opacity-0'
            }`}
            style={{ transitionDuration: '1200ms' }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] shadow-[inset_0_1px_1px_rgba(255,255,255,1)]" />
            <img src="/logo.png" alt="LaunderSmart Logo" className="relative z-10 h-full w-full object-contain" />
          </div>
          <div
            className={`mt-8 text-center transition-all duration-1000 delay-200 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <h1 className="text-[40px] font-bold tracking-tight text-[#0F166E]">LaunderSmart.</h1>
            <p className="mt-2 text-[19px] font-medium tracking-wide text-[#737373]">Wash without the wait.</p>
          </div>
        </div>

        <div
          className={`w-full max-w-[320px] transition-all duration-700 delay-300 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          } ${showSsoSheet ? 'pointer-events-none absolute bottom-20 scale-90 opacity-0' : 'relative scale-100 opacity-100'}`}
        >
          <button
            type="button"
            onClick={startBiometrics}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-full border border-[#0a0e4a] bg-gradient-to-b from-[#1a238a] to-[#0F166E] py-[18px] text-[17px] font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_10px_25px_rgba(15,22,110,0.4)] transition-transform duration-200 active:scale-[0.97]"
          >
            <span className="relative z-10 flex items-center gap-2 tracking-wide">
              Log in with Student ID
              <ChevronRight className="h-5 w-5 text-[#FFCC40] transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
          <div className="mt-5 flex items-center justify-center gap-2 text-[13px] text-[#737373]">
            <Lock className="h-3.5 w-3.5" />
            <span>Secured by Campus Identity</span>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-0 z-40 flex items-center justify-center transition-all duration-300 ${
          showAuthFeedback ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/10 backdrop-blur-[3px]"
          onClick={authStage === 'scanning' ? handleBiometricFailure : undefined}
        />

        <div
          className={`ease-spring relative w-[270px] overflow-hidden rounded-[24px] border border-black/5 bg-white/90 shadow-[0_20px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all duration-300 ${
            showAuthFeedback ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <div className="relative mb-2 flex h-16 w-16 items-center justify-center">
              {authStage === 'scanning' && <ScanFace className="h-14 w-14 animate-pulse text-[#0F166E]" strokeWidth={1.5} />}
              {authStage === 'success' && (
                <div className="absolute inset-0 flex animate-in zoom-in spin-in-12 items-center justify-center duration-500">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#34C759] shadow-lg shadow-green-500/20">
                    <Check className="h-8 w-8 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
              {authStage === 'failed' && <ScanFace className="animate-shake h-14 w-14 text-[#FF3B30]" strokeWidth={1.5} />}
            </div>

            <h3 className="text-[17px] font-semibold tracking-tight text-[#0F166E]">
              {authStage === 'success' ? 'Authenticated' : 'Face ID'}
            </h3>
            <p className="mt-1 h-4 text-[13px] leading-snug text-[#737373]">
              {authStage === 'scanning' && 'Tap anywhere to fail'}
              {authStage === 'success' && 'Welcome back, Amin'}
              {authStage === 'failed' && 'Face Not Recognized'}
            </p>

            <div
              className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${
                authStage === 'failed' ? 'mt-6 max-h-20 opacity-100' : 'mt-0 max-h-0 opacity-0'
              }`}
            >
              <button
                type="button"
                onClick={openSsoSheet}
                className="w-full rounded-xl bg-[#F0F0F0] py-3.5 text-[15px] font-semibold text-[#0F166E] shadow-sm transition-transform active:scale-[0.97]"
              >
                Use University Login
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-0 z-50 transition-all duration-700 ${
          showSsoSheet ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
        }`}
      >
        <div
          className={`absolute inset-0 bg-[#0F166E]/30 backdrop-blur-md transition-opacity duration-700 ${
            showSsoSheet ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={resetAuthFlow}
        />

        <div
          className={`ease-spring absolute bottom-0 left-0 right-0 flex h-[88vh] flex-col rounded-t-[32px] border-t border-white bg-[#FBFBFA] shadow-[0_-10px_40px_rgba(15,22,110,0.15)] transition-all duration-700 ${
            showSsoSheet ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-[20vh] scale-95 opacity-0'
          }`}
        >
          <div className="flex w-full justify-center pb-2 pt-3">
            <div className="h-1.5 w-10 rounded-full bg-[#D1D1D6]" />
          </div>
          <div className="flex items-center justify-between px-6 pb-2">
            <h2 className="text-[22px] font-bold tracking-tight text-[#0F166E]">University Login</h2>
            <button
              type="button"
              onClick={resetAuthFlow}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFEFEF] text-[#737373] transition-colors active:scale-95 hover:bg-[#E5E5E5]"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
          <div className="hide-scrollbar flex flex-1 flex-col overflow-y-auto px-6 pb-12 pt-8">
            <form
              className="mx-auto w-full max-w-sm space-y-8"
              autoComplete="on"
              onSubmit={(event) => {
                event.preventDefault();
                authenticate();
              }}
            >
              <div className="space-y-4">
                <label htmlFor="campus-username" className="sr-only">
                  Student ID or Email
                </label>
                <input
                  id="campus-username"
                  name="username"
                  type="text"
                  placeholder="Student ID or Email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="email"
                  enterKeyHint="next"
                  className="w-full rounded-xl border border-transparent bg-[#F0F0F0] px-4 py-4 text-[17px] text-[#0F166E] shadow-sm outline-none transition-all placeholder:text-[#9E9E9E] focus:border-[#0F166E]/50 focus:bg-white"
                />
                <label htmlFor="campus-password" className="sr-only">
                  Password
                </label>
                <input
                  id="campus-password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  enterKeyHint="done"
                  className="w-full rounded-xl border border-transparent bg-[#F0F0F0] px-4 py-4 text-[17px] text-[#0F166E] shadow-sm outline-none transition-all placeholder:text-[#9E9E9E] focus:border-[#0F166E]/50 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl border border-[#0a0e4a] bg-gradient-to-b from-[#1a238a] to-[#0F166E] py-4 text-[17px] font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_6px_15px_rgba(15,22,110,0.3)] transition-transform active:scale-[0.98]"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainScreen({ onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [loadingHome, setLoadingHome] = useState(true);
  const [washState, setWashState] = useState('idle');
  const [balance, setBalance] = useState(12);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [homeOverlayVisible, setHomeOverlayVisible] = useState(false);
  const [walletOverlayVisible, setWalletOverlayVisible] = useState(false);
  const [profileOverlayVisible, setProfileOverlayVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadingHome(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  const handleNavClick = (tab) => {
    if (tab !== 'rooms' && selectedRoom) {
      setSelectedRoom(null);
    }

    if (tab === 'home' && activeTab === 'home') {
      setWashState((previous) => (previous === 'idle' ? 'active' : 'idle'));
      return;
    }

    setActiveTab(tab);
  };

  const handleBalanceClick = () => {
    // Force a low-balance state for demo purposes, then open Wallet
    setBalance(2);
    handleNavClick('wallet');
  };

  const activeTabIndex = TABS.findIndex((tab) => tab.id === activeTab);
  const lowBalance = balance < 5;
  const walletAmount = balance.toFixed(2);
  const isBlockingOverlay = homeOverlayVisible || walletOverlayVisible || profileOverlayVisible;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#F4F3F0] font-sans selection:bg-[#0F166E]/20 md:h-full md:min-h-0">
      <header className="z-20 flex items-center justify-between bg-[#F4F3F0]/80 px-6 pb-4 pt-14 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0F166E]/20 bg-[#0F166E]/10 text-[#0F166E] transition-transform active:scale-95"
            onClick={onLogout}
          >
            <User className="h-5 w-5" />
          </button>
          <div className="h-8 overflow-hidden">
            <h1 className="text-drop-in text-[24px] font-bold tracking-tight text-[#0F166E]">{TAB_TITLES[activeTab]}</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBalanceClick}
          className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300 ${
            lowBalance
              ? 'animate-pulse ring-2 ring-red-500 shadow-[0_0_18px_rgba(239,68,68,0.35)]'
              : 'border border-black/5 bg-white shadow-sm hover:bg-gray-50'
          }`}
        >
          <span className={`text-[15px] font-bold ${lowBalance ? 'text-red-600' : 'text-[#0F166E]'}`}>RM {walletAmount}</span>
        </button>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <div
          className="ease-spring absolute bottom-0 left-0 top-0 flex w-[400%] transition-transform duration-500"
          style={{ transform: `translateX(-${activeTabIndex * 25}%)` }}
        >
          <div className="relative h-full w-1/4">
            <HomeTabContent
              loading={loadingHome}
              washState={washState}
              setWashState={setWashState}
              onOverlayChange={setHomeOverlayVisible}
            />
          </div>
          <div className="relative h-full w-1/4">
            <RoomsTabContent onRoomSelect={setSelectedRoom} />
          </div>
          <div className="relative h-full w-1/4">
            <WalletTabContent balance={balance} setBalance={setBalance} onOverlayChange={setWalletOverlayVisible} />
          </div>
          <div className="relative h-full w-1/4">
            <ProfileTabContent onLogout={onLogout} onOverlayChange={setProfileOverlayVisible} />
          </div>
        </div>

        {selectedRoom && <RoomDetailOverlay room={selectedRoom} onBack={() => setSelectedRoom(null)} />}
      </div>

      <nav
        className={`absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between border-t border-black/5 bg-white/90 px-8 pb-8 pt-4 backdrop-blur-xl transition-all duration-300 ${
          isBlockingOverlay ? 'pointer-events-none translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        {TABS.map((tab) => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => handleNavClick(tab.id)}
          />
        ))}
      </nav>
    </div>
  );
}

function HomeTabContent({ loading, washState, setWashState, onOverlayChange }) {
  const [timeLeft, setTimeLeft] = useState(18);
  const [showNfcSheet, setShowNfcSheet] = useState(false);
  const [nfcStatus, setNfcStatus] = useState('idle');
  const detectTimerRef = useRef(null);
  const closeSheetTimerRef = useRef(null);
  const activateWashTimerRef = useRef(null);
  const audioContextRef = useRef(null);

  const clearNfcTimers = () => {
    if (detectTimerRef.current) {
      window.clearTimeout(detectTimerRef.current);
      detectTimerRef.current = null;
    }

    if (closeSheetTimerRef.current) {
      window.clearTimeout(closeSheetTimerRef.current);
      closeSheetTimerRef.current = null;
    }

    if (activateWashTimerRef.current) {
      window.clearTimeout(activateWashTimerRef.current);
      activateWashTimerRef.current = null;
    }
  };

  const resetNfcSheet = () => {
    clearNfcTimers();
    setShowNfcSheet(false);
    setNfcStatus('idle');
  };

  const primeNfcAudio = async () => {
    if (audioContextRef.current || typeof window === 'undefined') {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    audioContextRef.current = new AudioContextClass();

    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch {
        audioContextRef.current = null;
      }
    }
  };

  const startNfcFlow = async () => {
    clearNfcTimers();
    await primeNfcAudio();
    setNfcStatus('scanning');
    setShowNfcSheet(true);

    detectTimerRef.current = window.setTimeout(() => {
      setNfcStatus('detected');

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([20, 40, 20]);
      }

      playNfcDetectedSound(audioContextRef.current);

      closeSheetTimerRef.current = window.setTimeout(() => {
        setShowNfcSheet(false);

        activateWashTimerRef.current = window.setTimeout(() => {
          setWashState('active');
          setNfcStatus('idle');
        }, 300);
      }, 850);
    }, 950);
  };

  useEffect(() => {
    if (washState !== 'active') {
      setTimeLeft(18);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }

        return previousTime - 1;
      });
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [washState]);

  useEffect(() => {
    return () => {
      clearNfcTimers();

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    onOverlayChange(showNfcSheet);

    return () => {
      onOverlayChange(false);
    };
  }, [onOverlayChange, showNfcSheet]);

  return (
    <div className="hide-scrollbar relative flex h-full flex-col overflow-y-auto px-6 pb-32 pt-4">
      {loading && (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-8 animate-in fade-in duration-300">
          <div className="h-[240px] rounded-[2.5rem] border border-[#E5E5E5] bg-transparent p-8">
            <div className="skeleton-shimmer mb-4 h-4 w-24 rounded-full" />
            <div className="skeleton-shimmer mb-8 h-8 w-48 rounded-full" />
            <div className="grid grid-cols-2 gap-4">
              <div className="skeleton-shimmer h-20 rounded-2xl" />
              <div className="skeleton-shimmer h-20 rounded-2xl" />
            </div>
          </div>
          <div className="skeleton-shimmer h-16 w-full rounded-full" />
        </div>
      )}

      {!loading && washState === 'idle' && (
        <div className="mx-auto flex h-full w-full max-w-sm flex-col animate-in zoom-in-95 fade-in duration-500">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white p-8 shadow-[0_12px_40px_rgba(15,22,110,0.08)]">
            <div className="pointer-events-none absolute right-0 top-0 p-6 opacity-5">
              <MapPin className="h-40 w-40 text-[#0F166E]" />
            </div>
            <div className="relative z-10">
              <div className="mb-1 flex items-center gap-2 text-[#737373]">
                <MapPin className="h-4 w-4" />
                <span className="text-[13px] font-semibold uppercase tracking-wider">Nearest Room</span>
              </div>
              <h2 className="mb-8 text-[28px] font-bold leading-tight text-[#0F166E]">Bota Hall Basement</h2>
              <div className="grid grid-cols-2 gap-4">
                {HOME_METRICS.map((metric) => (
                  <MetricCard key={metric.lines.join('-')} value={metric.value} lines={metric.lines} />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8">
            <button
              type="button"
              onClick={startNfcFlow}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-full border border-[#0a0e4a] bg-gradient-to-b from-[#1a238a] to-[#0F166E] py-[22px] text-[17px] font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_12px_30px_rgba(15,22,110,0.3)] transition-all duration-200 active:scale-[0.97]"
            >
              <span className="relative z-10 flex items-center gap-3 tracking-wide">
                <Nfc className="h-7 w-7 animate-pulse text-[#FFCC40] drop-shadow-[0_0_8px_rgba(255,204,64,0.8)]" />
                Hold Phone Near Washer
              </span>
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
            </button>
          </div>
        </div>
      )}

      {!loading && washState === 'active' && (
        <button
          type="button"
          onClick={() => setWashState('idle')}
          className="mx-auto mt-6 flex h-full w-full max-w-sm flex-col items-center justify-center animate-in slide-in-from-bottom-8 fade-in duration-700"
        >
          <div className="liquid-ring group relative flex h-72 w-72 items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-white shadow-2xl transition-transform active:scale-95">
            <div className="wave-back" />
            <div className="wave-front" />
            <div className="relative z-10 flex flex-col items-center pt-4 transition-all duration-300">
              <span className="tabular-nums text-[85px] font-black leading-none tracking-tighter text-white drop-shadow-md">
                {timeLeft.toString().padStart(2, '0')}
              </span>
              <span className="mt-[-5px] text-[18px] font-bold uppercase tracking-widest text-white/90">Min</span>
            </div>
          </div>
          <div className="mt-10 animate-in slide-in-from-bottom-4 fade-in rounded-full border border-white bg-white/60 px-6 py-3 text-center shadow-sm backdrop-blur-md duration-700 delay-300">
            <p className="flex items-center justify-center gap-2 text-[16px] font-bold text-[#0F166E]">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0F166E] opacity-50" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#0F166E]" />
              </span>
              Currently in Rinse Cycle
            </p>
          </div>
          <div className="mt-8 flex flex-col items-center">
            <p className="text-[13px] font-medium text-gray-500">Tap ring to reset demo</p>
          </div>
        </button>
      )}

      <div
        className={`absolute inset-0 z-40 transition-all duration-500 ${
          showNfcSheet ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-[#0F166E]/20 backdrop-blur-sm" onClick={resetNfcSheet} />
        <div
          className={`ease-spring absolute bottom-0 left-0 right-0 rounded-t-[2.5rem] border-t border-black/5 bg-white p-8 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] transition-transform duration-500 ${
            showNfcSheet ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-[#E5E5E5]" />
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-5 flex h-20 w-20 items-center justify-center rounded-[2rem] border ${
                nfcStatus === 'detected'
                  ? 'border-[#34C759]/20 bg-[#34C759]/10 text-[#34C759]'
                  : 'border-[#0F166E]/10 bg-[#F4F3F0] text-[#0F166E]'
              }`}
            >
              {nfcStatus === 'detected' ? (
                <Check className="h-10 w-10" strokeWidth={3} />
              ) : (
                <Nfc className="h-10 w-10 animate-pulse" />
              )}
            </div>
            <h3 className="text-[22px] font-bold text-[#0F166E]">
              {nfcStatus === 'detected' ? 'Washer Detected' : 'Hold Phone Near Washer'}
            </h3>
            <p className="mt-3 max-w-[260px] text-[15px] leading-6 text-[#737373]">
              {nfcStatus === 'detected'
                ? 'NFC detected successfully. Starting your wash session now.'
                : 'Keep your phone close to the washer reader. A chime will play once NFC is detected.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomsTabContent({ onRoomSelect }) {
  const [viewMode, setViewMode] = useState('map');
  const [mapImageLoaded, setMapImageLoaded] = useState(false);
  const [showMapSkeleton, setShowMapSkeleton] = useState(true);
  const [mapTransform, setMapTransform] = useState({
    scale: CAMPUS_MAP_INITIAL_SCALE,
    offset: { x: 0, y: 0 },
  });
  const [mapDragging, setMapDragging] = useState(false);
  const mapViewportRef = useRef(null);
  const mapLoadTimerRef = useRef(null);
  const mapDragStateRef = useRef(null);

  useEffect(() => {
    return () => {
      if (mapLoadTimerRef.current) {
        window.clearTimeout(mapLoadTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (viewMode !== 'map') {
      return;
    }

    setShowMapSkeleton(!mapImageLoaded);
  }, [mapImageLoaded, viewMode]);

  useEffect(() => {
    if (viewMode !== 'map' || showMapSkeleton || !mapViewportRef.current) {
      return;
    }

    setMapTransform(getInitialCampusMapTransform(mapViewportRef.current));
  }, [showMapSkeleton, viewMode]);

  useEffect(() => {
    if (viewMode !== 'map') {
      return undefined;
    }

    const handleResize = () => {
      if (!mapViewportRef.current) {
        return;
      }

      setMapTransform((previous) => ({
        ...previous,
        offset: clampCampusMapOffset(previous.offset, previous.scale, mapViewportRef.current),
      }));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [viewMode]);

  const handleMapImageLoad = () => {
    setMapImageLoaded(true);

    if (mapLoadTimerRef.current) {
      window.clearTimeout(mapLoadTimerRef.current);
    }

    mapLoadTimerRef.current = window.setTimeout(() => {
      setShowMapSkeleton(false);
      mapLoadTimerRef.current = null;
    }, 450);
  };

  const handleMapImageError = () => {
    setMapImageLoaded(true);
    setShowMapSkeleton(false);
  };

  const endMapDrag = (pointerId) => {
    const viewport = mapViewportRef.current;

    if (viewport && pointerId !== null && viewport.hasPointerCapture?.(pointerId)) {
      viewport.releasePointerCapture(pointerId);
    }

    mapDragStateRef.current = null;
    setMapDragging(false);
  };

  const handleMapPointerDown = (event) => {
    if (showMapSkeleton || !mapViewportRef.current) {
      return;
    }

    if (event.target instanceof Element && event.target.closest('[data-map-marker="true"]')) {
      return;
    }

    event.preventDefault();
    mapDragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: mapTransform.offset,
    };
    mapViewportRef.current.setPointerCapture?.(event.pointerId);
    setMapDragging(true);
  };

  const handleMapPointerMove = (event) => {
    const dragState = mapDragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId || !mapViewportRef.current) {
      return;
    }

    const nextOffset = {
      x: dragState.startOffset.x + (event.clientX - dragState.startX),
      y: dragState.startOffset.y + (event.clientY - dragState.startY),
    };

    setMapTransform((previous) => ({
      ...previous,
      offset: clampCampusMapOffset(nextOffset, previous.scale, mapViewportRef.current),
    }));
  };

  const handleMapPointerUp = (event) => {
    const dragState = mapDragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    endMapDrag(event.pointerId);
  };

  const handleMapWheel = (event) => {
    if (showMapSkeleton || !mapViewportRef.current) {
      return;
    }

    event.preventDefault();

    const viewport = mapViewportRef.current;
    const rect = viewport.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;

    setMapTransform((previous) => {
      const nextScale = clampNumber(previous.scale - event.deltaY * 0.0015, CAMPUS_MAP_MIN_SCALE, CAMPUS_MAP_MAX_SCALE);

      if (nextScale === previous.scale) {
        return previous;
      }

      const zoomRatio = nextScale / previous.scale;
      const nextOffset = {
        x: cursorX - (cursorX - previous.offset.x) * zoomRatio,
        y: cursorY - (cursorY - previous.offset.y) * zoomRatio,
      };

      return {
        scale: nextScale,
        offset: clampCampusMapOffset(nextOffset, nextScale, viewport),
      };
    });
  };

  return (
    <div className="flex h-full flex-col px-6 pb-32 pt-4">
      <div className="mb-6 flex shrink-0 rounded-full border border-black/5 bg-[#E5E5EA]/70 p-1.5 shadow-inner backdrop-blur-sm">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setViewMode(mode.id)}
            className={`flex-1 rounded-full py-2.5 text-[14px] font-bold transition-all duration-300 ${
              viewMode === mode.id ? 'bg-white text-[#0F166E] shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : 'text-[#A6AEB5]'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {viewMode === 'map' && (
        <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[2.5rem] border border-black/5 bg-[#F9F9F9] shadow-inner animate-in fade-in duration-300">
          <div
            ref={mapViewportRef}
            className={`interactive-map absolute inset-0 ${mapDragging ? 'is-dragging' : ''} ${
              showMapSkeleton ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            onPointerDown={handleMapPointerDown}
            onPointerMove={handleMapPointerMove}
            onPointerUp={handleMapPointerUp}
            onPointerCancel={handleMapPointerUp}
            onWheel={handleMapWheel}
          >
            <div
              className={`absolute left-0 top-0 h-[145%] min-h-full w-[185%] min-w-full origin-top-left transition-opacity duration-300 ${
                showMapSkeleton ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                transform: `translate3d(${mapTransform.offset.x}px, ${mapTransform.offset.y}px, 0) scale(${mapTransform.scale})`,
              }}
            >
              <img
                src="/utp-campus-map.png"
                alt="UTP campus map"
                className="absolute inset-0 h-full w-full object-cover"
                onLoad={handleMapImageLoad}
                onError={handleMapImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-[#0F166E]/12" />

              {ROOM_MAP_MARKERS.map((marker) => (
                <button
                  key={marker.id}
                  type="button"
                  onClick={() => onRoomSelect(marker.room)}
                  data-map-marker="true"
                  className={`z-10 ${marker.className}`}
                >
                  {marker.label}
                </button>
              ))}

              <div className={`absolute z-10 ${CURRENT_LOCATION_MARKER.leftClass} ${CURRENT_LOCATION_MARKER.topClass}`}>
                <div className="mb-3 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/90 bg-white/96 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#0F166E] shadow-[0_12px_20px_rgba(15,22,110,0.16)] backdrop-blur-md">
                  <MapPin className="h-3.5 w-3.5 text-[#0F166E]" />
                  {CURRENT_LOCATION_MARKER.label}
                </div>
                <div className="relative -translate-x-1/2">
                  <span className="absolute inset-0 h-6 w-6 animate-ping rounded-full bg-[#0F166E]/25" />
                  <span className="relative flex h-6 w-6 items-center justify-center rounded-full border-[5px] border-white bg-[#0F166E] shadow-[0_8px_18px_rgba(15,22,110,0.25)]" />
                </div>
              </div>
            </div>
          </div>

          {showMapSkeleton && <MapPanelSkeleton />}

          <div className="absolute left-4 top-4 z-20 rounded-full border border-white/70 bg-white/88 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0F166E] shadow-sm backdrop-blur-md">
            Live Campus Map
          </div>
          {!showMapSkeleton && (
            <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/70 bg-white/88 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F166E] shadow-sm backdrop-blur-md">
              Scroll to Zoom · Drag to Move
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="hide-scrollbar flex flex-col gap-4 overflow-y-auto animate-in fade-in duration-300">
          {ROOM_LIST_ITEMS.map((room) => (
            <RoomListItem
              key={room.id}
              title={room.title}
              badge={room.badge}
              badgeClass={room.badgeClass}
              onClick={() => onRoomSelect(room.room)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ScreenBackButton({ onClick, label = 'Back', variant = 'solid', className = '' }) {
  const isSolid = variant === 'solid';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 shrink-0 items-center gap-3 rounded-full pl-3 pr-5 transition-all active:scale-95 ${
        isSolid
          ? 'border border-[#0F166E]/10 bg-[#0F166E] text-white shadow-[0_12px_26px_rgba(15,22,110,0.22)] hover:bg-[#141c83]'
          : 'border border-[#0F166E]/10 bg-white text-[#0F166E] shadow-[0_8px_18px_rgba(15,22,110,0.08)] hover:bg-[#F8F8FF]'
      } ${className}`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          isSolid ? 'bg-white/14 ring-1 ring-white/10 text-[#FFCC40]' : 'bg-[#0F166E]/8 text-[#0F166E]'
        }`}
      >
        <ChevronLeft className="h-4.5 w-4.5" strokeWidth={3} />
      </span>
      <span className="text-[13px] font-black uppercase tracking-[0.18em]">{label}</span>
    </button>
  );
}

function RoomDetailOverlay({ room, onBack }) {
  const [loading, setLoading] = useState(true);
  const [activeMachineSheet, setActiveMachineSheet] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="ease-spring absolute inset-0 z-50 flex flex-col bg-[#F4F3F0] animate-in slide-in-from-bottom-12 fade-in duration-500">
      <div className="z-10 flex shrink-0 items-center gap-4 border-b border-black/5 bg-white/88 px-6 pb-3 pt-6 backdrop-blur-xl">
        <ScreenBackButton onClick={onBack} />
        <div className="flex h-8 min-w-0 items-center overflow-hidden">
          <h2 className="text-drop-in text-[24px] font-bold tracking-tight text-[#0F166E]">{room}</h2>
        </div>
      </div>

      <div className="hide-scrollbar flex-1 overflow-y-auto px-6 pb-32 pt-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-5">
            {ROOM_GRID_CARDS.map((machine) => (
              <div key={machine.id} className="skeleton-shimmer aspect-square rounded-[2.5rem] border border-black/5" />
            ))}
            <div className="skeleton-shimmer aspect-square rounded-[2.5rem] border border-black/5" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 animate-in zoom-in-95 fade-in duration-500">
            <MachineCard {...ROOM_GRID_CARDS[0]} />

            <button
              type="button"
              onClick={() => setActiveMachineSheet(2)}
              className="relative aspect-square rounded-[2.5rem] bg-[#FF3B30] text-white shadow-[0_12px_30px_rgba(255,59,48,0.25)] transition-transform active:scale-95"
            >
              <div className="flex h-full flex-col items-center justify-center">
                <span className="text-[48px] font-black leading-none drop-shadow-sm">02</span>
                <span className="mt-2 text-[13px] font-bold uppercase tracking-widest opacity-90">In Use</span>
              </div>
            </button>

            {ROOM_GRID_CARDS.slice(1).map((machine) => (
              <MachineCard key={machine.id} {...machine} />
            ))}
          </div>
        )}
      </div>

      <div
        className={`absolute inset-0 z-[60] transition-all duration-300 ${
          activeMachineSheet ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
        }`}
      >
        <div
          className="absolute inset-0 bg-[#0F166E]/18 backdrop-blur-sm"
          onClick={() => setActiveMachineSheet(null)}
        />
        <div
          className={`ease-spring absolute bottom-0 left-0 right-0 rounded-t-[2.25rem] border-t border-black/5 bg-white px-6 pb-10 pt-4 shadow-[0_-20px_40px_rgba(0,0,0,0.15)] transition-transform duration-500 ${
            activeMachineSheet ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#E5E5E5]" />
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#A6AEB5]">Machine Status</p>
              <h3 className="mt-2 text-[24px] font-bold tracking-tight text-[#0F166E]">Washer 02</h3>
              <p className="mt-1 text-[15px] font-medium text-[#737373]">{room}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveMachineSheet(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F3F0] text-[#737373] transition-transform active:scale-95"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          <div className="mb-5 rounded-[1.75rem] border border-[#FF3B30]/15 bg-[#FF3B30]/8 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#FF3B30]">In Use</p>
                <p className="mt-2 text-[17px] font-bold leading-snug text-[#0F166E]">
                  This machine will be free in 12 minutes.
                </p>
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-[14px] font-black text-[#FF3B30] shadow-sm">
                12 min
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveMachineSheet(null)}
            className="w-full rounded-[1.25rem] bg-[#34C759] py-4 text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(52,199,89,0.24)] transition-transform active:scale-[0.98]"
          >
            Notify Me When It&apos;s Done
          </button>
        </div>
      </div>
    </div>
  );
}

function WalletTabContent({ balance, setBalance, onOverlayChange }) {
  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [showApplePay, setShowApplePay] = useState(false);
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const displayBalanceRef = useRef(balance);
  const transitionTimerRef = useRef(null);

  useEffect(() => {
    displayBalanceRef.current = displayBalance;
  }, [displayBalance]);

  useEffect(() => {
    if (displayBalanceRef.current === balance) {
      return undefined;
    }

    const startValue = displayBalanceRef.current;
    const difference = balance - startValue;
    const startTime = performance.now();
    const duration = 600;
    let frameId = 0;

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const nextValue = startValue + difference * progress;

      displayBalanceRef.current = nextValue;
      setDisplayBalance(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [balance]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    onOverlayChange(showTopUp || showApplePay);

    return () => {
      onOverlayChange(false);
    };
  }, [onOverlayChange, showApplePay, showTopUp]);

  const resetTopUpState = () => {
    setShowCustomInput(false);
    setCustomAmount('');
  };

  const scheduleAfterSheetClose = (callback) => {
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      resetTopUpState();
      callback?.();
      transitionTimerRef.current = null;
    }, 300);
  };

  const handleTopUpClick = (amount) => {
    setSelectedAmount(amount);
    setShowTopUp(false);
    scheduleAfterSheetClose(() => setShowApplePay(true));
  };

  const handleCloseTopUp = () => {
    setShowTopUp(false);
    scheduleAfterSheetClose();
  };

  const handlePaymentSuccess = () => {
    if (!selectedAmount) {
      setShowApplePay(false);
      return;
    }

    setShowApplePay(false);
    setBalance((previous) => previous + selectedAmount);
    setTransactions((previous) => [
      createTopUpTransaction(selectedAmount),
      ...previous,
    ]);
  };

  const parsedCustomAmount = Number.parseFloat(customAmount);
  const canProceedWithCustomAmount = Number.isFinite(parsedCustomAmount) && parsedCustomAmount > 0;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="shrink-0 animate-in slide-in-from-top-4 fade-in px-6 pb-8 pt-6 duration-500 flex flex-col items-center justify-center">
        <span className="mb-2 text-[12px] font-bold uppercase tracking-widest text-[#A6AEB5]">Current Balance</span>
        <h2 className="flex items-start text-[64px] font-black leading-none tracking-tighter text-[#0F166E] tabular-nums">
          <span className="mr-2 mt-2 text-[32px] opacity-50">RM</span>
          {displayBalance.toFixed(2)}
        </h2>

        <button
          type="button"
          onClick={() => setShowTopUp(true)}
          className="mt-8 flex items-center gap-2 rounded-full bg-[#0F166E] px-8 py-3.5 font-bold text-white shadow-[0_10px_20px_rgba(15,22,110,0.2)] transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5 text-[#FFCC40]" />
          Top Up
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-t-[2.5rem] border-t border-black/5 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.04)] animate-in slide-in-from-bottom-12 duration-500 delay-150">
        <div className="shrink-0 px-8 pb-4 pt-8">
          <h3 className="text-[18px] font-bold text-[#0F166E]">Recent Washes</h3>
        </div>
        <div className="hide-scrollbar flex-1 space-y-4 overflow-y-auto px-6 pb-32">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              title={transaction.title}
              date={transaction.date}
              amount={transaction.amount}
              type={transaction.type}
            />
          ))}
        </div>
      </div>

      <div
        className={`absolute inset-0 z-40 transition-all duration-500 ${
          showTopUp ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-[#0F166E]/20 backdrop-blur-sm" onClick={handleCloseTopUp} />
        <div
          className={`ease-spring absolute bottom-0 left-0 right-0 rounded-t-[2.5rem] border-t border-black/5 bg-white p-8 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] transition-transform duration-500 ${
            showTopUp ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-[#E5E5E5]" />

          {!showCustomInput ? (
            <>
              <h3 className="mb-6 text-center text-[22px] font-bold text-[#0F166E]">Select Amount</h3>
              <div className="flex flex-col gap-3">
                {[10, 20].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleTopUpClick(amount)}
                    className="w-full rounded-[1.25rem] border border-black/5 bg-[#F4F3F0] py-4 text-[20px] font-black text-[#0F166E] transition-transform hover:bg-gray-100 active:scale-95"
                  >
                    + RM {amount}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full rounded-[1.25rem] border border-black/5 bg-[#F4F3F0] py-4 text-[20px] font-black text-[#0F166E] transition-transform hover:bg-gray-100 active:scale-95"
                >
                  + Others
                </button>
              </div>
            </>
          ) : (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300">
              <h3 className="mb-6 text-center text-[22px] font-bold text-[#0F166E]">Enter Amount</h3>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[20px] font-black text-[#A6AEB5]">RM</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(event) => setCustomAmount(event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-[1.25rem] border-2 border-black/5 bg-[#F4F3F0] py-4 pl-16 pr-6 text-[24px] font-black text-[#0F166E] shadow-inner outline-none transition-all focus:border-[#0F166E]/50 focus:bg-white"
                    autoFocus
                  />
                </div>
                <div className="mt-2 flex gap-3">
                  <ScreenBackButton
                    onClick={() => setShowCustomInput(false)}
                    variant="soft"
                    className="min-w-0 flex-1 justify-center rounded-[1.25rem]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (canProceedWithCustomAmount) {
                        handleTopUpClick(parsedCustomAmount);
                      }
                    }}
                    className={`flex-[2] rounded-[1.25rem] py-4 text-[16px] font-bold shadow-lg transition-all active:scale-95 ${
                      canProceedWithCustomAmount ? 'bg-[#0F166E] text-white' : 'cursor-not-allowed bg-[#A6AEB5] text-white/50'
                    }`}
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ApplePaySimulation
        show={showApplePay}
        amount={selectedAmount}
        onClose={() => setShowApplePay(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

function TransactionItem({ title, date, amount, type }) {
  return (
    <div className="flex cursor-pointer items-center justify-between rounded-[1.5rem] border border-black/5 bg-[#F9F9F9] p-4 transition-transform active:scale-95">
      <div className="flex flex-col">
        <span className="text-[15px] font-bold text-[#0F166E]">{title}</span>
        <span className="mt-0.5 text-[12px] font-medium text-[#A6AEB5]">{date}</span>
      </div>
      <div className={`text-[16px] font-black tabular-nums ${type === 'expense' ? 'text-[#FF3B30]' : 'text-[#34C759]'}`}>
        {amount}
      </div>
    </div>
  );
}

function ApplePaySimulation({ show, amount, onClose, onSuccess }) {
  const [doubleClickStep, setDoubleClickStep] = useState(0);
  const resetTimerRef = useRef(null);
  const successTimerRef = useRef(null);

  const clearTimers = () => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  };

  useEffect(() => {
    clearTimers();
    setDoubleClickStep(0);

    return () => {
      clearTimers();
    };
  }, [show]);

  const handleSideButtonClick = () => {
    if (doubleClickStep === 0) {
      setDoubleClickStep(1);
      resetTimerRef.current = window.setTimeout(() => {
        setDoubleClickStep((previous) => (previous === 1 ? 0 : previous));
      }, 500);
      return;
    }

    if (doubleClickStep === 1) {
      clearTimers();
      setDoubleClickStep(2);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }

      successTimerRef.current = window.setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  };

  return (
    <div
      className={`absolute inset-0 z-50 transition-all duration-300 ${
        show ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`ease-spring absolute bottom-0 left-0 right-0 rounded-t-[2rem] bg-white px-6 pb-12 pt-6 shadow-2xl transition-transform duration-500 ${
          show ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex flex-col items-center">
          {doubleClickStep < 2 ? (
            <>
              <div className="mb-4 flex h-10 w-16 items-center justify-center rounded-md bg-black text-xs font-bold text-white">Pay</div>
              <p className="text-[13px] font-medium uppercase tracking-wider text-[#A6AEB5]">LaunderSmart</p>
              <h3 className="mt-1 mb-8 text-[36px] font-black text-[#1D1D1F] tabular-nums">RM {amount?.toFixed(2)}</h3>
              <ScanFace className="h-12 w-12 animate-pulse text-[#0F166E]" />
              <p className="mt-4 text-[15px] font-semibold text-[#0F166E]">Confirm with Face ID</p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in duration-300">
              <svg className="apple-checkmark h-20 w-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="apple-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="apple-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
              <p className="mt-4 text-[18px] font-bold text-[#34C759]">Done</p>
            </div>
          )}
        </div>
      </div>

      {doubleClickStep < 2 && (
        <button
          type="button"
          className="absolute right-0 top-[40%] flex -translate-y-1/2 items-center"
          onClick={handleSideButtonClick}
        >
          <div className="mr-2 animate-pulse whitespace-nowrap rounded-l-xl bg-white/90 px-4 py-2 text-[12px] font-bold text-[#0F166E] shadow-lg backdrop-blur-md pointer-events-none">
            Double Click
          </div>
          <div className="flex h-24 w-4 items-center justify-center rounded-l-lg bg-[#1D1D1F] shadow-[-4px_0_10px_rgba(0,0,0,0.3)] transition-colors active:bg-black" />
        </button>
      )}
    </div>
  );
}

function ProfileTabContent({ onLogout, onOverlayChange }) {
  const [fiveMinWarning, setFiveMinWarning] = useState(true);
  const [reportState, setReportState] = useState('idle');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paymentLinked, setPaymentLinked] = useState(true);
  const [paymentMethodLabel, setPaymentMethodLabel] = useState('Apple Pay ending 1200');
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [quickTopUpEnabled, setQuickTopUpEnabled] = useState(true);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [paymentLinking, setPaymentLinking] = useState(false);
  const reportResetTimerRef = useRef(null);
  const paymentLinkTimerRef = useRef(null);
  const settingsMessageTimerRef = useRef(null);

  useEffect(() => {
    onOverlayChange(reportState !== 'idle' || settingsOpen);

    return () => {
      onOverlayChange(false);
    };
  }, [onOverlayChange, reportState, settingsOpen]);

  useEffect(() => {
    return () => {
      if (reportResetTimerRef.current) {
        window.clearTimeout(reportResetTimerRef.current);
      }

      if (paymentLinkTimerRef.current) {
        window.clearTimeout(paymentLinkTimerRef.current);
      }

      if (settingsMessageTimerRef.current) {
        window.clearTimeout(settingsMessageTimerRef.current);
      }
    };
  }, []);

  const pulseHaptic = (pattern = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const showSettingsMessage = (message) => {
    if (settingsMessageTimerRef.current) {
      window.clearTimeout(settingsMessageTimerRef.current);
    }

    setSettingsMessage(message);
    settingsMessageTimerRef.current = window.setTimeout(() => {
      setSettingsMessage('');
      settingsMessageTimerRef.current = null;
    }, 2200);
  };

  const toggleHaptic = () => {
    pulseHaptic();
    setFiveMinWarning((previous) => !previous);
  };

  const toggleBiometricLogin = () => {
    pulseHaptic();
    setBiometricLogin((previous) => !previous);
  };

  const toggleQuickTopUp = () => {
    pulseHaptic();
    setQuickTopUpEnabled((previous) => !previous);
  };

  const handlePaymentLink = () => {
    if (paymentLinking) {
      return;
    }

    pulseHaptic([15, 40, 15]);
    setPaymentLinking(true);

    if (paymentLinkTimerRef.current) {
      window.clearTimeout(paymentLinkTimerRef.current);
    }

    paymentLinkTimerRef.current = window.setTimeout(() => {
      setPaymentLinked(true);
      setPaymentMethodLabel('Apple Pay ending 1200');
      setPaymentLinking(false);
      showSettingsMessage('Payment method linked successfully.');
      paymentLinkTimerRef.current = null;
    }, 1100);
  };

  const handlePaymentUnlink = () => {
    if (paymentLinkTimerRef.current) {
      window.clearTimeout(paymentLinkTimerRef.current);
      paymentLinkTimerRef.current = null;
    }

    pulseHaptic();
    setPaymentLinking(false);
    setPaymentLinked(false);
    setPaymentMethodLabel('No payment method linked');
    showSettingsMessage('Payment method removed.');
  };

  const submitReport = () => {
    if (reportResetTimerRef.current) {
      window.clearTimeout(reportResetTimerRef.current);
    }

    setReportState('success');
    reportResetTimerRef.current = window.setTimeout(() => {
      setReportState('idle');
      reportResetTimerRef.current = null;
    }, 1500);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-in fade-in duration-300">
      <div className="hide-scrollbar flex flex-1 flex-col gap-8 overflow-y-auto px-6 pb-32 pt-4">
        <div>
          <h3 className="mb-3 pl-2 text-[13px] font-black uppercase tracking-widest text-[#A6AEB5]">Preferences</h3>
          <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-[#F4F3F0]">
                  <Bell className="h-5 w-5 text-[#0F166E]" />
                </div>
                <span className="text-[16px] font-bold text-[#0F166E]">5-Minute Warning</span>
              </div>

              <button
                type="button"
                onClick={toggleHaptic}
                className={`ease-spring flex h-8 w-14 rounded-full p-1 transition-colors duration-300 ${
                  fiveMinWarning ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
                }`}
              >
                <div
                  className={`ease-spring h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    fiveMinWarning ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="h-px w-full bg-[#F4F3F0]" />

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex w-full items-center justify-between p-5 text-left transition-colors active:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-[#F4F3F0]">
                  <Settings className="h-5 w-5 text-[#0F166E]" />
                </div>
                <span className="text-[16px] font-bold text-[#0F166E]">Account Settings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-[#A6AEB5]" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-3 pl-2 text-[13px] font-black uppercase tracking-widest text-[#A6AEB5]">Support</h3>
          <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <button
              type="button"
              onClick={() => setReportState('open')}
              className="group flex w-full items-center justify-between p-5 text-left transition-colors active:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FF3B30]/20 bg-[#FF3B30]/10 transition-transform group-active:scale-95">
                  <AlertTriangle className="h-5 w-5 text-[#FF3B30]" />
                </div>
                <span className="text-[16px] font-bold text-[#FF3B30]">Report Broken Machine</span>
              </div>
              <ChevronRight className="h-5 w-5 text-[#A6AEB5]" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-[1.5rem] border border-black/5 bg-[#F4F3F0] py-4 text-[16px] font-bold text-[#737373] transition-transform hover:bg-white hover:shadow-sm active:scale-95"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>

      <div
        className={`absolute inset-0 z-50 transition-all duration-500 ${
          settingsOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
        }`}
      >
        <div
          className="absolute inset-0 bg-[#0F166E]/20 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
        />

        <div
          className={`ease-spring absolute inset-0 flex flex-col bg-[#F4F3F0] transition-transform duration-500 ${
            settingsOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="z-10 shrink-0 border-b border-black/5 bg-white/88 px-6 pb-3 pt-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <ScreenBackButton onClick={() => setSettingsOpen(false)} />
              <div className="min-w-0">
                <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#A6AEB5]">Account Hub</p>
                <h3 className="mt-1 truncate text-[24px] font-bold tracking-tight text-[#0F166E]">Account Settings</h3>
                <p className="mt-1 text-[14px] leading-5 text-[#737373]">Manage identity, payment link, and security.</p>
              </div>
            </div>
          </div>

          <div className="hide-scrollbar flex-1 overflow-y-auto px-6 pb-10 pt-5">
            <div className="space-y-5">
              <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0F166E_0%,#1A238A_100%)] p-5 text-white shadow-[0_20px_40px_rgba(15,22,110,0.22)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-white/12 text-white">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-black uppercase tracking-[0.22em] text-white/60">Campus Identity</p>
                      <h4 className="mt-2 truncate text-[22px] font-black tracking-tight">Amin Rashid</h4>
                      <p className="mt-1 text-[14px] font-medium text-white/72">UTP-230245 · Village 5 Resident</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#FFCC40]">
                    <Check className="h-4 w-4" strokeWidth={3} />
                    Verified
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">Student ID</p>
                      <p className="mt-2 text-[15px] font-bold text-white">UTP-230245</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">Residence</p>
                      <p className="mt-2 text-[15px] font-bold text-white">Village 5</p>
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">Receipts & Contact</p>
                    <p className="mt-2 text-[16px] font-bold text-white">amin@student.utp.edu.my</p>
                    <p className="mt-1 text-[14px] leading-6 text-white/68">Receipts, top-up confirmations, and machine alerts will be sent here.</p>
                  </div>
                </div>
              </div>

              {settingsMessage && (
                <div className="rounded-[1.25rem] border border-[#34C759]/20 bg-[#34C759]/10 px-4 py-3 text-[14px] font-semibold text-[#0F166E]">
                  {settingsMessage}
                </div>
              )}

              <div className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#A6AEB5]">Payment Link</p>
                    <h4 className="mt-2 text-[19px] font-bold text-[#0F166E]">Top-Up Payment Source</h4>
                    <p className="mt-1 text-[14px] leading-6 text-[#737373]">Keep one trusted payment source connected for faster wallet reloads.</p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1.5 text-[12px] font-black uppercase tracking-[0.16em] ${
                      paymentLinked ? 'bg-[#34C759]/12 text-[#34C759]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                    }`}
                  >
                    {paymentLinked ? 'Linked' : 'Unlinked'}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-black/5 bg-[#F8F8F6] p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F166E]/8 text-[#0F166E]">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[16px] font-bold text-[#0F166E]">{paymentMethodLabel}</p>
                      <p className="mt-1 text-[14px] leading-6 text-[#737373]">
                        {paymentLinked
                          ? 'Active for wallet reloads, future quick top-ups, and payment confirmation.'
                          : 'Link Apple Pay or another wallet to enable one-tap top-ups.'}
                      </p>
                      {paymentLinked && (
                        <div className="mt-3 inline-flex rounded-full bg-[#0F166E]/8 px-3 py-1.5 text-[12px] font-black uppercase tracking-[0.16em] text-[#0F166E]">
                          Default payment source
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handlePaymentLink}
                    className={`flex-1 rounded-[1.25rem] py-4 text-[15px] font-bold transition-transform active:scale-[0.98] ${
                      paymentLinking
                        ? 'bg-[#A6AEB5] text-white'
                        : 'bg-[#0F166E] text-white shadow-[0_10px_20px_rgba(15,22,110,0.2)]'
                    }`}
                  >
                    {paymentLinking ? 'Linking...' : paymentLinked ? 'Relink Payment Method' : 'Link Payment Method'}
                  </button>
                  {paymentLinked && (
                    <button
                      type="button"
                      onClick={handlePaymentUnlink}
                      className="rounded-[1.25rem] border border-black/5 bg-[#F4F3F0] px-5 py-4 text-[15px] font-bold text-[#737373] transition-transform hover:bg-gray-50 active:scale-[0.98]"
                    >
                      Unlink
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="mb-4">
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#A6AEB5]">Security & Convenience</p>
                  <p className="mt-2 text-[14px] leading-6 text-[#737373]">Control how quickly you sign in and reload your wallet.</p>
                </div>
                <div className="space-y-3">
                  <SettingsToggleRow
                    icon={Lock}
                    label="Biometric Login"
                    description="Use Face ID before campus SSO fallback appears."
                    value={biometricLogin}
                    onToggle={toggleBiometricLogin}
                  />
                  <SettingsToggleRow
                    icon={Wallet}
                    label="Quick Top-Up"
                    description="Keep the linked payment source ready for one-tap reload."
                    value={quickTopUpEnabled}
                    onToggle={toggleQuickTopUp}
                  />
                  <SettingsInfoRow icon={Bell} label="5-Minute Warning" value={fiveMinWarning ? 'Enabled' : 'Disabled'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-0 z-50 transition-all duration-500 ${
          reportState !== 'idle' ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
        }`}
      >
        <div
          className="absolute inset-0 bg-[#0F166E]/20 backdrop-blur-sm"
          onClick={() => reportState === 'open' && setReportState('idle')}
        />

        <div
          className={`ease-spring absolute bottom-0 left-0 right-0 rounded-t-[2.5rem] border-t border-black/5 bg-white p-8 shadow-[0_-20px_40px_rgba(0,0,0,0.15)] transition-transform duration-500 ${
            reportState !== 'idle' ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {reportState === 'open' ? (
            <div className="animate-in fade-in duration-300">
              <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-[#E5E5E5]" />
              <h3 className="mb-6 text-center text-[22px] font-bold text-[#0F166E]">Report Issue</h3>

              <div className="relative mb-6 overflow-hidden rounded-[1.5rem] border border-[#D9B343]/30 bg-[#D9B343]/10 p-5 shadow-inner">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#D9B343]/20 blur-2xl" />
                <p className="relative z-10 text-[16px] font-medium leading-snug text-[#0F166E]">
                  Are you reporting an issue with <span className="font-black text-[#D9B343]">Washer 04</span> in{' '}
                  <span className="font-black text-[#D9B343]">V5 laundry</span>?
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {['Won\'t Start', 'Leaking', 'Card Reader / NFC Broken'].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={submitReport}
                    className="w-full rounded-[1.25rem] border border-black/5 bg-[#F4F3F0] py-4 text-[16px] font-bold text-[#0F166E] shadow-sm transition-transform hover:bg-gray-50 active:scale-95"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-300">
              <svg className="apple-checkmark h-24 w-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="apple-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="apple-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
              <p className="mt-6 text-[22px] font-bold tracking-tight text-[#34C759]">Report Submitted</p>
              <p className="mt-1 text-[15px] font-medium text-[#737373]">Thank you for helping out.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsInfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-[1.25rem] border border-black/5 bg-white px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F3F0] text-[#0F166E]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#A6AEB5]">{label}</p>
        <p className="mt-1 truncate text-[15px] font-bold text-[#0F166E]">{value}</p>
      </div>
    </div>
  );
}

function SettingsToggleRow({ icon: Icon, label, description, value, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-black/5 bg-[#F8F8F6] px-4 py-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0F166E] shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-[#0F166E]">{label}</p>
          <p className="mt-1 text-[13px] leading-5 text-[#737373]">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`ease-spring flex h-8 w-14 shrink-0 rounded-full p-1 transition-colors duration-300 ${
          value ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
        }`}
      >
        <div
          className={`ease-spring h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            value ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function MapPanelSkeleton() {
  return (
    <div className="absolute inset-0 z-10 p-4">
      <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/70 bg-[#EEF1F6] shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,22,110,0.07),transparent_22%),radial-gradient(circle_at_80%_78%,rgba(255,204,64,0.12),transparent_20%)]" />
        <div className="absolute left-[12%] top-[18%] h-2 w-[38%] -rotate-[18deg] rounded-full bg-white/70" />
        <div className="absolute left-[8%] top-[44%] h-2 w-[52%] rotate-[24deg] rounded-full bg-white/70" />
        <div className="absolute left-[42%] top-[10%] h-[58%] w-2 rounded-full bg-white/70" />
        <div className="absolute left-[64%] top-[28%] h-[40%] w-2 rotate-[10deg] rounded-full bg-white/70" />

        <div className="absolute inset-x-5 top-5 flex items-center justify-between">
          <div className="skeleton-shimmer h-8 w-28 rounded-full" />
          <div className="skeleton-shimmer h-8 w-20 rounded-full" />
        </div>

        <div className="absolute left-[18%] top-[32%] flex items-center gap-3 rounded-full border border-white/80 bg-white/82 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div className="skeleton-shimmer h-3 w-10 rounded-full" />
          <div className="skeleton-shimmer h-3 w-8 rounded-full" />
        </div>

        <div className="absolute right-[16%] bottom-[26%] flex items-center gap-3 rounded-full border border-white/80 bg-white/82 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div className="skeleton-shimmer h-3 w-10 rounded-full" />
          <div className="skeleton-shimmer h-3 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function createTopUpTransaction(amount) {
  return {
    id: `topup-${Date.now()}`,
    title: 'Top Up (Apple Pay)',
    date: formatWalletTimestamp(new Date()),
    amount: `+ RM ${amount.toFixed(2)}`,
    type: 'income',
  };
}

function formatWalletTimestamp(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function playNfcDetectedSound(audioContext) {
  if (!audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  masterGain.connect(audioContext.destination);

  const notes = [
    { frequency: 880, start: 0, duration: 0.12 },
    { frequency: 1174.66, start: 0.14, duration: 0.14 },
    { frequency: 1567.98, start: 0.3, duration: 0.2 },
  ];

  notes.forEach((note) => {
    const oscillator = audioContext.createOscillator();
    const noteGain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(note.frequency, now + note.start);

    noteGain.gain.setValueAtTime(0.0001, now + note.start);
    noteGain.gain.exponentialRampToValueAtTime(0.4, now + note.start + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);

    oscillator.connect(noteGain);
    noteGain.connect(masterGain);
    oscillator.start(now + note.start);
    oscillator.stop(now + note.start + note.duration);
  });
}

function MetricCard({ value, lines }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-[#F4F3F0] p-4">
      <div className="mb-0 text-[34px] font-black leading-none tracking-tighter text-[#34C759]">{value}</div>
      <div className="mt-1 text-[13px] font-medium leading-tight text-[#737373]">
        {lines[0]}
        <br />
        {lines[1]}
      </div>
    </div>
  );
}

function RoomListItem({ title, badge, badgeClass, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-[2rem] border border-black/5 bg-white p-6 text-left shadow-sm transition-transform active:scale-[0.98]"
    >
      <h3 className="text-lg font-bold text-[#0F166E]">{title}</h3>
      <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${badgeClass}`}>{badge}</span>
    </button>
  );
}

function MachineCard({ number, status, className, muted = false }) {
  return (
    <div className={`aspect-square rounded-[2.5rem] text-white transition-transform active:scale-95 ${className}`}>
      <div className="flex h-full flex-col items-center justify-center">
        <span className={`text-[48px] font-black leading-none ${muted ? 'opacity-50' : 'drop-shadow-sm'}`}>{number}</span>
        <span className={`mt-2 text-[13px] font-bold uppercase tracking-widest ${muted ? 'opacity-80' : 'opacity-90'}`}>{status}</span>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors active:scale-95 ${
        active ? 'text-[#0F166E]' : 'text-[#A6AEB5] hover:text-[#737373]'
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}
