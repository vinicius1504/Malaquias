'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle, Upload, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Footer from '@/components/sections/Footer';
import StarfieldCanvas from '@/components/ui/StarfieldCanvas';
import toast from 'react-hot-toast';

type ContactType = 'orcamento' | 'trabalheConosco';

const DEFAULT_IMAGE = '/images/Sem_foto.png';

export default function ContatoPage() {
  const { t } = useLanguage();
  const contact = t.contact;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contactType, setContactType] = useState<ContactType>('orcamento');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Formato não permitido. Use PDF, DOC ou DOCX.');
        return;
      }
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      setResumeFile(file);
    }
  };

  const removeFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simular envio (substituir por integração real)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
      setResumeFile(null);
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      {/* Hero Section com Vídeo ou Imagem */}
      <section className="relative min-h-[40vh] flex items-center justify-center">
        {/* Background Media */}
        <div className="absolute inset-0 overflow-hidden">
          {contact.heroMediaType === 'video' ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              crossOrigin="anonymous"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={contact.heroMedia} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={contact.heroMedia || DEFAULT_IMAGE}
              alt="Contato"
              fill
              className="object-cover"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_IMAGE;
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/70 via-[#1a1a2e]/50 to-[#1a1a2e]/70" />
        </div>

        {/* Título */}
        <div className="relative z-10 container mx-auto px-6 py-24 text-center">
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white uppercase tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {contact.pageTitle}
          </motion.h1>
          <motion.p
            className="text-white/80 text-lg mt-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {contact.pageSubtitle}
          </motion.p>
        </div>

        {/* Linha dourada inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500" />
      </section>

      {/* Formulário e Informações */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulário */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dropdown Tipo de Contato */}
                <div className="relative">
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    {contact.form.typeLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-left flex items-center justify-between hover:border-gold-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <span className="text-dark-700">
                      {contactType === 'orcamento'
                        ? contact.form.types.orcamento
                        : contact.form.types.trabalheConosco}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setContactType('orcamento');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gold-50 transition-colors ${
                          contactType === 'orcamento' ? 'bg-gold-50 text-gold-600' : 'text-dark-700'
                        }`}
                      >
                        {contact.form.types.orcamento}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setContactType('trabalheConosco');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gold-50 transition-colors ${
                          contactType === 'trabalheConosco' ? 'bg-gold-50 text-gold-600' : 'text-dark-700'
                        }`}
                      >
                        {contact.form.types.trabalheConosco}
                      </button>
                    </div>
                  )}
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    {contact.form.name} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={contact.form.namePlaceholder}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Email e Telefone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      {contact.form.email} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={contact.form.emailPlaceholder}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      {contact.form.phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={contact.form.phonePlaceholder}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Empresa (apenas para orçamento) */}
                {contactType === 'orcamento' && (
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      {contact.form.company}
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder={contact.form.companyPlaceholder}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}

                {/* Assunto */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    {contact.form.subject}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder={contact.form.subjectPlaceholder}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    {contact.form.message} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={contact.form.messagePlaceholder}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Upload de Currículo (apenas para Trabalhe Conosco) */}
                {contactType === 'trabalheConosco' && (
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      {contact.form.resume} *
                    </label>
                    <div className="relative">
                      {!resumeFile ? (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gold-400 hover:bg-gold-50/50 transition-all">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">{contact.form.resumePlaceholder}</span>
                          <span className="text-xs text-gray-400 mt-1">{contact.form.resumeHint}</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-gold-50 border border-gold-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
                              <Upload className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-dark-700">{resumeFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="p-2 hover:bg-gold-100 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status de Envio */}
                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {contact.form.success}
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {contact.form.error}
                  </div>
                )}

                {/* Botão Enviar */}
                <button
                  type="submit"
                  disabled={isSubmitting || (contactType === 'trabalheConosco' && !resumeFile)}
                  className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold rounded-lg hover:from-gold-400 hover:to-gold-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold-500/20"
                >
                  {isSubmitting ? contact.form.submitting : contact.form.submit}
                </button>
              </form>
            </motion.div>

            {/* Informações de Contato */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div>
                <h2 className="text-2xl font-heading font-bold text-dark-900 mb-4">
                  {contact.info.title}
                </h2>
                <p className="text-dark-600">
                  {contact.info.description}
                </p>
              </div>

              {/* Cards de Contato */}
              <div className="space-y-4">
                {/* WhatsApp */}
                <Link
                  href="https://wa.me/5567996617549"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{contact.info.whatsapp}</p>
                    <p className="font-semibold text-dark-900">{contact.info.whatsappNumber}</p>
                  </div>
                </Link>

                {/* Email */}
                <Link
                  href="mailto:contato@malaquiascontabilidade.com.br"
                  className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{contact.info.email}</p>
                    <p className="font-semibold text-dark-900">{contact.info.emailAddress}</p>
                  </div>
                </Link>

                {/* Telefone */}
                <Link
                  href="tel:+5567996617549"
                  className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{contact.info.whatsapp}</p>
                    <p className="font-semibold text-dark-900">{contact.info.whatsappNumber}</p>
                  </div>
                </Link>

                {/* Endereço */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{contact.info.address}</p>
                    <p className="font-semibold text-dark-900">{contact.info.addressText}</p>
                  </div>
                </div>
              </div>

              {/* CTA WhatsApp */}
              <Link
                href="https://wa.me/5567996617549"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <MessageCircle className="w-6 h-6" />
                {contact.cta.whatsapp}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="relative bg-[#1a1a2e] overflow-hidden">
        <StarfieldCanvas />
        <Footer />
      </section>
    </main>
  );
}
