'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';

// ==========================================
// 🔗 API CONFIGURATION & MOCK DATA
// ==========================================
const GAS_API_URL = "http://localhost:3001/api/exec";

const taskForcesTemplate = [
  { id: 'naresuan', name: 'กกล. นเรศวร', stars: 3, color: '#0dcaf0', hq: 'ค่ายวชิรปราการ อ.เมือง จ.ตาก', hqLat: 16.865, hqLng: 99.125, detailedDesc: 'มีภารกิจหลักในการป้องกันประเทศ การจัดระเบียบพื้นที่ชายแดน สกัดกั้นยาเสพติด และการลักลอบเข้าเมืองโดยผิดกฎหมาย' },
  { id: 'surasi', name: 'กกล. สุรสีห์', stars: 3, color: '#f1c40f', hq: 'ค่ายสุรสีห์ อ.เมือง จ.กาญจนบุรี', hqLat: 14.072, hqLng: 99.458, detailedDesc: 'ดูแลความมั่นคงแนวพรมแดน จุดผ่อนปรนการค้า และควบคุมเส้นทางช่องทางธรรมชาติที่สำคัญ' },
  { id: 'thepsatri', name: 'กกล. เทพสตรี', stars: 3, color: '#2ecc71', hq: 'ค่ายเทพสตรีศรีสุนทรธรรมธาดา จ.นครศรีธรรมราช', hqLat: 8.169, hqLng: 99.638, detailedDesc: 'ป้องกันการกระทำผิดกฎหมายข้ามชาติ สินค้าหนีภาษี และรักษาความมั่นคงร่วมกับประเทศเพื่อนบ้าน' },
  { id: 'phamuang', name: 'กกล. ผาเมือง', stars: 3, color: '#e74c3c', hq: 'ค่ายโชติวัตร อ.แม่ริม จ.เชียงใหม่', hqLat: 18.847, hqLng: 98.956, detailedDesc: 'สกัดกั้นขบวนการค้ายาเสพติดข้ามชาติ การตัดไม้ทำลายป่า และอาชญากรรมชายแดนอื่นๆ' },
  { id: 'surasak', name: 'กกล. สุรศักดิ์มนตรี', stars: 3, color: '#a855f7', hq: 'ค่ายพระยาสุนทรธรรมธาดา จ.อุดรธานี', hqLat: 17.304, hqLng: 102.815, detailedDesc: 'สกัดกั้นยาเสพติด สินค้าเถื่อน และบูรณาการความร่วมมือลาดตระเวนตามแนวลำน้ำโขง' },
  { id: 'suranari', name: 'กกล. สุรนารี', stars: 3, color: '#f97316', hq: 'ค่ายวีรวัฒน์โยธิน อ.เมือง จ.สุรินทร์', hqLat: 14.894, hqLng: 103.491, detailedDesc: 'ป้องกันการลุกล้ำอธิปไตย ดูแลพื้นที่ทับซ้อน การลักลอบตัดไม้พะยูง และการเก็บกู้ทุ่นระเบิด' },
  { id: 'burapha', name: 'กกล. บูรพา', stars: 3, color: '#ec4899', hq: 'ค่ายสุรสิงหนาท จ.สระแก้ว', hqLat: 13.682, hqLng: 102.502, detailedDesc: 'ดูแลจุดผ่านแดนถาวร ป้องกันอาชญากรรมข้ามชาติ การลักลอบนำเข้ารถยนต์ และแรงงานผิดกฎหมาย' }
];

async function fetchAPI(action, data = {}) {
  try {
    const response = await fetch(GAS_API_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, data })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Error:', error);
    return { error: error.message };
  }
}

function runDemoMode(action, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (action === 'checkLogin') {
        if (data.username === 'admin') resolve({ success: true, name: 'Demo Admin', role: 'Admin' });
        else resolve({ success: true, name: data.username, role: 'Editor' });
      }
      else if (action === 'getUnitData') {
        resolve({
          rows: [
            ["แผนยุทธศาสตร์ที่ 1", "กกล. ผาเมือง", "ส่วนบังคับบัญชา", "-", "-", "บก.กกล.ผาเมือง", 1, 15, 50, 200, 266, "", "Updated: 10/10/26 10:00", 1, 15, 50, 200, 266, 1],
            ["แผนยุทธศาสตร์ที่ 1", "กกล. สุรสีห์", "ส่วนปฏิบัติการ", "ร.29", "-", "ร.29 พัน.1", 0, 8, 30, 150, 188, "", "Updated: 11/10/26 12:30", 0, 8, 30, 100, 138, 2],
            ["แผนยุทธศาสตร์ที่ 2", "กกล. นเรศวร", "ส่วนสนับสนุน", "รพ.สนาม", "-", "รพ.ค่ายวชิรปราการ", 0, 5, 20, 40, 65, "", "Pending", 0, 5, 20, 40, 65, 3]
          ]
        });
      }
      else if (action === 'getUsersData') resolve({ rows: [{ username: 'admin', password: '123', name: 'ระบบ Admin', role: 'Admin', rowIndex: 2 }] });
      else if (action === 'getPersonnelData') resolve({ rows: [{ rank: 'ร.29 พัน.1', name: '188', position_normal: '150', position_field: 'report_r29.xlsx', mil_id: 'ร.อ. ตัวอย่าง', unit: 'false', timestamp: '12/10/2026 10:00:00', rowIndex: 2 }] });
      else if (action === 'getCasualtyData') resolve({ rows: [{ date: '12/10/2026', name: 'ส.อ. สมชาย', unit: 'ร.29 พัน.1', cause: 'ปะทะข้าศึก', status: 'บาดเจ็บ', doctorConfirm: 'true', rowIndex: 2 }] });
      else resolve({ success: true });
    }, 500);
  });
}

function cleanNumber(val) {
  if (val === undefined || val === null || val === "") return 0;
  let num = Number(val.toString().replace(/,/g, '').replace(/\s/g, ''));
  return isNaN(num) ? 0 : num;
}

// ==========================================
// 🎨 REUSABLE COMPONENTS
// ==========================================
const StatCard = ({ title, value, icon, colorClass }) => (
  <div className={`relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-${colorClass.split('-')[1]}/20 group`}>
    <div className={`absolute -right-6 -bottom-6 opacity-10 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 ${colorClass}`}>
      {icon}
    </div>
    <p className="text-slate-400 font-medium text-sm mb-2">{title}</p>
    <h3 className={`text-4xl font-bold tracking-tight ${colorClass}`}>{Number(value).toLocaleString()}</h3>
  </div>
);

const NavItem = ({ id, label, iconClass, colorClass = "text-slate-400", delayIdx = 0, activePage, switchPage, sidebarCollapsed, mobileOpen }) => {
  const isActive = activePage === id;
  return (
    <button 
      onClick={() => switchPage(id)}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden group animate-menu-slide-in
        ${isActive ? 'bg-gradient-to-r from-yellow-500/10 to-transparent text-yellow-400' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}`}
      style={{ animationDelay: `${delayIdx * 50}ms`, animationFillMode: 'forwards', opacity: 0 }}
    >
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 bg-yellow-500 rounded-r-full shadow-[0_0_10px_rgba(234,179,8,0.6)] transition-all duration-300 ease-out ${isActive ? 'h-8 opacity-100' : 'h-0 opacity-0'}`}></div>
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
      <i className={`${iconClass} text-xl transition-all duration-300 relative z-10 ${isActive ? `scale-110 drop-shadow-[0_0_8px_currentColor] ${colorClass}` : `group-hover:scale-110 group-hover:rotate-[5deg] ${colorClass}`}`}></i>
      {(!sidebarCollapsed || mobileOpen) && <span className="font-semibold tracking-wide whitespace-nowrap relative z-10 transition-transform duration-300 group-hover:translate-x-1">{label}</span>}
    </button>
  );
};

const ModalWrapper = ({ isOpen, onClose, title, iconClass, colorClass, children, submitText, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}></div>
      <div className="relative bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className={`h-2 w-full shrink-0 bg-${colorClass.split('-')[1]}-500`}></div>
        <div className="p-6 lg:p-8 flex-1 overflow-y-auto custom-scroll">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold flex items-center gap-3 ${colorClass}`}><i className={`${iconClass} text-2xl`}></i> {title}</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><i className="bi bi-x-lg"></i></button>
          </div>
          <div className="space-y-5">{children}</div>
          <div className="mt-8 flex gap-3 justify-end">
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:bg-white/5 transition-colors border border-transparent">ยกเลิก</button>
            <button onClick={onSubmit} className={`px-8 py-3 rounded-xl font-bold text-black bg-${colorClass.split('-')[1]}-500 hover:bg-${colorClass.split('-')[1]}-400 shadow-lg shadow-${colorClass.split('-')[1]}-500/20 transition-all`}>{submitText || 'บันทึก'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  // 1️⃣ Global States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [isPageAnimating, setIsPageAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 2️⃣ Data States
  const [rawData, setRawData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [personnelData, setPersonnelData] = useState([]);
  const [casualtyData, setCasualtyData] = useState([]);

  // 3️⃣ Filter & UI States
  const [filters, setFilters] = useState({ search: '', plan: '', l0: '', l1: '', l2: '', l3: '', l4: '', rank: '' });
  const [showNotif, setShowNotif] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [showCasualtyModal, setShowCasualtyModal] = useState(false);
  const [showLineRegModal, setShowLineRegModal] = useState(false);
  const [showNodeDrawer, setShowNodeDrawer] = useState(false);
  const [drawerData, setDrawerData] = useState(null);
  const [showMapLayers, setShowMapLayers] = useState(false);
  const [showMapSidePanel, setShowMapSidePanel] = useState(false);
  const [activeMapForce, setActiveMapForce] = useState(null);
  
  // 4️⃣ Form States
  const [unitForm, setUnitForm] = useState({ rowIndex: '', plan: '', l0: '', l1: '', l2: '', l3: '', l4: '', g: '', n: '', s: '', p: '', lat: '', lng: '', checkList: '' });
  const [userForm, setUserForm] = useState({ rowIndex: '', username: '', password: '', name: '', role: 'Viewer' });
  const [personnelForm, setPersonnelForm] = useState({ rowIndex: '', unit: '', target: 0, actual: 0, mil_id: '', isConfirmed: false });
  const [casualtyForm, setCasualtyForm] = useState({ rowIndex: '', date: '', name: '', unit: '', cause: '', status: '', doctorConfirm: false, picUrl: '' });
  const [lineRegForm, setLineRegForm] = useState({ lineId: '', rank: '', name: '', position: '', affiliation: '', unit: '', phone: '' });

  // 5️⃣ Refs
  const pChartRef = useRef(null);
  const yearlyChartRef = useRef(null);
  const chartInstances = useRef({});
  const mapRef = useRef(null);

  // 📥 Effects: Load Initial Resources
  useEffect(() => {
    const styles = [
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
      "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    ];
    styles.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; document.head.appendChild(link);
      }
    });

    const scripts = ["https://cdn.jsdelivr.net/npm/chart.js", "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"];
    scripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script'); script.src = src; script.async = false; document.body.appendChild(script);
      }
    });

    // ตรวจสอบ Session เดิมจาก LocalStorage
    const savedUser = localStorage.getItem('army_user');
    if (savedUser) {
      try {
        const uData = JSON.parse(savedUser);
        setUser(uData);
        setIsLoggedIn(true);
      } catch (err) {
        localStorage.removeItem('army_user');
      }
    }
  }, []);

  // 📥 Effects: Fetch Core Data
  const loadCoreData = async () => {
    setIsLoading(true);
    const [uRes, pRes, cRes, usrRes] = await Promise.all([
      fetchAPI('getUnitData'), fetchAPI('getPersonnelData'), fetchAPI('getCasualtyData'), fetchAPI('getUsersData')
    ]);
    if (uRes.rows) setRawData(uRes.rows);
    if (pRes.rows) setPersonnelData(pRes.rows);
    if (cRes.rows) setCasualtyData(cRes.rows);
    if (usrRes.rows) setUsersData(usrRes.rows);
    setIsLoading(false);
  };

  useEffect(() => { if (isLoggedIn) loadCoreData(); }, [isLoggedIn]);

  // 🔍 Memos: Filter & Compute Stats
  const filteredData = useMemo(() => {
    return rawData.filter(r => {
      let strMatch = r.slice(0, 6).join(" ").toUpperCase();
      if (filters.search && !strMatch.includes(filters.search.toUpperCase())) return false;
      if (filters.plan && r[0] !== filters.plan) return false;
      if (filters.l0 && r[1] !== filters.l0) return false;
      if (filters.l1 && r[2] !== filters.l1) return false;
      if (filters.l2 && r[3] !== filters.l2) return false;
      if (filters.l3 && r[4] !== filters.l3) return false;
      if (filters.l4 && r[5] !== filters.l4) return false;
      return true;
    });
  }, [rawData, filters]);

  const dashboardStats = useMemo(() => {
    let g = 0, n = 0, s = 0, p = 0, total = 0, prevTotal = 0;
    let updated = 0, pending = 0, increasedUnits = 0;
    let plans = {}, struct = {};
    let l0Set = new Set(), l1Set = new Set(), l2Set = new Set(), l3Set = new Set(), l4Set = new Set();

    filteredData.forEach(r => {
      let cg = cleanNumber(r[6]); let cn = cleanNumber(r[7]); let cs = cleanNumber(r[8]); let cp = cleanNumber(r[9]);
      let ct = cleanNumber(r[10]) || (cg + cn + cs + cp);
      let pt = cleanNumber(r[17]) || ct;
      
      g += cg; n += cn; s += cs; p += cp; total += ct; prevTotal += pt;

      if (r[1] && r[1] !== '-') l0Set.add(r[1]);
      if (r[2] && r[2] !== '-') l1Set.add(r[1] + r[2]);
      if (r[3] && r[3] !== '-') l2Set.add(r[2] + r[3]);
      if (r[4] && r[4] !== '-') l3Set.add(r[3] + r[4]);
      if (r[5] && r[5] !== '-') l4Set.add(r[4] + r[5]);

      if (r[12] && r[12].includes("Updated")) updated++; else pending++;
      if (ct > pt) increasedUnits++;

      let planName = r[0] || "อื่นๆ";
      if (!plans[planName]) plans[planName] = { units: 0, pop: 0 };
      plans[planName].units++; plans[planName].pop += ct;

      let l0 = r[1] || "-";
      if (!struct[l0]) struct[l0] = { prev: 0, curr: 0 };
      struct[l0].prev += pt; struct[l0].curr += ct;
    });

    return { 
      g, n, s, p, total, prevTotal, updated, pending, increasedUnits, plans, struct, 
      c_l0: l0Set.size, c_l1: l1Set.size, c_l2: l2Set.size, c_l3: l3Set.size, c_l4: l4Set.size 
    };
  }, [filteredData]);

  // 📊 Effects: Charts Initialization
  useEffect(() => {
    if (activePage === 'dashboard') {
      const initCharts = () => {
        if (window.Chart && pChartRef.current && yearlyChartRef.current) {
          if (chartInstances.current.pChart) chartInstances.current.pChart.destroy();
          chartInstances.current.pChart = new window.Chart(pChartRef.current, {
            type: 'doughnut',
            data: { labels: ['นายพล', 'น.', 'ส.', 'พลฯ'], datasets: [{ data: [dashboardStats.g, dashboardStats.n, dashboardStats.s, dashboardStats.p], backgroundColor: ['#38bdf8', '#4ade80', '#facc15', '#f87171'], borderWidth: 0 }] },
            options: { plugins: { legend: { position: 'bottom', labels: { color: theme === 'dark' ? '#cbd5e1' : '#475569', font: { family: 'Sarabun' } } } }, cutout: '75%', maintainAspectRatio: false }
          });

          if (chartInstances.current.yChart) chartInstances.current.yChart.destroy();
          const labels = Object.keys(dashboardStats.struct).filter(k => k !== '-');
          const prevData = labels.map(l => dashboardStats.struct[l].prev);
          const currData = labels.map(l => dashboardStats.struct[l].curr);
          
          chartInstances.current.yChart = new window.Chart(yearlyChartRef.current, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [
                { label: 'ยอดเดิม', data: prevData, backgroundColor: 'rgba(71, 85, 105, 0.5)', borderRadius: 4 },
                { label: 'ยอดใหม่', data: currData, backgroundColor: 'rgba(234, 179, 8, 0.8)', borderRadius: 4 }
              ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: theme === 'dark' ? '#cbd5e1' : '#475569', font: { family: 'Sarabun' } } } }, scales: { y: { grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' } }, x: { grid: { display: false }, ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' } } } }
          });
        } else {
          setTimeout(initCharts, 500);
        }
      };
      initCharts();
    }
  }, [activePage, dashboardStats, theme]);

  // 🗺️ Effects: Leaflet Map Initialization
  useEffect(() => {
    if (activePage === 'map' && !mapRef.current) {
      const initMap = () => {
        if (window.L) {
          const L = window.L;
          const map = L.map('viewDiv', { zoomControl: false }).setView([13.7367, 100.5231], 5.8);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
          
          const hqIcon = L.divIcon({ className: 'custom-div-icon', html: `<div style="width:24px;height:24px;border-radius:50%;background:#111827;border:2px solid #fbbf24;display:flex;align-items:center;justify-content:center;box-shadow: 0 0 10px rgba(251,191,36,0.5);"><i class="fas fa-star text-warning text-xs"></i></div>`, iconSize: [24, 24] });
          const hqGroup = L.layerGroup().addTo(map);
          const unitIcon = L.divIcon({ className: 'custom-div-icon', html: `<div style="width:16px;height:16px;border-radius:50%;background:#fbbf24;border:2px solid #111827;box-shadow: 0 0 5px rgba(251,191,36,0.8);"></div>`, iconSize: [16, 16] });
          const unitGroup = L.layerGroup().addTo(map);
          
          taskForcesTemplate.forEach(tf => {
            if (tf.hqLat && tf.hqLng) {
              L.marker([tf.hqLat, tf.hqLng], { icon: hqIcon })
               .bindPopup(`<div class="text-sm font-bold text-yellow-500">${tf.hq}</div><div class="text-xs text-white">${tf.name}</div>`)
               .on('click', () => { setActiveMapForce(tf); setShowMapSidePanel(true); })
               .addTo(hqGroup);
            }
          });
          rawData.forEach(r => {
            const lat = Number(r[19]); const lng = Number(r[20]);
            if (lat && lng && lat !== 0 && lng !== 0) {
              L.marker([lat, lng], { icon: unitIcon })
               .bindPopup(`<div class="text-sm font-bold text-yellow-400">${r[5] || r[4]}</div><div class="text-xs text-slate-300">สังกัด: ${r[1]}</div><div class="mt-1 font-bold text-white">กำลังพล: ${cleanNumber(r[10]).toLocaleString()} นาย</div>`)
               .addTo(unitGroup);
            }
          });

          mapRef.current = map;
        } else {
          setTimeout(initMap, 500);
        }
      };
      initMap();
    }
  }, [activePage]);

  // 🔐 Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    const u = e.target.username.value; const p = e.target.password.value;
    const res = await fetchAPI('checkLogin', { username: u, password: p });
    if (res.success) { 
      const userData = { name: res.name, role: res.role };
      setUser(userData); 
      setIsLoggedIn(true); 
      localStorage.setItem('army_user', JSON.stringify(userData));
    } 
    else { alert(res.error); }
  };

  const handleLogout = () => { 
    setIsLoggedIn(false); 
    setUser(null); 
    localStorage.removeItem('army_user');
  };
  
  const switchPage = (page) => {
    if (page === activePage) return;
    setIsPageAnimating(true);
    setTimeout(() => { setActivePage(page); setMobileOpen(false); setIsPageAnimating(false); }, 300);
  };

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  // 💾 Save Handlers
  const handleSaveUnit = async () => {
    const res = await fetchAPI('saveUnitData', unitForm);
    if (res.success) {
      setShowUnitModal(false);
      loadCoreData();
      if (window.Swal) window.Swal.fire('Success', 'บันทึกสำเร็จ', 'success');
    }
  };

  const handleSavePersonnel = async () => {
    const res = await fetchAPI('savePersonnelData', { ...personnelForm, name: personnelForm.target, position_normal: personnelForm.actual });
    if (res.success) {
      setShowPersonnelModal(false);
      loadCoreData();
      if (window.Swal) window.Swal.fire('Success', 'บันทึกกำลังพลเรียบร้อย', 'success');
    }
  };

  const handleSaveUser = async () => {
    const res = await fetchAPI('saveUserData', userForm);
    if (res.success) {
      setShowUserModal(false);
      loadCoreData();
      if (window.Swal) window.Swal.fire('Success', 'บันทึกบัญชีผู้ใช้เรียบร้อย', 'success');
    }
  };

  const handleSaveCasualty = async () => {
    const res = await fetchAPI('saveCasualtyData', casualtyForm);
    if (res.success) {
      setShowCasualtyModal(false);
      loadCoreData();
      if (window.Swal) window.Swal.fire('Success', 'บันทึกรายการสูญเสียเรียบร้อย', 'success');
    }
  };
  
  // 🌳 Tree Builders
  const buildTreeData = () => {
    const tree = {};
    filteredData.forEach(r => {
      let l0 = r[1] || "-"; let l1 = r[2] || "-"; let l2 = r[3] || "-"; let l3 = r[4] || "-";
      if (!tree[l0]) tree[l0] = {};
      if (!tree[l0][l1]) tree[l0][l1] = {};
      if (!tree[l0][l1][l2]) tree[l0][l1][l2] = [];
      tree[l0][l1][l2].push(r);
    });
    return tree;
  };

  const buildDynamicTreeData = () => {
    const tree = {};
    filteredData.forEach((r, i) => {
      let plan = r[0] || "อื่นๆ"; let l0 = r[1] || "-"; let l1 = r[2] || "-"; let l2 = r[3] || "-";
      if (!tree[plan]) tree[plan] = {};
      if (!tree[plan][l0]) tree[plan][l0] = {};
      if (!tree[plan][l0][l1]) tree[plan][l0][l1] = {};
      if (!tree[plan][l0][l1][l2]) tree[plan][l0][l1][l2] = [];
      tree[plan][l0][l1][l2].push({ data: r, index: i });
    });
    return tree;
  };

  // ==========================================
  // 1️⃣ RENDER: LOGIN SCREEN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#050505] overflow-hidden font-['Sarabun'] animate-slow-fade">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-900/20 via-slate-950 to-black"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-600/20 rounded-full blur-[100px] animate-soft-float"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-emerald-900/20 rounded-full blur-[120px] animate-soft-float" style={{animationDelay: '2s'}}></div>

        <div className="relative z-10 w-full max-w-md p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <img src="/logo.png" className="w-28 relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" alt="RTA Logo" />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-wider mb-2">ศปก.ทบ.</h2>
          <p className="text-slate-400 text-sm font-medium mb-8">ระบบบริหารจัดการและบัญชาการโครงสร้างหน่วย</p>
          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 tracking-wider uppercase ml-1"><i className="bi bi-person-fill me-2"></i>ชื่อผู้ใช้งาน</label>
              <input type="text" name="username" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-center focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all placeholder:text-slate-600" placeholder="admin" required />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 tracking-wider uppercase ml-1"><i className="bi bi-key-fill me-2"></i>รหัสผ่าน</label>
              <input type="password" name="password" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-center focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all placeholder:text-slate-600" placeholder="123" required />
            </div>
            <button type="submit" className="w-full relative overflow-hidden bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 mt-4">
              <span className="relative z-10 flex items-center gap-2 text-lg"><i className="bi bi-box-arrow-in-right"></i> เข้าสู่ระบบ</span>
            </button>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20"></div>
              <span className="text-xs text-slate-500 font-medium">หรือเข้าสู่ระบบด้วย</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20"></div>
            </div>
            <button type="button" onClick={() => setShowLineRegModal(true)} className="w-full bg-[#06C755]/10 hover:bg-[#06C755]/20 border border-[#06C755]/30 text-[#06C755] font-bold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3">
              <i className="bi bi-line text-xl"></i> <span>LINE Login</span>
            </button>
          </form>
        </div>

        {/* Line Login Form Modal (Mock) */}
        <ModalWrapper isOpen={showLineRegModal} onClose={() => setShowLineRegModal(false)} onSubmit={() => setShowLineRegModal(false)} title="ลงทะเบียน LINE" iconClass="bi bi-line" colorClass="text-[#06C755]" submitText="ลงทะเบียน">
           <div className="space-y-4">
              <p className="text-sm text-slate-400">กรุณากรอกข้อมูลเพื่อผูกบัญชี LINE ของท่าน</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">ยศ</label><input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">ชื่อ-สกุล</label><input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" /></div>
                <div className="col-span-2 space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">หน่วยสังกัด</label><input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" /></div>
              </div>
           </div>
        </ModalWrapper>
      </div>
    );
  }

  // ==========================================
  // 2️⃣ RENDER: MAIN APP LAYOUT
  // ==========================================
  return (
    <div className="flex h-screen bg-[#070a13] text-slate-200 font-['Sarabun'] overflow-hidden selection:bg-yellow-500/30 animate-slow-fade">
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        
        .tree-vertical ul { padding-left: 32px; position: relative; list-style: none; margin: 0; }
        .tree-vertical-root { padding-left: 0 !important; }
        .tree-vertical li { position: relative; padding: 20px 0 0 32px; }
        .tree-vertical li::after { content: ''; position: absolute; top: 0; bottom: 0; left: 0; border-left: 2px solid rgba(234, 179, 8, 0.3); }
        .tree-vertical li::before { content: ''; position: absolute; top: 48px; left: 0; width: 32px; border-top: 2px solid rgba(234, 179, 8, 0.3); }
        .tree-vertical li:last-child::after { height: 50px; bottom: auto; }

        /* Dynamic Details Tree CSS */
        details > summary { list-style: none; cursor: pointer; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 6px; display: flex; align-items: center; transition: 0.3s; border: 1px solid rgba(255,255,255,0.05); }
        details > summary::-webkit-details-marker { display: none; }
        details[open] > summary { background: rgba(234,179,8,0.1); border-color: rgba(234,179,8,0.3); }
        
        @keyframes menuSlideIn { 0% { opacity: 0; transform: translateX(-20px); } 100% { opacity: 1; transform: translateX(0); } }
        .animate-menu-slide-in { animation: menuSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        [data-theme="light"] .text-white { color: var(--text) !important; }
        [data-theme="light"] .text-slate-200 { color: #1e293b !important; }
        [data-theme="light"] .text-slate-300 { color: #334155 !important; }
        [data-theme="light"] .text-slate-400 { color: #64748b !important; }
        [data-theme="light"] .text-slate-500 { color: #94a3b8 !important; }
        [data-theme="light"] .bg-white\\/5 { background-color: rgba(0,0,0,0.03) !important; }
        [data-theme="light"] .bg-white\\/10 { background-color: rgba(0,0,0,0.08) !important; }
        [data-theme="light"] .border-white\\/5 { border-color: rgba(0,0,0,0.05) !important; }
        [data-theme="light"] .border-white\\/10 { border-color: rgba(0,0,0,0.1) !important; }
        [data-theme="light"] .bg-black\\/20 { background-color: #ffffff !important; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0 !important; }
        [data-theme="light"] .bg-black\\/40 { background-color: #f8fafc !important; border: 1px solid #cbd5e1 !important; }
        [data-theme="light"] .bg-[#070a13] { background-color: #f4f6f0 !important; }
        [data-theme="light"] .bg-[#0b0f19] { background-color: #2d341a !important; }
        [data-theme="light"] .bg-[#0f172a] { background-color: #ffffff !important; }
        [data-theme="light"] .shadow-xl { box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important; }

        @media print { body { background: white !important; color: black !important; } .no-print { display: none !important; } }
      `}} />

      {mobileOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)}></div>}

      {/* 🧭 SIDEBAR */}
      <aside className={`fixed lg:relative z-50 h-full bg-[#0b0f19] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-24' : 'w-72'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="absolute -right-4 top-8 bg-[#1e293b] border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 p-1.5 rounded-full z-50 hidden lg:flex shadow-lg transition-colors">
          <i className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'} text-sm`}></i>
        </button>
        <div className="p-6 flex flex-col items-center justify-center shrink-0">
          <div className="relative">
             <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
             <img src="/logo.png" className={`relative z-10 transition-all duration-300 drop-shadow-md ${sidebarCollapsed ? 'w-10' : 'w-16'}`} alt="logo" />
          </div>
          {(!sidebarCollapsed || mobileOpen) && <h1 className="mt-4 text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-widest">ศปก.ทบ.</h1>}
        </div>
        <div className="px-6 pb-6 border-b border-white/5 flex flex-col items-center shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border-2 border-white/10 flex items-center justify-center shadow-inner mb-3"><i className="bi bi-person-fill text-2xl text-slate-400"></i></div>
          {(!sidebarCollapsed || mobileOpen) && (
            <div className="text-center animate-in fade-in duration-300">
              <p className="font-bold text-white text-sm">{user?.name}</p>
              <span className={`inline-block mt-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user?.role === 'Admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{user?.role}</span>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1 custom-scroll">
          {(!sidebarCollapsed || mobileOpen) && <div className="px-4 text-[10px] font-bold text-slate-500 tracking-widest mb-3 mt-2 animate-menu-slide-in" style={{animationDelay: '0ms', opacity: 0}}>MAIN MENU</div>}
          <NavItem id="dashboard" label="Dashboard" iconClass="bi bi-grid-1x2-fill" colorClass="text-blue-400" delayIdx={1} activePage={activePage} switchPage={switchPage} sidebarCollapsed={sidebarCollapsed} mobileOpen={mobileOpen} />
          <NavItem id="map" label="แผนที่ยุทธวิธี" iconClass="bi bi-globe-americas" colorClass="text-emerald-400" delayIdx={2} activePage={activePage} switchPage={switchPage} sidebarCollapsed={sidebarCollapsed} mobileOpen={mobileOpen} />

          {(!sidebarCollapsed || mobileOpen) && <div className="px-4 text-[10px] font-bold text-slate-500 tracking-widest mb-3 mt-6 animate-menu-slide-in" style={{animationDelay: '150ms', opacity: 0}}>STRUCTURE</div>}
          <NavItem id="structure" label="บัญชีโครงสร้าง" iconClass="bi bi-table" colorClass="text-purple-400" delayIdx={4} activePage={activePage} switchPage={switchPage} sidebarCollapsed={sidebarCollapsed} mobileOpen={mobileOpen} />
          <NavItem id="tree" label="ผังหน่วย (Tree)" iconClass="bi bi-diagram-3-fill" colorClass="text-yellow-500" delayIdx={5} activePage={activePage} switchPage={switchPage} sidebarCollapsed={sidebarCollapsed} mobileOpen={mobileOpen} />
          <NavItem id="dynamic" label="จัดการโครงสร้าง" iconClass="bi bi-layers-fill" colorClass="text-orange-400" delayIdx={6} activePage={activePage} switchPage={switchPage} sidebarCollapsed={sidebarCollapsed} mobileOpen={mobileOpen} />

          {(!sidebarCollapsed || mobileOpen) && <div className="px-4 text-[10px] font-bold text-slate-500 tracking-widest mb-3 mt-6 animate-menu-slide-in" style={{animationDelay: '350ms', opacity: 0}}>REPORTS</div>}
          <NavItem id="personnelEntry" label="บันทึกกำลังพล" iconClass="bi bi-person-lines-fill" colorClass="text-pink-400" delayIdx={8} activePage={activePage} switchPage={switchPage} sidebarCollapsed={sidebarCollapsed} mobileOpen={mobileOpen} />
          <NavItem id="dailyReport" label="รายงานประจำวัน" iconClass="bi bi-file-earmark-bar-graph-fill" colorClass="text-teal-400" delayIdx={9} activePage={activePage} switchPage={switchPage} sidebarCollapsed={sidebarCollapsed} mobileOpen={mobileOpen} />
          <NavItem id="casualtyReport" label="รายงานสูญเสีย" iconClass="bi bi-heart-pulse-fill" colorClass="text-red-500" delayIdx={10} activePage={activePage} switchPage={switchPage} sidebarCollapsed={sidebarCollapsed} mobileOpen={mobileOpen} />

          {(!sidebarCollapsed || mobileOpen) && <div className="px-4 text-[10px] font-bold text-slate-500 tracking-widest mb-3 mt-6 animate-menu-slide-in" style={{animationDelay: '550ms', opacity: 0}}>SYSTEM</div>}
          <div className="relative group animate-menu-slide-in" style={{animationDelay: '600ms', opacity: 0}}>
             <NavItem id="notif" label="การแจ้งเตือน" iconClass="bi bi-bell-fill" colorClass="text-slate-400" delayIdx={12} activePage={activePage} switchPage={() => setShowNotif(true)} sidebarCollapsed={sidebarCollapsed} mobileOpen={mobileOpen} />
             <span className="absolute top-3 ${sidebarCollapsed ? 'right-8' : 'right-4'} w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          </div>
          {user?.role === 'Admin' && <NavItem id="admin" label="จัดการผู้ใช้งาน" iconClass="bi bi-shield-lock-fill" colorClass="text-slate-400" delayIdx={13} activePage={activePage} switchPage={switchPage} sidebarCollapsed={sidebarCollapsed} mobileOpen={mobileOpen} />}
        </nav>
        
        <div className="px-4 pb-2 animate-menu-slide-in" style={{animationDelay: '650ms', opacity: 0}}>
          <div className={`flex items-center p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-black/5 border border-black/10'} ${sidebarCollapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}>
            {(!sidebarCollapsed || mobileOpen) && (
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                {theme === 'dark' ? <i className="bi bi-moon-stars-fill text-blue-400"></i> : <i className="bi bi-sun-fill text-yellow-500"></i>}โหมดหน้าจอ
              </span>
            )}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${theme === 'dark' ? 'bg-slate-600' : 'bg-yellow-400'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
        <div className="p-4 border-t border-white/5 shrink-0 animate-menu-slide-in" style={{animationDelay: '700ms', opacity: 0}}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors group">
            <i className="bi bi-box-arrow-left text-xl group-hover:-translate-x-1 transition-transform"></i>
            {(!sidebarCollapsed || mobileOpen) && <span className="font-bold text-sm">ออกจากระบบ</span>}
          </button>
        </div>
      </aside>

      {/* 🖼️ MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#070a13]">
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-emerald-900/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Top Header */}
        <header className="h-20 shrink-0 px-6 lg:px-10 border-b border-white/5 bg-white/5 backdrop-blur-xl flex items-center justify-between z-30 relative shadow-sm no-print">
          <div className="flex items-center gap-4">
             <button onClick={() => setMobileOpen(true)} className="lg:hidden text-slate-400 hover:text-white text-2xl"><i className="bi bi-list"></i></button>
             <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
               {activePage === 'dashboard' && <><i className="bi bi-grid-1x2-fill text-blue-500"></i> Tactical Dashboard</>}
               {activePage === 'map' && <><i className="bi bi-globe-americas text-emerald-500"></i> แผนที่ยุทธวิธี (GIS)</>}
               {activePage === 'structure' && <><i className="bi bi-table text-purple-500"></i> บัญชีโครงสร้างหน่วย</>}
               {activePage === 'tree' && <><i className="bi bi-diagram-3-fill text-yellow-500"></i> ผังโครงสร้างหน่วย</>}
               {activePage === 'dynamic' && <><i className="bi bi-layers-fill text-orange-500"></i> จัดการโครงสร้าง</>}
               {activePage === 'personnelEntry' && <><i className="bi bi-person-lines-fill text-pink-500"></i> นำเข้ากำลังพล</>}
               {activePage === 'dailyReport' && <><i className="bi bi-file-earmark-bar-graph-fill text-teal-500"></i> รายงานประจำวัน</>}
               {activePage === 'casualtyReport' && <><i className="bi bi-heart-pulse-fill text-red-500"></i> รายงานสถานภาพสูญเสีย</>}
               {activePage === 'admin' && <><i className="bi bi-shield-lock-fill text-slate-400"></i> จัดการผู้ใช้งาน</>}
             </h2>
          </div>
          <div className="flex items-center gap-3">
             {activePage !== 'map' && activePage !== 'tree' && activePage !== 'dynamic' && !activePage.includes('Report') && (
                <button onClick={loadCoreData} className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition-colors text-slate-300">
                  <i className={`bi bi-arrow-clockwise ${isLoading ? 'animate-spin text-yellow-500' : ''}`}></i> ซิงค์ข้อมูล
                </button>
             )}
          </div>
        </header>

        {/* Global Filter Bar */}
        {!['dailyReport', 'kp4Report', 'map', 'admin'].includes(activePage) && (
          <div className="px-6 lg:px-10 pt-6 pb-2 shrink-0 z-20 relative animate-in slide-in-from-top-4 duration-500 no-print">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex flex-wrap gap-3 shadow-lg">
              <select className="flex-1 min-w-[140px] bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-yellow-500/50" value={filters.plan} onChange={e => handleFilterChange('plan', e.target.value)}>
                <option value="">🌐 ทุกแผนยุทธศาสตร์</option>
                {Array.from(new Set(rawData.map(r=>r[0]).filter(Boolean))).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <select className="flex-1 min-w-[140px] bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-yellow-500/50" value={filters.l0} onChange={e => handleFilterChange('l0', e.target.value)}>
                <option value="">🛡️ ส่วนภูมิภาค</option>
                {Array.from(new Set(rawData.map(r=>r[1]).filter(Boolean))).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <select className="flex-1 min-w-[140px] bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-yellow-500/50" value={filters.l1} onChange={e => handleFilterChange('l1', e.target.value)}>
                <option value="">⚡ จัดกำลัง</option>
                {Array.from(new Set(rawData.map(r=>r[2]).filter(Boolean))).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="flex-2 min-w-[200px] relative">
                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input type="text" placeholder="ค้นหาหน่วย..." className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 placeholder:text-slate-600" value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto custom-scroll p-6 lg:p-10 relative z-10 transition-opacity duration-300 ${isPageAnimating ? 'opacity-0' : 'opacity-100'}`}>
          
          {/* ================= 1. DASHBOARD ================= */}
          {activePage === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                <StatCard title="กำลังพลรวม (นาย)" value={dashboardStats.total} icon={<i className="bi bi-people-fill text-6xl"></i>} colorClass="text-white border-t-slate-500" />
                <StatCard title="นายพล" value={dashboardStats.g} icon={<i className="bi bi-star-fill text-6xl"></i>} colorClass="text-[#38bdf8] border-t-[#38bdf8]" />
                <StatCard title="สัญญาบัตร (น.)" value={dashboardStats.n} icon={<i className="bi bi-person-badge-fill text-6xl"></i>} colorClass="text-[#4ade80] border-t-[#4ade80]" />
                <StatCard title="ประทวน (ส.)" value={dashboardStats.s} icon={<i className="bi bi-person-check-fill text-6xl"></i>} colorClass="text-[#facc15] border-t-[#facc15]" />
                <StatCard title="พลทหาร (พลฯ)" value={dashboardStats.p} icon={<i className="bi bi-person-fill text-6xl"></i>} colorClass="text-[#f87171] border-t-[#f87171]" />
              </div>
              
              <div>
                <h6 className="mb-4 font-bold text-yellow-500 flex items-center gap-2"><i className="bi bi-building-fill"></i>สรุปจำนวนหน่วยแยกตามระดับ</h6>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center shadow-lg"><h3 className="text-2xl font-bold text-[#38bdf8]">{dashboardStats.c_l0}</h3><p className="text-xs text-slate-400 mt-1">ส่วนภูมิภาค</p></div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center shadow-lg"><h3 className="text-2xl font-bold text-[#4ade80]">{dashboardStats.c_l1}</h3><p className="text-xs text-slate-400 mt-1">จัดกำลัง</p></div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center shadow-lg"><h3 className="text-2xl font-bold text-[#facc15]">{dashboardStats.c_l2}</h3><p className="text-xs text-slate-400 mt-1">กองกำลัง</p></div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center shadow-lg"><h3 className="text-2xl font-bold text-[#f87171]">{dashboardStats.c_l3}</h3><p className="text-xs text-slate-400 mt-1">หน่วยเฉพาะกิจ</p></div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center shadow-lg"><h3 className="text-2xl font-bold text-white">{dashboardStats.c_l4}</h3><p className="text-xs text-slate-400 mt-1">หน่วย</p></div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6"><i className="bi bi-bar-chart-fill text-yellow-500 mr-2"></i>เปรียบเทียบยอดกำลังพล อดีต-ปัจจุบัน</h3>
                    <div className="h-[300px] w-full"><canvas ref={yearlyChartRef}></canvas></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
                     <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6"><i className="bi bi-shield-check text-emerald-500 mr-2"></i>สถานะอัปเดตข้อมูล</h3>
                        <div className="flex justify-center items-center gap-8 mb-6">
                          <div className="text-center"><p className="text-4xl font-extrabold text-emerald-400 mb-1">{dashboardStats.updated}</p><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">อัปเดตแล้ว</p></div>
                          <div className="w-px h-12 bg-white/10"></div>
                          <div className="text-center"><p className="text-4xl font-extrabold text-slate-400 mb-1">{dashboardStats.pending}</p><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">รอดำเนินการ</p></div>
                        </div>
                     </div>
                     <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6"><i className="bi bi-journal-text text-blue-500 mr-2"></i>สรุปตามแผนยุทธศาสตร์</h3>
                        <div className="space-y-3 custom-scroll overflow-y-auto max-h-[150px]">
                           {Object.keys(dashboardStats.plans).map(p => (
                             <div key={p} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                               <span className="text-sm font-medium text-slate-300">{p}</span>
                               <span className="text-sm font-bold text-white">{dashboardStats.plans[p].units} หน่วย <span className="text-yellow-500 ml-1">{dashboardStats.plans[p].pop.toLocaleString()}</span></span>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
                <div className="space-y-6 lg:space-y-8">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col h-full">
                     <h3 className="text-lg font-bold text-white mb-6"><i className="bi bi-pie-chart-fill text-purple-500 mr-2"></i>สัดส่วนภาพรวม</h3>
                     <div className="relative h-[220px] w-full flex items-center justify-center mb-6"><canvas ref={pChartRef}></canvas></div>
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">ยอดแยกตามส่วนภูมิภาค</h3>
                     <div className="space-y-3 flex-1 overflow-y-auto custom-scroll pr-2">
                        {Object.keys(dashboardStats.struct).map((l0, idx) => {
                          if (l0==='-') return null;
                          const colors = ['#38bdf8', '#4ade80', '#facc15', '#f87171', '#a855f7'];
                          const c = colors[idx % colors.length];
                          return (
                            <div key={l0} className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-slate-300 flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{backgroundColor:c}}></span> {l0}</span>
                              <span className="text-sm font-bold text-white">{dashboardStats.struct[l0].curr.toLocaleString()}</span>
                            </div>
                          );
                        })}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. STRUCTURE TAB ================= */}
          {activePage === 'structure' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl flex flex-col h-full overflow-hidden animate-in fade-in">
               <div className="p-4 lg:p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                 <h3 className="font-bold text-lg text-white flex items-center gap-2"><i className="bi bi-table text-purple-500"></i> ข้อมูลโครงสร้าง</h3>
                 <div className="flex gap-3">
                   <button onClick={() => { setUnitForm({ rowIndex: '', plan: '', l0: '', l1: '', l2: '', l3: '', l4: '', g: '', n: '', s: '', p: '', checkList: '' }); setShowUnitModal(true); }} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-xl text-sm transition-colors"><i className="bi bi-plus-lg mr-1"></i> เพิ่มข้อมูล</button>
                 </div>
               </div>
               <div className="flex-1 overflow-auto custom-scroll">
                 <table className="w-full text-left border-collapse whitespace-nowrap">
                   <thead className="bg-black/40 text-slate-400 text-xs uppercase font-bold tracking-wider sticky top-0 z-10 backdrop-blur-md">
                     <tr>
                       <th className="p-4 border-b border-white/10">ยุทธศาสตร์ / ภูมิภาค</th>
                       <th className="p-4 border-b border-white/10">โครงสร้างหน่วย</th>
                       <th className="p-4 border-b border-white/10 text-center text-[#38bdf8]">พล</th>
                       <th className="p-4 border-b border-white/10 text-center text-[#4ade80]">น.</th>
                       <th className="p-4 border-b border-white/10 text-center text-[#facc15]">ส.</th>
                       <th className="p-4 border-b border-white/10 text-center text-[#f87171]">พลฯ</th>
                       <th className="p-4 border-b border-white/10 text-center text-yellow-500">รวม</th>
                       <th className="p-4 border-b border-white/10 text-center">สถานะ</th>
                       <th className="p-4 border-b border-white/10 text-center">จัดการ</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm divide-y divide-white/5">
                     {filteredData.map((u, idx) => (
                       <tr key={idx} className="hover:bg-white/5 transition-colors">
                         <td className="p-4">
                           <div className="font-medium text-slate-300 mb-1"><i className="bi bi-journal-text text-slate-500 mr-2"></i>{u[0]}</div>
                           <div className="font-bold text-white"><i className="bi bi-shield-check text-blue-400 mr-2"></i>{u[1]}</div>
                         </td>
                         <td className="p-4">
                            <div className="text-slate-400 text-xs mb-1">{u[2]} {u[3] !== '-' ? `> ${u[3]}` : ''}</div>
                            <div className="font-bold text-white"><i className="bi bi-diagram-3 text-emerald-400 mr-2"></i>{u[5] || u[4]}</div>
                         </td>
                         <td className="p-4 text-center font-bold text-[#38bdf8] bg-[#38bdf8]/5">{cleanNumber(u[6]).toLocaleString()}</td>
                         <td className="p-4 text-center font-bold text-[#4ade80] bg-[#4ade80]/5">{cleanNumber(u[7]).toLocaleString()}</td>
                         <td className="p-4 text-center font-bold text-[#facc15] bg-[#facc15]/5">{cleanNumber(u[8]).toLocaleString()}</td>
                         <td className="p-4 text-center font-bold text-[#f87171] bg-[#f87171]/5">{cleanNumber(u[9]).toLocaleString()}</td>
                         <td className="p-4 text-center font-extrabold text-yellow-500 text-base bg-yellow-500/5">{cleanNumber(u[10]).toLocaleString()}</td>
                         <td className="p-4 text-center">
                           {u[12] && u[12].includes("Updated") 
                            ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><i className="bi bi-check-circle-fill"></i> อัปเดตแล้ว</span>
                            : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20"><i className="bi bi-clock-fill"></i> รอดำเนินการ</span>}
                         </td>
                         <td className="p-4 text-center">
                           <button onClick={() => {
                             setUnitForm({ rowIndex: u[18]||u[u.length-1], plan: u[0], l0: u[1], l1: u[2], l2: u[3], l3: u[4], l4: u[5], g: u[6], n: u[7], s: u[8], p: u[9], checkList: u[11] });
                             setShowUnitModal(true);
                           }} className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors"><i className="bi bi-pencil-square"></i></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* ================= 3. TREE TAB ================= */}
          {activePage === 'tree' && (() => {
            const treeData = buildTreeData();
            return (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-10 shadow-xl h-full overflow-auto custom-scroll animate-in fade-in">
                 <div className="tree-vertical">
                    <ul className="tree-vertical-root">
                      <li>
                        <div className="inline-flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-800 to-slate-900 border border-yellow-500/50 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)] min-w-[280px]">
                          <i className="bi bi-diagram-3-fill text-3xl text-yellow-500 mb-2"></i>
                          <span className="font-bold text-white text-lg">ศูนย์ปฏิบัติการกองทัพบก</span>
                          <span className="mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-bold border border-yellow-500/30">ยอดรวม {dashboardStats.total.toLocaleString()} นาย</span>
                        </div>
                        <ul className="mt-8">
                          {Object.keys(treeData).map(l0 => (
                            <li key={l0}>
                              <div className="inline-flex items-center gap-3 p-3 bg-slate-800/80 border border-blue-500/30 rounded-xl min-w-[240px] text-white font-bold"><i className="bi bi-shield-fill-check text-blue-400 text-xl"></i> {l0}</div>
                              <ul className="mt-6">
                                {Object.keys(treeData[l0]).map(l1 => (
                                  <li key={l1}>
                                    <div className="inline-flex items-center gap-3 p-3 bg-slate-800/80 border border-emerald-500/30 rounded-xl min-w-[220px] text-slate-200 font-semibold text-sm"><i className="bi bi-diagram-2 text-emerald-400"></i> {l1}</div>
                                    <ul className="mt-6">
                                      {Object.keys(treeData[l0][l1]).map(l2 => (
                                        <li key={l2}>
                                          <div className="inline-flex items-center gap-3 p-2 px-4 bg-slate-800/50 border border-red-500/30 rounded-xl text-slate-300 text-sm"><i className="bi bi-bullseye text-red-400"></i> {l2}</div>
                                          <ul className="mt-6">
                                            {treeData[l0][l1][l2].map((u, i) => (
                                              <li key={i}>
                                                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 min-w-[280px] shadow-lg hover:border-yellow-500/50 transition-colors cursor-pointer" onClick={() => { setDrawerData(u); setShowNodeDrawer(true); }}>
                                                  <div className="flex justify-between items-center mb-3">
                                                    <div className="font-bold text-white text-sm flex items-center gap-2"><i className="bi bi-geo-alt-fill text-red-500"></i> {u[5]||u[4]}</div>
                                                    <span className="bg-yellow-500 text-black text-xs font-extrabold px-2 py-1 rounded-md">{cleanNumber(u[10]).toLocaleString()}</span>
                                                  </div>
                                                  <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-3 mt-1">
                                                    <div className="text-center bg-[#38bdf8]/10 rounded py-1"><span className="block text-[10px] text-slate-500 mb-0.5">นายพล</span><span className="text-[#38bdf8] font-bold text-xs">{cleanNumber(u[6]).toLocaleString()}</span></div>
                                                    <div className="text-center bg-[#4ade80]/10 rounded py-1"><span className="block text-[10px] text-slate-500 mb-0.5">น.</span><span className="text-[#4ade80] font-bold text-xs">{cleanNumber(u[7]).toLocaleString()}</span></div>
                                                    <div className="text-center bg-[#facc15]/10 rounded py-1"><span className="block text-[10px] text-slate-500 mb-0.5">ส.</span><span className="text-[#facc15] font-bold text-xs">{cleanNumber(u[8]).toLocaleString()}</span></div>
                                                    <div className="text-center bg-[#f87171]/10 rounded py-1"><span className="block text-[10px] text-slate-500 mb-0.5">พลฯ</span><span className="text-[#f87171] font-bold text-xs">{cleanNumber(u[9]).toLocaleString()}</span></div>
                                                  </div>
                                                </div>
                                              </li>
                                            ))}
                                          </ul>
                                        </li>
                                      ))}
                                    </ul>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                 </div>
              </div>
            );
          })()}

          {/* ================= 3.5 DYNAMIC TAB ================= */}
          {activePage === 'dynamic' && (() => {
            const dynTree = buildDynamicTreeData();
            return (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                   <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex justify-between items-center shadow-lg">
                      <div><p className="text-emerald-400 font-bold text-sm mb-1"><i className="bi bi-shield-check"></i> สถานะอัปเดตข้อมูล</p><p className="text-3xl font-bold text-white">{dashboardStats.updated} <span className="text-sm font-normal text-slate-500">/ รอดำเนินการ {dashboardStats.pending}</span></p></div>
                   </div>
                   <div className="bg-white/5 border border-blue-500/30 p-6 rounded-3xl flex justify-between items-center shadow-lg">
                      <div><p className="text-blue-400 font-bold text-sm mb-1"><i className="bi bi-people-fill"></i> เปรียบเทียบยอดกำลังพล</p><p className="text-3xl font-bold text-white">{dashboardStats.prevTotal.toLocaleString()} <i className="bi bi-arrow-right text-slate-500 text-lg mx-2"></i> {dashboardStats.total.toLocaleString()}</p></div>
                   </div>
                   <div className="bg-white/5 border border-yellow-500/30 p-6 rounded-3xl flex justify-between items-center shadow-lg">
                      <div><p className="text-yellow-500 font-bold text-sm mb-1"><i className="bi bi-graph-up-arrow"></i> สรุปการเปลี่ยนแปลง</p><p className="text-3xl font-bold text-white">{dashboardStats.increasedUnits} หน่วย <span className="text-sm font-normal text-slate-500">ส่วนต่างรวม {dashboardStats.total - dashboardStats.prevTotal > 0 ? `+${dashboardStats.total - dashboardStats.prevTotal}` : dashboardStats.total - dashboardStats.prevTotal}</span></p></div>
                   </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl h-[600px] overflow-auto custom-scroll">
                  {Object.keys(dynTree).map(plan => (
                    <details key={plan} open className="mb-2">
                      <summary className="font-bold text-yellow-500 bg-white/5"><i className="bi bi-journal-text me-2"></i>{plan}</summary>
                      <div className="pl-6 border-l-2 border-yellow-500/30 ml-4 mt-2 space-y-2">
                         {Object.keys(dynTree[plan]).map(l0 => (
                           <details key={l0}>
                             <summary className="font-bold text-blue-400 bg-white/5"><i className="bi bi-shield-fill-check me-2"></i>{l0}</summary>
                             <div className="pl-6 border-l-2 border-blue-500/30 ml-4 mt-2 space-y-2">
                                {Object.keys(dynTree[plan][l0]).map(l1 => (
                                  <details key={l1}>
                                     <summary className="font-bold text-emerald-400 bg-white/5"><i className="bi bi-diagram-2 me-2"></i>{l1}</summary>
                                     <div className="pl-6 border-l-2 border-emerald-500/30 ml-4 mt-2 space-y-2">
                                        {Object.keys(dynTree[plan][l0][l1]).map(l2 => (
                                          <details key={l2}>
                                            <summary className="font-bold text-orange-400 bg-white/5"><i className="bi bi-crosshair me-2"></i>{l2}</summary>
                                            <div className="pl-6 border-l-2 border-orange-500/30 ml-4 mt-2 space-y-1">
                                               {dynTree[plan][l0][l1][l2].map(u => {
                                                  let ct = cleanNumber(u.data[10]) || (cleanNumber(u.data[6]) + cleanNumber(u.data[7]) + cleanNumber(u.data[8]) + cleanNumber(u.data[9]));
                                                  let pt = cleanNumber(u.data[17]) || ct;
                                                  let diff = ct - pt;
                                                  return (
                                                    <div key={u.index} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                                                      <span className="text-white text-sm cursor-pointer" onClick={() => { setDrawerData(u.data); setShowNodeDrawer(true); }}><i className="bi bi-geo-alt-fill text-red-500 mr-2"></i>{u.data[5] || u.data[4]}</span>
                                                      <div className="flex items-center gap-3">
                                                         {diff !== 0 && <span className={`text-xs font-bold px-2 py-1 rounded ${diff > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{diff > 0 ? '+' : ''}{diff}</span>}
                                                         <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 font-bold px-3 py-1 rounded-lg text-sm">{ct.toLocaleString()} นาย</span>
                                                         <button onClick={() => { setUnitForm({ rowIndex: u.data[18], plan: u.data[0], l0: u.data[1], l1: u.data[2], l2: u.data[3], l3: u.data[4], l4: u.data[5], g: u.data[6], n: u.data[7], s: u.data[8], p: u.data[9], lat: u.data[19] || '', lng: u.data[20] || '', checkList: u.data[11] }); setShowUnitModal(true); }} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><i className="bi bi-pencil-square"></i></button>
                                                      </div>
                                                    </div>
                                                  )
                                               })}
                                            </div>
                                          </details>
                                        ))}
                                     </div>
                                  </details>
                                ))}
                             </div>
                           </details>
                         ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ================= 4. MAP TAB ================= */}
          {activePage === 'map' && (
            <div className="bg-[#0f172a] rounded-3xl border border-slate-700 h-full relative overflow-hidden shadow-2xl flex flex-col animate-in fade-in">
              <div id="viewDiv" className="absolute inset-0 z-0"></div>
              
              <div className="absolute top-4 right-4 z-20">
                 <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-lg w-[240px]">
                    <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => setShowMapLayers(!showMapLayers)}>
                       <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-wider"><i className="fas fa-layer-group mr-2"></i> เปิด/ปิด เลเยอร์</h4>
                       <i className={`fas fa-chevron-${showMapLayers ? 'up' : 'down'} text-slate-400 text-xs transition-transform`}></i>
                    </div>
                    {showMapLayers && (
                      <div className="space-y-3 pt-2 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                         <label className="flex items-center justify-between cursor-pointer group">
                           <span className="text-sm font-medium text-slate-300 flex items-center gap-2"><div className="w-5 h-5 bg-black border border-yellow-500 rounded flex items-center justify-center"><i className="fas fa-star text-[10px] text-yellow-500"></i></div>ที่ตั้ง บก.กกล.</span>
                           <i className="fas fa-eye text-emerald-400"></i>
                         </label>
                      </div>
                    )}
                 </div>
              </div>

              <div className={`absolute top-4 left-4 z-20 w-80 bg-slate-900/95 backdrop-blur-xl border border-yellow-500/50 p-6 rounded-3xl shadow-2xl transition-transform duration-500 ${showMapSidePanel ? 'translate-x-0' : '-translate-x-[120%]'}`}>
                 <button onClick={() => setShowMapSidePanel(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400"><i className="bi bi-x-lg"></i></button>
                 {activeMapForce && (
                   <>
                     <div className="flex gap-1 mb-2 text-yellow-500 text-sm"><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i></div>
                     <h3 className="text-xl font-bold text-white mb-4" style={{color: activeMapForce.color}}>{activeMapForce.name}</h3>
                     <div className="space-y-4">
                        <div className="flex gap-3">
                           <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 border border-white/10"><i className="fas fa-building text-slate-400"></i></div>
                           <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ที่ตั้งกองบัญชาการ</p><p className="text-sm text-white font-medium bg-black/40 p-2 rounded-lg border border-white/10">{activeMapForce.hq}</p></div>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2"><i className="fas fa-info-circle text-blue-400 mr-1"></i> รายละเอียดภารกิจ</p>
                           <p className="text-xs text-slate-400 leading-relaxed">{activeMapForce.detailedDesc}</p>
                        </div>
                     </div>
                   </>
                 )}
              </div>

              <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 text-emerald-400 font-mono text-xs px-3 py-2 rounded-lg z-20 shadow-[0_0_15px_rgba(16,185,129,0.1)] pointer-events-none">
                LAT: 13.7563° N | LNG: 100.5018° E
              </div>
            </div>
          )}

          {/* ================= 5. PERSONNEL ENTRY ================= */}
          {activePage === 'personnelEntry' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl">
                 <div className="flex justify-between items-end mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><i className="bi bi-bar-chart-steps text-pink-500"></i> ภาพรวมการนำเข้าข้อมูล</h3>
                      <p className="text-sm text-slate-400">อ้างอิงจากเป้าหมายตามโครงสร้างหน่วย</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col">
                 <div className="p-4 lg:p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                   <h3 className="font-bold text-lg text-white flex items-center gap-2"><i className="bi bi-list-ul text-blue-400"></i> รายการบันทึกกำลังพล</h3>
                   <div className="flex gap-3">
                     <button onClick={() => { setPersonnelForm({ rowIndex: '', unit: '', target: 0, actual: 0, mil_id: user?.name, isConfirmed: false }); setShowPersonnelModal(true); }} className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors shadow-lg shadow-pink-500/20"><i className="bi bi-cloud-arrow-up mr-2"></i> นำเข้าข้อมูล</button>
                   </div>
                 </div>
                 <div className="flex-1 overflow-auto custom-scroll">
                   <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-black/40 text-slate-400 text-xs uppercase font-bold tracking-wider sticky top-0 backdrop-blur-md">
                       <tr>
                         <th className="p-4 border-b border-white/10">หน่วย</th>
                         <th className="p-4 border-b border-white/10 text-center">อัตรา</th>
                         <th className="p-4 border-b border-white/10 text-center">บรรจุจริง</th>
                         <th className="p-4 border-b border-white/10 text-center">สถานะ</th>
                         <th className="p-4 border-b border-white/10 text-center">จัดการ</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                       {personnelData.map((p, idx) => (
                         <tr key={idx} className="hover:bg-white/5 transition-colors">
                           <td className="p-4 font-bold text-white">{p.rank}</td>
                           <td className="p-4 text-center text-slate-400">{cleanNumber(p.name).toLocaleString()}</td>
                           <td className="p-4 text-center font-bold text-pink-400">{cleanNumber(p.position_normal).toLocaleString()}</td>
                           <td className="p-4 text-center">{p.unit === "true" ? <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs border border-emerald-500/20">ยืนยันแล้ว</span> : <span className="text-slate-400 bg-slate-500/10 px-2 py-1 rounded text-xs border border-slate-500/20">รอตรวจ</span>}</td>
                           <td className="p-4 text-center"><button onClick={() => { setPersonnelForm({ rowIndex: p.rowIndex, unit: p.rank, target: cleanNumber(p.name), actual: cleanNumber(p.position_normal), mil_id: p.mil_id, isConfirmed: p.unit === "true" }); setShowPersonnelModal(true); }} className="p-2 text-slate-400 hover:text-pink-400 hover:bg-pink-400/10 rounded-lg transition-colors"><i className="bi bi-pencil-square"></i></button></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>
            </div>
          )}

          {/* ================= 6. CASUALTY TAB ================= */}
          {activePage === 'casualtyReport' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl overflow-hidden flex flex-col h-full animate-in fade-in">
               <div className="p-4 lg:p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                 <h3 className="font-bold text-lg text-white flex items-center gap-2"><i className="bi bi-heart-pulse-fill text-red-500"></i> บัญชีสถานภาพสูญเสีย</h3>
                 <button onClick={() => { setCasualtyForm({ rowIndex: '', date: '', name: '', unit: '', cause: '', status: '', doctorConfirm: false, picUrl: '' }); setShowCasualtyModal(true); }} className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"><i className="bi bi-plus-lg mr-1"></i> เพิ่มรายการ</button>
               </div>
               <div className="flex-1 overflow-auto custom-scroll">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-black/40 text-slate-400 text-xs uppercase font-bold tracking-wider sticky top-0 backdrop-blur-md">
                     <tr>
                       <th className="p-4 border-b border-white/10">วันที่เกิดเหตุ</th>
                       <th className="p-4 border-b border-white/10">ยศ ชื่อ-สกุล</th>
                       <th className="p-4 border-b border-white/10">หน่วยสังกัด</th>
                       <th className="p-4 border-b border-white/10">สาเหตุ</th>
                       <th className="p-4 border-b border-white/10 text-red-400">สถานะอาการ</th>
                       <th className="p-4 border-b border-white/10 text-center">การยืนยันแพทย์</th>
                       <th className="p-4 border-b border-white/10 text-center">จัดการ</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {casualtyData.map((c, idx) => (
                       <tr key={idx} className="hover:bg-white/5 transition-colors">
                         <td className="p-4 text-slate-400">{c.date}</td>
                         <td className="p-4 font-bold text-white">{c.name}</td>
                         <td className="p-4 text-slate-300">{c.unit}</td>
                         <td className="p-4 text-yellow-400">{c.cause}</td>
                         <td className="p-4 font-bold text-red-400">{c.status}</td>
                         <td className="p-4 text-center">
                            {c.doctorConfirm === 'true' || c.doctorConfirm === true
                              ? <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs border border-emerald-500/20"><i className="bi bi-check-circle-fill mr-1"></i>ยืนยันแล้ว</span>
                              : <span className="text-slate-400 bg-slate-500/10 px-2 py-1 rounded text-xs border border-slate-500/20">รอตรวจสอบ</span>}
                         </td>
                         <td className="p-4 text-center"><button onClick={() => { setCasualtyForm({ ...c, doctorConfirm: c.doctorConfirm === 'true' || c.doctorConfirm === true }); setShowCasualtyModal(true); }} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><i className="bi bi-pencil-square"></i></button></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* ================= 7. ADMIN TAB ================= */}
          {activePage === 'admin' && (
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl overflow-hidden flex flex-col h-full animate-in fade-in">
               <div className="p-4 lg:p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <h2 className="mb-0 font-bold text-lg text-white flex items-center"><i className="bi bi-people-fill text-warning me-2"></i>จัดการผู้ใช้งาน (Admin)</h2>
                  <button className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors border border-white/10" onClick={() => { setUserForm({ rowIndex: '', username: '', password: '', name: '', role: 'Viewer' }); setShowUserModal(true); }}><i className="bi bi-person-plus-fill me-1"></i> เพิ่มผู้ใช้ใหม่</button>
              </div>
              <div className="flex-1 overflow-auto custom-scroll">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-black/40 text-slate-400 text-xs uppercase font-bold tracking-wider sticky top-0 backdrop-blur-md">
                          <tr>
                              <th className="p-4 border-b border-white/10">Username</th>
                              <th className="p-4 border-b border-white/10">ชื่อ-สกุล</th>
                              <th className="p-4 border-b border-white/10">สิทธิ์การใช้งาน</th>
                              <th className="p-4 border-b border-white/10 text-center">ตั้งค่า</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {usersData.map((u, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="p-4 text-warning font-bold">{u.username}</td>
                              <td className="p-4 text-white">{u.name}</td>
                              <td className="p-4"><span className={`px-2 py-1 rounded text-xs border font-bold ${u.role === 'Admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{u.role}</span></td>
                              <td className="p-4 text-center">
                                <button onClick={() => { setUserForm(u); setShowUserModal(true); }} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><i className="bi bi-pencil-square"></i></button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
             </div>
          )}

          {/* ================= 8. PRINT REPORTS ================= */}
          {['dailyReport', 'kp4Report'].includes(activePage) && (
            <div className="flex flex-col h-full items-center animate-in fade-in">
               <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 no-print">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    {activePage === 'dailyReport' ? <><i className="bi bi-file-earmark-bar-graph-fill text-teal-400"></i> รายงานสรุปยอดประจำวัน</> : <><i className="bi bi-file-earmark-text-fill text-blue-400"></i> รายงานสถานภาพหน่วย</>}
                  </h2>
                  <button onClick={() => window.print()} className="bg-white text-black hover:bg-slate-200 font-bold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-lg flex items-center gap-2"><i className="bi bi-printer-fill"></i> พิมพ์เอกสาร</button>
               </div>
               <div className="bg-white text-black p-12 rounded-xl shadow-2xl w-full max-w-[210mm] min-h-[297mm] mx-auto report-paper">
                 <div className="text-center mb-8 border-b-2 border-black pb-6">
                    <img src="/logo.png" className="w-24 mx-auto mb-4" alt="Logo" />
                     <h2 className="text-2xl font-extrabold mb-2">{activePage === 'dailyReport' ? 'รายงานสรุปยอดกำลังพลประจำวัน' : 'รายงานสถานภาพหน่วย (กพ.4)'}</h2>
                    <h3 className="text-lg font-bold text-gray-800">ศูนย์ปฏิบัติการกองทัพบก (ศปก.ทบ.)</h3>
                    <p className="mt-4 text-sm text-gray-600 font-medium">ข้อมูล ณ วันที่: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                 </div>
                 <table className="w-full border-collapse border-2 border-black text-sm text-center">
                   <thead className="bg-gray-200 border-b-2 border-black font-bold">
                     <tr><th className="border border-black p-3 w-16">ลำดับ</th><th className="border border-black p-3 text-left">นามหน่วย</th><th className="border border-black p-3 w-32">รวมทั้งสิ้น</th></tr>
                   </thead>
                   <tbody>
                     {Object.keys(dashboardStats.struct).map((l0, idx) => l0 !== '-' && (
                        <tr key={l0}><td className="border border-black p-3">{idx + 1}</td><td className="border border-black p-3 text-left font-bold">{l0}</td><td className="border border-black p-3 font-bold text-lg">{dashboardStats.struct[l0].curr.toLocaleString()}</td></tr>
                     ))}
                   </tbody>
                   <tfoot className="bg-gray-100 font-bold border-t-2 border-black">
                     <tr><td colSpan="2" className="border border-black p-3 text-right">ยอดรวมทั้งสิ้น</td><td className="border border-black p-3 text-xl">{dashboardStats.total.toLocaleString()}</td></tr>
                   </tfoot>
                 </table>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODALS & DRAWER (Tailwind Styled) ================= */}
      
      <ModalWrapper isOpen={showUnitModal} onClose={() => setShowUnitModal(false)} onSubmit={handleSaveUnit} title="ฟอร์มบันทึกโครงสร้าง" iconClass="bi bi-diagram-3-fill" colorClass="text-yellow-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">แผนยุทธศาสตร์</label><input type="text" value={unitForm.plan} onChange={e=>setUnitForm({...unitForm, plan: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500/50 focus:outline-none" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ระดับส่วนภูมิภาค</label><input type="text" value={unitForm.l0} onChange={e=>setUnitForm({...unitForm, l0: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500/50 focus:outline-none" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">จัดกำลัง</label><input type="text" value={unitForm.l1} onChange={e=>setUnitForm({...unitForm, l1: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500/50 focus:outline-none" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">หน่วยย่อย</label><input type="text" value={unitForm.l4} onChange={e=>setUnitForm({...unitForm, l4: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500/50 focus:outline-none" /></div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="space-y-1.5"><label className="text-xs font-bold text-[#38bdf8] uppercase">นายพล</label><input type="number" value={unitForm.g} onChange={e=>setUnitForm({...unitForm, g: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-white text-center focus:border-blue-500/50 focus:outline-none font-bold" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-[#4ade80] uppercase">น.</label><input type="number" value={unitForm.n} onChange={e=>setUnitForm({...unitForm, n: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-white text-center focus:border-emerald-500/50 focus:outline-none font-bold" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-[#facc15] uppercase">ส.</label><input type="number" value={unitForm.s} onChange={e=>setUnitForm({...unitForm, s: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-white text-center focus:border-yellow-500/50 focus:outline-none font-bold" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-[#f87171] uppercase">พลฯ</label><input type="number" value={unitForm.p} onChange={e=>setUnitForm({...unitForm, p: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-white text-center focus:border-red-500/50 focus:outline-none font-bold" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 p-4 rounded-2xl bg-white/5 border border-white/5">
           <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latitude (ละติจูด)</label><input type="number" step="any" value={unitForm.lat} onChange={e=>setUnitForm({...unitForm, lat: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-yellow-500/50 focus:outline-none" /></div>
           <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Longitude (ลองจิจูด)</label><input type="number" step="any" value={unitForm.lng} onChange={e=>setUnitForm({...unitForm, lng: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-yellow-500/50 focus:outline-none" /></div>
        </div>
      </ModalWrapper>

      <ModalWrapper isOpen={showPersonnelModal} onClose={() => setShowPersonnelModal(false)} onSubmit={handleSavePersonnel} title="ฟอร์มบันทึกกำลังพล" iconClass="bi bi-person-vcard-fill" colorClass="text-pink-500">
        <div className="space-y-5">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ระบุชื่อหน่วย</label><input type="text" value={personnelForm.unit} onChange={e=>setPersonnelForm({...personnelForm, unit: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500/50 focus:outline-none" /></div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">อัตรา (เป้าหมาย)</label><input type="number" value={personnelForm.target} onChange={e=>setPersonnelForm({...personnelForm, target: e.target.value})} className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-3 text-slate-300 focus:outline-none" /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-pink-400 uppercase tracking-wider">บรรจุจริง</label><input type="number" value={personnelForm.actual} onChange={e=>setPersonnelForm({...personnelForm, actual: e.target.value})} className="w-full bg-pink-500/10 border border-pink-500/30 rounded-xl px-4 py-3 text-white font-bold focus:border-pink-500/50 focus:outline-none" /></div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-between cursor-pointer" onClick={()=>setPersonnelForm({...personnelForm, isConfirmed: !personnelForm.isConfirmed})}>
            <div><p className="text-sm font-bold text-white mb-0.5">ยืนยันความถูกต้อง</p><p className="text-xs text-slate-400">ทำเครื่องหมายเมื่อบรรจุครบถ้วนแล้ว</p></div>
            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${personnelForm.isConfirmed ? 'bg-pink-500' : 'bg-black/50 border border-white/10'}`}>{personnelForm.isConfirmed && <i className="bi bi-check text-white"></i>}</div>
          </div>
        </div>
      </ModalWrapper>

      <ModalWrapper isOpen={showUserModal} onClose={() => setShowUserModal(false)} onSubmit={handleSaveUser} title="จัดการบัญชีผู้ใช้" iconClass="bi bi-shield-lock-fill" colorClass="text-slate-400">
        <div className="space-y-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">Username</label><input type="text" value={userForm.username} onChange={e=>setUserForm({...userForm, username: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 focus:outline-none" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">Password</label><input type="password" value={userForm.password} onChange={e=>setUserForm({...userForm, password: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 focus:outline-none" placeholder="ปล่อยว่างหากไม่เปลี่ยน" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">ชื่อ-สกุล</label><input type="text" value={userForm.name} onChange={e=>setUserForm({...userForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 focus:outline-none" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">สิทธิ์</label>
             <select value={userForm.role} onChange={e=>setUserForm({...userForm, role: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 focus:outline-none appearance-none">
                <option value="Admin">Admin</option><option value="Editor">Editor</option><option value="Viewer">Viewer</option>
             </select>
          </div>
        </div>
      </ModalWrapper>

      <ModalWrapper isOpen={showCasualtyModal} onClose={() => setShowCasualtyModal(false)} onSubmit={handleSaveCasualty} title="ฟอร์มรายงานสูญเสีย" iconClass="bi bi-heart-pulse-fill" colorClass="text-red-500">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">วันที่</label><input type="text" value={casualtyForm.date} onChange={e=>setCasualtyForm({...casualtyForm, date: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none" placeholder="DD/MM/YYYY" /></div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">สถานะอาการ</label><input type="text" value={casualtyForm.status} onChange={e=>setCasualtyForm({...casualtyForm, status: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none" placeholder="เช่น บาดเจ็บ, เสียชีวิต" /></div>
          <div className="col-span-2 space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">ยศ ชื่อ-สกุล</label><input type="text" value={casualtyForm.name} onChange={e=>setCasualtyForm({...casualtyForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none" /></div>
          <div className="col-span-2 space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">หน่วยสังกัด</label><input type="text" value={casualtyForm.unit} onChange={e=>setCasualtyForm({...casualtyForm, unit: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none" /></div>
          <div className="col-span-2 space-y-1.5"><label className="text-xs font-bold text-slate-400 uppercase">สาเหตุ</label><input type="text" value={casualtyForm.cause} onChange={e=>setCasualtyForm({...casualtyForm, cause: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none" /></div>
          <div className="col-span-2 p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-between cursor-pointer mt-2" onClick={()=>setCasualtyForm({...casualtyForm, doctorConfirm: !casualtyForm.doctorConfirm})}>
            <div><p className="text-sm font-bold text-white mb-0.5">การยืนยันจากแพทย์</p><p className="text-xs text-slate-400">ตรวจสอบโดยแพทย์ทหารแล้ว</p></div>
            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${casualtyForm.doctorConfirm ? 'bg-red-500' : 'bg-black/50 border border-white/10'}`}>{casualtyForm.doctorConfirm && <i className="bi bi-check text-white"></i>}</div>
          </div>
        </div>
      </ModalWrapper>

      {/* Node Details Drawer */}
      {showNodeDrawer && drawerData && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={() => setShowNodeDrawer(false)}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#0f172a] border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-[110] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h5 className="font-bold text-lg text-yellow-500 flex items-center gap-2"><i className="bi bi-crosshair"></i> รายละเอียดเจาะลึก</h5>
                <button onClick={() => setShowNodeDrawer(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center"><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-400 uppercase mb-1">ส่วนภูมิภาค</p><p className="font-bold text-blue-400 mb-3">{drawerData[1]}</p>
                  <p className="text-xs text-slate-400 uppercase mb-1">จัดกำลัง</p><p className="font-bold text-emerald-400 mb-3">{drawerData[2]}</p>
                  <p className="text-xs text-slate-400 uppercase mb-1">หน่วย</p><p className="font-bold text-white text-lg">{drawerData[5] || drawerData[4]}</p>
               </div>
               <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl"><p className="text-blue-400 font-bold text-xl">{cleanNumber(drawerData[6]).toLocaleString()}</p><span className="text-xs text-slate-400">นายพล</span></div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl"><p className="text-emerald-400 font-bold text-xl">{cleanNumber(drawerData[7]).toLocaleString()}</p><span className="text-xs text-slate-400">น.</span></div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl"><p className="text-yellow-400 font-bold text-xl">{cleanNumber(drawerData[8]).toLocaleString()}</p><span className="text-xs text-slate-400">ส.</span></div>
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl"><p className="text-red-400 font-bold text-xl">{cleanNumber(drawerData[9]).toLocaleString()}</p><span className="text-xs text-slate-400">พลฯ</span></div>
               </div>
               <div className="text-center p-4 rounded-xl border border-yellow-500/30 bg-black/40">
                  <p className="text-sm font-bold text-slate-400">ยอดรวมทั้งสิ้น</p>
                  <p className="text-4xl font-extrabold text-yellow-500 my-2">{cleanNumber(drawerData[10]).toLocaleString()}</p>
               </div>
            </div>
          </div>
        </>
      )}

      {/* 🔔 Notification Drawer */}
      {showNotif && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={() => setShowNotif(false)}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#0f172a] border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-[110] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h5 className="font-bold text-lg text-white flex items-center gap-2"><i className="bi bi-bell-fill text-red-500"></i> แจ้งเตือนอัปเดต</h5>
                <button onClick={() => setShowNotif(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center"><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
               {filteredData.slice(0, 10).map((u, i) => (
                 <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 cursor-pointer transition-colors group" onClick={() => { setDrawerData(u); setShowNodeDrawer(true); }}>
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-white text-sm">{u[5] || u[4] || u[1]}</span>
                        <small className="text-xs text-slate-500 flex items-center gap-1"><i className="bi bi-clock"></i> ล่าสุด</small>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">มีการอัปเดตยอดกำลังพลใหม่ในระบบ</p>
                    <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1">
                        <span className="text-xs font-semibold text-blue-400">{u[1]}</span>
                        <span className="text-xs font-extrabold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md">ยอด {cleanNumber(u[10]).toLocaleString()}</span>
                    </div>
                </div>
               ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}


