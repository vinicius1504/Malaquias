'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  FileText,
  HelpCircle,
  Send,
  LayoutGrid,
  Palette,
  Image,
  Video,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Tipos das seções
const SECTION_TYPES = [
  { type: 'textImage', label: 'Texto + Imagem', icon: FileText },
  { type: 'carouselCards', label: 'Carrossel de Cards', icon: LayoutGrid },
  { type: 'servicesTabs', label: 'Abas de Serviços', icon: Settings },
  { type: 'faq', label: 'Perguntas Frequentes', icon: HelpCircle },
  { type: 'cta', label: 'CTA / Formulário', icon: Send },
];

// Componente de seção arrastável
function SortableSection({
  section,
  index,
  isExpanded,
  onToggle,
  onRemove,
  onUpdate,
}: {
  section: any;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (section: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id || `section-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const sectionType = SECTION_TYPES.find((t) => t.type === section.type);
  const Icon = sectionType?.icon || FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical size={20} />
          </button>
          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={onToggle}
          >
            <Icon size={20} className="text-gray-500" />
            <div>
              <h3 className="font-medium text-xl text-gray-800">
                {sectionType?.label || section.type}
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[300px]">
                {section.title || section.tag || 'Sem título'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onRemove}
            className="p-2 text-red-400 hover:text-red-600"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 hover:text-gray-700"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Editor da Seção */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
              <input
                type="text"
                value={section.tag || ''}
                onChange={(e) => onUpdate({ ...section, tag: e.target.value })}
                placeholder="ex: NOSSOS SERVIÇOS"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Fundo</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={section.backgroundColor || '#ffffff'}
                  onChange={(e) => onUpdate({ ...section, backgroundColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
                <input
                  type="text"
                  value={section.backgroundColor || '#ffffff'}
                  onChange={(e) => onUpdate({ ...section, backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) => onUpdate({ ...section, title: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parte do título em destaque (cor accent)
            </label>
            <input
              type="text"
              value={section.titleHighlight || ''}
              onChange={(e) => onUpdate({ ...section, titleHighlight: e.target.value })}
              placeholder="Copie a parte do título que quer destacar"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Campos específicos por tipo */}
          {section.type === 'textImage' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parágrafos</label>
                {(section.paragraphs || []).map((p: string, pIdx: number) => (
                  <div key={pIdx} className="flex gap-2 mb-2">
                    <textarea
                      value={p}
                      onChange={(e) => {
                        const newParagraphs = [...(section.paragraphs || [])];
                        newParagraphs[pIdx] = e.target.value;
                        onUpdate({ ...section, paragraphs: newParagraphs });
                      }}
                      rows={2}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                    />
                    <button
                      onClick={() => {
                        const newParagraphs = [...(section.paragraphs || [])];
                        newParagraphs.splice(pIdx, 1);
                        onUpdate({ ...section, paragraphs: newParagraphs });
                      }}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    onUpdate({ ...section, paragraphs: [...(section.paragraphs || []), ''] });
                  }}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  + Adicionar parágrafo
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                  <input
                    type="text"
                    value={section.image || ''}
                    onChange={(e) => onUpdate({ ...section, image: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posição da Imagem</label>
                  <select
                    value={section.imagePosition || 'right'}
                    onChange={(e) => onUpdate({ ...section, imagePosition: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="left">Esquerda</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
              </div>

              {/* CTA da seção textImage */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA da Seção</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Texto CTA</label>
                    <input
                      type="text"
                      value={section.ctaText || ''}
                      onChange={(e) => onUpdate({ ...section, ctaText: e.target.value })}
                      placeholder="ex: Quer identificar oportunidades?"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Texto do Botão</label>
                      <input
                        type="text"
                        value={section.ctaButtonText || ''}
                        onChange={(e) => onUpdate({ ...section, ctaButtonText: e.target.value })}
                        placeholder="ex: Agendar conversa"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Link do Botão</label>
                      <input
                        type="text"
                        value={section.ctaButtonLink || ''}
                        onChange={(e) => onUpdate({ ...section, ctaButtonLink: e.target.value })}
                        placeholder="/contato"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Carrossel de Cards */}
          {section.type === 'carouselCards' && (
            <div>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={section.description || ''}
                    onChange={(e) => onUpdate({ ...section, description: e.target.value })}
                    rows={2}
                    placeholder="Descrição opcional da seção"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posição do Conteúdo</label>
                    <select
                      value={section.contentPosition || 'left'}
                      onChange={(e) => onUpdate({ ...section, contentPosition: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="left">Esquerda</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Velocidade do Carrossel</label>
                    <input
                      type="number"
                      value={section.speed || 30}
                      onChange={(e) => onUpdate({ ...section, speed: parseInt(e.target.value) || 30 })}
                      placeholder="30"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto CTA da Seção</label>
                    <input
                      type="text"
                      value={section.ctaText || ''}
                      onChange={(e) => onUpdate({ ...section, ctaText: e.target.value })}
                      placeholder="ex: Falar com especialista"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link CTA da Seção</label>
                    <input
                      type="text"
                      value={section.ctaLink || ''}
                      onChange={(e) => onUpdate({ ...section, ctaLink: e.target.value })}
                      placeholder="/contato"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Cards</label>
              {(section.cards || []).map((card: any, cIdx: number) => (
                <div key={cIdx} className="p-3 bg-gray-50 rounded-lg mb-2 border border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">Card {cIdx + 1}</span>
                    <button
                      onClick={() => {
                        const newCards = [...(section.cards || [])];
                        newCards.splice(cIdx, 1);
                        onUpdate({ ...section, cards: newCards });
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => {
                        const newCards = [...(section.cards || [])];
                        newCards[cIdx] = { ...newCards[cIdx], title: e.target.value };
                        onUpdate({ ...section, cards: newCards });
                      }}
                      placeholder="Título do card"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                    <input
                      type="text"
                      value={card.subtitle || ''}
                      onChange={(e) => {
                        const newCards = [...(section.cards || [])];
                        newCards[cIdx] = { ...newCards[cIdx], subtitle: e.target.value };
                        onUpdate({ ...section, cards: newCards });
                      }}
                      placeholder="Subtítulo"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={card.image || ''}
                    onChange={(e) => {
                      const newCards = [...(section.cards || [])];
                      newCards[cIdx] = { ...newCards[cIdx], image: e.target.value };
                      onUpdate({ ...section, cards: newCards });
                    }}
                    placeholder="URL da imagem do card"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  onUpdate({ ...section, cards: [...(section.cards || []), { title: '', subtitle: '', image: '' }] });
                }}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                + Adicionar card
              </button>
            </div>
          )}

          {/* Abas de Serviços */}
          {section.type === 'servicesTabs' && (
            <div>
              {/* Configurações da seção */}
              <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posição do Logo</label>
                    <select
                      value={section.logoPosition || 'left'}
                      onChange={(e) => onUpdate({ ...section, logoPosition: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="left">Esquerda</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto CTA</label>
                  <input
                    type="text"
                    value={section.ctaText || ''}
                    onChange={(e) => onUpdate({ ...section, ctaText: e.target.value })}
                    placeholder="ex: Não sabe por onde começar?"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botão CTA</label>
                    <input
                      type="text"
                      value={section.ctaButtonText || ''}
                      onChange={(e) => onUpdate({ ...section, ctaButtonText: e.target.value })}
                      placeholder="ex: Receber orientação"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link do Botão CTA</label>
                    <input
                      type="text"
                      value={section.ctaButtonLink || ''}
                      onChange={(e) => onUpdate({ ...section, ctaButtonLink: e.target.value })}
                      placeholder="/contato"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Abas</label>
              {(section.tabs || []).map((tab: any, tIdx: number) => (
                <div key={tIdx} className="p-3 bg-gray-50 rounded-lg mb-3 border border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">Aba {tIdx + 1}</span>
                    <button
                      onClick={() => {
                        const newTabs = [...(section.tabs || [])];
                        newTabs.splice(tIdx, 1);
                        onUpdate({ ...section, tabs: newTabs });
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={tab.label || ''}
                      onChange={(e) => {
                        const newTabs = [...(section.tabs || [])];
                        newTabs[tIdx] = { ...newTabs[tIdx], label: e.target.value };
                        onUpdate({ ...section, tabs: newTabs });
                      }}
                      placeholder="Label da aba"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                    <input
                      type="text"
                      value={tab.title || ''}
                      onChange={(e) => {
                        const newTabs = [...(section.tabs || [])];
                        newTabs[tIdx] = { ...newTabs[tIdx], title: e.target.value };
                        onUpdate({ ...section, tabs: newTabs });
                      }}
                      placeholder="Título do conteúdo"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Items da aba */}
                  <div className="mt-2 pl-3 border-l-2 border-gray-300">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Itens da lista</label>
                    {(tab.items || []).map((item: string, iIdx: number) => (
                      <div key={iIdx} className="flex gap-2 mb-1">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newTabs = [...(section.tabs || [])];
                            const newItems = [...(newTabs[tIdx].items || [])];
                            newItems[iIdx] = e.target.value;
                            newTabs[tIdx] = { ...newTabs[tIdx], items: newItems };
                            onUpdate({ ...section, tabs: newTabs });
                          }}
                          placeholder="Item da lista"
                          className="flex-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={() => {
                            const newTabs = [...(section.tabs || [])];
                            const newItems = [...(newTabs[tIdx].items || [])];
                            newItems.splice(iIdx, 1);
                            newTabs[tIdx] = { ...newTabs[tIdx], items: newItems };
                            onUpdate({ ...section, tabs: newTabs });
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newTabs = [...(section.tabs || [])];
                        newTabs[tIdx] = { ...newTabs[tIdx], items: [...(newTabs[tIdx].items || []), ''] };
                        onUpdate({ ...section, tabs: newTabs });
                      }}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      + Adicionar item
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  onUpdate({ ...section, tabs: [...(section.tabs || []), { label: '', title: '', items: [] }] });
                }}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                + Adicionar aba
              </button>
            </div>
          )}

          {section.type === 'faq' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do Vídeo ou Imagem de Fundo</label>
                <input
                  type="text"
                  value={section.backgroundVideo || ''}
                  onChange={(e) => onUpdate({ ...section, backgroundVideo: e.target.value })}
                  placeholder="https://exemplo.com/video.mp4 ou imagem.jpg"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">Aceita vídeo (.mp4, .webm) ou imagem (.jpg, .png)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Perguntas</label>
                {(section.questions || []).map((q: any, qIdx: number) => (
                  <div key={qIdx} className="p-3 bg-gray-50 rounded-lg mb-2 border border-gray-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-500">Pergunta {qIdx + 1}</span>
                      <button
                        onClick={() => {
                          const newQuestions = [...(section.questions || [])];
                          newQuestions.splice(qIdx, 1);
                          onUpdate({ ...section, questions: newQuestions });
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={q.question || ''}
                      onChange={(e) => {
                        const newQuestions = [...(section.questions || [])];
                        newQuestions[qIdx] = { ...newQuestions[qIdx], question: e.target.value };
                        onUpdate({ ...section, questions: newQuestions });
                      }}
                      placeholder="Pergunta"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 mb-2"
                    />
                    <textarea
                      value={q.answer || ''}
                      onChange={(e) => {
                        const newQuestions = [...(section.questions || [])];
                        newQuestions[qIdx] = { ...newQuestions[qIdx], answer: e.target.value };
                        onUpdate({ ...section, questions: newQuestions });
                      }}
                      placeholder="Resposta"
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    onUpdate({ ...section, questions: [...(section.questions || []), { question: '', answer: '' }] });
                  }}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  + Adicionar pergunta
                </button>
              </div>

              {/* CTA do FAQ */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA da Seção (opcional)</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Texto acima do botão</label>
                    <input
                      type="text"
                      value={section.ctaText || ''}
                      onChange={(e) => onUpdate({ ...section, ctaText: e.target.value })}
                      placeholder="ex: Ainda tem dúvidas?"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Texto do Botão</label>
                      <input
                        type="text"
                        value={section.ctaButtonText || ''}
                        onChange={(e) => onUpdate({ ...section, ctaButtonText: e.target.value })}
                        placeholder="ex: Fale conosco"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Link do Botão</label>
                      <input
                        type="text"
                        value={section.ctaButtonLink || ''}
                        onChange={(e) => onUpdate({ ...section, ctaButtonLink: e.target.value })}
                        placeholder="/contato"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section.type === 'cta' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={section.description || ''}
                  onChange={(e) => onUpdate({ ...section, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botão</label>
                  <input
                    type="text"
                    value={section.submitText || ''}
                    onChange={(e) => onUpdate({ ...section, submitText: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Microcopy</label>
                  <input
                    type="text"
                    value={section.submitMicrocopy || ''}
                    onChange={(e) => onUpdate({ ...section, submitMicrocopy: e.target.value })}
                    placeholder="ex: Resposta em 24h"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function EditLPPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [lp, setLp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLocale, setActiveLocale] = useState<'pt' | 'en' | 'es'>('pt');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchLP();
  }, [slug]);

  // Garante que cada seção tenha um ID único
  useEffect(() => {
    if (lp?.content) {
      let needsUpdate = false;
      const newLp = { ...lp };

      ['pt', 'en', 'es'].forEach((locale) => {
        if (newLp.content[locale]?.sections) {
          newLp.content[locale].sections = newLp.content[locale].sections.map((section: any, idx: number) => {
            if (!section.id) {
              needsUpdate = true;
              return { ...section, id: `section-${locale}-${idx}-${Date.now()}` };
            }
            return section;
          });
        }
      });

      if (needsUpdate) {
        setLp(newLp);
      }
    }
  }, [lp?.content]);

  async function fetchLP() {
    try {
      const response = await fetch(`/api/admin/landing-pages/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setLp(data.lp);
      } else {
        toast.error('LP não encontrada');
        router.push('/admin/landing-pages');
      }
    } catch (error) {
      console.error('Erro ao carregar LP:', error);
      toast.error('Erro ao carregar LP');
    } finally {
      setLoading(false);
    }
  }

  async function saveLP() {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/landing-pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lp),
      });

      if (response.ok) {
        toast.success('LP salva com sucesso!');
      } else {
        toast.error('Erro ao salvar LP');
      }
    } catch (error) {
      console.error('Erro ao salvar LP:', error);
      toast.error('Erro ao salvar LP');
    } finally {
      setSaving(false);
    }
  }

  function updateContent(path: string, value: any) {
    const newLp = { ...lp };
    const keys = path.split('.');
    let current: any = newLp;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setLp(newLp);
  }

  function addSection(type: string) {
    const content = lp.content[activeLocale];
    const newSection = createEmptySection(type);

    content.sections = [...(content.sections || []), newSection];
    setLp({ ...lp });
    setShowAddSection(false);
    setExpandedSection(content.sections.length - 1);
    toast.success('Seção adicionada!');
  }

  function removeSection(index: number) {
    if (!confirm('Remover esta seção?')) return;

    const content = lp.content[activeLocale];
    content.sections.splice(index, 1);
    setLp({ ...lp });
    setExpandedSection(null);
    toast.success('Seção removida');
  }

  function updateSection(index: number, updatedSection: any) {
    const newLp = { ...lp };
    newLp.content[activeLocale].sections[index] = updatedSection;
    setLp(newLp);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const content = lp.content[activeLocale];
      const sections = content.sections || [];

      const oldIndex = sections.findIndex((s: any) => (s.id || `section-${sections.indexOf(s)}`) === active.id);
      const newIndex = sections.findIndex((s: any) => (s.id || `section-${sections.indexOf(s)}`) === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        const newLp = { ...lp };
        newLp.content[activeLocale].sections = newSections;
        setLp(newLp);

        // Atualiza a seção expandida se necessário
        if (expandedSection === oldIndex) {
          setExpandedSection(newIndex);
        } else if (expandedSection !== null) {
          if (oldIndex < expandedSection && newIndex >= expandedSection) {
            setExpandedSection(expandedSection - 1);
          } else if (oldIndex > expandedSection && newIndex <= expandedSection) {
            setExpandedSection(expandedSection + 1);
          }
        }

        toast.success('Seção reordenada!');
      }
    }
  }

  function createEmptySection(type: string): any {
    const id = `section-${activeLocale}-${Date.now()}`;
    const base = { id, type, tag: '', title: '', titleHighlight: '', backgroundColor: '#ffffff' };

    switch (type) {
      case 'textImage':
        return { ...base, paragraphs: [''], image: '', imagePosition: 'right' };
      case 'carouselCards':
        return { ...base, description: '', cards: [], contentPosition: 'left' };
      case 'servicesTabs':
        return { ...base, tabs: [{ label: 'Tab 1', title: 'Tab 1', items: [] }], logoPosition: 'left' };
      case 'faq':
        return { ...base, description: '', questions: [] };
      case 'cta':
        return { ...base, description: '', submitText: 'Enviar' };
      default:
        return base;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!lp) return null;

  const content = lp.content[activeLocale];
  const sections = content.sections || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/landing-pages"
            className="p-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Editar LP: {slug}
            </h1>
            <p className="text-gray-500 text-sm">/segmentos/{slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://sites.google.com/view/manuel-malaquias/in%C3%ADcio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            <HelpCircle size={18} />
            Ajuda
          </a>
          <Link
            href={`/segmentos/${slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye size={18} />
            Preview
          </Link>
          <button
            onClick={saveLP}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Tabs de Idioma */}
      <div className="flex gap-2">
        {(['pt', 'en', 'es'] as const).map((locale) => (
          <button
            key={locale}
            onClick={() => {
              setActiveLocale(locale);
              setExpandedSection(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeLocale === locale
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Seções */}
        <div className="lg:col-span-2 space-y-4">
          {/* Hero */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedSection(expandedSection === -1 ? null : -1)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: lp.theme.accentColor }}
                />
                <div>
                  <h3 className="font-semibold text-gray-800">Hero</h3>
                  <p className="text-sm text-gray-500">Banner principal da página</p>
                </div>
              </div>
              {expandedSection === -1 ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </div>

            {expandedSection === -1 && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={content.hero?.title || ''}
                    onChange={(e) => updateContent(`content.${activeLocale}.hero.title`, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={content.hero?.description || ''}
                    onChange={(e) => updateContent(`content.${activeLocale}.hero.description`, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto CTA Principal</label>
                    <input
                      type="text"
                      value={content.hero?.ctaText || ''}
                      onChange={(e) => updateContent(`content.${activeLocale}.hero.ctaText`, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link CTA</label>
                    <input
                      type="text"
                      value={content.hero?.ctaLink || ''}
                      onChange={(e) => updateContent(`content.${activeLocale}.hero.ctaLink`, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
                {/* CTA Secundário */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto CTA Secundário</label>
                    <input
                      type="text"
                      value={content.hero?.ctaSecondaryText || ''}
                      onChange={(e) => updateContent(`content.${activeLocale}.hero.ctaSecondaryText`, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link CTA Secundário</label>
                    <input
                      type="text"
                      value={content.hero?.ctaSecondaryLink || ''}
                      onChange={(e) => updateContent(`content.${activeLocale}.hero.ctaSecondaryLink`, e.target.value)}
                      placeholder="ex: #servicos"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Microcopy (texto de confiança)</label>
                  <input
                    type="text"
                    value={content.hero?.trustText || ''}
                    onChange={(e) => updateContent(`content.${activeLocale}.hero.trustText`, e.target.value)}
                    placeholder="ex: Retorno em até 24h úteis"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Background - Tipo, Imagem e Vídeos */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Video size={16} />
                    Background do Hero
                  </h4>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Background</label>
                        <select
                          value={content.hero?.backgroundType || 'image'}
                          onChange={(e) => updateContent(`content.${activeLocale}.hero.backgroundType`, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="image">Imagem</option>
                          <option value="video">Vídeo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Duração Vídeo (seg)</label>
                        <input
                          type="number"
                          value={content.hero?.videoDuration || 5}
                          onChange={(e) => updateContent(`content.${activeLocale}.hero.videoDuration`, parseInt(e.target.value) || 5)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">URL da Imagem de Fundo</label>
                      <input
                        type="text"
                        value={content.hero?.backgroundImage || ''}
                        onChange={(e) => updateContent(`content.${activeLocale}.hero.backgroundImage`, e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">URLs de Vídeos de Fundo (um por linha)</label>
                      <textarea
                        value={(content.hero?.backgroundVideos || []).join('\n')}
                        onChange={(e) => updateContent(`content.${activeLocale}.hero.backgroundVideos`, e.target.value.split('\n'))}
                        onBlur={(e) => updateContent(`content.${activeLocale}.hero.backgroundVideos`, e.target.value.split('\n').filter((v: string) => v.trim()))}
                        rows={3}
                        placeholder="https://exemplo.com/video1.mp4&#10;https://exemplo.com/video2.mp4"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cole os links dos vídeos, um em cada linha</p>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Destaques (Highlights)</h4>

                  {(content.hero?.highlights || []).map((h: any, hIdx: number) => (
                    <div key={hIdx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={h.emphasis || ''}
                        onChange={(e) => {
                          const newHighlights = [...(content.hero?.highlights || [])];
                          newHighlights[hIdx] = { ...newHighlights[hIdx], emphasis: e.target.value };
                          updateContent(`content.${activeLocale}.hero.highlights`, newHighlights);
                        }}
                        placeholder="Texto em destaque"
                        className="w-1/3 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={h.text || ''}
                        onChange={(e) => {
                          const newHighlights = [...(content.hero?.highlights || [])];
                          newHighlights[hIdx] = { ...newHighlights[hIdx], text: e.target.value };
                          updateContent(`content.${activeLocale}.hero.highlights`, newHighlights);
                        }}
                        placeholder="Texto complementar"
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        onClick={() => {
                          const newHighlights = [...(content.hero?.highlights || [])];
                          newHighlights.splice(hIdx, 1);
                          updateContent(`content.${activeLocale}.hero.highlights`, newHighlights);
                        }}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newHighlights = [...(content.hero?.highlights || []), { emphasis: '', text: '' }];
                      updateContent(`content.${activeLocale}.hero.highlights`, newHighlights);
                    }}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    + Adicionar destaque
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Seções com Drag and Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s: any, idx: number) => s.id || `section-${idx}`)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section: any, index: number) => (
                <SortableSection
                  key={section.id || `section-${index}`}
                  section={section}
                  index={index}
                  isExpanded={expandedSection === index}
                  onToggle={() => setExpandedSection(expandedSection === index ? null : index)}
                  onRemove={() => removeSection(index)}
                  onUpdate={(updated) => updateSection(index, updated)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Sidebar - Configurações */}
        <div className="space-y-4">
          {/* SEO */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={18} />
              SEO
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título da Página</label>
                <input
                  type="text"
                  value={content.seo?.title || ''}
                  onChange={(e) => updateContent(`content.${activeLocale}.seo.title`, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                  value={content.seo?.description || ''}
                  onChange={(e) => updateContent(`content.${activeLocale}.seo.description`, e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Botão Adicionar Seção */}
          <div className="relative">
            <button
              onClick={() => setShowAddSection(!showAddSection)}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-colors"
            >
              <Plus size={20} />
              Adicionar Seção
            </button>

            {showAddSection && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl p-2 z-10 shadow-lg">
                {SECTION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.type}
                      onClick={() => addSection(type.type)}
                      className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon size={20} className="text-gray-500" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>


        {/* Tema */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Palette size={18} />
            Tema
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor Principal</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={lp.theme?.accentColor || '#22c55e'}
                  onChange={(e) => {
                    lp.theme.accentColor = e.target.value;
                    setLp({ ...lp });
                  }}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
                <input
                  type="text"
                  value={lp.theme?.accentColor || '#22c55e'}
                  onChange={(e) => {
                    lp.theme.accentColor = e.target.value;
                    setLp({ ...lp });
                  }}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modo</label>
              <select
                value={lp.theme?.mode || 'dark'}
                onChange={(e) => {
                  lp.theme.mode = e.target.value;
                  setLp({ ...lp });
                }}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            {sections.length} seções configuradas
          </p>
          <p className="text-xs text-gray-400 mb-3">
            Arraste as seções pelo ícone para reordenar
          </p>
          <Link
            href={`/segmentos/${slug}`}
            target="_blank"
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            Abrir preview →
          </Link>
        </div>
      </div>
    </div>
    </div >
  );
}
