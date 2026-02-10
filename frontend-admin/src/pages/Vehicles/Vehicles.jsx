import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import vehicleService from '../../services/vehicleService';
import './Vehicles.css';

const Vehicles = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 10;

  // Pagination backend
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: itemsPerPage,
    total: 0,
    total_pages: 0,
  });

  // ====== UPDATE (modal) - design inchangé, juste pour faire marcher Update ======
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    nom_modele: '',
    plaque_immatriculation: '',
    status: 'active',
  });

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await vehicleService.getVehicles({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });

      if (result.success) {
        setVehicles(result.data.cars || []);
        setPagination(
          result.data.pagination || {
            current_page: currentPage,
            per_page: itemsPerPage,
            total: 0,
            total_pages: 0,
          }
        );
      } else {
        setError(result.error || 'Erreur lors de la récupération des véhicules');
      }

      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const result = await vehicleService.deleteVehicle(id);

      if (result.success) {
        alert('Vehicle deleted successfully!');
        if (vehicles.length === 1 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        } else {
          fetchVehicles();
        }
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Error deleting vehicle');
    }
  };

  // Ouvre le formulaire avec les données de la ligne (PAS de navigation)
  const handleEdit = (id) => {
    const vehicle = vehicles.find((v) => v.id === id);
    if (!vehicle) return;

    setEditingVehicle(vehicle);
    setFormData({
      nom_modele: vehicle.nom_modele || '',
      plaque_immatriculation: vehicle.plaque_immatriculation || '',
      status: vehicle.status || 'active',
    });
    setShowModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingVehicle) return;

    try {
      // Important: ici on update puis on refresh la liste
      const result = await vehicleService.updateVehicle(editingVehicle.id, formData);

      if (result.success) {
        alert('Vehicle updated successfully!');
        setShowModal(false);
        setEditingVehicle(null);
        fetchVehicles();
      } else {
        alert('Error: ' + (result.error || 'Update failed'));
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Error updating vehicle');
    }
  };

  const totalPages = pagination.total_pages || 0;

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Available', class: 'status-available' },
      in_use: { label: 'In Use', class: 'status-in-use' },
      maintenance: { label: 'Maintenance', class: 'status-maintenance' },
      inactive: { label: 'Inactive', class: 'status-inactive' },
    };
    const statusInfo = statusMap[status] || { label: status, class: '' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="vehicles-page">
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading vehicles...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="vehicles-page">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={fetchVehicles} className="btn-retry">
              <i className="fas fa-redo"></i> Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="vehicles-page">
        <div className="page-header">
          <h1 className="page-title">Vehicles</h1>
          <div className="header-actions">
            <button className="btn-add-primary" onClick={() => navigate('/vehicles/add')}>
              <i className="fas fa-plus"></i> Add Manually
            </button>
          </div>
        </div>

        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search by model, license plate or ID..."
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
          />
        </div>

        <div className="table-card">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>Vehicle ID</th>
                <th>Model Name</th>
                <th>License Plate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-cell">No vehicles found</td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td><input type="checkbox" /></td>
                    <td className="vehicle-id">#{String(vehicle.id).padStart(4, '0')}</td>
                    <td className="vehicle-model">{vehicle.nom_modele || 'N/A'}</td>
                    <td>
                      <span className="license-plate">{vehicle.plaque_immatriculation || '-'}</span>
                    </td>
                    <td>{getStatusBadge(vehicle.status)}</td>

                    {/* ICI: Update doit ouvrir le formulaire, pas alert + navigation */}
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          title="Update"
                          onClick={() => handleEdit(vehicle.id)}
                        >
                          <i className="fas fa-edit"></i> Update
                        </button>

                        <button
                          className="action-btn delete"
                          title="Delete"
                          onClick={() => handleDelete(vehicle.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}

        {/* MODAL UPDATE: pas de nouveau design, juste structure (mêmes classes que Drivers si tu as déjà) */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Vehicle</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="driver-form">
                {/* j'utilise driver-form/form-group/form-actions si tu les as déjà dans ton projet */}
                <div className="form-group">
                  <label>Model Name *</label>
                  <input
                    type="text"
                    value={formData.nom_modele}
                    onChange={(e) => setFormData({ ...formData, nom_modele: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>License Plate *</label>
                  <input
                    type="text"
                    value={formData.plaque_immatriculation}
                    onChange={(e) =>
                      setFormData({ ...formData, plaque_immatriculation: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Available</option>
                    <option value="in_use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    Save
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

export default Vehicles;
