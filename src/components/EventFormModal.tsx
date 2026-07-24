import React, { useState } from 'react';
import { X, Calendar, MapPin, Clock, Users, Coffee, Tag, CreditCard, Save } from 'lucide-react';
import type { Contact, EventDetails } from '../types/crm';

interface EventFormModalProps {
  contact: Contact;
  onSave: (eventDetails: EventDetails) => void;
  onClose: () => void;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({ contact, onSave, onClose }) => {
  const [formData, setFormData] = useState<EventDetails>(contact.eventDetails || {
    establishment: 'a_determiner',
    dateType: 'tbd',
    dateValue: '',
    guestCount: '',
    arrivalTime: '',
    departureTime: '',
    activities: '',
    catering: '',
    drinks: '',
    equipment: '',
    paymentStatus: '',
    quoteAmount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="overlay-backdrop animate-fade-in" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="card animate-scale-up" 
        onClick={(e) => e.stopPropagation()} 
        style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} />
            Détails de l'événement - {contact.firstName} {contact.lastName}
          </h2>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ border: 'none' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Établissement */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              <MapPin size={14} /> Établissement
            </label>
            <select 
              className="input-field" 
              value={formData.establishment} 
              onChange={e => setFormData({...formData, establishment: e.target.value as any})}
            >
              <option value="a_determiner">À déterminer</option>
              <option value="space_fun_games">Space Fun Games</option>
              <option value="share_and_fun">Share & Fun</option>
              <option value="les_deux">Les deux</option>
            </select>
          </div>

          {/* Date de l'événement */}
          <div style={{ backgroundColor: 'var(--surface-warm)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              <Calendar size={14} /> Date de l'événement
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input type="radio" name="dateType" checked={formData.dateType === 'exact'} onChange={() => setFormData({...formData, dateType: 'exact', dateValue: ''})} /> Date précise
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input type="radio" name="dateType" checked={formData.dateType === 'month'} onChange={() => setFormData({...formData, dateType: 'month', dateValue: ''})} /> Mois à déterminer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input type="radio" name="dateType" checked={formData.dateType === 'tbd'} onChange={() => setFormData({...formData, dateType: 'tbd', dateValue: ''})} /> Date à déterminer
              </label>
            </div>
            
            {formData.dateType === 'exact' && (
              <input type="date" className="input-field" value={formData.dateValue} onChange={e => setFormData({...formData, dateValue: e.target.value})} />
            )}
            {formData.dateType === 'month' && (
              <input type="month" className="input-field" value={formData.dateValue} onChange={e => setFormData({...formData, dateValue: e.target.value})} />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Nombre de personnes */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                <Users size={14} /> Nombre de personnes
              </label>
              <input type="text" className="input-field" placeholder="ex: 15-20 ou à déterminer" value={formData.guestCount} onChange={e => setFormData({...formData, guestCount: e.target.value})} />
            </div>

            {/* Devis */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                <CreditCard size={14} /> Montant du devis (€)
              </label>
              <input type="text" className="input-field" placeholder="ex: 450,00" value={formData.quoteAmount} onChange={e => setFormData({...formData, quoteAmount: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Arrivée */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                <Clock size={14} /> Heure d'arrivée
              </label>
              <input type="text" className="input-field" placeholder="ex: 14:00 ou TBD" value={formData.arrivalTime} onChange={e => setFormData({...formData, arrivalTime: e.target.value})} />
            </div>

            {/* Départ */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                <Clock size={14} /> Heure de départ
              </label>
              <input type="text" className="input-field" placeholder="ex: 18:00 ou TBD" value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} />
            </div>
          </div>

          {/* Activités */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              <Tag size={14} /> Activités choisies
            </label>
            <input type="text" className="input-field" placeholder="ex: Laser Game + Réalité Virtuelle" value={formData.activities} onChange={e => setFormData({...formData, activities: e.target.value})} />
          </div>

          {/* Catering */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              <Coffee size={14} /> Catering (Nourriture)
            </label>
            <input type="text" className="input-field" placeholder="ex: 2 pizzas, gâteau d'anniversaire" value={formData.catering} onChange={e => setFormData({...formData, catering: e.target.value})} />
          </div>

          {/* Boissons */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              <Coffee size={14} /> Boissons
            </label>
            <input type="text" className="input-field" placeholder="ex: 3 pichets, 2 softs" value={formData.drinks} onChange={e => setFormData({...formData, drinks: e.target.value})} />
          </div>

          {/* Matériel */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              <Tag size={14} /> Matériel / Autres options
            </label>
            <input type="text" className="input-field" placeholder="ex: Projecteur, salle de réunion" value={formData.equipment} onChange={e => setFormData({...formData, equipment: e.target.value})} />
          </div>

          {/* Avancement du paiement */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              <CreditCard size={14} /> Avancement du paiement
            </label>
            <input type="text" className="input-field" placeholder="ex: Acompte payé (30%)" value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value})} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={15} /> Enregistrer
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
