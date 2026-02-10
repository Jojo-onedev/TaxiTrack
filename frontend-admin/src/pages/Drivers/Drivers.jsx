<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import driverService from '../../services/driverService';
import vehicleService from '../../services/vehicleService';
import './Drivers.css';

const Drivers = () => {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: itemsPerPage,
    total: 0,
    total_pages: 0,
  });


  const [cars, setCars] = useState([]);

  useEffect(() => {
    fetchDrivers();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchCars();

  }, []);

  const fetchCars = async () => {
    try {
      const result = await vehicleService.getVehicles({ limit: 500 });
      if (result.success) {
        setCars(result.data.cars || result.data || []);
      }
    } catch (err) {
      console.error('Error loading cars:', err);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await driverService.getDrivers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });

      if (result.success) {
        setDrivers(result.data.drivers || []);
        setPagination(
          result.data.pagination || {
            current_page: currentPage,
            per_page: itemsPerPage,
            total: 0,
            total_pages: 0,
          }
        );
      } else {
        setError(result.error || 'Error fetching drivers');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred');
=======
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
>>>>>>> origin/frontend-admin
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
<<<<<<< HEAD
    if (!window.confirm('Are you sure you want to delete this driver?')) return;

    try {
      const result = await driverService.deleteDriver(id);

      if (result.success) {
        alert('Driver deleted successfully!');

        if (drivers.length === 1 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        } else {
          fetchDrivers();
        }
      } else {
        alert('Error: ' + (result.error || 'Delete failed'));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error deleting driver');
    }
  };

  const totalPages = pagination.total_pages || 0;

  const formatDate = (value) => {
    if (!value) return '-';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toISOString().slice(0, 10);
  };


  const carLabelById = useMemo(() => {
    const map = new Map();
    cars.forEach((car) => {
      const id = car.id;
      const model = car.nom_modele || car.nommodele || '';
      const plate = car.plaque_immatriculation || car.plaqueimmatriculation || '';
      const label = [model, plate].filter(Boolean).join(' - ') || `Car #${id}`;
      map.set(String(id), label);
    });
    return map;
  }, [cars]);

  const getCarLabel = (driver) => {
    if (driver?.car) {
      const model = driver.car.nom_modele || driver.car.nommodele || '';
      const plate = driver.car.plaque_immatriculation || driver.car.plaqueimmatriculation || '';
      const joined = [model, plate].filter(Boolean).join(' - ');
      if (joined) return joined;
    }
    if (!driver?.car_id) return '-';
    return carLabelById.get(String(driver.car_id)) || '-';
  };

  const displayedDrivers = useMemo(() => drivers, [drivers]);

  if (loading) {
    return (
      <Layout>
        <div className="drivers-page">
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="drivers-page">
          <div className="error-message">
            {error}
            <button onClick={fetchDrivers} className="btn-retry">Retry</button>
          </div>
        </div>
      </Layout>
    );
  }
=======
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
>>>>>>> origin/frontend-admin

  return (
    <Layout>
      <div className="drivers-page">
<<<<<<< HEAD
        <div className="page-header">
          <h1>Drivers List</h1>
=======
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
>>>>>>> origin/frontend-admin
          <button className="btn-add" onClick={() => navigate('/drivers/add')}>
            + Add Driver
          </button>
        </div>

<<<<<<< HEAD
        <div className="search-container">
          <input
            className="search-input"
            placeholder="Search driver..."
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
          />
        </div>

=======
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
>>>>>>> origin/frontend-admin
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
<<<<<<< HEAD
                <th>ID</th>
                <th>Last name</th>
                <th>First name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>CNIB</th>
                <th>Residence</th>
                <th>Start date</th>
                <th>Car</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {displayedDrivers.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data-cell">No drivers found</td>
                </tr>
              ) : (
                displayedDrivers.map((driver) => (
                  <tr key={driver.user_id}>
                    <td>{String(driver.user_id).padStart(6, '0')}</td>
                    <td>{driver.nom || '-'}</td>
                    <td>{driver.prenom || '-'}</td>
                    <td>{driver.email || '-'}</td>
                    <td>{driver.telephone || '-'}</td>
                    <td>{driver.cnib || '-'}</td>
                    <td>{driver.lieu_residence || '-'}</td>
                    <td>{formatDate(driver.date_entree)}</td>
                    <td>{getCarLabel(driver)}</td>

                    <td className="action-cell">
                      <div className="action-buttons">
                        <button
                          className="btn-action edit"
                          onClick={() => navigate(`/drivers/edit/${driver.user_id}`)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-action delete"
                          onClick={() => handleDelete(driver.user_id)}
                        >
                          Delete
                        </button>
=======
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
                        
>>>>>>> origin/frontend-admin
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

<<<<<<< HEAD
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} // ✅ tu voulais enlever couleur: on enlève juste la classe active
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
=======
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
>>>>>>> origin/frontend-admin
    </Layout>
  );
};

export default Drivers;
