'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText, Palette, Layers, ExternalLink, Trash2, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface LP {
  slug: string;
  title: string;
  theme: {
    mode: string;
    accentColor: string;
  };
  sectionsCount: number;
}

export default function LandingPagesPage() {
  const [lps, setLps] = useState<LP[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState('#22c55e');

  useEffect(() => {
    fetchLPs();
  }, []);

  async function fetchLPs() {
    try {
      const response = await fetch('/api/admin/landing-pages');
      if (response.ok) {
        const data = await response.json();
        setLps(data.lps);
      }
    } catch (error) {
      console.error('Erro ao carregar LPs:', error);
      toast.error('Erro ao carregar landing pages');
    } finally {
      setLoading(false);
    }
  }

  async function createLP() {
    if (!newSlug.trim()) {
      toast.error('Slug é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/admin/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: newSlug.toLowerCase().replace(/\s+/g, '-'),
          title: newTitle || newSlug,
          accentColor: newColor,
        }),
      });

      if (response.ok) {
        toast.success('LP criada com sucesso!');
        setShowCreateModal(false);
        setNewSlug('');
        setNewTitle('');
        fetchLPs();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar LP');
      }
    } catch (error) {
      console.error('Erro ao criar LP:', error);
      toast.error('Erro ao criar LP');
    }
  }

  async function deleteLP(slug: string) {
    if (!confirm(`Tem certeza que deseja excluir a LP "${slug}"?`)) return;

    try {
      const response = await fetch(`/api/admin/landing-pages/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('LP excluída com sucesso!');
        fetchLPs();
      } else {
        toast.error('Erro ao excluir LP');
      }
    } catch (error) {
      console.error('Erro ao excluir LP:', error);
      toast.error('Erro ao excluir LP');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Landing Pages</h1>
          <p className="text-dark-900 mt-1">Gerencie as landing pages de segmentos</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://sites.google.com/view/manuel-malaquias/in%C3%ADcio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            <HelpCircle size={20} />
            Ajuda
          </a>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-dark-900 rounded-lg font-medium hover:bg-gold-400 transition-colors"
          >
            <Plus size={20} />
            Nova LP
          </button>
        </div>
      </div>

      {/* Grid de LPs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lps.map((lp) => (
          <div
            key={lp.slug}
            className="bg-white rounded-xl border overflow-hidden hover:border-gold-500/50 transition-colors"
          >
            {/* Header do Card */}
            <div
              className="h-2"
              style={{ backgroundColor: lp.theme?.accentColor || '#22c55e' }}
            />

            <div className="p-5">
              {/* Título e Slug */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-dark-900 truncate">
                  {lp.title}
                </h3>
                <p className="text-sm text-gray-500">/segmentos/{lp.slug}</p>
              </div>

              {/* Info */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <Layers size={16} />
                  <span>{lp.sectionsCount} seções</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Palette size={16} />
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: lp.theme?.accentColor }}
                  />
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/landing-pages/${lp.slug}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gold-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <FileText size={16} />
                  Editar
                </Link>
                <Link
                  href={`/segmentos/${lp.slug}`}
                  target="_blank"
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink size={16} />
                </Link>
                <button
                  onClick={() => deleteLP(lp.slug)}
                  className="px-3 py-2 bg-gray-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {lps.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Nenhuma landing page encontrada
          </div>
        )}
      </div>

      {/* Modal Criar LP */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Nova Landing Page</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="ex: industria"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /segmentos/{newSlug || 'slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ex: Contabilidade para Indústria"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor Principal
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createLP}
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                Criar LP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
