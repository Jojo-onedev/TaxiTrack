import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import './Drivers.css';



const Drivers = () => {
  const navigate = useNavigate(); 
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/drivers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDrivers(data.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce chauffeur ?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/drivers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDrivers();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Filtrage
  const filteredDrivers = drivers.filter(d =>
    d.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.telephone?.includes(searchTerm) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDrivers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  return (
    <Layout>
      <div className="drivers-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Drivers List</h1>
            {/* <div className="breadcrumb">
              <span>Drivers</span>
              <span className="separator">›</span>
              <span className="active">Drivers List</span>
            </div> */}
          </div>
          {/* <button className="btn-add" onClick={() => setShowModal(true)}>
            + Add Driver
          </button> */}
          <button className="btn-add" onClick={() => navigate('/drivers/add')}>
            + Add Driver
          </button>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="tabs">
            <button className="tab active">Employee List</button>
          </div>
          
          <div className="filters-right">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="filter-btn">🎯 Filter</button>
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
                <th>Date of Birth</th>
                <th>CNIB</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="loading-cell">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data-cell">
                    No drivers found
                  </td>
                </tr>
              ) : (
                currentItems.map((driver) => (
                  <tr key={driver.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>
                      <span className="employee-id">{String(driver.id).padStart(6, '0')}</span>
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
                    <td>-</td>
                    <td>{driver.cnib}</td>
                    <td>{new Date(driver.date_entree).toLocaleDateString('en-US')}</td>
                    <td>
                      <span className="status-badge active">Active</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view" 
                          title="View"
                          onClick={() => alert('View driver')}
                        >
                          👁️
                        </button>
                        <button 
                          className="action-btn edit" 
                          title="Edit"
                          onClick={() => {
                            setSelectedDriver(driver);
                            setShowModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        {/* <button 
                          className="action-btn delete" 
                          title="Delete"
                          onClick={() => handleDelete(driver.id)}
                        >
                          🗑️
                        </button> */}
                        
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ‹
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
            ›
          </button>
        </div>
      </div>

      {/* Modal (à ajouter) */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedDriver ? 'Edit Driver' : 'Add Driver'}</h2>
            {/* Formulaire ici */}
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Drivers;
