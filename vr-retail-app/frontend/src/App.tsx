import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

function Home() {
  const user = useSelector((s: RootState) => s.auth.user);
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">VR Retail</h1>
      <p className="mt-2">AI-Powered VR Retail Shopping Assistant</p>
      <div className="mt-4 flex gap-4">
        <Link to="/store" className="px-4 py-2 bg-sky-600 rounded">Enter Store</Link>
        {!user && <Link to="/login" className="px-4 py-2 bg-emerald-600 rounded">Login</Link>}
      </div>
    </div>
  );
}

function Store() {
  return <div className="p-6">Store coming soon</div>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/store" element={<Store />} />
    </Routes>
  );
}

export default App;
