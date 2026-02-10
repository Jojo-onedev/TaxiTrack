import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaSearch, FaSyncAlt, FaSpinner, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Layout from '../../components/Layout/Layout';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

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

  const handleDeleteClick = (id) => {
    setClientToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      const result = await clientService.deleteClient(clientToDelete);

      if (result.success) {
        toast.success('Client supprimé avec succès !');
        if (clients.length === 1 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        } else {
          fetchClients();
        }
        fetchStats();
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la suppression du client');
    } finally {
      setClientToDelete(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/clients/edit/${id}`);
  };

  const totalPages = pagination.total_pages || 0;

  if (loading) {
    return (
      <Layout>
        <div className="clients-page">
          <div className="loading">
            <FaSpinner className="fa-spin" />
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
            <FaExclamationTriangle />
            <p>{error}</p>
            <button onClick={fetchClients} className="btn-retry">
              <FaSyncAlt /> Réessayer
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
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>Total Clients</h3>
              <p className="stat-number">{stats.total_clients || 0}</p>
            </div>
          </div>
        </div>

        <div className="tabs-section">
          <div className="tabs">
            <button className="tab active">
              <FaUsers className="tab-icon" /> Clients
            </button>
          </div>
        </div>

        <div className="content-header">
          <h2 className="section-title">List</h2>

          <div className="header-actions">
            <div className="search-box">
              <FaSearch />
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
              <FaSyncAlt />
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
                          className="action-btn edit"
                          onClick={() => handleEdit(client.user_id)}
                        >
                          Modifier
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteClick(client.user_id)}
                        >
                          Supprimer
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
              <FaChevronLeft />
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
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Supprimer le client"
        message="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        type="danger"
      />
    </Layout>
  );
};

export default Clients;
