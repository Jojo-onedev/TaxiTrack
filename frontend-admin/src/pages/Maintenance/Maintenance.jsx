import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import './Maintenance.css';

const Maintenance = () => {
  const navigate = useNavigate();
  const [maintenances, setMaintenances] = useState([]); // ✅ Toujours array
  const [cars, setCars] = useState([]);
  const [stats, setStats] = useState({
    total_maintenances: 0,
    last_30_days: 0,
    total_cost: 0,
    average_cost: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ✅ État erreur
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    car_id: '',
    type_maintenance: '',
    description: '',
    cout: '',
    date_maintenance: ''
  });
  const itemsPerPage = 10;

  // ✅ Fonction fetch sécurisée (gère TOUS les cas)
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

      // Stats
      const statsData = await safeFetch('/api/admin/stats/maintenance');
      setStats(statsData.data || stats);

      // Liste (force array)
      const listData = await safeFetch('/api/admin/maintenance?page=1&limit=100');
      setMaintenances(Array.isArray(listData.data) ? listData.data : []); // ✅ Garanti array [web:17]

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
      setCars(Array.isArray(data.data?.cars) ? data.data.cars : data.data || []);
    } catch (err) {
      console.error('Cars fetch error:', err);
      // Fallback dev
      setCars([
        { id: 1, plaque_immatriculation: '123 AB CD', nom_modele: 'Toyota Corolla' },
        { id: 2, plaque_immatriculation: '456 EF GH', nom_modele: 'Hyundai Accent' },
        { id: 3, plaque_immatriculation: '789 HI JK', nom_modele: 'Peugeot 301' },
      ]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCars();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.car_id || !formData.type_maintenance || !formData.cout || !formData.date_maintenance) {
      alert('⚠️ Champs obligatoires manquants');
      return;
    }

    try {
      const submitData = {
        car_id: parseInt(formData.car_id, 10),
        type_maintenance: formData.type_maintenance,
        description: formData.description || '',
        cout: parseInt(formData.cout, 10),
        date_maintenance: formData.date_maintenance
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

  // ✅ Filtre safe (maintenances toujours array)
  const filteredMaintenances = maintenances.filter(m =>
    (m.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.nom_modele || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.plaque_immatriculation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.type_maintenance || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMaintenances.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMaintenances.length / itemsPerPage);

  const openModal = (maintenance = null) => {
    if (maintenance) {
      setFormData({
        car_id: maintenance.car_id || '',
        type_maintenance: maintenance.type_maintenance || '',
        description: maintenance.description || '',
        cout: maintenance.cout || '',
        date_maintenance: maintenance.date_maintenance?.split('T')[0] || ''
      });
      setEditingId(maintenance.id);
    } else {
      setFormData({ car_id: '', type_maintenance: '', description: '', cout: '', date_maintenance: '' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}. <button onClick={fetchData}>Réessayer</button></div>;

  // Reste du JSX IDENTIQUE (page-header, stats-grid, table, modal...)
  return (
    <Layout>
      <div className="maintenance-page">
        {/* Tout votre JSX existant reste IDENTIQUE ici */}
        <div className="page-header">
          <div>
            <h1>Gestion Maintenance</h1>
            <p>{stats.total_maintenances} entretiens</p>
          </div>
          <button className="btn-add" onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Nouvelle
          </button>
        </div>

        {/* Stats grid IDENTIQUE */}
        <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-tools stat-icon"></i>
            <div><h3>Total</h3><p className="stat-number">{stats.total_maintenances}</p></div>
          </div>
          <div className="stat-card">
            <i className="fas fa-calendar stat-icon"></i>
            <div><h3>30 jours</h3><p className="stat-number">{stats.last_30_days}</p></div>
          </div>
          <div className="stat-card">
            <i className="fas fa-coins stat-icon"></i>
            <div><h3>Total coût</h3><p className="stat-number">{Math.round(stats.total_cost / 1000)}k FCFA</p></div>
          </div>
          <div className="stat-card">
            <i className="fas fa-calculator stat-icon"></i>
            <div><h3>Moyenne</h3><p className="stat-number">{Math.round(stats.average_cost / 1000)}k FCFA</p></div>
          </div>
        </div>

        {/* Table + pagination IDENTIQUE */}
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
                  <th>Véhicule</th><th>Type</th><th>Description</th><th>Coût</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div>
                        <strong>{m.nom_modele}</strong><br/>
                        <small>{m.plaque_immatriculation}</small>
                      </div>
                    </td>
                    <td><span className="type-badge">{m.type_maintenance}</span></td>
                    <td>{m.description}</td>
                    <td>{Math.round(m.cout / 1000)}k FCFA</td>
                    <td>{m.date_maintenance?.split('T')[0]}</td>
                    <td>
                      <button className="btn-edit" onClick={() => openModal(m)}><i className="fas fa-edit"></i></button>
                      <button className="btn-delete" onClick={() => handleDelete(m.id)}><i className="fas fa-trash"></i></button>
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
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Précédent</button>
              <span>Page {currentPage} sur {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Suivant</button>
            </div>
          )}
        </div>

        {/* Modal IDENTIQUE */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Modifier' : 'Nouvelle maintenance'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
              </div>
              <form onSubmit={handleSubmit} className="maintenance-form">
                <div className="form-group">
                  <label>Véhicule * ({cars.length} disponible{cars.length !== 1 ? 's' : ''})</label>
                  <select value={formData.car_id} onChange={e => setFormData({...formData, car_id: e.target.value})} required>
                    <option value="">Sélectionner</option>
                    {cars.map(car => (
                      <option key={car.id} value={car.id}>{car.nom_modele} - {car.plaque_immatriculation}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select value={formData.type_maintenance} onChange={e => setFormData({...formData, type_maintenance: e.target.value})} required>
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
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"/>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Coût (FCFA) *</label>
                    <input type="number" value={formData.cout} onChange={e => setFormData({...formData, cout: e.target.value})} required/>
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input type="date" value={formData.date_maintenance} onChange={e => setFormData({...formData, date_maintenance: e.target.value})} required/>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn-save">{editingId ? 'Modifier' : 'Ajouter'}</button>
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
