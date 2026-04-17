import { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { FiPlus, FiCheck, FiMapPin, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { indiaStates } from '../utils/indiaStates';

const AddressSelector = ({ onSelect, selectedId }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        full_name: '', phone_number: '', address_line1: '', address_line2: '',
        locality: '', city: '', district: '', state: '', pincode: ''
    });

    const fetchAddresses = async () => {
        try {
            const { data } = await authAPI.getAddresses();
            setAddresses(data);
            if (data.length > 0 && !selectedId) {
                const defaultAddr = data.find(a => a.is_default) || data[0];
                onSelect(defaultAddr);
            }
        } catch (error) {
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const { data } = await authAPI.addAddress(newAddress);
            toast.success('Address added!');
            setAddresses([...addresses, data]);
            onSelect(data);
            setShowForm(false);
            setNewAddress({
                full_name: '', phone_number: '', address_line1: '', address_line2: '',
                locality: '', city: '', district: '', state: '', pincode: ''
            });
        } catch (error) {
            toast.error('Failed to add address');
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this address?')) return;
        try {
            await authAPI.deleteAddress(id);
            setAddresses(addresses.filter(a => a.id !== id));
            if (selectedId === id) onSelect(null);
            toast.success('Address removed');
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    if (loading) return <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Loading addresses...</div>;

    return (
        <div className="address-selector">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {addresses.map(addr => (
                    <div 
                        key={addr.id} 
                        className={`glass-card address-card ${selectedId === addr.id ? 'selected' : ''}`}
                        onClick={() => onSelect(addr)}
                        style={{ 
                            padding: '16px', 
                            cursor: 'pointer', 
                            border: selectedId === addr.id ? '2px solid var(--action)' : '1px solid var(--border)',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            background: selectedId === addr.id ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '700', color: selectedId === addr.id ? 'var(--action)' : 'inherit' }}>{addr.full_name}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {selectedId === addr.id && <FiCheck color="var(--action)" />}
                                <FiTrash2 size={14} color="#ff4d4d" onClick={(e) => handleDelete(addr.id, e)} title="Delete Address" />
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                            {addr.locality}<br />
                            {addr.city}, {addr.district}, {addr.state} - {addr.pincode}<br />
                            <span style={{ display: 'block', marginTop: '4px', color: 'var(--text-main)', fontWeight: '500' }}>📞 {addr.phone_number}</span>
                        </div>
                        {addr.is_default && <span className="badge" style={{ marginTop: '8px', fontSize: '0.7rem', background: 'var(--action-dim)', color: 'var(--action)' }}>Default</span>}
                    </div>
                ))}
                
                <div 
                    className="glass-card address-card add-new"
                    onClick={() => setShowForm(!showForm)}
                    style={{ 
                        padding: '16px', 
                        cursor: 'pointer', 
                        border: '2px dashed var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '140px',
                        color: 'var(--text-muted)'
                    }}
                >
                    <FiPlus size={24} style={{ marginBottom: '8px' }} />
                    <span style={{ fontWeight: '600' }}>Add New Address</span>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="glass-card" style={{ padding: '24px', animation: 'fadeIn 0.3s ease', border: '1px solid var(--action)' }}>
                    <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiMapPin color="var(--action)" /> New Delivery Address
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" placeholder="e.g. John Doe" value={newAddress.full_name} onChange={e => setNewAddress({...newAddress, full_name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input className="form-input" placeholder="10-digit mobile" value={newAddress.phone_number} onChange={e => setNewAddress({...newAddress, phone_number: e.target.value})} required />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Address Line 1</label>
                        <input className="form-input" placeholder="House No, Flat, Building" value={newAddress.address_line1} onChange={e => setNewAddress({...newAddress, address_line1: e.target.value})} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Address Line 2 (Optional)</label>
                        <input className="form-input" placeholder="Area, Colony, Sector" value={newAddress.address_line2} onChange={e => setNewAddress({...newAddress, address_line2: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Locality / Landmark</label>
                            <input className="form-input" placeholder="e.g. Near Market" value={newAddress.locality} onChange={e => setNewAddress({...newAddress, locality: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <select 
                                className="form-input" 
                                value={newAddress.city === 'Other' || !indiaStates[newAddress.state]?.includes(newAddress.city) && newAddress.city ? 'Other' : newAddress.city} 
                                onChange={e => setNewAddress({...newAddress, city: e.target.value})} 
                                required
                                disabled={!newAddress.state}
                            >
                                <option value="">Select City</option>
                                {newAddress.state && indiaStates[newAddress.state]?.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                                <option value="Other">Other (Type manually)</option>
                            </select>
                            {(newAddress.city === 'Other' || !indiaStates[newAddress.state]?.includes(newAddress.city) && newAddress.city && newAddress.state) && (
                                <input 
                                    className="form-input" 
                                    style={{ marginTop: '8px' }} 
                                    placeholder="Enter your city name" 
                                    value={newAddress.city === 'Other' ? '' : newAddress.city} 
                                    onChange={e => setNewAddress({...newAddress, city: e.target.value})} 
                                    required 
                                />
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div className="form-group">
                            <label className="form-label">District</label>
                            <input className="form-input" value={newAddress.district} onChange={e => setNewAddress({...newAddress, district: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">State</label>
                            <select 
                                className="form-input" 
                                value={newAddress.state} 
                                onChange={e => setNewAddress({...newAddress, state: e.target.value, city: ''})} 
                                required
                            >
                                <option value="">Select State</option>
                                {Object.keys(indiaStates).sort().map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Pincode</label>
                            <input 
                                className="form-input" 
                                placeholder="6 digits (e.g. 400001)" 
                                value={newAddress.pincode} 
                                onChange={async (e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setNewAddress({...newAddress, pincode: val});
                                    if (val.length === 6) {
                                        try {
                                            const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
                                            const data = await res.json();
                                            if (data[0].Status === "Success") {
                                                const postOffices = data[0].PostOffice;
                                                const first = postOffices[0];
                                                setNewAddress(prev => ({
                                                    ...prev,
                                                    state: first.State,
                                                    district: first.District,
                                                    city: first.Block === 'NA' ? first.District : first.Block,
                                                    // Store areas for a local dropdown
                                                    _localities: postOffices.map(p => p.Name)
                                                }));
                                                toast.success('Location fetched!');
                                            } else {
                                                toast.error('Invalid Pincode');
                                            }
                                        } catch (err) {
                                            console.error("Pincode API failed");
                                        }
                                    }
                                }} 
                                required 
                            />
                        </div>
                    </div>
                    
                    {newAddress._localities && (
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Select Area / Locality</label>
                            <select 
                                className="form-input"
                                value={newAddress.locality}
                                onChange={e => setNewAddress({...newAddress, locality: e.target.value})}
                                required
                            >
                                <option value="">Select Area</option>
                                {newAddress._localities.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                                <option value="Other">Other (Type manually below)</option>
                            </select>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }}>Add Address</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AddressSelector;
