'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Mail, Phone, User, Loader2 } from 'lucide-react';
import Image from 'next/image';

const INACTIVITY_TIME = 60000; // 1 minuto em milissegundos
const POPUP_COOLDOWN = 300000; // 5 minutos entre popups

interface FormData {
  name: string;
  phone: string;
  email: string;
}

export default function InactivityPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [lastPopupShown, setLastPopupShown] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Resetar timer de inatividade
  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Verificar inatividade
  useEffect(() => {
    // Verificar se já mostrou o popup recentemente (localStorage)
    const lastShown = localStorage.getItem('inactivityPopupLastShown');
    if (lastShown) {
      setLastPopupShown(parseInt(lastShown));
    }

    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeSinceLastPopup = now - lastPopupShown;

      // Mostrar popup se inativo por 1 min E não mostrou nos últimos 5 min
      if (
        timeSinceActivity >= INACTIVITY_TIME &&
        timeSinceLastPopup >= POPUP_COOLDOWN &&
        !isOpen &&
        !submitted
      ) {
        setIsOpen(true);
        setLastPopupShown(now);
        localStorage.setItem('inactivityPopupLastShown', now.toString());
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(checkInactivity);
  }, [lastActivity, lastPopupShown, isOpen, submitted]);

  // Listeners de atividade
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  const handleClose = () => {
    setIsOpen(false);
    resetTimer();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleWhatsApp = () => {
    if (!formData.name || !formData.phone) return;

    const message = encodeURIComponent(
      `Olá! Meu nome é ${formData.name}.\n` +
        `Telefone: ${formData.phone}\n` +
        `${formData.email ? `E-mail: ${formData.email}\n` : ''}` +
        `\nGostaria de mais informações sobre os serviços da Malaquias Contabilidade.`
    );

    window.open(`https://wa.me/5567996617549?text=${message}`, '_blank');
    setSubmitted(true);
    handleClose();
  };

  const handleEmail = async () => {
    if (!formData.name || !formData.phone || !formData.email) return;

    setIsSubmitting(true);

    // Simular envio (substituir por integração real se necessário)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Abrir cliente de email como fallback
    const subject = encodeURIComponent('Contato via Site - Malaquias Contabilidade');
    const body = encodeURIComponent(
      `Nome: ${formData.name}\n` +
        `Telefone: ${formData.phone}\n` +
        `E-mail: ${formData.email}\n\n` +
        `Mensagem: Gostaria de mais informações sobre os serviços.`
    );

    window.location.href = `mailto:contato@malaquiascontabilidade.com.br?subject=${subject}&body=${body}`;

    setIsSubmitting(false);
    setSubmitted(true);
    handleClose();
  };

  const isWhatsAppValid = formData.name && formData.phone;
  const isEmailValid = formData.name && formData.phone && formData.email;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[800px] max-h-[90vh]">
              {/* Botão Fechar */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-20 p-2 bg-gray-100 hover:bg-gray-200 rounded-full shadow-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Lado Esquerdo - Imagem e Texto */}
                <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] p-8 md:w-[320px] flex flex-col justify-center">
                  {/* Decoração */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                  <div className="relative z-10">
                    {/* Logo */}
                    <div className="mb-6">
                      <Image
                        src="/images/logos/Logo Branca.svg"
                        alt="Malaquias Contabilidade"
                        width={180}
                        height={50}
                        className="h-12 w-auto"
                      />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      Ficou com alguma{' '}
                      <span className="text-gold-500">dúvida?</span>
                    </h2>

                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                      Preencha as informações ao lado que em breve entraremos em contato com você.
                    </p>

                    {/* Imagem decorativa mobile */}
                    <div className="mt-6 hidden md:block">
                      <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 bg-gold-500/30 rounded-full animate-pulse" />
                        <div className="absolute inset-2 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lado Direito - Formulário */}
                <div className="p-6 md:p-8 flex-1 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">
                    Preencha seus dados
                  </h3>

                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nome completo *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Seu nome"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all text-gray-800"
                        />
                      </div>
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Celular/WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="(00) 00000-0000"
                          maxLength={16}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all text-gray-800"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        E-mail
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="seu@email.com.br"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all text-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Texto de preferência */}
                  <p className="text-sm text-gray-600 mt-6 mb-4">
                    Como prefere que entremos em contato com você?
                  </p>

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleWhatsApp}
                      disabled={!isWhatsAppValid}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Via WhatsApp
                    </button>

                    <button
                      onClick={handleEmail}
                      disabled={!isEmailValid || isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1a1a2e] hover:bg-[#2d2d44] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Mail className="w-5 h-5" />
                      )}
                      Via E-mail
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-4 text-center">
                    * Campos obrigatórios
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
