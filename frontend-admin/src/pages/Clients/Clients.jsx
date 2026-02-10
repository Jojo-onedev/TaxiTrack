<<<<<<< HEAD

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import clientService from '../../services/clientService';
=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
>>>>>>> origin/frontend-admin
import './Clients.css';

const Clients = () => {
  const navigate = useNavigate();
<<<<<<< HEAD

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
=======
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    setClients(clients.filter(c => c.id !== id));
    alert('Client deleted successfully!');
  };

  const handleEdit = (id) => {
    navigate(`/clients/edit/${id}`);
  };

  // Filtrage
  const filteredClients = clients.filter(c =>
    c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id?.toString().includes(searchTerm)
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
>>>>>>> origin/frontend-admin

  return (
    <Layout>
      <div className="clients-page">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">Clients</h1>
<<<<<<< HEAD
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
=======

          </div>
          
>>>>>>> origin/frontend-admin
        </div>

        <div className="tabs-section">
          <div className="tabs">
            <button className="tab active">Clients</button>
<<<<<<< HEAD
=======
            
>>>>>>> origin/frontend-admin
          </div>
        </div>

        <div className="content-header">
<<<<<<< HEAD
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
=======
          <h2 className="section-title">Client list</h2>
          <div className="header-actions">
            {/* <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div> */}
            {/* <button className="btn-filter">
              <i className="fas fa-filter"></i> Filter
            </button> */}
>>>>>>> origin/frontend-admin
          </div>
        </div>

        <div className="table-card">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Sl</th>
<<<<<<< HEAD
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
=======
                <th>Client id <i className="fas fa-sort"></i></th>
                <th>Name of client</th>
                <th>Email</th>
                <th>Mobile no</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data-cell">
                    No clients found
                  </td>
                </tr>
              ) : (
                currentItems.map((client, index) => (
                  <tr key={client.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td className="client-id">{String(client.id).padStart(6, '0')}</td>
                    <td>
                      <div className="client-name">
                        <div className="client-avatar">
                          {client.nom?.charAt(0)}{client.prenom?.charAt(0)}
                        </div>
                        <span>{client.nom} {client.prenom}</span>
                      </div>
                    </td>
                    <td>{client.email}</td>
                    <td>{client.telephone || '-'}</td>
                    <td>{client.date_naissance || '-'}</td>
                    <td>{new Date(client.date_inscription).toLocaleDateString('en-US')}</td>
                    <td>
                      <span className="status-badge active">Active</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit" 
                          title="Edit"
                          onClick={() => handleEdit(client.id)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="action-btn delete" 
                          title="Delete"
                          onClick={() => handleDelete(client.id)}
                        >
                          <i className="fas fa-trash"></i>
>>>>>>> origin/frontend-admin
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
<<<<<<< HEAD
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
=======
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
>>>>>>> origin/frontend-admin
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>

<<<<<<< HEAD
            {Array.from({ length: totalPages }).map((_, i) => (
=======
            {[...Array(totalPages)].map((_, i) => (
>>>>>>> origin/frontend-admin
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
<<<<<<< HEAD
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
=======
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
>>>>>>> origin/frontend-admin
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
