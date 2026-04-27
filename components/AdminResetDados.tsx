'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function AdminResetDados() {
  const [step, setStep] = useState<'idle' | 'confirm' | 'loading' | 'done'>('idle');
  const [error, setError] = useState('');

  async function handleReset() {
    setStep('loading');
    setError('');
    try {
      const res = await fetch('/api/admin/reset-dados', { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao limpar dados.');
      setStep('done');
    } catch (e: any) {
      setError(e.message);
      setStep('confirm');
    }
  }

  if (step === 'done') {
    return (
      <div className="p-5">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-medium">
          Dados limpos com sucesso. Produtos, vendedores e compradores foram removidos.
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      {step === 'idle' && (
        <button
          onClick={() => setStep('confirm')}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm px-4 py-2.5 rounded-xl border border-red-200 transition-colors"
        >
          <Trash2 size={16} />
          Limpar todos os dados
        </button>
      )}

      {step === 'confirm' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-bold text-sm mb-1">Tem a certeza?</p>
          <p className="text-red-600 text-xs mb-4">
            Esta acção irá apagar <strong>todos os produtos, vendedores e compradores</strong> de forma permanente.
            As categorias, configurações e a conta admin serão mantidas.
          </p>
          {error && <p className="text-red-700 text-xs mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Sim, limpar tudo
            </button>
            <button
              onClick={() => setStep('idle')}
              className="bg-white hover:bg-slate-50 text-slate-600 font-medium text-sm px-4 py-2 rounded-lg border border-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {step === 'loading' && (
        <div className="text-slate-500 text-sm">A limpar dados...</div>
      )}
    </div>
  );
}
