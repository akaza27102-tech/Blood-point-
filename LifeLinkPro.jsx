import React, { useState, useEffect } from 'react';

const ADMIN_PROFILES = [
  { id: "S.Durgaprasad", pwd: "prasad271" },
  { id: "U.pavankumar", pwd: "pavan310" },
  { id: "Sk.nagulshareef", pwd: "shareef277" }
];

export default function LifeLinkPro() {
  // --- STATE ---
  const [view, setView] = useState('search'); // search, register, login, profile, admin
  const [donors, setDonors] = useState(() => JSON.parse(localStorage.getItem('ll_donors')) || []);
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem('ll_logs')) || []);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form States
  const [searchGroup, setSearchGroup] = useState('O+');
  const [searchCity, setSearchCity] = useState('');
  const [regForm, setRegForm] = useState({ name: '', pass: '', city: '', phone: '', group: 'O+' });
  const [loginForm, setLoginForm] = useState({ id: '', pwd: '' });

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('ll_donors', JSON.stringify(donors));
    localStorage.setItem('ll_logs', JSON.stringify(logs));
  }, [donors, logs]);

  // --- ACTIONS ---
  const handleRegister = () => {
    if (!regForm.name || !regForm.pass) return alert("Fill required fields");
    const newDonor = { ...regForm, id: Date.now() };
    setDonors([...donors, newDonor]);
    alert("Registered Successfully!");
    setView('login');
  };

  const handleLogin = () => {
    const admin = ADMIN_PROFILES.find(a => a.id === loginForm.id && a.pwd === loginForm.pwd);
    if (admin) {
      setCurrentUser({ name: admin.id, isAdmin: true });
      setView('profile');
    } else {
      const donor = donors.find(d => d.name === loginForm.id && d.pass === loginForm.pwd);
      if (donor) {
        setCurrentUser({ ...donor, isAdmin: false });
        setView('profile');
      } else {
        alert("Invalid Credentials");
      }
    }
  };

  const handleUpdateProfile = (updatedData) => {
    const updatedDonors = donors.map(d => d.id === currentUser.id ? { ...d, ...updatedData } : d);
    setDonors(updatedDonors);
    setCurrentUser({ ...currentUser, ...updatedData });
    alert("Profile Updated!");
  };

  const handleDeleteDonor = (id) => {
    if (window.confirm("Delete this donor permanently?")) {
      setDonors(donors.filter(d => d.id !== id));
    }
  };

  const logSelection = (donor) => {
    if (window.confirm(`View contact for ${donor.name}?`)) {
      setLogs([{ name: donor.name, group: donor.group, date: new Date().toLocaleString() }, ...logs]);
      alert(`Contact: ${donor.phone}`);
    }
  };

  // --- UI COMPONENTS ---
  const Nav = () => (
    <div style={{ display: 'flex', background: '#34495e' }}>
      <div style={navStyle(view === 'search')} onClick={() => setView('search')}>SEARCH</div>
      <div style={navStyle(view === 'register')} onClick={() => setView('register')}>REGISTER</div>
    </div>
  );

  return (
    <div style={appContainer}>
      <div style={header}>
        <span style={{ fontWeight: 'bold' }}>LIFELINK PRO</span>
        <div style={profileCircle} onClick={() => setView(currentUser ? 'profile' : 'login')}>👤</div>
      </div>

      {view !== 'profile' && view !== 'admin' && view !== 'login' && <Nav />}

      <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
        
        {/* SEARCH VIEW */}
        {view === 'search' && (
          <div>
            <select style={inputStyle} value={searchGroup} onChange={e => setSearchGroup(e.target.value)}>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g}>{g}</option>)}
            </select>
            <input style={inputStyle} placeholder="Filter by City" onChange={e => setSearchCity(e.target.value)} />
            {donors.filter(d => d.group === searchGroup && d.city.toLowerCase().includes(searchCity.toLowerCase())).map(d => (
              <div key={d.id} style={card}>
                <strong>{d.name}</strong><br/><small>📍 {d.city}</small>
                <button style={btnStyle('#f39c12')} onClick={() => logSelection(d)}>View Contact</button>
              </div>
            ))}
          </div>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <div>
            <input style={inputStyle} placeholder="Full Name" onChange={e => setRegForm({...regForm, name: e.target.value})} />
            <input style={inputStyle} type="password" placeholder="Password" onChange={e => setRegForm({...regForm, pass: e.target.value})} />
            <input style={inputStyle} placeholder="City" onChange={e => setRegForm({...regForm, city: e.target.value})} />
            <input style={inputStyle} placeholder="Phone" onChange={e => setRegForm({...regForm, phone: e.target.value})} />
            <button style={btnStyle('#28a745')} onClick={handleRegister}>Create Account</button>
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <div>
            <h3>Account Access</h3>
            <input style={inputStyle} placeholder="ID" onChange={e => setLoginForm({...loginForm, id: e.target.value})} />
            <input style={inputStyle} type="password" placeholder="Password" onChange={e => setLoginForm({...loginForm, pwd: e.target.value})} />
            <button style={btnStyle('#2c3e50')} onClick={handleLogin}>Login</button>
          </div>
        )}

        {/* PROFILE & EDIT VIEW */}
        {view === 'profile' && (
          <div>
            <h2>{currentUser.name}</h2>
            <p>Role: {currentUser.isAdmin ? 'Administrator' : 'Donor'}</p>
            {!currentUser.isAdmin && (
              <div style={{background: '#eee', padding: '15px', borderRadius: '10px'}}>
                <label>Update City</label>
                <input style={inputStyle} value={currentUser.city} onChange={e => handleUpdateProfile({city: e.target.value})} />
                <label>Update Phone</label>
                <input style={inputStyle} value={currentUser.phone} onChange={e => handleUpdateProfile({phone: e.target.value})} />
              </div>
            )}
            {currentUser.isAdmin && (
              <button style={btnStyle('gold', 'black')} onClick={() => setView('admin')}>🔓 ADMIN DASHBOARD</button>
            )}
            <button style={btnStyle('#666')} onClick={() => {setCurrentUser(null); setView('search')}}>Logout</button>
          </div>
        )}

        {/* ADMIN DATABASE VIEW */}
        {view === 'admin' && (
          <div>
            <button onClick={() => setView('profile')} style={{border: 'none', color: 'blue', cursor: 'pointer'}}>← Back</button>
            <h3>Master Database</h3>
            <p><strong>Total Donors:</strong> {donors.length}</p>
            <table style={{width: '100%', fontSize: '12px', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#eee'}}><th>Name</th><th>Grp</th><th>Action</th></tr>
              </thead>
              <tbody>
                {donors.map(d => (
                  <tr key={d.id} style={{borderBottom: '1px solid #ddd'}}>
                    <td>{d.name}</td><td>{d.group}</td>
                    <td><button onClick={() => handleDeleteDonor(d.id)} style={{color: 'red'}}>Del</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const appContainer = { maxWidth: '480px', margin: 'auto', background: 'white', height: '95vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
const header = { background: '#2c3e50', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const profileCircle = { width: '35px', height: '35px', background: '#d9534f', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' };
const navStyle = (active) => ({ flex: 1, padding: '12px', textAlign: 'center', color: active ? 'white' : '#a0aec0', borderBottom: active ? '3px solid #d9534f' : 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' });
const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnStyle = (bg, col = 'white') => ({ width: '100%', padding: '12px', background: bg, color: col, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' });
const card = { border: '1px solid #ddd', padding: '12px', borderRadius: '10px', marginBottom: '10px' };
