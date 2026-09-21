import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageCircle,
  X,
  Send,
  ExternalLink,
  Phone,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  Truck,
  AlertTriangle,
  Building2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  timestamp: string;
}

export const WhatsAppChatModal: React.FC = () => {
  const {
    currentUser,
    isWhatsAppOpen,
    whatsAppInitialMessage,
    openWhatsApp,
    closeWhatsApp,
    formatFCFA,
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'support',
      text: 'I ni sogoma / I ni tlé ! Bienvenue sur le canal d assistance WhatsApp officiel de MaliResell.',
      timestamp: '10:00',
    },
    {
      id: 'welcome-2',
      sender: 'support',
      text: 'Nous assurons la coordination logistique du Hub Bamako (Hamdallaye ACI 2000), le suivi des arrivages fournisseurs et le support livreurs/clients.',
      timestamp: '10:01',
    },
  ]);

  // Si un message initial est injecté (ex: depuis l'alerte stock critique du Fournisseur)
  useEffect(() => {
    if (whatsAppInitialMessage) {
      setMessageInput(whatsAppInitialMessage);
    }
  }, [whatsAppInitialMessage]);

  const phoneNumberBamako = '+223 70 00 00 00';
  const waCleanNumber = '22370000000';

  const handleOpenRealWhatsApp = (customText?: string) => {
    const textToSend = customText || messageInput || 'Bonjour MaliResell, je souhaite des informations.';
    const encoded = encodeURIComponent(textToSend);
    const waUrl = `https://wa.me/${waCleanNumber}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const sentText = messageInput.trim();
    setMessageInput('');

    // Réponse intelligente automatique du Hub Bamako
    setTimeout(() => {
      let reply = 'Message bien reçu au Hub Bamako ! Le coordinateur logistique traite votre dossier.';

      if (sentText.toLowerCase().includes('stock') || sentText.toLowerCase().includes('réassort') || sentText.toLowerCase().includes('rupture')) {
        reply = '📦 Alerte Stock bien notée ! Le responsable de l entrepôt ACI 2000 réserve un quai de déchargement pour votre arrivage. Merci de nous transmettre le numéro de bordereau dès le départ.';
      } else if (sentText.toLowerCase().includes('livraison') || sentText.toLowerCase().includes('colis') || sentText.toLowerCase().includes('mr-')) {
        reply = '🚚 Votre demande concernant l acheminement de commande est transmise au dispatcher livreurs secteur Bamako. Un point GPS et appel de courtoisie sont en cours.';
      } else if (sentText.toLowerCase().includes('retrait') || sentText.toLowerCase().includes('orange money') || sentText.toLowerCase().includes('wave')) {
        reply = '💳 Demande financière reçue. Le service trésorerie effectue les règlements Mobile Money sous 2 à 4 heures ouvrées après validation.';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'support',
          text: reply,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  // Modèles de messages rapides selon le rôle actif
  const roleSuggestions = {
    FOURNISSEUR: [
      {
        title: '⚠️ Alerte Stock Critique',
        text: `Bonjour Hub Bamako, je suis ${currentUser.nomEntreprise || currentUser.nom}. Je constate un niveau de stock critique sur mes références et prépare un réassort immédiat.`,
      },
      {
        title: '🚚 Avis d arrivage au Hub',
        text: `Bonjour MaliResell, un transporteur achemine un réassort de nos produits vers l entrepôt d ACI 2000. Arrivée estimée dans l après-midi.`,
      },
      {
        title: '💼 Tarifs & Contrats de gros',
        text: `Bonjour, je souhaite réviser les prix d achat fournisseur (P_F) pour nos prochaines importations.`,
      },
    ],
    CLIENT: [
      {
        title: '📍 Préciser mon repère de livraison',
        text: `Bonjour MaliResell, pour ma commande en cours à Bamako, mon repère précis est : `,
      },
      {
        title: '📞 Numéro du livreur',
        text: `Bonjour, pouvez-vous me communiquer le contact direct du livreur assigné à mon quartier ?`,
      },
      {
        title: '💰 Paiement Wave / Orange Money',
        text: `Bonjour, je souhaite régler ma commande via paiement électronique avant l arrivée du livreur.`,
      },
    ],
    REVENDEUR: [
      {
        title: '💸 Retrait de mes commissions',
        text: `Bonjour MaliResell, j ai soumis une demande de retrait de commission de mon portefeuille vers mon compte Orange Money.`,
      },
      {
        title: '🔥 Meilleures ventes de la semaine',
        text: `Bonjour, quels sont les articles les plus demandés à Bamako pour mes partages WhatsApp ?`,
      },
    ],
    LIVREUR: [
      {
        title: '📍 Client injoignable',
        text: `Allô Dispatch Hub, le client de la commande en cours ne répond pas sur son numéro Orange. Merci de m assister.`,
      },
      {
        title: '✅ Livraisons du jour terminées',
        text: `Bonjour, j ai clôturé ma tournée sur la rive droite (Badalabougou / Kalaban). Espèces prêtes à être versées au Hub.`,
      },
    ],
    ADMIN: [
      {
        title: '📢 Message d alerte générale',
        text: `Notification système : coordination générale des arrivages et vérification de la caisse centrale.`,
      },
    ],
  };

  const suggestions = roleSuggestions[currentUser.role] || roleSuggestions.CLIENT;

  return (
    <>
      {/* Bouton Flottant WhatsApp (toujours visible) */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group">
        <div className="hidden sm:flex items-center gap-2 bg-stone-900 text-white px-3 py-1.5 rounded-full text-xs shadow-xl border border-stone-700 opacity-90 group-hover:opacity-100 transition">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-semibold">Support WhatsApp Bamako</span>
        </div>

        <button
          id="btn-open-whatsapp"
          onClick={() => {
            if (isWhatsAppOpen) closeWhatsApp();
            else openWhatsApp();
          }}
          className="relative w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-900/40 hover:scale-105 active:scale-95 transition border-2 border-white focus:outline-none"
          title="Assistance WhatsApp MaliResell"
          aria-label="Ouvrir le chat WhatsApp"
        >
          <MessageCircle className="w-7 h-7 fill-white/20" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-emerald-700"></span>
        </button>
      </div>

      {/* Fenêtre de Discussion WhatsApp */}
      {isWhatsAppOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[85vh] h-[580px] bg-stone-100 rounded-2xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header style WhatsApp */}
          <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-800 border-2 border-emerald-400 flex items-center justify-center font-black text-white text-base shadow">
                  MR
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#075e54]"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  MaliResell Hub Central
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                </h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span>En ligne</span> • <span>Hamdallaye ACI 2000</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={`tel:${phoneNumberBamako.replace(/\s+/g, '')}`}
                className="p-2 rounded-lg hover:bg-white/10 text-white transition"
                title="Appel téléphonique direct"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={closeWhatsApp}
                className="p-2 rounded-lg hover:bg-white/10 text-white transition"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Numéro officiel & rôle */}
          <div className="bg-emerald-800/90 text-emerald-100 text-[11px] px-3.5 py-1.5 flex items-center justify-between border-b border-emerald-700">
            <span className="font-medium">
              WhatsApp Officiel : <strong className="text-white">{phoneNumberBamako}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-white font-mono text-[10px]">
              Rôle : {currentUser.role}
            </span>
          </div>

          {/* Corps de conversation */}
          <div
            className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#e5ddd5]/60 bg-repeat"
            style={{
              backgroundImage: 'radial-gradient(#075e54 0.5px, transparent 0.5px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* Note de sécurité Malienne */}
            <div className="text-center my-1">
              <span className="inline-block bg-white/90 backdrop-blur text-stone-600 text-[10px] px-3 py-1 rounded-full shadow-sm border border-stone-200">
                🔒 Vos échanges sont synchronisés avec l équipe logistique de Bamako
              </span>
            </div>

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#d9fdd3] text-stone-900 rounded-tr-none border border-emerald-200'
                      : 'bg-white text-stone-900 rounded-tl-none border border-stone-200'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-stone-500">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'user' && (
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Raccourcis rapides selon le profil (ex: Fournisseur, Stock Critique) */}
          <div className="bg-white p-2.5 border-t border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Modèles de messages ({currentUser.role}) :
              </span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setMessageInput(s.text)}
                  className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 text-[11px] border border-stone-200 whitespace-nowrap transition"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Zone de saisie + Bouton WhatsApp réel */}
          <div className="bg-stone-100 p-3 border-t border-stone-200 space-y-2">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2.5 rounded-xl bg-[#075e54] hover:bg-[#064e46] disabled:opacity-40 text-white transition shadow-sm"
                title="Envoyer dans le simulateur"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={() => handleOpenRealWhatsApp()}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition"
              title="Ouvrir directement dans l'application WhatsApp"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ouvrir dans l application WhatsApp (+223 70 00 00 00)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
