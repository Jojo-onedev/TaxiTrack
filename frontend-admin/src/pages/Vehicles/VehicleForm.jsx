import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Layout from '../../components/Layout/Layout';
import vehicleService from '../../services/vehicleService';
import './VehicleForm.css';

const VehicleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nom_modele: '',
    plaque_immatriculation: '',
    statut: 'available'
  });

  // Charger les données du véhicule si mode édition
  useEffect(() => {
    if (isEditMode) {
      loadVehicle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadVehicle = async () => {
    const result = await vehicleService.getVehicleById(id);
    if (result.success) {
      const vehicle = result.data.car;
      setFormData({
        nom_modele: vehicle.nom_modele || '',
        plaque_immatriculation: vehicle.plaque_immatriculation || '',
        statut: vehicle.status || 'available'
      });
    } else {
      alert('Erreur: ' + result.error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data:', formData);

    // Préparer les données pour l'API (envoie directement la valeur du select)
    const apiData = {
      nom_modele: formData.nom_modele,
      plaque_immatriculation: formData.plaque_immatriculation,
      status: formData.statut  // Envoie 'available', 'in_use', ou 'maintenance'
    };

    // Appel API
    const result = isEditMode
      ? await vehicleService.updateVehicle(id, apiData)
      : await vehicleService.createVehicle(apiData);

    if (result.success) {
      alert(isEditMode ? 'Véhicule mis à jour !' : 'Véhicule ajouté !');
      navigate('/vehicles');
    } else {
      alert('Erreur: ' + result.error);
    }
  };

  return (
    <Layout>
      <div className="vehicle-form-page">
        <div className="form-header">
          <div className="header-title">
            <h1>{isEditMode ? 'Modifier Véhicule' : 'Ajouter Véhicule'}</h1>
          </div>
          <button className="btn-back" onClick={() => navigate('/vehicles')}>
            <FaArrowLeft /> Retour à la liste
          </button>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="section-header">
                <h3>Informations du Véhicule</h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nom du Modèle *</label>
                  <input
                    type="text"
                    name="nom_modele"
                    value={formData.nom_modele}
                    onChange={handleChange}
                    required
                    placeholder="ex: Toyota Corolla"
                  />
                </div>

                <div className="form-group">
                  <label>Plaque d'immatriculation *</label>
                  <input
                    type="text"
                    name="plaque_immatriculation"
                    value={formData.plaque_immatriculation}
                    onChange={handleChange}
                    required
                    placeholder="ex: BF-1234-AB"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Statut *</label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  required
                >
                  <option value="available">Disponible</option>
                  <option value="in_use">En service</option>
                  <option value="maintenance">En réparation</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/vehicles')}>
                Annuler
              </button>
              <button type="submit" className="btn-submit">
                {isEditMode ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default VehicleForm;
