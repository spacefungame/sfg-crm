import type { CRMData } from '../types/crm';

export const DEFAULT_CRM_DATA: CRMData = {
  contacts: [],
  users: [
    { id: 'u-dir', username: 'Lauréline Henkens', password: 'Jerome221087', role: 'directrice', email: 'laureline@spacefungames.fr' }
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
