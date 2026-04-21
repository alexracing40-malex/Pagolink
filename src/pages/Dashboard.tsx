import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Copy, CheckCircle2, ChevronRight, PlusCircle, ExternalLink } from "lucide-react";
import { Order } from "../types";

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [bankConfig, setBankConfig] = useState({ name: "", clabe: "", owner: "" });
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [configSavedInfo, setConfigSavedInfo] = useState(false);
  const [formParams, setFormParams] = useState({
    amount: "",
    concept: "",
    client: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Use the window location origin for the link, or fallback to something
  const getAppUrl = () => window.location.origin;

  useEffect(() => {
    fetchOrders();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const config = await res.json();
        setBankConfig({ name: config.name || "", clabe: config.clabe || "", owner: config.owner || "" });
      }
    } catch (e) {
      console.error("Failed to fetch config", e);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfigSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankConfig),
      });
      if (res.ok) {
        setConfigSavedInfo(true);
        setTimeout(() => setConfigSavedInfo(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConfigSaving(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(formParams.amount),
          concept: formParams.concept,
          client: formParams.client,
        }),
      });
      if (res.ok) {
        setFormParams({ amount: "", concept: "", client: "" });
        fetchOrders();
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/pay`, { method: "POST" });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (id: string) => {
    const link = `${getAppUrl()}/pay/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <header className="flex flex-col gap-1 mb-2 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#006847] rounded-lg flex items-center justify-center text-white font-bold">
                $
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Cobros</h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest">SPEI Directo</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-1">Genera links de pago por transferencia sin comisiones.</p>
          </header>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">
                  Monto Exacto (MXN)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formParams.amount}
                    onChange={(e) => setFormParams({ ...formParams, amount: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md p-2 pl-7 font-mono outline-none focus:ring-2 focus:ring-[#22C55E]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">
                  Concepto del cobro
                </label>
                <input
                  type="text"
                  required
                  value={formParams.concept}
                  onChange={(e) => setFormParams({ ...formParams, concept: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-[#22C55E]"
                  placeholder="Ej. Diseño de logotipo"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">
                  Cliente <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={formParams.client}
                  onChange={(e) => setFormParams({ ...formParams, client: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-[#22C55E]"
                  placeholder="Nombre o ID del cliente"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#006847] hover:bg-[#00573C] active:bg-[#004D33] text-white font-bold py-3 rounded-lg text-sm transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <PlusCircle size={16} />
                CREAR LINK DE PAGO
              </button>
            </form>
          </div>

          {/* Config form */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mt-2">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase mb-3 flex items-center justify-between">
              Datos Bancarios Receptor
              {configSavedInfo && <span className="text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Guardado</span>}
            </h2>
            <form onSubmit={handleConfigSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Banco</label>
                <input
                  type="text"
                  required
                  value={bankConfig.name}
                  onChange={(e) => setBankConfig({ ...bankConfig, name: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-md p-1.5 outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej. BBVA"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">CLABE Interbancaria (18 dígitos)</label>
                <input
                  type="text"
                  required
                  value={bankConfig.clabe}
                  onChange={(e) => setBankConfig({ ...bankConfig, clabe: e.target.value })}
                  className="w-full text-xs font-mono border border-slate-300 rounded-md p-1.5 outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="000000000000000000"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Titular / Razón Social</label>
                <input
                  type="text"
                  required
                  value={bankConfig.owner}
                  onChange={(e) => setBankConfig({ ...bankConfig, owner: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-md p-1.5 outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="Nombre de la cuenta"
                />
              </div>
              <button
                type="submit"
                disabled={isConfigSaving || configSavedInfo}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-lg text-[11px] transition-colors mt-1 disabled:opacity-70 disabled:cursor-not-allowed uppercase"
              >
                {isConfigSaving ? "GUARDANDO..." : "GUARDAR Y APLICAR"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-full flex flex-col">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase mb-4 flex justify-between items-center">
              Últimos Enlaces Generados
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 py-1 px-2 rounded-md border border-slate-200">
                {orders.length} pedidos
              </span>
            </h2>

            <div className="overflow-hidden flex-1 relative min-h-[400px]">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Cargando...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 size={20} className="text-slate-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Aún no hay cobros</h3>
                  <p className="text-xs text-slate-500">Los links generados aparecerán aquí.</p>
                </div>
              ) : (
                <div className="absolute inset-0 divide-y divide-slate-100 overflow-y-auto w-full">
                  {orders.map((order) => (
                    <div key={order.id} className="py-4 hover:bg-slate-50 transition-colors flex flex-col xl:flex-row xl:items-center justify-between gap-4 -mx-5 px-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm font-bold text-slate-900">${order.amount.toFixed(2)} MXN</span>
                          {order.status === "paid" ? (
                            <span className="px-2 py-0.5 bg-[#16A34A]/10 text-[#16A34A] rounded-full text-[10px] uppercase font-bold tracking-wide">
                              Pagado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] rounded-full text-[10px] uppercase font-bold tracking-wide">
                              Pendiente
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-700 line-clamp-1">{order.concept}</p>
                        
                        <div className="mt-2 flex items-center gap-4 text-[11px] font-mono text-slate-500">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">REF:</span>
                            <span className="font-semibold text-[#006847] bg-[#006847]/10 border border-[#006847]/20 px-1.5 py-0.5 rounded">
                              {order.reference}
                            </span>
                          </div>
                          {order.client && (
                            <span className="text-slate-400 truncate max-w-[100px] sm:max-w-[150px]">
                              {order.client}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 xl:mt-0 xl:justify-end">
                       {order.status === "pending" && (
                         <button
                           onClick={() => markAsPaid(order.id)}
                           className="px-3 py-1.5 text-[11px] uppercase font-bold tracking-wider text-[#16A34A] bg-[#16A34A]/10 border border-[#16A34A]/20 rounded-md hover:bg-[#16A34A]/20 transition-colors flex items-center gap-1"
                           title="Marcar como pagado manualmente"
                         >
                           <CheckCircle2 size={14} />
                           <span className="hidden sm:inline">Pagado</span>
                         </button>
                       )}
                       <Link 
                        to={`/pay/${order.id}`}
                        target="_blank"
                        className="px-3 py-1.5 text-[11px] uppercase font-bold tracking-wider text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink size={14} />
                        <span className="hidden sm:inline">Ver</span>
                      </Link>
                      
                      <button
                        onClick={() => copyToClipboard(order.id)}
                        className={`px-3 py-1.5 text-[11px] uppercase font-bold tracking-wider rounded-md transition-all flex items-center gap-1 ${
                          copiedLink === order.id ? "bg-[#16A34A] text-white" : "bg-[#006847] hover:bg-[#00573C] active:bg-[#004D33] text-white"
                        }`}
                      >
                        {copiedLink === order.id ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span className="hidden sm:inline">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span className="hidden sm:inline">Link</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          const link = `${getAppUrl()}/pay/${order.id}`;
                          const copyText = `¡Hola! Tu link de pago seguro por $${order.amount.toFixed(2)} MXN - ${order.concept} - está listo.\n\nPuedes ver los datos exactos (CLABE y Referencia) e instrucciones para transferir aquí: \n${link}\n\nPor favor usa el monto exacto y la referencia indicada para que el pago se acredite correctamente.`;
                          navigator.clipboard.writeText(copyText);
                          setCopiedLink(`${order.id}-msg`);
                          setTimeout(() => setCopiedLink(null), 2000);
                        }}
                        className={`px-3 py-1.5 text-[11px] uppercase font-bold tracking-wider rounded-md border transition-all flex items-center gap-1 ${
                          copiedLink === `${order.id}-msg` ? "border-[#16A34A] text-[#16A34A] bg-[#16A34A]/10" : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                        }`}
                        title="Copiar mensaje de WhatsApp"
                      >
                        {copiedLink === `${order.id}-msg` ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink size={14} className="rotate-90"/>
                            <span className="hidden sm:inline">WhatsApp</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
