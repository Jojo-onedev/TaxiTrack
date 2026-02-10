import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import driverService from '../../services/driverService';
import './Drivers.css';

const Drivers = () => {
  const navigate = useNavigate(); 
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDrivers();
  }, [currentPage, searchTerm]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await driverService.getDrivers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      });

      if (result.success) {
        setDrivers(result.data.drivers || []);
        setPagination(result.data.pagination || {
          current_page: currentPage,
          per_page: itemsPerPage,
          total: 0,
          total_pages: 0
        });
      } else {
        setError(result.error || 'Erreur lors de la récupération des chauffeurs');
      }

      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) return;

    try {
      const result = await driverService.deleteDriver(id);
      
      if (result.success) {
        alert('Chauffeur supprimé avec succès!');
        fetchDrivers(); // Rafraîchir la liste
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du chauffeur');
    }
  };

  const handleEdit = (id) => {
    navigate(`/drivers/edit/${id}`);
  };

  const handleView = (driver) => {
    alert(`Détails du chauffeur:\n\nNom: ${driver.nom} ${driver.prenom}\nEmail: ${driver.email}\nTéléphone: ${driver.telephone}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="drivers-page">
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Chargement des données...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="drivers-page">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={fetchDrivers} className="btn-retry">
              <i className="fas fa-redo"></i> Réessayer
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="drivers-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Drivers List</h1>
          </div>
          <button className="btn-add" onClick={() => navigate('/drivers/add')}>
            + Add Driver
          </button>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="tabs">
            <button className="tab active">Employee List ({pagination.total})</button>
          </div>
          
          <div className="filters-right">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset à la page 1 lors d'une recherche
                }}
              />
            </div>
            <button className="filter-btn" onClick={fetchDrivers}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Employee ID</th>
                <th>Name of Employee</th>
                <th>Email</th>
                <th>Mobile Numero</th>
                <th>Assigned Car</th>
                <th>CNIB</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data-cell">
                    Aucun chauffeur trouvé
                  </td>
                </tr>
              ) : (
                drivers.map((driver, index) => (
                  <tr key={driver.user_id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>
                      <span className="employee-id">
                        {String(driver.user_id).padStart(6, '0')}
                      </span>
                    </td>
                    <td>
                      <div className="employee-name">
                        <div className="employee-avatar">
                          {driver.nom?.charAt(0)}{driver.prenom?.charAt(0)}
                        </div>
                        <span>{driver.nom} {driver.prenom}</span>
                      </div>
                    </td>
                    <td>{driver.email}</td>
                    <td>{driver.telephone}</td>
                    <td>
                      {driver.car_model ? (
                        <span className="badge badge-success">
                          {driver.car_model} - {driver.car_plate}
                        </span>
                      ) : (
                        <span className="badge badge-secondary">Non assigné</span>
                      )}
                    </td>
                    <td>{driver.cnib || '-'}</td>
                    <td>
                      {driver.created_at 
                        ? new Date(driver.created_at).toLocaleDateString('fr-FR')
                        : '-'
                      }
                    </td>
                    <td>
                      <span className="status-badge active">Active</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view" 
                          title="View"
                          onClick={() => handleView(driver)}
                        >
                          👁️
                        </button>
                        <button 
                          className="action-btn edit" 
                          title="Edit"
                          onClick={() => handleEdit(driver.user_id)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete" 
                          title="Delete"
                          onClick={() => handleDelete(driver.user_id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            
            {[...Array(pagination.total_pages)].map((_, i) => (
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.total_pages))}
              disabled={currentPage === pagination.total_pages}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Drivers;
