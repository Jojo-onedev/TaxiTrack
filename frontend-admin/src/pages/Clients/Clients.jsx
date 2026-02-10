
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import clientService from '../../services/clientService';
import './Clients.css';

const Clients = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    total_clients: 0,
    active_last_30_days: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Pagination backend
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: itemsPerPage,
    total: 0,
    total_pages: 0,
  });

  useEffect(() => {
    fetchClients();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch liste quand page/search change
  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const fetchStats = async () => {
    try {
      const result = await clientService.getClientStats();
      if (result.success) {
        setStats(result.data.overview);
      }
    } catch (e) {
      // stats non critiques: ignorer
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await clientService.getClients({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });

      if (result.success) {
        setClients(result.data.clients || []);
        setPagination(result.data.pagination || {
          current_page: currentPage,
          per_page: itemsPerPage,
          total: 0,
          total_pages: 0,
        });
      } else {
        setError(result.error || 'Erreur lors de la récupération des clients');
      }

      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) return;

    try {
      const result = await clientService.deleteClient(id);

      if (result.success) {
        alert('Client supprimé avec succès!');
        if (clients.length === 1 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        } else {
          fetchClients();
        }
        fetchStats();
      } else {
        alert(result.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la suppression du client');
    }
  };

  const totalPages = pagination.total_pages || 0;

  if (loading) {
    return (
      <Layout>
        <div className="clients-page">
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
        <div className="clients-page">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={fetchClients} className="btn-retry">
              <i className="fas fa-redo"></i> Réessayer
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="clients-page">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">Clients</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h3>Total Clients</h3>
              <p className="stat-number">{stats.total_clients || 0}</p>
            </div>
          </div>

          {/* <div className="stat-card">
            <div className="stat-icon active">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-content">
              <h3>Actifs (30 days)</h3>
              <p className="stat-number">{stats.active_last_30_days || 0}</p>
            </div>
          </div> */}
        </div>

        <div className="tabs-section">
          <div className="tabs">
            <button className="tab active">Clients</button>
          </div>
        </div>

        <div className="content-header">
          <h2 className="section-title">List</h2>

          <div className="header-actions">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher (nom, téléphone, email...)"
                value={searchTerm}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchTerm(e.target.value);
                }}
              />
            </div>

            <button className="btn-refresh" onClick={fetchClients}>
              <i className="fas fa-sync-alt"></i> 
            </button>
          </div>
        </div>

        <div className="table-card">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Sl</th>
                <th>Client ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Residence Location</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data-cell">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                clients.map((client, index) => (
                  <tr key={client.user_id}>
                    <td>{(pagination.current_page - 1) * pagination.per_page + index + 1}</td>

                    <td className="client-id">
                      #{String(client.user_id).padStart(6, '0')}
                    </td>

                    <td>
                      <div className="client-name">
                        <div className="client-avatar">
                          {client.nom?.charAt(0) || 'C'}
                          {client.prenom?.charAt(0) || 'L'}
                        </div>
                        <span>
                          {client.nom || 'N/A'} {client.prenom || ''}
                        </span>
                      </div>
                    </td>

                    <td>{client.email || '-'}</td>

                    <td>{client.telephone || '-'}</td>

                    <td>{client.lieu_residence || '-'}</td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn delete"
                          title="Supprimer"
                          onClick={() => handleDelete(client.user_id)}
                        >
                          Delete
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

            {Array.from({ length: totalPages }).map((_, i) => (
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
      </div>
    </Layout>
  );
};

export default Clients;
