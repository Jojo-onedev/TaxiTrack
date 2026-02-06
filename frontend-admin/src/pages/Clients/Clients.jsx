import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import './Clients.css';

const Clients = () => {
  const navigate = useNavigate();
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

  return (
    <Layout>
      <div className="clients-page">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">Clients</h1>

          </div>
          
        </div>

        <div className="tabs-section">
          <div className="tabs">
            <button className="tab active">Clients</button>
            
          </div>
        </div>

        <div className="content-header">
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
          </div>
        </div>

        <div className="table-card">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Sl</th>
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
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
