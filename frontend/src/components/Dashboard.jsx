import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, LogOut, Search, Filter, BookOpen, MessageSquare, 
  Sparkles, Calendar, Heart, MapPin, Award, User, Briefcase, 
  TrendingUp, CheckCircle, ChevronRight, RefreshCw, Send, AlertTriangle, Clock
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard({ matchmaker, onLogout }) {
  // Navigation
  const [activeNav, setActiveNav] = useState('clients'); // 'clients' | 'outbox'
  
  // Data States
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [matches, setMatches] = useState([]);
  const [outboxHistory, setOutboxHistory] = useState([]);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Active Customer Sub-Tabs
  const [detailTab, setDetailTab] = useState('profile'); // 'profile' | 'notes' | 'matching'

  // Input States
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // loading states
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingOutbox, setLoadingOutbox] = useState(false);
  
  // Match Action States
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [aiExplanations, setAiExplanations] = useState({}); // matchId -> text
  const [draftEmails, setDraftEmails] = useState({}); // matchId -> text
  const [generatingAI, setGeneratingAI] = useState({}); // matchId -> boolean
  const [generatingEmail, setGeneratingEmail] = useState({}); // matchId -> boolean
  const [sendingMatch, setSendingMatch] = useState({}); // matchId -> boolean
  const [toastMessage, setToastMessage] = useState(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(null); // match object or null

  // Fetch Customers
  const fetchCustomers = async () => {
    setLoadingClients(true);
    try {
      const response = await fetch(`${API_BASE}/api/customers`);
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
        // Default to first customer if none selected
        if (data.customers.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(data.customers[0].id);
        }
      }
    } catch (err) {
      showToast('Error loading customer list', 'error');
      console.error(err);
    } finally {
      setLoadingClients(false);
    }
  };

  // Fetch Match history
  const fetchOutboxHistory = async () => {
    setLoadingOutbox(true);
    try {
      const response = await fetch(`${API_BASE}/api/matches/history`);
      const data = await response.json();
      if (data.success) {
        setOutboxHistory(data.history);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOutbox(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchOutboxHistory();
  }, []);

  // Fetch matches when customer changes
  useEffect(() => {
    if (selectedCustomerId && detailTab === 'matching') {
      fetchMatchesForCustomer(selectedCustomerId);
    }
    // Reset match expansions
    setExpandedMatchId(null);
  }, [selectedCustomerId, detailTab]);

  const fetchMatchesForCustomer = async (id) => {
    setLoadingMatches(true);
    try {
      const response = await fetch(`${API_BASE}/api/customers/${id}/matches`);
      const data = await response.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (err) {
      showToast('Error calculating matches', 'error');
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToastMessage({ text: message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Get active customer object
  const activeCustomer = customers.find(c => c.id === selectedCustomerId);

  // Add a meeting note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      const response = await fetch(`${API_BASE}/api/customers/${selectedCustomerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNote, author: matchmaker.name })
      });
      const data = await response.json();
      if (data.success) {
        // Update local customer list with new notes
        setCustomers(prev => prev.map(c => c.id === selectedCustomerId ? data.customer : c));
        setNewNote('');
        showToast('Meeting note added to timeline');
      }
    } catch (err) {
      showToast('Failed to add note', 'error');
      console.error(err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Update Customer Status
  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`${API_BASE}/api/customers/${selectedCustomerId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(prev => prev.map(c => c.id === selectedCustomerId ? data.customer : c));
        showToast(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Generate AI Explanation
  const handleGenerateAIExplanation = async (matchId) => {
    setGeneratingAI(prev => ({ ...prev, [matchId]: true }));
    try {
      const response = await fetch(`${API_BASE}/api/ai/scoring-explanation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: selectedCustomerId, matchId })
      });
      const data = await response.json();
      if (data.success) {
        setAiExplanations(prev => ({ ...prev, [matchId]: data.explanation }));
      } else {
        showToast('AI Service error', 'error');
      }
    } catch (err) {
      showToast('Failed to generate AI analysis', 'error');
      console.error(err);
    } finally {
      setGeneratingAI(prev => ({ ...prev, [matchId]: false }));
    }
  };

  // Generate AI Intro Email
  const handleGenerateIntroEmail = async (matchId) => {
    setGeneratingEmail(prev => ({ ...prev, [matchId]: true }));
    try {
      const response = await fetch(`${API_BASE}/api/ai/email-intro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: selectedCustomerId, matchId })
      });
      const data = await response.json();
      if (data.success) {
        setDraftEmails(prev => ({ ...prev, [matchId]: data.emailText }));
      } else {
        showToast('AI Service error', 'error');
      }
    } catch (err) {
      showToast('Failed to draft email', 'error');
      console.error(err);
    } finally {
      setGeneratingEmail(prev => ({ ...prev, [matchId]: false }));
    }
  };

  // Send Match Action
  const handleSendMatch = async (matchId, emailContent) => {
    setSendingMatch(prev => ({ ...prev, [matchId]: true }));
    try {
      const response = await fetch(`${API_BASE}/api/matches/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId: selectedCustomerId, 
          matchId, 
          emailContent: emailContent || draftEmails[matchId] || 'Simulated profile sent.'
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Match sent! Client timeline and status updated.');
        setShowEmailPreviewModal(null);
        // Refresh customer data to show new timeline note & status change
        fetchCustomers();
        fetchOutboxHistory();
      }
    } catch (err) {
      showToast('Failed to execute send match', 'error');
      console.error(err);
    } finally {
      setSendingMatch(prev => ({ ...prev, [matchId]: false }));
    }
  };

  // Filtered Customer Directory List
  const filteredCustomers = customers.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const city = c.city.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = fullName.includes(query) || city.includes(query);
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Render Status Badge
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Onboarding': return 'bg-sky-50 text-sky-600 border border-sky-200';
      case 'Searching': return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'Matching': return 'bg-pink-50 text-pink-600 border border-pink-200';
      case 'Engaged': return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'Married': return 'bg-gold-100 text-gold-700 border border-gold-300';
      default: return 'bg-gray-50 text-gray-500 border border-gray-200';
    }
  };

  // Format Currency (INR lakhs)
  const formatSalary = (amount) => {
    if (!amount) return 'N/A';
    return `₹${(amount / 100000).toFixed(0)} LPA`;
  };

  return (
    <div className="min-h-screen flex bg-luxury-cream">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-luxury-lightgray shrink-0 flex flex-col justify-between">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-luxury-lightgray/60 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-brand-600 to-gold-400 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif gold-gradient-text tracking-wide leading-tight">VowsAI</h2>
              <span className="text-[10px] text-luxury-gray uppercase tracking-widest font-semibold">Matchmaker Portal</span>
            </div>
          </div>

          {/* Matchmaker Profile Box */}
          <div className="mx-4 my-6 p-4 bg-luxury-cream rounded-2xl border border-luxury-lightgray/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-400/10 text-gold-600 border border-gold-300/30 rounded-xl flex items-center justify-center font-bold">
              {matchmaker.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-xs font-bold text-luxury-dark leading-tight">{matchmaker.name}</p>
              <span className="text-[10px] text-brand-600 font-medium">Senior Matchmaker</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveNav('clients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeNav === 'clients' 
                  ? 'bg-gradient-to-r from-brand-50 to-gold-50/30 text-brand-600 border-l-4 border-brand-500 shadow-sm' 
                  : 'text-luxury-gray hover:bg-luxury-cream hover:text-luxury-dark'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Clients Directory</span>
            </button>
            
            <button
              onClick={() => setActiveNav('outbox')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeNav === 'outbox' 
                  ? 'bg-gradient-to-r from-brand-50 to-gold-50/30 text-brand-600 border-l-4 border-brand-500 shadow-sm' 
                  : 'text-luxury-gray hover:bg-luxury-cream hover:text-luxury-dark'
              }`}
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>Recommendations Log</span>
            </button>
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-luxury-lightgray/60">
          <button
            onClick={() => {
              localStorage.removeItem('vows_token');
              localStorage.removeItem('vows_matchmaker');
              onLogout();
            }}
            className="w-full py-2.5 px-4 bg-brand-50 border border-brand-100 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Portal</span>
          </button>
        </div>
      </aside>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-fade-in-up ${
          toastMessage.type === 'error' 
            ? 'bg-red-50 text-red-700 border-red-200' 
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Navigation Content: CLIENTS DIRECTORY */}
        {activeNav === 'clients' && (
          <div className="flex-1 flex min-h-0 overflow-hidden">
            
            {/* LEFT: CUSTOMER LIST */}
            <div className="w-80 border-r border-luxury-lightgray flex flex-col bg-white/70">
              
              {/* Search & Filter Header */}
              <div className="p-4 border-b border-luxury-lightgray/60 space-y-3">
                <h3 className="text-sm font-bold text-luxury-dark font-serif tracking-wide">Client Directory</h3>
                
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-luxury-gray">
                    <Search className="w-4 h-4 opacity-50" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search name, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-luxury-cream border border-luxury-lightgray/80 rounded-xl text-xs font-medium"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-luxury-gray">
                  <span className="flex items-center gap-1"><Filter className="w-3 h-3" /> Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent border-0 pr-6 py-0 font-bold text-brand-600 focus:ring-0 cursor-pointer"
                  >
                    <option value="All">All Stages</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Searching">Searching</option>
                    <option value="Matching">Matching</option>
                    <option value="Engaged">Engaged</option>
                    <option value="Married">Married</option>
                  </select>
                </div>
              </div>

              {/* Scrollable Customer List */}
              <div className="flex-1 overflow-y-auto divide-y divide-luxury-lightgray/40">
                {loadingClients ? (
                  <div className="p-8 text-center text-xs text-luxury-gray flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-brand-500" />
                    <span>Syncing clients...</span>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-luxury-gray">
                    No customers match filters.
                  </div>
                ) : (
                  filteredCustomers.map(customer => {
                    const isSelected = customer.id === selectedCustomerId;
                    return (
                      <div
                        key={customer.id}
                        onClick={() => setSelectedCustomerId(customer.id)}
                        className={`p-4 cursor-pointer transition-all flex items-start justify-between gap-2 border-l-4 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-brand-50/20 to-gold-50/10 border-brand-500 shadow-sm' 
                            : 'border-transparent hover:bg-luxury-cream/40'
                        }`}
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-luxury-dark truncate">
                            {customer.firstName} {customer.lastName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-luxury-gray mt-1 font-medium">
                            <span>{customer.age} yrs</span>
                            <span>•</span>
                            <span className="truncate">{customer.city}</span>
                            <span>•</span>
                            <span className="font-semibold text-luxury-dark">{customer.gender[0]}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadgeClass(customer.status)}`}>
                            {customer.status}
                          </span>
                          <ChevronRight className={`w-3.5 h-3.5 text-luxury-gray transition-transform ${isSelected ? 'translate-x-1 text-brand-500' : ''}`} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT: CUSTOMER DETAILED WORKSPACE */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
              {activeCustomer ? (
                <div className="flex-1 flex flex-col min-h-0">
                  
                  {/* Detailed Pane Top Header */}
                  <div className="p-6 border-b border-luxury-lightgray/60 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-100 to-gold-100 text-brand-600 border border-brand-200/50 flex items-center justify-center font-bold text-lg shadow-sm">
                        {activeCustomer.firstName[0]}{activeCustomer.lastName[0]}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-serif text-luxury-dark leading-tight flex items-center gap-2">
                          {activeCustomer.firstName} {activeCustomer.lastName}
                          <span className="text-xs font-sans px-2 py-0.5 bg-luxury-lightgray text-luxury-gray rounded-md font-semibold mt-1">
                            ID: {activeCustomer.id}
                          </span>
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-luxury-gray mt-1.5 font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {activeCustomer.city}, {activeCustomer.country}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-brand-400 text-brand-400" /> {activeCustomer.gender}</span>
                          <span>•</span>
                          <span className="font-semibold text-luxury-dark">{activeCustomer.preferences.manglik === 'Yes' ? 'Manglik' : 'Non-Manglik'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Changer Control */}
                    <div className="flex items-center gap-2 bg-luxury-cream p-1.5 rounded-xl border border-luxury-lightgray/60">
                      <span className="text-[10px] uppercase tracking-wider text-luxury-gray font-bold pl-2">Client Stage:</span>
                      <select
                        value={activeCustomer.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={updatingStatus}
                        className="bg-white border border-luxury-lightgray/80 text-xs font-bold text-luxury-dark rounded-lg py-1 px-3.5 cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        <option value="Onboarding">Onboarding</option>
                        <option value="Searching">Searching</option>
                        <option value="Matching">Matching</option>
                        <option value="Engaged">Engaged</option>
                        <option value="Married">Married</option>
                      </select>
                    </div>
                  </div>

                  {/* Sub-Tab Navigation Bar */}
                  <div className="px-6 border-b border-luxury-lightgray/40 flex gap-6 bg-luxury-cream/15">
                    <button
                      onClick={() => setDetailTab('profile')}
                      className={`py-3.5 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
                        detailTab === 'profile' ? 'text-brand-600' : 'text-luxury-gray hover:text-luxury-dark'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Detailed Biodata</span>
                      {detailTab === 'profile' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-500 rounded-full"></span>}
                    </button>
                    
                    <button
                      onClick={() => setDetailTab('notes')}
                      className={`py-3.5 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
                        detailTab === 'notes' ? 'text-brand-600' : 'text-luxury-gray hover:text-luxury-dark'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Meeting Notes ({activeCustomer.notes?.length || 0})</span>
                      {detailTab === 'notes' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-500 rounded-full"></span>}
                    </button>
                    
                    <button
                      onClick={() => setDetailTab('matching')}
                      className={`py-3.5 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
                        detailTab === 'matching' ? 'text-brand-600' : 'text-luxury-gray hover:text-luxury-dark'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-gold-500" />
                      <span>AI Matchmaker Engine</span>
                      {detailTab === 'matching' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-500 rounded-full"></span>}
                    </button>
                  </div>

                  {/* Scrollable Sub-Tab Body */}
                  <div className="flex-1 overflow-y-auto p-6">
                    
                    {/* TAB: DETAILED BIODATA */}
                    {detailTab === 'profile' && (
                      <div className="space-y-6 animate-fade-in">
                        
                        {/* Profile Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Card 1: Personal & Astrological */}
                          <div className="bg-luxury-cream/30 p-5 rounded-2xl border border-luxury-lightgray/55">
                            <h3 className="text-xs font-bold text-luxury-gray uppercase tracking-wider mb-4 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-brand-500" /> Astrological & Personal
                            </h3>
                            <table className="w-full text-xs font-medium text-luxury-dark space-y-3">
                              <tbody>
                                <tr className="border-b border-luxury-lightgray/30 pb-2 flex justify-between">
                                  <td className="text-luxury-gray">Date of Birth</td>
                                  <td className="font-semibold">{activeCustomer.dob} ({activeCustomer.age} Years)</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Height</td>
                                  <td className="font-semibold">{activeCustomer.height} ({activeCustomer.heightCm} cm)</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Marital Status</td>
                                  <td className="font-semibold">{activeCustomer.family.religion === 'Hindu' || activeCustomer.family.religion === 'Jain' ? 'Never Married' : 'Single'}</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Manglik Status</td>
                                  <td className="font-bold text-brand-600">{activeCustomer.preferences.manglik}</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Gotra / Clan</td>
                                  <td className="font-semibold">{activeCustomer.family.gotra}</td>
                                </tr>
                                <tr className="py-2 flex justify-between">
                                  <td className="text-luxury-gray">Rashi & Nakshatra</td>
                                  <td className="font-semibold">{activeCustomer.preferences.rashi} | {activeCustomer.preferences.nakshatra}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Card 2: Professional & Education */}
                          <div className="bg-luxury-cream/30 p-5 rounded-2xl border border-luxury-lightgray/55">
                            <h3 className="text-xs font-bold text-luxury-gray uppercase tracking-wider mb-4 flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-gold-500" /> Career & Education
                            </h3>
                            <table className="w-full text-xs font-medium text-luxury-dark space-y-3">
                              <tbody>
                                <tr className="border-b border-luxury-lightgray/30 pb-2 flex justify-between">
                                  <td className="text-luxury-gray">Designation</td>
                                  <td className="font-semibold">{activeCustomer.career.designation}</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Current Company</td>
                                  <td className="font-semibold">{activeCustomer.career.company}</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Annual Income</td>
                                  <td className="font-bold text-emerald-600">{formatSalary(activeCustomer.career.income)}</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Undergrad College</td>
                                  <td className="font-semibold">{activeCustomer.education.college}</td>
                                </tr>
                                <tr className="py-2 flex justify-between">
                                  <td className="text-luxury-gray">Degree</td>
                                  <td className="font-semibold">{activeCustomer.education.degree}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Card 3: Family & Lifestyle */}
                          <div className="bg-luxury-cream/30 p-5 rounded-2xl border border-luxury-lightgray/55">
                            <h3 className="text-xs font-bold text-luxury-gray uppercase tracking-wider mb-4 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-brand-500" /> Family & Lifestyle
                            </h3>
                            <table className="w-full text-xs font-medium text-luxury-dark space-y-3">
                              <tbody>
                                <tr className="border-b border-luxury-lightgray/30 pb-2 flex justify-between">
                                  <td className="text-luxury-gray">Religion / Caste</td>
                                  <td className="font-semibold">{activeCustomer.family.religion} ({activeCustomer.family.caste})</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Dietary Habit</td>
                                  <td className="font-bold text-brand-600">{activeCustomer.lifestyle.diet}</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Family Structure</td>
                                  <td className="font-semibold">{activeCustomer.family.familyType} Family</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Family Values</td>
                                  <td className="font-semibold">{activeCustomer.family.familyValues}</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Father's Occupation</td>
                                  <td className="font-semibold">{activeCustomer.family.fatherOccupation}</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Mother's Occupation</td>
                                  <td className="font-semibold">{activeCustomer.family.motherOccupation}</td>
                                </tr>
                                <tr className="py-2 flex justify-between">
                                  <td className="text-luxury-gray">Siblings</td>
                                  <td className="font-semibold">{activeCustomer.family.siblings}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Card 4: Matchmaker Notes & Contact */}
                          <div className="bg-luxury-cream/30 p-5 rounded-2xl border border-luxury-lightgray/55">
                            <h3 className="text-xs font-bold text-luxury-gray uppercase tracking-wider mb-4 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-gold-500" /> Matchmaker Requirements
                            </h3>
                            <table className="w-full text-xs font-medium text-luxury-dark space-y-3">
                              <tbody>
                                <tr className="border-b border-luxury-lightgray/30 pb-2 flex justify-between">
                                  <td className="text-luxury-gray">Want Kids?</td>
                                  <td className="font-semibold">{activeCustomer.preferences.wantKids}</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Open to Relocate?</td>
                                  <td className="font-semibold">{activeCustomer.preferences.openToRelocate}</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Open to Pets?</td>
                                  <td className="font-semibold">{activeCustomer.preferences.openToPets}</td>
                                </tr>
                                <tr className="border-b border-luxury-lightgray/30 py-2 flex justify-between">
                                  <td className="text-luxury-gray">Email Address</td>
                                  <td className="font-mono">{activeCustomer.email}</td>
                                </tr>
                                <tr className="py-2 flex justify-between">
                                  <td className="text-luxury-gray">Phone Number</td>
                                  <td className="font-semibold">{activeCustomer.phone}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB: MEETING NOTES */}
                    {detailTab === 'notes' && (
                      <div className="space-y-6 animate-fade-in">
                        
                        {/* Note Entry Form */}
                        <form onSubmit={handleAddNote} className="space-y-3 bg-luxury-cream/20 p-4 rounded-2xl border border-luxury-lightgray/50">
                          <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider">
                            Record Call / Meeting Notes
                          </label>
                          <textarea
                            rows="3"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Type client feedback, preference updates, or call details here..."
                            className="w-full p-3 bg-white border border-luxury-lightgray rounded-xl text-xs font-medium transition-all"
                          ></textarea>
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={isSubmittingNote || !newNote.trim()}
                              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmittingNote ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Saving Note...</span>
                                </>
                              ) : (
                                <span>Save Note</span>
                              )}
                            </button>
                          </div>
                        </form>

                        {/* Notes Timeline */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-luxury-gray uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4 text-brand-500" /> Interactive Timeline
                          </h4>
                          {(!activeCustomer.notes || activeCustomer.notes.length === 0) ? (
                            <p className="text-xs text-luxury-gray text-center py-6 bg-luxury-cream/10 border border-dashed border-luxury-lightgray/50 rounded-2xl">
                              No logs recorded yet. Use the form above to add a meeting note.
                            </p>
                          ) : (
                            <div className="space-y-4 relative pl-4 before:absolute before:inset-y-1 before:left-1 before:w-0.5 before:bg-luxury-lightgray">
                              {activeCustomer.notes.map(note => (
                                <div key={note.id} className="relative bg-white p-4 rounded-xl border border-luxury-lightgray/50 shadow-sm animate-fade-in-up">
                                  {/* Bullet point indicator */}
                                  <span className={`absolute top-5 -left-[17px] w-2 h-2 rounded-full border-2 ${
                                    note.author === 'System' ? 'bg-amber-400 border-amber-400' : 'bg-brand-500 border-brand-500'
                                  }`}></span>
                                  
                                  <div className="flex items-center justify-between text-[10px] text-luxury-gray font-semibold mb-2">
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3 text-luxury-gray/70" />
                                      {note.author}
                                    </span>
                                    <span>{new Date(note.date).toLocaleString()}</span>
                                  </div>
                                  <p className="text-xs font-medium text-luxury-dark leading-relaxed">
                                    {note.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB: MATCHMAKING ENGINE */}
                    {detailTab === 'matching' && (
                      <div className="space-y-6 animate-fade-in">
                        
                        {/* Algorithm Info Bar */}
                        <div className="p-4 bg-gradient-to-r from-gold-50/20 to-brand-50/15 border border-gold-200/50 rounded-2xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gold-400/10 text-gold-600 flex items-center justify-center">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-luxury-dark">VowsAI Compatibility Algorithm</h4>
                              <p className="text-[10px] text-luxury-gray mt-0.5">Matching pool size: 120 dummy profiles. Ranking logic: Gender-specific + Astrological Guna checks.</p>
                            </div>
                          </div>
                          <button
                            onClick={() => fetchMatchesForCustomer(selectedCustomerId)}
                            className="p-2 hover:bg-white text-luxury-gray hover:text-brand-600 border border-transparent hover:border-luxury-lightgray rounded-xl transition-all cursor-pointer"
                            title="Recalculate Matches"
                          >
                            <RefreshCw className={`w-4 h-4 ${loadingMatches ? 'animate-spin text-brand-500' : ''}`} />
                          </button>
                        </div>

                        {/* Matches Suggestion Cards */}
                        <div className="space-y-4">
                          {loadingMatches ? (
                            <div className="py-12 text-center text-xs text-luxury-gray flex flex-col items-center justify-center gap-2">
                              <RefreshCw className="w-7 h-7 animate-spin text-brand-500" />
                              <span className="font-semibold text-luxury-dark">Processing Compatibility Profiles...</span>
                              <span className="text-[10px]">Sorting pool on caste, income, gotra, relocation, and kids preference</span>
                            </div>
                          ) : matches.length === 0 ? (
                            <div className="py-12 text-center text-xs text-luxury-gray">
                              No matched profiles available in the pool.
                            </div>
                          ) : (
                            matches.slice(0, 10).map((matchData, idx) => {
                              const matchProf = matchData.profile;
                              const isExpanded = expandedMatchId === matchProf.id;
                              const score = matchData.score;
                              
                              // Determine compatibility tag color
                              let scoreColor = 'text-amber-500 border-amber-300 bg-amber-50';
                              if (score >= 85) scoreColor = 'text-emerald-600 border-emerald-300 bg-emerald-50';
                              else if (score < 60) scoreColor = 'text-red-500 border-red-300 bg-red-50';

                              return (
                                <div 
                                  key={matchProf.id}
                                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                                    isExpanded 
                                      ? 'ring-2 ring-brand-500 border-transparent shadow-md' 
                                      : 'border-luxury-lightgray/60 hover:shadow-sm hover:border-luxury-lightgray'
                                  }`}
                                >
                                  {/* Card Summary Bar */}
                                  <div 
                                    onClick={() => setExpandedMatchId(isExpanded ? null : matchProf.id)}
                                    className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-4 min-w-0">
                                      {/* Rank Index & Compatibility Ring */}
                                      <div className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center shrink-0 font-bold ${scoreColor}`}>
                                        <span className="text-xs leading-none">{score}%</span>
                                        <span className="text-[7px] uppercase tracking-wider font-semibold">Fit</span>
                                      </div>
                                      
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-luxury-dark flex items-center gap-2">
                                          {idx + 1}. {matchProf.firstName} {matchProf.lastName}
                                          {matchData.gotraConflict && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-600 text-[8px] font-bold rounded border border-red-200 uppercase tracking-wide">
                                              <AlertTriangle className="w-2 h-2" /> Same Gotra Warning
                                            </span>
                                          )}
                                        </h5>
                                        <div className="flex items-center gap-2 text-[10px] text-luxury-gray mt-1 font-medium">
                                          <span>{matchProf.age} yrs</span>
                                          <span>•</span>
                                          <span>{matchProf.height}</span>
                                          <span>•</span>
                                          <span>{matchProf.city}</span>
                                          <span>•</span>
                                          <span className="font-bold text-emerald-600">{formatSalary(matchProf.career.income)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                      <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-luxury-dark">{matchProf.career.designation}</p>
                                        <span className="text-[9px] text-luxury-gray font-medium">{matchProf.career.company}</span>
                                      </div>
                                      <button 
                                        className="py-1 px-2.5 bg-luxury-cream border border-luxury-lightgray/80 text-luxury-dark hover:text-brand-600 hover:border-brand-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                                      >
                                        {isExpanded ? 'Hide Details' : 'View Breakdown'}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Expanded Match Breakdown Panel */}
                                  {isExpanded && (
                                    <div className="border-t border-luxury-lightgray/60 bg-luxury-cream/10 p-5 space-y-5 animate-fade-in">
                                      
                                      {/* Match Information Breakdown */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                                        
                                        {/* Match Profile Column */}
                                        <div className="bg-white p-4 rounded-xl border border-luxury-lightgray/40 space-y-2">
                                          <h6 className="text-[10px] uppercase tracking-wider text-luxury-gray font-bold">Candidate Biodata</h6>
                                          <div className="space-y-1.5 text-luxury-dark">
                                            <p className="flex justify-between"><span className="text-luxury-gray">Education:</span> <span className="font-semibold text-right">{matchProf.education.degree} ({matchProf.education.college})</span></p>
                                            <p className="flex justify-between"><span className="text-luxury-gray">Religion / Caste:</span> <span className="font-semibold text-right">{matchProf.family.religion} - {matchProf.family.caste}</span></p>
                                            <p className="flex justify-between"><span className="text-luxury-gray">Gotra:</span> <span className="font-semibold">{matchProf.family.gotra}</span></p>
                                            <p className="flex justify-between"><span className="text-luxury-gray">Diet:</span> <span className="font-bold text-brand-600">{matchProf.lifestyle.diet}</span></p>
                                            <p className="flex justify-between"><span className="text-luxury-gray">Astrology:</span> <span className="font-semibold">{matchProf.preferences.rashi} ({matchProf.preferences.nakshatra})</span></p>
                                            <p className="flex justify-between"><span className="text-luxury-gray">Values / Type:</span> <span className="font-semibold">{matchProf.family.familyValues} ({matchProf.family.familyType})</span></p>
                                          </div>
                                        </div>

                                        {/* Algorithm Highlights & Gaps */}
                                        <div className="bg-white p-4 rounded-xl border border-luxury-lightgray/40 flex flex-col justify-between gap-3">
                                          <div className="space-y-2">
                                            <h6 className="text-[10px] uppercase tracking-wider text-luxury-gray font-bold">Matching Factors</h6>
                                            
                                            {/* Highlights */}
                                            <div className="space-y-1">
                                              {matchData.highlights.map((h, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                                                  <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                                  <span>✓ {h}</span>
                                                </div>
                                              ))}
                                            </div>

                                            {/* Gaps */}
                                            {matchData.gaps.length > 0 && (
                                              <div className="space-y-1 pt-1.5 border-t border-dashed border-luxury-lightgray/40">
                                                {matchData.gaps.map((g, i) => (
                                                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-700 font-semibold">
                                                    <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                                                    <span>⚠ {g}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* AI Matching Analysis Section */}
                                      <div className="bg-gradient-to-r from-brand-50/10 to-gold-50/10 p-4 rounded-xl border border-brand-100/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] uppercase tracking-wider text-brand-600 font-bold flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-gold-500 fill-gold-100" /> AI Compatibility Analysis
                                          </span>
                                          {!aiExplanations[matchProf.id] && (
                                            <button
                                              onClick={() => handleGenerateAIExplanation(matchProf.id)}
                                              disabled={generatingAI[matchProf.id]}
                                              className="px-3 py-1 bg-white border border-brand-200 hover:border-brand-400 text-brand-600 hover:text-brand-700 text-[10px] font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                            >
                                              {generatingAI[matchProf.id] ? 'AI Evaluating...' : 'Generate AI Assessment'}
                                            </button>
                                          )}
                                        </div>

                                        {aiExplanations[matchProf.id] ? (
                                          <p className="text-xs font-semibold text-luxury-dark leading-relaxed italic bg-white/60 p-3 rounded-lg border border-brand-100/30">
                                            "{aiExplanations[matchProf.id]}"
                                          </p>
                                        ) : (
                                          <p className="text-[10px] text-luxury-gray italic">
                                            Click the button to request the AI engine to compose a detailed compatibility summary.
                                          </p>
                                        )}
                                      </div>

                                      {/* Matchmaker Actions Bar */}
                                      <div className="flex items-center justify-end gap-3 pt-2">
                                        {/* Generation Trigger */}
                                        <button
                                          onClick={() => {
                                            handleGenerateIntroEmail(matchProf.id);
                                            setShowEmailPreviewModal(matchData);
                                          }}
                                          disabled={generatingEmail[matchProf.id]}
                                          className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50"
                                        >
                                          Draft Intro Email & Match
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-luxury-gray">
                  <Users className="w-12 h-12 text-luxury-lightgray mb-4" />
                  <p className="text-sm font-semibold text-luxury-dark">No Client Selected</p>
                  <p className="text-xs mt-1">Please select an assigned client from the directory panel.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Content: RECOMMENDATIONS LOG (OUTBOX) */}
        {activeNav === 'outbox' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-serif text-luxury-dark">Recommendations Log & History</h2>
                <p className="text-xs text-luxury-gray mt-1">Timeline logs of all recommended matches and sent intro emails across your client portfolio.</p>
              </div>
              <button
                onClick={fetchOutboxHistory}
                className="p-2.5 bg-white hover:bg-luxury-cream border border-luxury-lightgray/80 rounded-xl text-luxury-gray hover:text-luxury-dark shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingOutbox ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingOutbox ? (
              <div className="py-24 text-center text-xs text-luxury-gray flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-7 h-7 animate-spin text-brand-500" />
                <span>Loading activity history...</span>
              </div>
            ) : outboxHistory.length === 0 ? (
              <div className="py-16 text-center text-xs text-luxury-gray bg-white rounded-2xl border border-luxury-lightgray/60 p-8 shadow-sm">
                <Mail className="w-12 h-12 text-luxury-lightgray mx-auto mb-4" />
                <p className="font-semibold text-luxury-dark">No Matches Sent Yet</p>
                <p className="text-[10px] mt-1">Find a client in the directory, open the AI Matchmaker tab, and click "Send Match".</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-luxury-lightgray/60 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs font-semibold text-luxury-dark">
                  <thead className="bg-luxury-cream text-[10px] uppercase text-luxury-gray tracking-wider border-b border-luxury-lightgray/60">
                    <tr>
                      <th className="p-4">Send Date</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Suggested Match</th>
                      <th className="p-4">Match Location</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-lightgray/40 font-medium">
                    {outboxHistory.map((historyEvent) => {
                      const client = customers.find(c => c.id === historyEvent.customerId);
                      return (
                        <tr key={historyEvent.id} className="hover:bg-luxury-cream/10 transition-all">
                          <td className="p-4 text-[10px] font-mono text-luxury-gray">
                            {new Date(historyEvent.sentDate).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-luxury-dark">
                              {client ? `${client.firstName} ${client.lastName}` : `Client (ID: ${historyEvent.customerId})`}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-brand-600 font-bold">
                              {historyEvent.matchDetails.firstName} {historyEvent.matchDetails.lastName}
                            </span>
                            <span className="text-[10px] text-luxury-gray block mt-0.5">{historyEvent.matchDetails.designation}</span>
                          </td>
                          <td className="p-4 text-luxury-gray">
                            {historyEvent.matchDetails.city}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setShowEmailPreviewModal({
                                score: 100, // mock score placeholder for display
                                profile: {
                                  firstName: historyEvent.matchDetails.firstName,
                                  lastName: historyEvent.matchDetails.lastName
                                },
                                isReadOnly: true,
                                readOnlyEmailContent: historyEvent.emailContent
                              })}
                              className="px-3 py-1.5 bg-luxury-cream border border-luxury-lightgray text-luxury-dark hover:text-brand-600 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                            >
                              View Sent Draft
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. EMAIL PREVIEW & CONFIRMATION MODAL */}
      {showEmailPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-dark/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-luxury border border-luxury-lightgray overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-luxury-lightgray/60 flex items-center justify-between bg-luxury-cream/35">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-600" />
                <h3 className="text-md font-bold font-serif text-luxury-dark">
                  {showEmailPreviewModal.isReadOnly ? 'Sent Recommendation Log' : 'Review & Send Match Profile'}
                </h3>
              </div>
              <button 
                onClick={() => setShowEmailPreviewModal(null)}
                className="text-luxury-gray hover:text-luxury-dark font-bold text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {!showEmailPreviewModal.isReadOnly && (
                <div className="p-3 bg-brand-50 border border-brand-100 text-brand-700 text-[11px] rounded-xl flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5 fill-brand-100" />
                  <div>
                    <span className="font-bold">AI Draft Generated!</span> This email has been drafted using our three-tier AI fallback engine. You can refine and edit the email content in the text editor below before sending it.
                  </div>
                </div>
              )}

              {/* Email Content Editor */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-luxury-gray uppercase tracking-wider">
                  Introductory Message Content
                </label>
                {showEmailPreviewModal.isReadOnly ? (
                  <div className="w-full p-4 bg-luxury-cream/40 border border-luxury-lightgray/60 rounded-2xl text-xs text-luxury-dark font-medium leading-relaxed whitespace-pre-line font-serif">
                    {showEmailPreviewModal.readOnlyEmailContent}
                  </div>
                ) : (
                  <textarea
                    rows="12"
                    value={draftEmails[showEmailPreviewModal.profile.id] || ''}
                    onChange={(e) => setDraftEmails(prev => ({ ...prev, [showEmailPreviewModal.profile.id]: e.target.value }))}
                    placeholder="Generating introduction draft..."
                    className="w-full p-4 bg-luxury-cream/10 border border-luxury-lightgray rounded-2xl text-xs text-luxury-dark font-medium leading-relaxed font-mono"
                  ></textarea>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-luxury-lightgray/60 flex justify-end gap-3 bg-luxury-cream/25">
              <button
                onClick={() => setShowEmailPreviewModal(null)}
                className="px-4 py-2 bg-white border border-luxury-lightgray hover:bg-luxury-cream text-luxury-gray hover:text-luxury-dark text-xs font-semibold rounded-lg cursor-pointer transition-all"
              >
                Cancel
              </button>
              
              {!showEmailPreviewModal.isReadOnly && (
                <button
                  onClick={() => handleSendMatch(showEmailPreviewModal.profile.id, draftEmails[showEmailPreviewModal.profile.id])}
                  disabled={sendingMatch[showEmailPreviewModal.profile.id]}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-gold-500 hover:from-brand-500 hover:to-gold-600 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                >
                  {sendingMatch[showEmailPreviewModal.profile.id] ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Match...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm & Send Match</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
