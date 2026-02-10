import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import './Maintenance.css';

const Maintenance = () => {
  const navigate = useNavigate();
  const [maintenances, setMaintenances] = useState([]);
  const [cars, setCars] = useState([]);
  const [stats, setStats] = useState({
    totalmaintenances: 0,
    last30days: 0,
    totalcost: 0,
    averagecost: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    carid: '',
    typemaintenance: '',
    description: '',
    cout: '',
    datemaintenance: ''
  });
  const itemsPerPage = 10;

  // Fetch sécurisé
  const safeFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const text = await res.text();
      return text ? JSON.parse(text) : {};
    } catch (err) {
      console.error(`Fetch error ${url}:`, err);
      throw err;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Stats - adapter aux clés backend (totalmaintenances, etc.)
      const statsData = await safeFetch('/api/admin/stats/maintenance');
      console.log('Stats data:', statsData); // Debug
      setStats(statsData.data || stats);

      // Liste - corriger pour backend qui retourne data.maintenances
      const listData = await safeFetch('/api/admin/maintenance?page=1&limit=100');
      console.log('List data:', listData); // Debug
      // Backend retourne {success: true, data: {maintenances: [...]}}
      const maintenanceList = listData.data?.maintenances || listData.data || [];
      setMaintenances(Array.isArray(maintenanceList) ? maintenanceList : []);
    } catch (err) {
      setError(err.message);
      setMaintenances([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const data = await safeFetch('/api/admin/cars?limit=100');
      console.log('Cars data:', data); // Debug
      // Backend peut retourner data.cars ou directement data
      const carList = data.data?.cars || data.data || data.cars || [];
      setCars(Array.isArray(carList) ? carList : []);
    } catch (err) {
      console.error('Cars fetch error:', err);
      // Fallback dev
      setCars([
        { id: 1, plaqueimmatriculation: '123 AB CD', nommodele: 'Toyota Corolla' },
        { id: 2, plaqueimmatriculation: '456 EF GH', nommodele: 'Hyundai Accent' },
        { id: 3, plaqueimmatriculation: '789 HI JK', nommodele: 'Peugeot 301' },
      ]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCars();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.carid || !formData.typemaintenance || !formData.cout || !formData.datemaintenance) {
      alert('⚠️ Champs obligatoires manquants');
      return;
    }

    try {
      const submitData = {
  car_id: parseInt(formData.carid, 10),
  type_maintenance: formData.typemaintenance,
  description: formData.description || '',
  cout: parseInt(formData.cout, 10),
  date_maintenance: formData.datemaintenance
};



      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/admin/maintenance/${editingId}` : '/api/admin/maintenance';

      const data = await safeFetch(url, { method, body: JSON.stringify(submitData) });
      if (!data.success) throw new Error(data.message || 'Échec opération');

      alert(editingId ? '✅ Modifié !' : '✅ Ajouté !');
      setShowModal(false);
      fetchData(); // Refresh
    } catch (err) {
      alert('❌ Erreur: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Confirmer suppression ?')) {
      try {
        await safeFetch(`/api/admin/maintenance/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        alert('❌ Erreur suppression: ' + err.message);
      }
    }
  };

  // Filtre safe - toujours array
  const filteredMaintenances = maintenances.filter(m =>
    (m.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.nommodele || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.plaqueimmatriculation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.typemaintenance || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMaintenances.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMaintenances.length / itemsPerPage);

  const openModal = (maintenance = null) => {
    if (maintenance) {
      setFormData({
        carid: maintenance.carid || maintenance.car_id || '',
        typemaintenance: maintenance.typemaintenance || maintenance.type_maintenance || '',
        description: maintenance.description || '',
        cout: maintenance.cout || '',
        datemaintenance: maintenance.datemaintenance?.split('T')[0] || maintenance.date_maintenance?.split('T')[0] || ''
      });
      setEditingId(maintenance.id);
    } else {
      setFormData({ carid: '', typemaintenance: '', description: '', cout: '', datemaintenance: '' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return (
    <div className="error">
      Erreur: {error}. <button onClick={fetchData}>Réessayer</button>
    </div>
  );

  return (
    <Layout>
      <div className="maintenance-page">
        <div className="page-header">
          <div>
            <h1> Maintenance management</h1>
            <p>{stats.totalmaintenances} </p>
          </div>
          <button className="btn-add" onClick={() => openModal()}>
            <i className="fas fa-plus"></i> New Maintenance
          </button>
        </div>

        {/* CARDS MISES À JOUR - formatage FCFA + fallback */}
        {/* <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-tools stat-icon"></i>
            <div>
              <h3>Total</h3>
              <p className="stat-number">{stats.totalmaintenances || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-calendar stat-icon"></i>
            <div>
              <h3>30 jours</h3>
              <p className="stat-number">{stats.last30days || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-coins stat-icon"></i>
            <div>
              <h3>Total coût</h3>
              <p className="stat-number">
                {stats.totalcost ? Math.round(stats.totalcost).toLocaleString() + ' FCFA' : '0 FCFA'}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-calculator stat-icon"></i>
            <div>
              <h3>Moyenne</h3>
              <p className="stat-number">
                {stats.averagecost ? Math.round(stats.averagecost).toLocaleString() + ' FCFA' : '0 FCFA'}
              </p>
            </div>
          </div>
        </div> */}

        <div className="table-card">
          <div className="table-header">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="table-stats">{filteredMaintenances.length} résultats</div>
          </div>
          <div className="table-container">
            <table className="maintenance-table">
              <thead>
                <tr>
                  <th>Véhicule</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Coût</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div>
                        <strong>{m.nommodele || m.nom_modele || m.car?.nommodele || '—'}</strong><br/>
                        <small>{m.plaqueimmatriculation || m.plaque_immatriculation || m.car?.plaqueimmatriculation || '—'}</small>
                      </div>
                    </td>
                    <td><span className="type-badge">{m.typemaintenance || m.type_maintenance || '—'}</span></td>
                    <td>{m.description || '—'}</td>
                    <td>{m.cout ? `${parseInt(m.cout).toLocaleString()} FCFA` : '—'}</td>
                    <td>{(m.datemaintenance || m.date_maintenance)?.split('T')[0] || '—'}</td>
                    <td>
                      <button className="btn-edit" onClick={() => openModal(m)} title="Modifier"> Update
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(m.id)} title="Supprimer">Delete
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr><td colSpan="6" className="no-data">Aucune maintenance trouvée</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                disabled={currentPage === 1}
              >
                Précédent
              </button>
              <span>Page {currentPage} sur {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                disabled={currentPage === totalPages}
              >
                Suivant
              </button>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Modifier' : 'Nouvelle maintenance'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="maintenance-form">
                <div className="form-group">
                  <label>Véhicule {cars.length ? `(${cars.length} disponible${cars.length !== 1 ? 's' : ''})` : ''} *</label>
                  <select 
                    value={formData.carid} 
                    onChange={e => setFormData({...formData, carid: e.target.value})} 
                    required
                  >
                    <option value="">Sélectionner</option>
                    {cars.map(car => (
                      <option key={car.id} value={car.id}>
                        {car.nommodele || car.nom_modele} - {car.plaqueimmatriculation || car.plaque_immatriculation}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select 
                    value={formData.typemaintenance} 
                    onChange={e => setFormData({...formData, typemaintenance: e.target.value})} 
                    required
                  >
                    <option value="">Choisir</option>
                    <option value="Vidange">Vidange</option>
                    <option value="Freins">Freins</option>
                    <option value="Pneus">Pneus</option>
                    <option value="Révision">Révision</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Coût (FCFA) *</label>
                    <input 
                      type="number" 
                      value={formData.cout} 
                      onChange={e => setFormData({...formData, cout: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input 
                      type="date" 
                      value={formData.datemaintenance} 
                      onChange={e => setFormData({...formData, datemaintenance: e.target.value})} 
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-save">
                    {editingId ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Maintenance;
