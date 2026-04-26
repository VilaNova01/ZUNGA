import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { Star, Check, Phone, Smartphone, CreditCard, AlertCircle } from 'lucide-react';

export default async function AssinaturaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const [user, rawSettings] = await Promise.all([
    prisma.user.findUnique({ where: { email: session.user.email! } }),
    prisma.setting.findMany(),
  ]);
  if (!user || user.role !== 'SELLER') redirect('/');

  const cfg: Record<string, string> = {};
  rawSettings.forEach(s => { cfg[s.key] = s.value; });
  const whatsapp    = cfg.contact_whatsapp || '244900000000';
  const iban        = cfg.bank_iban        || 'AO06 0040 0000 0000 0000 0000 0';
  const bankName    = cfg.bank_name        || 'BAI';
  const bankHolder  = cfg.bank_holder      || 'ZUNGA, LDA';
  const price       = parseInt(cfg.premium_price || '5000').toLocaleString('pt-AO');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Planos ZUNGA</h1>
          <p className="text-slate-500">Escolhe o plano certo para o teu negócio</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {/* Free */}
          <div className={`bg-white rounded-2xl border-2 p-6 ${!user.isPremium ? 'border-orange-500' : 'border-slate-100'}`}>
            {!user.isPremium && <span className="text-xs bg-orange-500 text-white font-bold px-3 py-1 rounded-full mb-4 inline-block">PLANO ACTUAL</span>}
            <h2 className="text-xl font-black text-slate-800 mb-1">Gratuito</h2>
            <p className="text-3xl font-black text-slate-900 mb-4">0 Kz<span className="text-base font-normal text-slate-400">/mês</span></p>
            <ul className="space-y-2 mb-6">
              {['Até 3 produtos', 'Perfil de vendedor', 'Contacto via WhatsApp', 'Estatísticas básicas'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600"><Check size={15} className="text-green-500" /> {f}</li>
              ))}
            </ul>
            <div className="bg-slate-100 rounded-xl py-2.5 text-center text-sm text-slate-500 font-medium">Plano actual</div>
          </div>

          {/* Premium */}
          <div className={`rounded-2xl border-2 p-6 ${user.isPremium ? 'bg-white border-orange-500' : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 text-white'}`}>
            {user.isPremium && <span className="text-xs bg-orange-500 text-white font-bold px-3 py-1 rounded-full mb-4 inline-block">PLANO ACTUAL</span>}
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`text-xl font-black ${user.isPremium ? 'text-slate-800' : 'text-white'}`}>Premium</h2>
              <Star size={18} className="text-orange-400 fill-orange-400" />
            </div>
            <p className={`text-3xl font-black mb-4 ${user.isPremium ? 'text-slate-900' : 'text-white'}`}>
              {price} Kz<span className={`text-base font-normal ${user.isPremium ? 'text-slate-400' : 'text-slate-400'}`}>/mês</span>
            </p>
            <ul className="space-y-2 mb-6">
              {['Produtos ilimitados', 'Destaque na pesquisa', 'Badge de Premium', 'Estatísticas avançadas', 'Suporte prioritário'].map(f => (
                <li key={f} className={`flex items-center gap-2 text-sm ${user.isPremium ? 'text-slate-600' : 'text-slate-300'}`}>
                  <Check size={15} className="text-orange-400" /> {f}
                </li>
              ))}
            </ul>
            {user.isPremium ? (
              <div className="bg-green-50 rounded-xl py-2.5 text-center text-sm text-green-600 font-medium">
                Activo até {user.premiumUntil ? new Date(user.premiumUntil).toLocaleDateString('pt-AO') : '—'}
              </div>
            ) : (
              <div className="bg-orange-500/20 rounded-xl py-2.5 text-center text-sm text-orange-300 font-medium">
                Escolhe um método abaixo para activar
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        {!user.isPremium && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CreditCard size={20} className="text-orange-500" /> Métodos de Pagamento
            </h2>

            {/* Multicaixa Express */}
            <div className="bg-white rounded-2xl border-2 border-orange-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                  <Smartphone size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Multicaixa Express</p>
                  <p className="text-xs text-slate-500">Pagamento instantâneo via app ou USSD</p>
                </div>
                <span className="ml-auto text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">Recomendado</span>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 mb-4 space-y-2">
                <p className="text-sm font-semibold text-orange-800">Como pagar via Multicaixa Express:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-sm text-orange-700">
                  <li>Abre o teu banco (BAI, BFA, BIC, Millennium, etc.) ou marca <strong>*800#</strong></li>
                  <li>Selecciona <strong>Pagamento de Serviços</strong></li>
                  <li>Entidade: <strong className="font-mono">ZUNGA</strong></li>
                  <li>Referência: <strong className="font-mono">{user.id.slice(-8).toUpperCase()}</strong></li>
                  <li>Valor: <strong>{price} Kz</strong></li>
                  <li>Confirma com o teu PIN</li>
                </ol>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-orange-400" />
                <p>Após o pagamento, envia o comprovativo via WhatsApp. A activação é feita em até 2 horas em dias úteis.</p>
              </div>

              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Paguei o Premium ZUNGA via Multicaixa Express. Ref: ${user.id.slice(-8).toUpperCase()}`)}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors mt-3"
              >
                <Phone size={16} /> Enviar Comprovativo via WhatsApp
              </a>
            </div>

            {/* Bank Transfer */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                  <CreditCard size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Transferência Bancária</p>
                  <p className="text-xs text-slate-500">TPA ou transferência para conta ZUNGA</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-700">Dados bancários:</p>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>Banco: <span className="font-mono font-semibold">{bankName}</span></p>
                  <p>IBAN: <span className="font-mono font-semibold">{iban}</span></p>
                  <p>Titular: <span className="font-semibold">{bankHolder}</span></p>
                  <p>Valor: <span className="font-semibold">{price} Kz/mês</span></p>
                </div>
              </div>
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Fiz a transferência bancária para o Premium ZUNGA.')}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors mt-3 text-sm"
              >
                <Phone size={16} /> Enviar Comprovativo
              </a>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-5 text-sm text-orange-800">
          <p className="font-semibold mb-1">Notas importantes</p>
          <ul className="list-disc list-inside space-y-1 text-orange-700">
            <li>O plano Premium renova mensalmente</li>
            <li>Guarda sempre o comprovativo de pagamento</li>
            <li>Activação em até 2 horas (dias úteis)</li>
            <li>Suporte: WhatsApp +{whatsapp}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
