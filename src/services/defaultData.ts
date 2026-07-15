import type { CRMData } from '../types/crm';

export const DEFAULT_CRM_DATA: CRMData = {
  contacts: [
    {
      id: 'c-101',
      lastName: 'Dupont',
      firstName: 'Sophie',
      email: 's.dupont@tech-solutions.fr',
      phone: '06 12 34 56 78',
      company: 'Tech Solutions SAS',
      type: 'Entreprise',
      establishment: 'space_fun_games',
      status: 'À relancer',
      deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // dans 2 jours
      notes: 'Souhaite organiser un team-building pour 45 collaborateurs en septembre. Demande de devis buffet + jeux.',
      createdAt: '2026-07-10T10:30:00Z',
      updatedAt: '2026-07-12T14:15:00Z',
      logs: [
        {
          id: 'log-1',
          contactId: 'c-101',
          employeeName: 'Jean',
          actionType: 'call',
          summary: 'Premier contact téléphonique : très intéressée par la formule Laser Game + Réalité Virtuelle.',
          newStatus: 'À relancer',
          deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          timestamp: '2026-07-12T14:15:00Z'
        }
      ]
    },
    {
      id: 'c-102',
      lastName: 'Martin',
      firstName: 'Lucas',
      email: 'l.martin@asso-sport-jeunes.org',
      phone: '06 87 65 43 21',
      company: 'Association Sport & Jeunesse',
      type: 'Association',
      establishment: 'les_deux',
      status: 'Rendez-vous fixé',
      deadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      notes: 'Visite des locaux prévue pour organiser la sortie annuelle des ados de l\'association.',
      createdAt: '2026-07-08T09:00:00Z',
      updatedAt: '2026-07-13T16:20:00Z',
      logs: [
        {
          id: 'log-2',
          contactId: 'c-102',
          employeeName: 'Marie',
          actionType: 'mail',
          summary: 'Envoi de la plaquette de présentation Space Fun Games et Share & Fun.',
          newStatus: 'Rendez-vous fixé',
          deadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
          timestamp: '2026-07-13T16:20:00Z'
        }
      ]
    },
    {
      id: 'c-103',
      lastName: 'Bernard',
      firstName: 'Camille',
      email: 'camille.b@boulangerie-st-michel.com',
      phone: '06 45 67 89 01',
      company: 'Boulangerie St Michel',
      type: 'Entreprise',
      establishment: 'share_and_fun',
      status: 'Nouveau : à contacter',
      deadline: new Date().toISOString().split('T')[0], // Aujourd'hui !
      notes: 'Contact issu de l\'import Excel du salon des commerçants locaux.',
      createdAt: '2026-07-14T08:00:00Z',
      updatedAt: '2026-07-14T08:00:00Z',
      logs: [
        {
          id: 'log-3',
          contactId: 'c-103',
          employeeName: 'Système',
          actionType: 'import',
          summary: 'Contact importé automatiquement avec le statut Nouveau : à contacter.',
          newStatus: 'Nouveau : à contacter',
          deadline: new Date().toISOString().split('T')[0],
          timestamp: '2026-07-14T08:00:00Z'
        }
      ]
    },
    {
      id: 'c-104',
      lastName: 'Leroy',
      firstName: 'Thomas',
      email: 't.leroy@mairie-centre.fr',
      phone: '06 23 45 67 89',
      company: 'Service Jeunesse Mairie',
      type: 'Scolaire & Mairie',
      establishment: 'space_fun_games',
      status: 'Devis envoyé',
      deadline: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], // En retard d'un jour !
      notes: 'Devis envoyé pour sortie centre de loisirs en août. Attente de la validation du budget de la mairie.',
      createdAt: '2026-07-01T11:00:00Z',
      updatedAt: '2026-07-09T15:40:00Z',
      logs: [
        {
          id: 'log-4',
          contactId: 'c-104',
          employeeName: 'Jean',
          actionType: 'mail',
          summary: 'Envoi du devis n°2026-409 (Montant: 1450€ TTC).',
          newStatus: 'Devis envoyé',
          deadline: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
          timestamp: '2026-07-09T15:40:00Z'
        }
      ]
    },
    {
      id: 'c-105',
      lastName: 'Girard',
      firstName: 'Elodie',
      email: 'e.girard@ce-banque-nationale.fr',
      phone: '06 99 88 77 66',
      company: 'CSE Banque Nationale',
      type: 'CE / CSE',
      establishment: 'les_deux',
      status: 'Client converti',
      deadline: undefined,
      notes: 'Partenariat annuel signé ! Réduction de 10% pour les salariés sur présentation du badge.',
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: '2026-07-05T17:00:00Z',
      logs: [
        {
          id: 'log-5',
          contactId: 'c-105',
          employeeName: 'Marie',
          actionType: 'status_change',
          summary: 'Signature de la convention de partenariat CE.',
          newStatus: 'Client converti',
          timestamp: '2026-07-05T17:00:00Z'
        }
      ]
    }
  ],
  users: [
    { id: 'u-dir', username: 'Lauréline Henkens', password: 'Jerome221087', role: 'directrice', email: 'laureline@spacefungames.fr' },
    { id: 'u-1', username: 'Jean', password: '', role: 'admin' },
    { id: 'u-2', username: 'Marie', password: '', role: 'admin' },
    { id: 'u-3', username: 'Marc', password: '', role: 'user' },
    { id: 'u-4', username: 'Julie', password: '', role: 'user' }
  ],
  contactTypes: [
    'Entreprise',
    'Association',
    'CE / CSE',
    'Scolaire & Mairie',
    'Particulier'
  ],
  statuses: [
    'Nouveau : à contacter',
    'À relancer',
    'Rendez-vous fixé',
    'Devis envoyé',
    'Client converti',
    'Pas intéressé'
  ],
  tags: [
    { id: 'tag-1', name: 'VIP', description: 'Client prioritaire à fidéliser', color: '#8D5B4C' },
    { id: 'tag-2', name: 'Gros budget', description: 'Événement > 2000 €', color: '#2E7D32' },
    { id: 'tag-3', name: 'Urgent', description: 'Événement à organiser dans moins de 7 jours', color: '#C62828' }
  ],
  roles: [
    'directrice',
    'admin',
    'user'
  ],
  templateCategories: [
    'Prospection',
    'Relance',
    'Suivi & Fidélisation',
    'Evénements & Devis',
    'Général'
  ],
  emailTemplates: [
    {
      id: 'tpl-1',
      title: '👋 Premier contact & Présentation de nos activités',
      category: 'Prospection',
      shortcut: '/intro',
      subject: 'Présentation Space Fun Games & Share & Fun pour {Société}',
      body: `Bonjour {Prénom},\n\nSuite à notre recherche de partenaires locaux, je me permets de vous contacter pour vous présenter nos deux établissements dédiés aux loisirs, à la cohésion d'équipe et au divertissement :\n\n🚀 Space Fun Games : Laser game, jeux d'arcade et expériences immersives idéales pour vos événements de team-building et soirées d'entreprise.\n🎲 Share & Fun : Notre espace convivial convivial pour partager des moments ludiques en groupe autour d'activités fédératrices et de buffets traiteur.\n\nNous proposons des formules sur-mesure adaptées aux besoins de {Société}.\n\nSeriez-vous disponible pour un court échange téléphonique de 5 minutes cette semaine afin de découvrir nos offres et tarifs de groupe ?\n\nBien cordialement,\nL'équipe Space Fun Games & Share & Fun`
    },
    {
      id: 'tpl-2',
      title: '📄 Relance suite à l\'envoi de devis',
      category: 'Relance',
      shortcut: '/relance1',
      subject: 'Suivi de votre devis - Space Fun Games / Share & Fun',
      body: `Bonjour {Prénom},\n\nJ'espère que vous allez bien.\n\nJe reviens vers vous concernant le devis que nous vous avons transmis récemment pour l'organisation de votre événement pour {Société}.\n\nAvez-vous eu l'occasion d'en prendre connaissance et d'en discuter avec votre équipe ?\n\nJe reste à votre entière disposition pour ajuster les horaires, les options ou répondre à toutes vos questions.\n\nAu plaisir de vous accueillir très bientôt !\n\nBien cordialement,\nL'équipe Space Fun Games & Share & Fun`
    },
    {
      id: 'tpl-3',
      title: '🤝 Remerciement & Invitation à visiter nos locaux',
      category: 'Suivi & Fidélisation',
      shortcut: '/visite',
      subject: 'Merci pour notre échange, {Prénom} !',
      body: `Bonjour {Prénom},\n\nJe vous remercie pour le temps que vous nous avez accordé lors de notre échange téléphonique aujourd'hui.\n\nComme convenu, nous serions ravis de vous accueillir directement sur place pour vous faire visiter nos installations et vous offrir un café en discutant de votre futur projet pour {Société}.\n\nN'hésitez pas à nous indiquer le jour et l'heure qui vous conviennent le mieux.\n\nÀ très vite,\nL'équipe Space Fun Games & Share & Fun`
    }
  ],
  cloudConfig: {
    enabled: false,
    provider: 'local'
  }
};
