/* ============================================================
   RÉVOLUTION FRANÇAISE – Moteur de jeu complet
   ============================================================ */

// ─── État du joueur ───────────────────────────────────────────
const state = {
  playerName : 'Citoyen',
  influence  : 50,   // 0-100
  danger     : 20,   // 0-100
  step       : 0,
  journal    : [],
  choices    : [],   // historique des choix
  alive      : true,
  endType    : '',   // 'triumph' | 'survivor' | 'fallen' | 'dead'
};

// ─── Événements aléatoires ────────────────────────────────────
const RANDOM_EVENTS = [
  {
    text : "Un inconnu vous glisse un billet : <em>« Méfiez-vous du comte de Mirabeau, il joue double jeu »</em>. Votre vigilance s'aiguise.",
    deltaInfluence: 0, deltaDanger: +5,
    effects: ["⚠️ Danger +5"]
  },
  {
    text : "Votre discours d'hier a circulé dans les cafés parisiens. On parle de vous avec admiration.",
    deltaInfluence: +8, deltaDanger: 0,
    effects: ["⭐ Influence +8"]
  },
  {
    text : "Une émeute éclate près de l'Assemblée. Impossible de sortir pendant deux heures. Vous êtes sains et saufs, mais les nerfs sont à vif.",
    deltaInfluence: 0, deltaDanger: +8,
    effects: ["⚠️ Danger +8"]
  },
  {
    text : "Un pamphlet anonyme circule, vous accusant de trahison envers le peuple. Pure calomnie, mais cela vous fragilise.",
    deltaInfluence: -6, deltaDanger: +10,
    effects: ["📉 Influence −6", "⚠️ Danger +10"]
  },
  {
    text : "Vous avez sauvé un boutiquier d'une arrestation injuste. La rue vous acclame : <em>« Vive le Citoyen ! »</em>",
    deltaInfluence: +10, deltaDanger: 0,
    effects: ["⭐ Influence +10"]
  },
  {
    text : "Une épidémie de typhus se répand dans votre quartier. Vous restez confiné trois jours, perdant de précieux contacts.",
    deltaInfluence: -4, deltaDanger: +4,
    effects: ["📉 Influence −4", "⚠️ Danger +4"]
  },
  {
    text : "Un aristocrate ruiné vous propose une alliance secrète contre le Comité de Salut Public. L'offre est tentante… mais dangereuse.",
    deltaInfluence: +5, deltaDanger: +12,
    effects: ["⭐ Influence +5", "⚠️ Danger +12"]
  },
  {
    text : "Votre cousin, officier de la garde nationale, vous avertit d'un complot. Vous échappez de justesse à une arrestation préventive.",
    deltaInfluence: 0, deltaDanger: -10,
    effects: ["🛡 Danger −10"]
  },
  {
    text : "Un journaliste du <em>Moniteur Universel</em> publie un portrait élogieux de votre action. Votre réputation s'envole.",
    deltaInfluence: +12, deltaDanger: 0,
    effects: ["⭐ Influence +12"]
  },
  {
    text : "Vous assistez à une altercation violente entre sans-culottes et gardes suisses. La peur vous serre le ventre.",
    deltaInfluence: 0, deltaDanger: +6,
    effects: ["⚠️ Danger +6"]
  },
];

// ─── 10 Étapes historiques ────────────────────────────────────
const STEPS = [

  // ══════════════════════════════════════════════════
  // ÉTAPE 1 – 5 mai 1789 : États Généraux
  // ══════════════════════════════════════════════════
  {
    id      : 'etats-generaux',
    badge   : 'Étape 1 / 11',
    title   : 'Les États Généraux',
    date    : '5 mai 1789 — Versailles',
    context : `<strong>Contexte :</strong> La France est au bord de la faillite. Le roi Louis XVI convoque les États Généraux à Versailles pour trouver une solution à la crise financière. Les trois ordres — Noblesse, Clergé et Tiers-État — se réunissent pour la première fois depuis 1614. Vous représentez le peuple : 97 % de la population, mais seulement une voix sur trois.`,
    narrative : `La salle des Menus-Plaisirs bourdonne de murmures. Vous prenez place parmi vos collègues du Tiers-État, vêtu sobrement — une mer de noir parmi les habits brodés de la noblesse et les robes violettes du clergé. Le roi entre, imposant sous sa perruque poudrée. Mais très vite, l'ambiance tourne à l'aigre : la noblesse exige que chaque ordre vote séparément — ce qui rendrait le Tiers-État impuissant face aux deux autres ordres réunis. <em>Votre cœur bat fort. C'est le moment d'agir.</em>`,
    choices : [
      {
        title : 'Exiger le vote par tête',
        desc  : 'Vous prenez la parole pour réclamer que chaque député vote individuellement, ce qui donnerait au Tiers-État un vrai pouvoir.',
        consequence : `Votre discours est ovationné par vos collègues ! Votre nom circule dans les salons patriotes. Mais la noblesse et le clergé vous regardent avec hostilité. Vous venez de vous faire des ennemis puissants.`,
        deltaInfluence: +15, deltaDanger: +8,
        effects: [
          { label: '⭐ Influence +15', type: 'up' },
          { label: '⚠️ Danger +8',    type: 'down' },
        ],
        journal : 'Réclamé le vote par tête aux États Généraux. Applaudissements du Tiers-État, hostilité de la noblesse.',
      },
      {
        title : 'Observer et tisser des alliances',
        desc  : 'Vous préférez la prudence : vous écoutez, prenez des notes, et engagez des conversations discrètes avec des députés libéraux de la noblesse.',
        consequence : `Votre stratégie porte ses fruits. Vous identifiez plusieurs nobles libéraux prêts à rejoindre votre cause, dont un comte de Bretagne. Votre réseau s'élargit, mais votre discrétion vous vaut peu de notoriété pour l'instant.`,
        deltaInfluence: +8, deltaDanger: +2,
        effects: [
          { label: '⭐ Influence +8', type: 'up' },
          { label: '⚠️ Danger +2',    type: 'warn' },
        ],
        journal : 'Observé et noué des alliances discrètes aux États Généraux. Réseau élargi.',
      },
      {
        title : 'Refuser de siéger, protester publiquement',
        desc  : 'Vous quittez ostensiblement la salle avec d\'autres députés pour protester contre les règles injustes du scrutin.',
        consequence : `Votre geste fait grand bruit dans la presse patriote ! Mais le roi vous fait surveiller. Certains collègues estiment que vous avez été trop impulsif et risquez de compromettre les négociations.`,
        deltaInfluence: +10, deltaDanger: +14,
        effects: [
          { label: '⭐ Influence +10', type: 'up' },
          { label: '⚠️ Danger +14',    type: 'down' },
        ],
        journal : 'Quitté la salle des États Généraux en signe de protestation. Couverture dans les gazettes.',
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // ÉTAPE 2 – 20 juin 1789 : Serment du Jeu de Paume
  // ══════════════════════════════════════════════════
  {
    id      : 'serment-jeu-de-paume',
    badge   : 'Étape 2 / 11',
    title   : 'Le Serment du Jeu de Paume',
    date    : '20 juin 1789 — Versailles',
    context : `<strong>Contexte :</strong> Le roi a fait fermer la salle des États Généraux aux députés du Tiers-État qui viennent de se proclamer <em>Assemblée nationale</em>. Refusant de céder, les 577 représentants se retrouvent devant une salle de jeu de paume voisine, décidés à continuer coûte que coûte.`,
    narrative : `La pluie tombe sur Versailles. Devant la salle fermée à double tour, vos collègues hésitent. Puis quelqu'un crie : <em>« Le jeu de paume ! »</em>. Vous courez tous ensemble vers le vaste hangar. Là, entassés, en sueur, vibrants d'émotion, vous sentez que l'Histoire s'écrit. Mounier monte sur une table et propose que chaque député jure de ne pas se séparer avant d'avoir donné une Constitution à la France. <em>Votre tour vient de signer.</em>`,
    choices : [
      {
        title : 'Signer le serment avec enthousiasme',
        desc  : 'Vous montez sur l\'estrade, signez d\'une grande plume et proclamez : « Je jure au nom du peuple de France ! »',
        consequence : `Le serment est signé par 576 représentants. Votre nom figure en bonne place sur la liste historique. La presse vous cite comme l'un des plus ardents défenseurs du peuple. Vous devenez une figure connue du mouvement patriote.`,
        deltaInfluence: +12, deltaDanger: +6,
        effects: [
          { label: '⭐ Influence +12', type: 'up' },
          { label: '⚠️ Danger +6',    type: 'down' },
        ],
        journal : 'Signé le Serment du Jeu de Paume. Cité dans les gazettes patriotes.',
      },
      {
        title : 'Signer discrètement',
        desc  : 'Vous signez sans discours, mais avec conviction. Vous préférez laisser les orateurs s\'exprimer et garder votre énergie pour plus tard.',
        consequence : `Votre signature compte tout autant que les autres. Vous restez discret mais loyal. Un collègue vous glisse : <em>« Les vrais patriotes agissent, ils ne palabrent pas. »</em> Cela vous renforce dans votre détermination.`,
        deltaInfluence: +7, deltaDanger: +3,
        effects: [
          { label: '⭐ Influence +7', type: 'up' },
          { label: '⚠️ Danger +3',    type: 'warn' },
        ],
        journal : 'Signé discrètement le Serment du Jeu de Paume. Détermination renforcée.',
      },
      {
        title : 'Organiser la résistance si le roi réprime',
        desc  : 'Pendant la signature, vous organisez en coulisses un plan d\'action au cas où le roi enverrait des soldats disperser l\'assemblée.',
        consequence : `Votre prévoyance impressionne vos pairs. Grâce à vous, un réseau de messagers est mis en place. Mais vos préparatifs attirent l'attention de la police royale, qui commence à vous surveiller.`,
        deltaInfluence: +9, deltaDanger: +12,
        effects: [
          { label: '⭐ Influence +9', type: 'up' },
          { label: '⚠️ Danger +12',   type: 'down' },
        ],
        journal : 'Organisé un plan de résistance au Jeu de Paume. Surveillance royale signalée.',
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // ÉTAPE 3 – 14 juillet 1789 : Prise de la Bastille
  // ══════════════════════════════════════════════════
  {
    id      : 'prise-bastille',
    badge   : 'Étape 3 / 11',
    title   : 'La Prise de la Bastille',
    date    : '14 juillet 1789 — Paris',
    context : `<strong>Contexte :</strong> Le roi a renvoyé le ministre populaire Necker. Paris s'embrase. Des milliers de citoyens en armes convergent vers la Bastille, forteresse-prison qui symbolise le despotisme royal. C'est le début d'une insurrection populaire.`,
    narrative : `Les cloches de Paris sonnent à toute volée. Vous vous retrouvez pris dans le torrent humain qui déferle vers la Bastille. La fumée des mousquets flotte dans l'air chaud. Des femmes, des artisans, des soldats déserteurs — tout Paris est dans la rue. Le gouverneur de Launay hésite. Puis le pont-levis tombe. La foule envahit la forteresse dans un rugissement. <em>La Révolution vient de naître.</em> Que faites-vous ?`,
    choices : [
      {
        title : 'Rejoindre les assaillants',
        desc  : 'Vous saisissez un mousquet et combattez aux côtés du peuple de Paris pour prendre la Bastille.',
        consequence : `Vous participez à la prise de la Bastille ! Vous en revenez couvert de poudre et de gloire. Mais une balle vous a frôlé l'épaule. Paris vous acclame. Le récit de votre bravoure circule dans tous les quartiers.`,
        deltaInfluence: +18, deltaDanger: +18,
        effects: [
          { label: '⭐ Influence +18', type: 'up' },
          { label: '⚠️ Danger +18',    type: 'down' },
        ],
        journal : 'Participé à la prise de la Bastille. Héros populaire, mais blessure légère à l\'épaule.',
      },
      {
        title : 'Négocier pour éviter un bain de sang',
        desc  : 'Vous tentez de convaincre le gouverneur de rendre les armes pacifiquement pour éviter des morts inutiles.',
        consequence : `Votre tentative de négociation échoue — le gouverneur refuse. Mais votre courage d'interposition a sauvé plusieurs vies et vous vaut le respect des modérés. Vous témoignez de la capitulation de De Launay.`,
        deltaInfluence: +10, deltaDanger: +8,
        effects: [
          { label: '⭐ Influence +10', type: 'up' },
          { label: '⚠️ Danger +8',    type: 'warn' },
        ],
        journal : 'Tenté de négocier à la Bastille. Respect des modérés, mais échec de la médiation.',
      },
      {
        title : 'Documenter l\'événement pour la postérité',
        desc  : 'Vous restez en retrait, carnet en main, témoignant de chaque instant pour que la vérité soit connue de tous.',
        consequence : `Votre compte-rendu détaillé est publié dans la presse dès le lendemain. Historiens et journalistes vous citent. Votre influence intellectuelle grandit, même si certains sans-culottes vous reprochent votre prudence.`,
        deltaInfluence: +8, deltaDanger: +3,
        effects: [
          { label: '⭐ Influence +8', type: 'up' },
          { label: '⚠️ Danger +3',    type: 'warn' },
        ],
        journal : 'Témoigné et documenté la prise de la Bastille. Article publié dans la presse.',
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // ÉTAPE 4 – 4 août 1789 : Abolition des privilèges
  // ══════════════════════════════════════════════════
  {
    id      : 'abolition-privileges',
    badge   : 'Étape 4 / 11',
    title   : 'La Nuit du 4 Août',
    date    : '4 août 1789 — Versailles, Assemblée nationale',
    context : `<strong>Contexte :</strong> Dans tout le pays, des paysans brûlent les châteaux et refusent de payer les taxes féodales. Pour calmer la révolte, des nobles libéraux proposent à l'Assemblée d'abolir les privilèges. Dans une atmosphère électrisée, nobles et clercs se succèdent à la tribune pour renoncer à leurs droits : c'est la fin de l'Ancien Régime.`,
    narrative : `La salle de l'Assemblée est bondée. La nuit est tombée et des centaines de bougies éclairent des visages exaltés. Un duc, puis un vicomte, puis des évêques se lèvent pour renoncer à leurs droits féodaux sous les applaudissements. La foule est en délire. C'est l'heure de vérité pour le Tiers-État. <em>Que réclamez-vous pour le peuple ?</em>`,
    choices : [
      {
        title : 'Réclamer l\'abolition totale et immédiate',
        desc  : 'Vous exigez que l\'abolition des droits féodaux soit complète, sans indemnité pour les seigneurs.',
        consequence : `Votre radicalité est acclamée par les galeries populaires. Vous incarnez la voix des paysans. Mais plusieurs nobles libéraux qui vous soutenaient prennent leurs distances. La nuit du 4 août entre dans l'histoire.`,
        deltaInfluence: +14, deltaDanger: +10,
        effects: [
          { label: '⭐ Influence +14', type: 'up' },
          { label: '⚠️ Danger +10',    type: 'down' },
        ],
        journal : 'Réclamé l\'abolition totale des privilèges le 4 août. Soutien populaire massif.',
      },
      {
        title : 'Soutenir une abolition progressive avec compensation',
        desc  : 'Vous défendez une approche modérée : abolir les privilèges mais prévoir un rachat progressif pour éviter la ruine des nobles.',
        consequence : `Votre position pragmatique permet d'arracher l'accord des nobles libéraux. La loi passe plus facilement. Vous gagnez la réputation d'un législateur habile, mais les radicaux vous soupçonnent de ménager les privilégiés.`,
        deltaInfluence: +9, deltaDanger: +5,
        effects: [
          { label: '⭐ Influence +9', type: 'up' },
          { label: '⚠️ Danger +5',    type: 'warn' },
        ],
        journal : 'Soutenu une abolition progressive. Accordé le compromis avec les nobles libéraux.',
      },
      {
        title : 'Proposer la Déclaration des droits de l\'Homme',
        desc  : 'Vous profitez de l\'élan révolutionnaire pour avancer l\'idée d\'une déclaration solennelle des droits fondamentaux.',
        consequence : `L'idée fait mouche ! Elle sera reprise dans les semaines suivantes. On vous cite parmi les inspirateurs de la Déclaration des droits de l'Homme et du Citoyen du 26 août. Votre prestige intellectuel atteint son sommet.`,
        deltaInfluence: +16, deltaDanger: +7,
        effects: [
          { label: '⭐ Influence +16', type: 'up' },
          { label: '⚠️ Danger +7',     type: 'warn' },
        ],
        journal : 'Proposé une déclaration des droits. Cité parmi les inspirateurs de la DDHC.',
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // ÉTAPE 5 – 14 juillet 1790 : Fête de la Fédération
  // ══════════════════════════════════════════════════
  {
    id      : 'fete-federation',
    badge   : 'Étape 5 / 11',
    title   : 'La Fête de la Fédération',
    date    : '14 juillet 1790 — Champ-de-Mars, Paris',
    context : `<strong>Contexte :</strong> Un an après la prise de la Bastille, la France révolutionnaire célèbre son unité au Champ-de-Mars. 300 000 Parisiens et des fédérés de toutes les provinces se rassemblent autour du roi, qui jure fidélité à la Nation et à la Constitution. C'est un moment d'euphorie — la monarchie constitutionnelle semble possible.`,
    narrative : `Le ciel est bas mais la foule est immense. Des drapeaux tricolores partout. La Fayette passe en revue la garde nationale à cheval. Le roi prête serment sur l'autel de la Patrie sous des tonnerres d'applaudissements. La reine Marie-Antoinette élève le Dauphin dans ses bras. Vous êtes là, les larmes aux yeux. <em>Est-ce vraiment la paix entre le roi et le peuple ?</em>`,
    choices : [
      {
        title : 'Défendre la monarchie constitutionnelle',
        desc  : 'Vous pensez que le roi peut régner sous la loi. Vous prenez la parole pour célébrer cette réconciliation et appeler à l\'union.',
        consequence : `Votre discours est bien accueilli par les modérés et les Feuillants. Vous êtes invité à dîner chez La Fayette. Mais les radicaux murmurent que vous êtes trop proche du trône. La confiance entre le roi et le peuple reste fragile.`,
        deltaInfluence: +10, deltaDanger: +5,
        effects: [
          { label: '⭐ Influence +10', type: 'up' },
          { label: '⚠️ Danger +5',     type: 'warn' },
        ],
        journal : 'Défendu la monarchie constitutionnelle à la Fête de la Fédération. Proche des Feuillants.',
      },
      {
        title : 'Rester méfiant, surveiller la cour',
        desc  : 'Vous participez aux festivités mais gardez l\'œil ouvert. Des rumeurs circulent sur des complots royalistes. Vous enquêtez discrètement.',
        consequence : `Vos soupçons s'avèrent fondés : vous apprenez que le roi correspond secrètement avec des princes émigrés. Vous en informez des collègues de confiance. Votre clairvoyance vous vaut l'estime des patriotes vigilants.`,
        deltaInfluence: +7, deltaDanger: +8,
        effects: [
          { label: '⭐ Influence +7', type: 'up' },
          { label: '⚠️ Danger +8',    type: 'down' },
        ],
        journal : 'Enquêté sur les complots royalistes lors de la Fête de la Fédération. Informé les patriotes.',
      },
      {
        title : 'Rappeler les problèmes sociaux non résolus',
        desc  : 'Au milieu des festivités, vous montez sur une tribune improvisée pour rappeler que des millions de pauvres ont encore faim.',
        consequence : `Votre intervention crée un froid parmi les notables, mais les sans-culottes présents vous ovationent. Les journaux de gauche vous consacrent leur une. Vous devenez le porte-voix des humbles — et une cible pour les conservateurs.`,
        deltaInfluence: +13, deltaDanger: +12,
        effects: [
          { label: '⭐ Influence +13', type: 'up' },
          { label: '⚠️ Danger +12',    type: 'down' },
        ],
        journal : 'Rappelé les problèmes sociaux lors de la Fête de la Fédération. Applaudi par les sans-culottes.',
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // ÉTAPE 6 – 21 juin 1791 : Fuite à Varennes
  // ══════════════════════════════════════════════════
  {
    id      : 'fuite-varennes',
    badge   : 'Étape 6 / 11',
    title   : 'La Fuite à Varennes',
    date    : '21 juin 1791 — Paris / Varennes',
    context : `<strong>Contexte :</strong> Choc total ! Dans la nuit du 20 au 21 juin, la famille royale s'est enfuie en secret vers la frontière autrichienne. Arrêtée à Varennes, elle est ramenée à Paris sous escorte. Le roi a trahi son serment constitutionnel. La confiance est brisée. Une onde de colère et d'incrédulité traverse le pays.`,
    narrative : `Vous apprenez la nouvelle au petit matin en entendant les cloches d'alarme. Paris est en état de sidération, puis de rage. Partout on lacère les portraits du roi. Des affiches proclament : <em>« Roi fugitif = Roi traître »</em>. À l'Assemblée, la tension est extrême. Que faire de Louis XVI ? <em>La monarchie peut-elle survivre à cette trahison ?</em>`,
    choices : [
      {
        title : 'Réclamer la déchéance du roi',
        desc  : 'Vous rejoignez ceux qui estiment que la trahison du roi est un crime impardonnable et qu\'il faut proclamer la République.',
        consequence : `Votre position vous range parmi les Républicains, minoritaires mais en plein essor. La pétition du Champ-de-Mars que vous signez sera dispersée dans le sang (massacre du Champ-de-Mars, 17 juillet 1791). Vous échappez de justesse aux gardes nationaux de La Fayette.`,
        deltaInfluence: +12, deltaDanger: +22,
        effects: [
          { label: '⭐ Influence +12', type: 'up' },
          { label: '⚠️ Danger +22',    type: 'down' },
        ],
        journal : 'Réclamé la déchéance du roi après Varennes. Signé la pétition du Champ-de-Mars. Danger extrême.',
      },
      {
        title : 'Suspendre le roi, maintenir la Constitution',
        desc  : 'Vous rejoignez la majorité constitutionnelle : le roi est suspendu, mais la monarchie est conservée pour préserver la stabilité.',
        consequence : `L'Assemblée adopte la suspension. La Constitution est révisée. Vous êtes du bon côté de la majorité, mais vous savez que cette solution est fragile. La confiance dans le roi est morte — seule la peur du chaos le maintient en place.`,
        deltaInfluence: +6, deltaDanger: +8,
        effects: [
          { label: '⭐ Influence +6', type: 'up' },
          { label: '⚠️ Danger +8',    type: 'warn' },
        ],
        journal : 'Soutenu la suspension du roi. Position constitutionnelle modérée adoptée.',
      },
      {
        title : 'Interroger personnellement les gardes de Varennes',
        desc  : 'Vous vous rendez à Varennes pour recueillir les témoignages et comprendre comment la fuite a été organisée.',
        consequence : `Votre enquête révèle un réseau de complices royalistes et étrangers. Votre rapport, lu à l'Assemblée, fait scandale. Vous devenez une autorité en matière de contre-espionnage patriote.`,
        deltaInfluence: +14, deltaDanger: +10,
        effects: [
          { label: '⭐ Influence +14', type: 'up' },
          { label: '⚠️ Danger +10',    type: 'down' },
        ],
        journal : 'Enquêté à Varennes. Rapport lu à l\'Assemblée, réseau royaliste démasqué.',
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // ÉTAPE 7 – 1792 : Guerre et chute de la monarchie
  // ══════════════════════════════════════════════════
  {
    id      : 'guerre-chute-monarchie',
    badge   : 'Étape 7 / 11',
    title   : 'Guerre et Chute de la Monarchie',
    date    : 'Avril – Août 1792 — Paris',
    context : `<strong>Contexte :</strong> La France est en guerre contre l'Autriche et la Prusse. Les armées ennemies avancent vers Paris. Un manifeste menace de détruire la ville si le roi est touché. La colère monte. Le 10 août 1792, une foule armée prend d'assaut les Tuileries, résidence du roi. La monarchie s'effondre.`,
    narrative : `Les canons tonnent au loin. Paris se barricade. La Marseillaise résonne dans les rues pavoisées de rouge. Le 10 août, la foule franchit les grilles des Tuileries. Les gardes suisses résistent — plusieurs centaines de morts. Le roi se réfugie à l'Assemblée. Il est suspendu, puis emprisonné au Temple. <em>En quelques heures, mille ans de royauté s'effondrent.</em>`,
    choices : [
      {
        title : 'Rejoindre les fédérés pour défendre la République',
        desc  : 'Vous prenez les armes avec les fédérés marseillais pour défendre la Révolution contre les ennemis intérieurs et extérieurs.',
        consequence : `Vous participez à la défense de la Révolution. Votre courage lors des combats de rue vous vaut une réputation de patriote intègre. Mais vous avez vu des massacres. La violence de la foule vous trouble profondément.`,
        deltaInfluence: +15, deltaDanger: +20,
        effects: [
          { label: '⭐ Influence +15', type: 'up' },
          { label: '⚠️ Danger +20',    type: 'down' },
        ],
        journal : 'Combattu avec les fédérés le 10 août 1792. Monarchie renversée. Blessure légère.',
      },
      {
        title : 'Réclamer un procès légal pour le roi',
        desc  : 'Vous pensez que le roi doit être jugé selon la loi, pas liquidé par la rue. Vous défendez cette position à l\'Assemblée.',
        consequence : `Votre position juridique est respectée par les modérés. Mais les Montagnards de Robespierre vous regardent d'un mauvais œil. Vous êtes catalogué comme « trop doux ». Un risque pour les mois à venir.`,
        deltaInfluence: +7, deltaDanger: +12,
        effects: [
          { label: '⭐ Influence +7', type: 'up' },
          { label: '⚠️ Danger +12',   type: 'down' },
        ],
        journal : 'Réclamé un procès légal pour le roi. Méfiance des Montagnards.',
      },
      {
        title : 'Fuir Paris temporairement',
        desc  : 'La violence des journées d\'août vous terrifie. Vous quittez discrètement Paris pour votre province natale en attendant que la tempête passe.',
        consequence : `Vous échappez aux massacres de Septembre 1792. Mais votre absence est remarquée. On vous soupçonne de sympathies royalistes. Votre retour à Paris sera risqué.`,
        deltaInfluence: -10, deltaDanger: -15,
        effects: [
          { label: '📉 Influence −10', type: 'down' },
          { label: '🛡 Danger −15',     type: 'up' },
        ],
        journal : 'Fui Paris en août 1792. Absent des journées cruciales. Réputation entachée.',
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // ÉTAPE 8 – 21 janvier 1793 : Exécution de Louis XVI
  // ══════════════════════════════════════════════════
  {
    id      : 'execution-louis-xvi',
    badge   : 'Étape 8 / 11',
    title   : 'L\'Exécution de Louis XVI',
    date    : '21 janvier 1793 — Place de la Révolution, Paris',
    context : `<strong>Contexte :</strong> Après un procès devant la Convention nationale, Louis XVI est reconnu coupable de trahison. Le vote sur la peine est capital : mort ou prison ? La Convention est divisée. Votre vote peut changer le cours de l'histoire.`,
    narrative : `Le froid est glacial en ce matin de janvier. Les membres de la Convention ont voté toute la nuit. La mort l'emporte à une faible majorité. Ce matin, Louis Capet monte sur l'échafaud place de la Révolution. La foule est silencieuse. Puis la tête tombe. Un grand cri monte vers le ciel de plomb. <em>Comment avez-vous voté ?</em>`,
    choices : [
      {
        title : 'Voter la mort',
        desc  : 'Vous estimez que la trahison du roi ne peut être pardonnée. Vous votez la mort, sans appel au peuple.',
        consequence : `Vous faites partie des régicides. Ce vote vous lie définitivement à la Révolution radicale. Les Montagnards vous accueillent fraternellement. Mais si la Révolution tourne mal, vous serez un des premiers accusés.`,
        deltaInfluence: +10, deltaDanger: +20,
        effects: [
          { label: '⭐ Influence +10', type: 'up' },
          { label: '⚠️ Danger +20',    type: 'down' },
        ],
        journal : 'Voté la mort de Louis XVI. Régicide. Lié aux Montagnards.',
      },
      {
        title : 'Voter la détention et l\'appel au peuple',
        desc  : 'Vous refusez la peine de mort et demandez que la décision soit soumise au vote populaire.',
        consequence : `Votre position est celle des Girondins. Vous êtes mis en minorité, mais votre conscience est saine. Les Montagnards vous cataloguent comme ennemi. Votre danger politique augmente considérablement.`,
        deltaInfluence: -5, deltaDanger: +18,
        effects: [
          { label: '📉 Influence −5', type: 'down' },
          { label: '⚠️ Danger +18',   type: 'down' },
        ],
        journal : 'Voté contre la mort du roi — appel au peuple réclamé. Catalogué comme Girondin.',
      },
      {
        title : 'Voter la mort avec sursis',
        desc  : 'Vous votez la mort mais demandez un sursis pour tenter une dernière négociation diplomatique.',
        consequence : `Le sursis est rejeté par la majorité montagnarde. Votre position nuancée vous isole politiquement des deux camps. On vous traite de « ventre mou ». Mais votre intégrité morale reste intacte.`,
        deltaInfluence: +2, deltaDanger: +14,
        effects: [
          { label: '⭐ Influence +2', type: 'warn' },
          { label: '⚠️ Danger +14',   type: 'down' },
        ],
        journal : 'Voté la mort avec sursis. Isolé politiquement des deux camps.',
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // ÉTAPE 9 – 1793-1794 : La Terreur
  // ══════════════════════════════════════════════════
  {
    id      : 'terreur',
    badge   : 'Étape 9 / 11',
    title   : 'La Terreur',
    date    : 'Juin 1793 – Juillet 1794 — Paris',
    context : `<strong>Contexte :</strong> La France est encerclée par les armées étrangères. À l'intérieur, des insurrections menacent la République. Le Comité de Salut Public, dominé par Robespierre, instaure la Terreur : des milliers de personnes sont guillotinées sans procès équitable. Nul n'est en sécurité.`,
    narrative : `La charrette passe quotidiennement place de la Révolution. Les accusateurs du tribunal révolutionnaire voient des traîtres partout. Des amis ont déjà été arrêtés. Un matin, on frappe à votre porte. C'est un comité de sûreté. Ils cherchent des preuves de contre-révolution. <em>Votre cœur s'arrête.</em>`,
    choices : [
      {
        title : 'Collaborer avec le Comité de Salut Public',
        desc  : 'Vous devenez vous-même agent de la Terreur pour survivre : vous dénoncez des suspects et collaborez avec Robespierre.',
        consequence : `Vous survivez — pour l'instant. Mais chaque nuit est un cauchemar. Vous avez envoyé des innocents à l'échafaud. Votre danger diminue, mais votre âme est meurtrie. Et si Robespierre tombe, vous tomberez avec lui.`,
        deltaInfluence: +5, deltaDanger: -15,
        effects: [
          { label: '⭐ Influence +5', type: 'warn' },
          { label: '🛡 Danger −15',    type: 'up' },
        ],
        journal : 'Collaboré avec le Comité de Salut Public pendant la Terreur. Survivant — mais à quel prix.',
      },
      {
        title : 'Résister en secret, protéger des innocents',
        desc  : 'Au péril de votre vie, vous cachez des suspects et sauvez des familles menacées d\'arrestation.',
        consequence : `Vous devenez un héros de l'ombre. Des familles vous doivent la vie. Mais la police révolutionnaire est sur vos traces. Vous dormez peu. Chaque jour peut être le dernier. Votre courage force l'admiration.`,
        deltaInfluence: +16, deltaDanger: +25,
        effects: [
          { label: '⭐ Influence +16', type: 'up' },
          { label: '⚠️ Danger +25',    type: 'down' },
        ],
        journal : 'Résisté en secret pendant la Terreur — sauvé des innocents. Danger maximum.',
      },
      {
        title : 'Quitter Paris et se cacher en province',
        desc  : 'Vous fuyez Paris et vous cachez dans un village de province, attendant la fin de la Terreur.',
        consequence : `Vous échappez à la guillotine. Caché dans votre province natale, vous attendez que la tempête passe. Des nouvelles de Paris vous parviennent au compte-gouttes. Vous ne savez pas encore ce qui vous attend à votre retour — mais vous êtes vivant, et c'est déjà un miracle.`,
        deltaInfluence: -12, deltaDanger: -20,
        effects: [
          { label: '📉 Influence −12', type: 'down' },
          { label: '🛡 Danger −20',     type: 'up' },
        ],
        journal : 'Fui Paris pendant la Terreur. Caché en province. Retour difficile à venir.',
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // ÉTAPE 10 – 27 juillet 1794 : 9 Thermidor
  // ══════════════════════════════════════════════════
  {
    id      : 'thermidor',
    badge   : 'Étape 10 / 11',
    title   : 'La Chute de Robespierre',
    date    : '9 Thermidor an II (27 juillet 1794) — Paris, Convention nationale',
    context : `<strong>Contexte :</strong> Depuis plus d'un an, la France vit sous la Terreur. Le Comité de Salut Public, dominé par Maximilien Robespierre, envoie chaque jour des centaines de personnes à la guillotine. Mais la peur a fini par se retourner contre lui : ses propres alliés craignent d'être les prochains sur la liste. Le 9 Thermidor, une coalition de députés décide de l'abattre avant d'être eux-mêmes accusés.`,
    narrative : `Ce matin du 27 juillet, la salle de la Convention crépite d'une tension électrique. Depuis plusieurs semaines, Robespierre a multiplié les discours menaçants sans jamais nommer ses cibles — et chacun tremble pour sa tête. Soudain, quand il monte à la tribune, des cris fusent de toutes parts : <em>« À bas le tyran ! »</em>, <em>« Arrêtez-le ! »</em>. Il tente de parler — sa voix se brise. Le président agite sa cloche, couvert par le vacarme. La salle hurle. C'est le chaos total. <em>L'Incorruptible est en train de tomber. Quelle part prenez-vous dans sa chute ?</em>`,
    choices : [
      {
        title : 'Prendre la parole pour accuser Robespierre',
        desc  : 'Vous montez à la tribune et criez avec les autres : "La tyrannie doit cesser !" Vous réclamez son arrestation immédiate.',
        consequence : `Votre voix porte dans le tumulte. Robespierre, Saint-Just et Couthon sont arrêtés sur-le-champ. Le lendemain, ils sont guillotinés sans procès — ironie cruelle pour des hommes qui en avaient envoyé tant d'autres à l'échafaud. Vous êtes salué comme l'un des artisans de Thermidor. Le danger s'évanouit enfin. Une page noire de la Révolution se tourne.`,
        deltaInfluence: +16, deltaDanger: -22,
        effects: [
          { label: '⭐ Influence +16', type: 'up' },
          { label: '🛡 Danger −22',    type: 'up' },
        ],
        journal : 'Participé activement au coup de Thermidor. Arrestation de Robespierre réclamée à la tribune.',
      },
      {
        title : 'Voter l\'arrestation sans prendre la parole',
        desc  : 'Vous levez la main pour voter l\'arrestation de Robespierre, mais sans vous exposer en prenant la parole publiquement.',
        consequence : `Robespierre est arrêté et guillotiné le lendemain 10 Thermidor. La Terreur s'effondre avec lui. Votre vote discret vous protège des représailles sans vous exposer inutilement. Le Directoire qui suit vous offre une place honorable dans les nouvelles institutions républicaines.`,
        deltaInfluence: +9, deltaDanger: -16,
        effects: [
          { label: '⭐ Influence +9', type: 'up' },
          { label: '🛡 Danger −16',   type: 'up' },
        ],
        journal : 'Voté discrètement l\'arrestation de Robespierre au 9 Thermidor. Position prudente et efficace.',
      },
      {
        title : 'Libérer les prisonniers politiques dans la nuit',
        desc  : 'Profitant du chaos, vous vous précipitez vers les prisons pour faire libérer des détenus injustement condamnés avant qu\'il ne soit trop tard.',
        consequence : `Dans la nuit du 9 au 10 Thermidor, vous faites libérer une dizaine de prisonniers : des intellectuels, des anciens Girondins, des innocents piégés par la machine de la Terreur. Votre geste humaniste vous vaut une réputation de juste. Mais les partisans de Robespierre, qui résistent encore à l'Hôtel de Ville, vous tirent dessus. Vous vous en sortez avec une égratignure — et une conscience nette.`,
        deltaInfluence: +18, deltaDanger: +8,
        effects: [
          { label: '⭐ Influence +18', type: 'up' },
          { label: '⚠️ Danger +8',     type: 'down' },
        ],
        journal : 'Libéré des prisonniers politiques dans la nuit de Thermidor. Blessure légère mais conscience nette.',
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // ÉTAPE 11 – 1799 : Coup d'État de Napoléon
  // ══════════════════════════════════════════════════
  {
    id      : 'coup-napoleon',
    badge   : 'Étape 11 / 11 — FINALE',
    title   : 'Le Coup d\'État de Napoléon',
    date    : '18 Brumaire (9 novembre 1799) — Saint-Cloud',
    context : `<strong>Contexte :</strong> La République est épuisée par dix ans de guerres et d'instabilité. Le Directoire, au pouvoir depuis 1795, est corrompu et impopulaire. Le général Napoléon Bonaparte, auréolé de ses victoires en Italie et en Égypte, prépare un coup d'État avec ses complices Sieyès et Talleyrand. La République est en danger.`,
    narrative : `Le Conseil des Cinq-Cents se réunit à Saint-Cloud. Soudain, des grenadiers envahissent la salle. Napoléon entre, visage tendu, et exige la dissolution du Conseil. Des cris : <em>« Hors la loi ! Sabre ! »</em> La salle chavire. C'est le chaos. Les députés s'enfuient par les fenêtres. Napoléon reste maître du terrain. <em>La République vient de mourir. Quelle sera votre dernière action ?</em>`,
    choices : [
      {
        title : 'Résister publiquement à Bonaparte',
        desc  : 'Vous montez sur une table et criez : « Vive la République ! » face aux soldats de Bonaparte.',
        consequence : ``,  // géré dynamiquement via endGame
        deltaInfluence: +20, deltaDanger: +30,
        effects: [
          { label: '⭐ Influence +20', type: 'up' },
          { label: '⚠️ Danger +30',    type: 'down' },
        ],
        journal : 'Résisté publiquement à Bonaparte au 18 Brumaire. Acte héroïque.',
        endType : 'finale-resistance',
      },
      {
        title : 'Rallier Bonaparte pour sauver ce qui peut l\'être',
        desc  : 'Vous pensez que Bonaparte peut stabiliser la France et préserver certains acquis révolutionnaires. Vous le rejoignez.',
        consequence : ``,
        deltaInfluence: +8, deltaDanger: -15,
        effects: [
          { label: '⭐ Influence +8', type: 'warn' },
          { label: '🛡 Danger −15',    type: 'up' },
        ],
        journal : 'Rallié Bonaparte au 18 Brumaire. Choix de la survie politique.',
        endType : 'finale-ralliement',
      },
      {
        title : 'Fuir à l\'étranger pour continuer le combat républicain',
        desc  : 'Vous refusez de vous soumettre ou de collaborer. Vous quittez la France vers l\'Angleterre ou les États-Unis.',
        consequence : ``,
        deltaInfluence: +5, deltaDanger: -25,
        effects: [
          { label: '⭐ Influence +5', type: 'warn' },
          { label: '🛡 Danger −25',    type: 'up' },
        ],
        journal : 'Fui en exil après le coup d\'État. Continué le combat républicain depuis l\'étranger.',
        endType : 'finale-exil',
      },
    ],
  },
];

// ─── Fins narratives ──────────────────────────────────────────
function computeEnding() {
  const { influence, danger } = state;
  const lastChoice = state.choices[state.choices.length - 1];
  const endType    = lastChoice?.endType || '';

  if (endType === 'finale-resistance') {
    if (danger > 85) {
      return {
        type    : 'fallen',
        icon    : '⚔️',
        title   : 'Le Martyr de la République',
        subtitle: 'Vous avez choisi la mort plutôt que la servitude.',
        story   : `Face aux baïonnettes de Bonaparte, vous avez crié votre foi en la République jusqu'au dernier souffle. Arrêté, jugé, vous avez été fusillé au petit matin. Mais votre nom est gravé dans la mémoire des hommes libres. Des générations futures liront votre résistance comme un symbole. <em>La liberté a un prix.</em>`,
        histNote: `La résistance au coup d'État du 18 Brumaire fut minoritaire. La plupart des républicains capitulèrent ou se turent. Bonaparte devint Premier Consul, puis Consul à vie, puis Empereur en 1804.`,
      };
    } else {
      return {
        type    : 'triumph',
        icon    : '🗽',
        title   : 'La Voix de la République',
        subtitle: 'Votre courage a traversé les âges.',
        story   : `Vous avez crié « Vive la République ! » face aux soldats, et votre geste a été vu par des centaines de témoins. Arrêté puis relâché grâce à votre popularité, vous avez continué à écrire, à militer, à témoigner. Vos mémoires, publiés en 1815, sont devenus un classique de la pensée républicaine française.`,
        histNote: `Napoléon Bonaparte instaura le Consulat puis l'Empire (1804-1814). Les idéaux révolutionnaires furent en partie préservés : le Code civil (1804) reprit plusieurs acquis de 1789. La IIIe République (1870) porta enfin les fruits de la Révolution.`,
      };
    }
  }

  if (endType === 'finale-ralliement') {
    if (influence >= 60) {
      return {
        type    : 'survivor',
        icon    : '🏛',
        title   : 'Le Serviteur de l\'Empire',
        subtitle: 'Vous avez survécu en vous adaptant.',
        story   : `Vous avez rejoint Bonaparte et obtenu un poste de préfet sous l'Empire. Vous avez préservé certains acquis révolutionnaires dans votre département : l'école publique, l'abolition des privilèges féodaux. Pragmatique, vous avez choisi la survie des idées sur celle des symboles.`,
        histNote: `Beaucoup de révolutionnaires de 1789 servirent sous l'Empire. Napoléon utilisa les cadres de la Révolution pour gouverner, tout en en trahissant l'esprit démocratique.`,
      };
    } else {
      return {
        type    : 'fallen',
        icon    : '😔',
        title   : 'Le Résigné',
        subtitle: 'Vous avez choisi la sécurité au détriment de vos idéaux.',
        story   : `En ralliant Bonaparte, vous avez trahi les serments du Jeu de Paume. Votre influence, déjà fragile, s'est évanouie. Les anciens amis vous tournent le dos. Vous finissez vos jours dans l'oubli, hanté par le souvenir de ce que vous auriez pu être.`,
        histNote: `Le 18 Brumaire (9 novembre 1799) marqua la fin de la Révolution française et l'avènement du Consulat. Bonaparte abolit les libertés politiques tout en conservant les acquis sociaux.`,
      };
    }
  }

  if (endType === 'finale-exil') {
    return {
      type    : 'survivor',
      icon    : '⛵',
      title   : 'Le Républicain en Exil',
      subtitle: 'Vous avez choisi la liberté plutôt que le compromis.',
      story   : `Depuis Londres ou Philadelphie, vous avez continué à écrire des pamphlets républicains. Vos textes ont circulé clandestinement en France. Vous avez vécu pour voir la chute de Napoléon en 1814 et le retour des espoirs républicains. Un jour, peut-être, vous rentrerez.`,
      histNote: `De nombreux révolutionnaires choisirent l'exil plutôt que la collaboration avec l'Empire. Certains rentrèrent en France après 1815 et jouèrent un rôle dans les révolutions de 1830 et 1848.`,
    };
  }

  // Fin générique selon les stats
  if (danger >= 90) {
    return {
      type    : 'dead',
      icon    : '💀',
      title   : 'La Guillotine',
      subtitle: 'Votre témérité vous a coûté la vie.',
      story   : `La Terreur vous a rattrapé. Un soir, des hommes du Comité de Salut Public sont venus frapper à votre porte. Accusé de conspiration, vous avez été guillotiné sans procès équitable. Votre nom fut réhabilité sous le Directoire. Trop tard.`,
      histNote: `Entre 1793 et 1794, près de 40 000 personnes furent exécutées ou moururent en prison pendant la Terreur. Robespierre lui-même fut guillotiné le 9 Thermidor an II (27 juillet 1794).`,
    };
  }
  if (influence >= 70 && danger < 60) {
    return {
      type    : 'triumph',
      icon    : '🌟',
      title   : 'Le Père de la Nation',
      subtitle: 'Votre sagesse a guidé la France vers la liberté.',
      story   : `Dix ans de combats, de discours, d'alliances et de courage. Vous avez traversé les tempêtes de la Révolution en gardant la tête et les idéaux. Élu au Conseil des Anciens sous le Directoire, votre nom est associé aux grandes lois de la République. La France se souviendra de vous.`,
      histNote: `La Révolution française (1789-1799) a profondément transformé la France et le monde : fin de l'Ancien Régime, Déclaration des droits de l'Homme, abolition de la féodalité, adoption du principe de souveraineté nationale.`,
    };
  }
  if (influence >= 40) {
    return {
      type    : 'survivor',
      icon    : '🕊',
      title   : 'Le Survivant',
      subtitle: 'Vous avez traversé la Révolution, meurtri mais debout.',
      story   : `Ni héros ni traître, vous avez navigué entre les tempêtes révolutionnaires avec prudence. Vous finissez la décennie fatigué, parfois désillusionné, mais vivant. Et dans votre cœur brûle encore la flamme des droits de l'Homme que vous avez contribué à proclamer.`,
      histNote: `La Révolution française a planté les germes des démocraties modernes : séparation des pouvoirs, droits fondamentaux, citoyenneté. Ses idéaux ont inspiré les révolutions de 1848 et la démocratisation progressive de l'Europe.`,
    };
  }
  return {
    type    : 'fallen',
    icon    : '🌑',
    title   : 'Dans les Ténèbres de l\'Histoire',
    subtitle: 'La Révolution vous a avalé.',
    story   : `Vous n'avez pas su choisir votre camp, ni défendre vos idéaux avec assez de conviction. Entre les factions rivales, vous avez été broyé par l'engrenage révolutionnaire. Votre mémoire s'est perdue dans les archives poussiéreuses d'une époque qui ne pardonnait pas l'hésitation.`,
    histNote: `La Révolution française a exigé des choix impossibles. Des milliers d'hommes et de femmes ont péri, non pas par lâcheté, mais parce que les événements les dépassaient. L'Histoire retient les héros et les traîtres ; elle oublie les autres.`,
  };
}

// ─── Utilitaires ──────────────────────────────────────────────
function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function updateHUD() {
  document.getElementById('val-influence').textContent = state.influence;
  document.getElementById('val-danger').textContent    = state.danger;
  document.getElementById('bar-influence').style.width = state.influence + '%';
  document.getElementById('bar-danger').style.width    = state.danger    + '%';
  document.getElementById('hud-name').textContent = 'Citoyen ' + state.playerName;
}

function addJournalEntry(date, text) {
  state.journal.push({ date, text });
  const container = document.getElementById('journal-entries');
  const entry     = document.createElement('div');
  entry.className = 'journal-entry';
  entry.innerHTML = `<span class="je-date">${date}</span><span>${text}</span>`;
  container.prepend(entry);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.style.display = (id === 'screen-game') ? 'block' : 'flex';
  el.classList.add('active');
  window.scrollTo(0, 0);
}

// ─── Événements aléatoires ────────────────────────────────────
function maybeRandomEvent(afterCallback) {
  // 35 % de chance à chaque étape (sauf la 1ère et la dernière)
  if (state.step === 0 || state.step >= STEPS.length - 1) {
    afterCallback();
    return;
  }
  if (Math.random() > 0.35) {
    afterCallback();
    return;
  }
  const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  state.influence = clamp(state.influence + ev.deltaInfluence);
  state.danger    = clamp(state.danger    + ev.deltaDanger);
  updateHUD();

  const panel = document.getElementById('random-event-panel');
  document.getElementById('re-text').innerHTML = ev.text;
  const efDiv = document.getElementById('re-effects');
  efDiv.innerHTML = '';
  ev.effects.forEach(txt => {
    const isPositive = txt.includes('+') && !txt.includes('Danger');
    const isDanger   = txt.includes('Danger');
    const tag = document.createElement('span');
    tag.className = 're-effect-tag ' + (isDanger ? 'negative' : (isPositive ? 'positive' : 'neutral'));
    tag.textContent = txt;
    efDiv.appendChild(tag);
  });

  panel.classList.remove('hidden');
  document.getElementById('re-close').onclick = () => {
    panel.classList.add('hidden');
    afterCallback();
  };
}

// ─── Moteur de scène ──────────────────────────────────────────
function renderStep(stepIndex) {
  // Vérifier mort par danger
  if (state.danger >= 100) {
    state.alive = false;
    endGame({
      type    : 'dead',
      icon    : '💀',
      title   : 'La Guillotine',
      subtitle: 'Votre témérité vous a coûté la vie.',
      story   : `La Terreur vous a rattrapé. Un soir, des hommes du Comité de Salut Public sont venus frapper à votre porte. Accusé de conspiration, vous avez été guillotiné sans procès équitable. Votre nom fut réhabilité sous le Directoire. Trop tard.`,
      histNote: `Entre 1793 et 1794, près de 40 000 personnes furent exécutées ou moururent en prison pendant la Terreur. Robespierre lui-même fut guillotiné le 9 Thermidor an II (27 juillet 1794).`,
    });
    return;
  }

  if (stepIndex >= STEPS.length) {
    endGame(computeEnding());
    return;
  }

  const step = STEPS[stepIndex];
  state.step = stepIndex;

  // Mise à jour HUD date
  document.getElementById('hud-date').textContent = step.date.split('—')[0].trim();

  const card = document.getElementById('scene-card');

  // Animation de transition
  card.classList.add('transition-out');
  setTimeout(() => {
    card.classList.remove('transition-out');

    // Remplir le contenu
    document.getElementById('scene-step-badge').textContent = step.badge;
    document.getElementById('scene-title').textContent       = step.title;
    document.getElementById('scene-date').textContent        = step.date;
    document.getElementById('scene-context').innerHTML       = step.context;
    document.getElementById('scene-narrative').innerHTML     = step.narrative;

    // Choix
    const choiceArea = document.getElementById('choice-area');
    choiceArea.innerHTML = '<p class="choice-label">Que faites-vous ?</p>';

    step.choices.forEach((ch, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `
        <span class="choice-num">${i + 1}</span>
        <span class="choice-text">
          <span class="choice-title">${ch.title}</span>
          <span class="choice-desc">${ch.desc}</span>
        </span>
      `;
      btn.addEventListener('click', () => handleChoice(stepIndex, i));
      choiceArea.appendChild(btn);
    });

    card.classList.add('transition-in');
    setTimeout(() => card.classList.remove('transition-in'), 450);
  }, 350);
}

// ─── Gestion d'un choix ───────────────────────────────────────
function handleChoice(stepIndex, choiceIndex) {
  const step   = STEPS[stepIndex];
  const choice = step.choices[choiceIndex];

  // Désactiver tous les boutons
  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);

  // Appliquer effets
  state.influence = clamp(state.influence + choice.deltaInfluence);
  state.danger    = clamp(state.danger    + choice.deltaDanger);
  updateHUD();

  // Mémoriser
  state.choices.push({ ...choice, step: step.id });

  // Journal
  addJournalEntry(step.date.split('—')[0].trim(), choice.journal);

  // Afficher conséquence
  const choiceArea = document.getElementById('choice-area');
  const conseq = document.createElement('div');
  conseq.className = 'consequence-panel';

  const effectsHTML = choice.effects.map(e =>
    `<span class="effect-tag ${e.type}">${e.label}</span>`
  ).join('');

  conseq.innerHTML = `
    <div class="consequence-header">⚖️ Conséquence de votre choix</div>
    <p class="consequence-text">${choice.consequence}</p>
    <div class="consequence-effects">${effectsHTML}</div>
    <button class="btn-next" id="btn-next-step">▶ Étape suivante</button>
  `;
  choiceArea.appendChild(conseq);

  document.getElementById('btn-next-step').addEventListener('click', () => {
    // Vérifier danger critique
    if (state.danger >= 100) {
      endGame({
        type    : 'dead',
        icon    : '💀',
        title   : 'La Guillotine',
        subtitle: 'Votre témérité vous a coûté la vie.',
        story   : `La Terreur vous a rattrapé. Un soir, des hommes du Comité de Salut Public sont venus frapper à votre porte. Accusé de conspiration, vous avez été guillotiné sans procès équitable. Votre nom fut réhabilité sous le Directoire. Trop tard.`,
        histNote: `Entre 1793 et 1794, près de 40 000 personnes furent exécutées ou moururent en prison pendant la Terreur. Robespierre lui-même fut guillotiné le 9 Thermidor an II (27 juillet 1794).`,
      });
      return;
    }

    // Étape finale ?
    if (stepIndex >= STEPS.length - 1) {
      endGame(computeEnding());
      return;
    }

    // Événement aléatoire possible
    maybeRandomEvent(() => renderStep(stepIndex + 1));
  });
}

// ─── Fin de partie ────────────────────────────────────────────
function endGame(ending) {
  showScreen('screen-end');

  document.getElementById('end-icon').textContent       = ending.icon;
  document.getElementById('end-title').textContent      = ending.title;
  document.getElementById('end-subtitle').textContent   = ending.subtitle;
  document.getElementById('end-story').innerHTML        = ending.story;

  // Stats
  document.getElementById('end-stats').innerHTML = `
    <div class="end-stat">
      <span class="end-stat-val" style="color:#74b9ff">${state.influence}</span>
      <span class="end-stat-label">Influence</span>
    </div>
    <div class="end-stat">
      <span class="end-stat-val" style="color:${state.danger > 70 ? '#e17055' : '#55efc4'}">${state.danger}</span>
      <span class="end-stat-label">Danger</span>
    </div>
    <div class="end-stat">
      <span class="end-stat-val">${state.choices.length}</span>
      <span class="end-stat-label">Décisions</span>
    </div>
  `;

  document.getElementById('end-history').innerHTML = `
    <h4>📚 Le saviez-vous ?</h4>
    <p>${ending.histNote}</p>
  `;
}

// ─── Lancement du jeu ─────────────────────────────────────────
function startGame(name) {
  state.playerName = name || 'Dupont';
  state.influence  = 50;
  state.danger     = 20;
  state.step       = 0;
  state.journal    = [];
  state.choices    = [];
  state.alive      = true;

  document.getElementById('journal-entries').innerHTML = '';
  updateHUD();
  showScreen('screen-game');
  renderStep(0);
}

// ─── Événements DOM ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Formulaire de démarrage
  document.getElementById('form-name').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('player-name').value.trim();
    startGame(name || 'Dupont');
  });

  // Redémarrer
  document.getElementById('btn-restart').addEventListener('click', () => {
    document.getElementById('player-name').value = '';
    showScreen('screen-title');
    // Reset screen title
    document.getElementById('screen-title').style.display = 'flex';
    document.getElementById('screen-title').classList.add('active');
    document.getElementById('screen-end').classList.remove('active');
    document.getElementById('screen-game').classList.remove('active');
  });

  // Journal toggle
  document.getElementById('journal-toggle').addEventListener('click', () => {
    const entries = document.getElementById('journal-entries');
    const arrow   = document.getElementById('journal-arrow');
    entries.classList.toggle('open');
    arrow.textContent = entries.classList.contains('open') ? '▲' : '▼';
  });

  // Afficher l'écran titre correctement
  document.getElementById('screen-title').style.display = 'flex';
});
