'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Opções disponíveis:
// tag               = Texto pequeno acima do título                = -
// title             = Título principal                             = -
// titleHighlight    = Parte do título na cor accent                = -
// description       = Descrição abaixo do título                   = -
// fields            = Array de campos do formulário                = campos padrão
// submitText        = Texto do botão de envio                      = "Enviar"
// submitMicrocopy   = Microcopy abaixo do botão (ex: tempo resposta) = -
// backgroundColor   = Cor de fundo                                 = #0a0a0a
// accentColor       = Cor de destaque                              = #22c55e

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // para select
  fullWidth?: boolean; // ocupar largura total
}

export interface LPCTAProps {
  // Tag superior
  tag?: string;

  // Título com destaque
  title: string;
  titleHighlight?: string;

  // Descrição
  description?: string;

  // Campos do formulário
  fields?: FormField[];

  // Botão
  submitText?: string;
  submitMicrocopy?: string;

  // Tema
  accentColor?: string;
  backgroundColor?: string;
}

const defaultFields: FormField[] = [
  { name: 'nome', label: 'Nome', type: 'text', placeholder: 'Seu nome completo', required: true },
  { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Nome da empresa', required: true },
  { name: 'cargo', label: 'Seu cargo', type: 'text', placeholder: 'Seu cargo na empresa' },
  { name: 'celular', label: 'Celular', type: 'tel', placeholder: '(00) 00000-0000', required: true },
  { name: 'email', label: 'E-mail Corporativo', type: 'email', placeholder: 'seu@email.com', required: true },
  { name: 'servico', label: 'Serviço de interesse', type: 'select', options: ['Assessoria Contábil', 'Assessoria Societária', 'Consultoria Tributária', 'Auditoria', 'Outro'] },
  { name: 'mensagem', label: 'Mensagem', type: 'textarea', placeholder: 'Como podemos ajudar?', fullWidth: true },
];

export default function LPCTA({
  tag,
  title,
  titleHighlight,
  description,
  fields = defaultFields,
  submitText = 'Enviar',
  submitMicrocopy,
  accentColor = '#22c55e',
  backgroundColor = '#0a0a0a',
}: LPCTAProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detecta fundo escuro
  const isDarkBg =
    backgroundColor.toLowerCase() === '#0a0a0a' ||
    backgroundColor.toLowerCase() === '#000000' ||
    backgroundColor.toLowerCase() === '#1a1a2e';

  const textColor = isDarkBg ? 'text-white' : 'text-gray-900';
  const descriptionColor = isDarkBg ? 'text-white/70' : 'text-gray-600';
  const inputBg = isDarkBg ? 'bg-white/10' : 'bg-gray-100';
  const inputBorder = isDarkBg ? 'border-white/20' : 'border-gray-300';
  const inputText = isDarkBg ? 'text-white' : 'text-gray-900';
  const inputPlaceholder = isDarkBg ? 'placeholder:text-white/50' : 'placeholder:text-gray-400';

  // Renderiza o título com highlight
  const renderTitle = () => {
    if (!titleHighlight) return title;

    const parts = title.split(titleHighlight);
    return (
      <>
        {parts[0]}
        <span style={{ color: accentColor }}>{titleHighlight}</span>
        {parts[1] || ''}
      </>
    );
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simula envio - aqui você pode integrar com sua API
    console.log('Form data:', formData);

    // Aguarda 2 segundos para simular envio
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    alert('Mensagem enviada com sucesso!');
    setFormData({});
  };

  const renderField = (field: FormField) => {
    const baseClasses = `w-full px-4 py-3 rounded-lg border ${inputBg} ${inputBorder} ${inputText} ${inputPlaceholder} focus:outline-none focus:ring-2 transition-all`;

    switch (field.type) {
      case 'select':
        return (
          <select
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            className={`${baseClasses} appearance-none cursor-pointer`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDarkBg ? 'white' : '%236b7280'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '20px',
            }}
          >
            <option value="" disabled>{field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option} className="text-gray-900 bg-white">
                {option}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={`${baseClasses} resize-none`}
          />
        );

      default:
        return (
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <section style={{ backgroundColor }} className="py-44 md:py-28 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Tag */}
            {tag && (
              <span
                className="text-sm font-medium uppercase tracking-wider mb-4 block"
                style={{ color: accentColor }}
              >
                {tag}
              </span>
            )}

            {/* Título */}
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textColor}`}>
              {renderTitle()}
            </h2>

            {/* Descrição */}
            {description && (
              <p className={`text-base md:text-lg max-w-2xl mx-auto ${descriptionColor}`}>
                {description}
              </p>
            )}
          </motion.div>

          {/* Formulário */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={field.fullWidth ? 'md:col-span-2' : ''}
                >
                  {renderField(field)}
                </div>
              ))}
            </div>

            {/* Botão de Envio */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: accentColor }}
              >
                {isSubmitting ? 'Enviando...' : submitText}
              </button>

              {/* Microcopy abaixo do botão */}
              {submitMicrocopy && (
                <p className={`mt-3 text-sm ${descriptionColor}`}>
                  {submitMicrocopy}
                </p>
              )}
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
