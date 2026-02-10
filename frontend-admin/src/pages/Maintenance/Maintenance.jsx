import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTools, FaCalendarAlt, FaMoneyBillWave, FaCalculator, FaTimes, FaSearch, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import Layout from '../../components/Layout/Layout';
import maintenanceService from '../../services/maintenanceService';
import vehicleService from '../../services/vehicleService';
import './Maintenance.css';

const Maintenance = () => {
  const navigate = useNavigate();
  const [maintenances, setMaintenances] = useState([]);
  const [cars, setCars] = useState([]);
  const [stats, setStats] = useState({
    total_maintenances: 0,
    last_30_days: 0,
    total_cost: 0,
    average_cost: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResult, listResult] = await Promise.all([
        maintenanceService.getMaintenanceStats(),
        maintenanceService.getMaintenances({ page: 1, limit: 100 })
      ]);

      if (statsResult.success) {
        setStats(statsResult.data.overview || stats);
      }

      if (listResult.success) {
        setMaintenances(listResult.data.maintenances || []);
      } else {
        setError(listResult.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const result = await vehicleService.getVehicles({ limit: 100 });
      if (result.success) {
        setCars(result.data.cars || result.data || []);
      }
    } catch (err) {
      console.error('Cars fetch error:', err);
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
        cout: parseFloat(formData.cout),
        date_maintenance: formData.date_maintenance
      };

      const result = editingId
        ? await maintenanceService.updateMaintenance(editingId, submitData)
        : await maintenanceService.createMaintenance(submitData);

      if (result.success) {
        alert(editingId ? 'Modifié !' : 'Ajouté !');
        setShowModal(false);
        fetchData();
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirmer suppression ?')) {
      try {
        const result = await maintenanceService.deleteMaintenance(id);
        if (result.success) {
          fetchData();
        } else {
          alert('Erreur suppression: ' + result.error);
        }
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
        car_id: maintenance.carid || maintenance.car_id || '',
        type_maintenance: maintenance.typemaintenance || maintenance.type_maintenance || '',
        description: maintenance.description || '',
        cout: maintenance.cout || '',
        date_maintenance: maintenance.datemaintenance?.split('T')[0] || maintenance.date_maintenance?.split('T')[0] || ''
      });
      setEditingId(maintenance.id);
    } else {
      setFormData({ car_id: '', type_maintenance: '', description: '', cout: '', date_maintenance: '' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  if (loading) return (
    <Layout>
      <div className="maintenance-page">
        <div className="loading">
          <FaSpinner className="fa-spin" />
          <p>Chargement...</p>
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="maintenance-page">
        <div className="error-message">
          <FaExclamationTriangle />
          <p>Erreur: {error}</p>
          <button onClick={fetchData} className="btn-retry">
            <FaSyncAlt /> Réessayer
          </button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="maintenance-page">
        <div className="page-header">
          <div>
            <h1><FaTools /> Maintenance Management</h1>
            <p>{stats.total_maintenances || 0} maintenance records total</p>
          </div>
          <button className="btn-add" onClick={() => openModal()}>
            <FaPlus /> New Maintenance
          </button>
        </div>

        <div className="table-card">
          <div className="table-header">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher par véhicule, type, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
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
                        <strong>{m.nommodele || m.nom_modele || m.car?.nommodele || '—'}</strong><br />
                        <small>{m.plaqueimmatriculation || m.plaque_immatriculation || m.car?.plaqueimmatriculation || '—'}</small>
                      </div>
                    </td>
                    <td><span className="type-badge">{m.typemaintenance || m.type_maintenance || '—'}</span></td>
                    <td>{m.description || '—'}</td>
                    <td>{m.cout ? `${parseInt(m.cout).toLocaleString()} FCFA` : '—'}</td>
                    <td>{(m.datemaintenance || m.date_maintenance)?.split('T')[0] || '—'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit" onClick={() => openModal(m)}>
                          Modifier
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(m.id)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr><td colSpan="6" className="no-data-cell">Aucune maintenance trouvée</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </button>
              <span className="page-info">Page {currentPage} sur {totalPages}</span>
              <button
                className="page-btn"
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
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="maintenance-form">
                <div className="form-group">
                  <label>Véhicule {cars.length ? `(${cars.length} disponible${cars.length !== 1 ? 's' : ''})` : ''} *</label>
                  <select
                    value={formData.car_id}
                    onChange={e => setFormData({ ...formData, car_id: e.target.value })}
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
                    value={formData.type_maintenance}
                    onChange={e => setFormData({ ...formData, type_maintenance: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Coût (FCFA) *</label>
                    <input
                      type="number"
                      value={formData.cout}
                      onChange={e => setFormData({ ...formData, cout: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={formData.date_maintenance}
                      onChange={e => setFormData({ ...formData, date_maintenance: e.target.value })}
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
