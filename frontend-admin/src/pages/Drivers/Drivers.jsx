import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaFilter, FaUserFriends } from 'react-icons/fa';
import Layout from '../../components/Layout/Layout';
import driverService from '../../services/driverService';
import vehicleService from '../../services/vehicleService';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);


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
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDriverToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!driverToDelete) return;

    try {
      const result = await driverService.deleteDriver(driverToDelete);

      if (result.success) {
        toast.success('Chauffeur supprimé avec succès !');

        if (drivers.length === 1 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        } else {
          fetchDrivers();
        }
      } else {
        toast.error('Erreur: ' + (result.error || 'La suppression a échoué'));
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Une erreur est survenue lors de la suppression');
    } finally {
      setDriverToDelete(null);
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

  return (
    <Layout>
      <div className="drivers-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Drivers List</h1>
          </div>
          <button className="btn-add" onClick={() => navigate('/drivers/add')}>
            <FaPlus className="btn-icon" /> Add Driver
          </button>
        </div>

        <div className="filters-bar">
          <div className="tabs">
            <button className="tab active">
              <FaUserFriends className="tab-icon" /> Employee List
            </button>
          </div>

          <div className="filters-right">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchTerm(e.target.value);
                }}
              />
            </div>
            <button className="filter-btn">
              <FaFilter className="filter-icon" /> Filter
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
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
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data-cell">No drivers found</td>
                </tr>
              ) : (
                drivers.map((driver) => (
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
                          className="action-btn edit"
                          onClick={() => navigate(`/drivers/edit/${driver.user_id}`)}
                        >
                          Modifier
                        </button>

                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteClick(driver.user_id)}
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
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
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
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Drivers;
