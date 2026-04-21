import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Copy, CheckCircle2, AlertCircle, Info, ChevronRight, Check } from "lucide-react";
import { Order } from "../types";

// Configuration is now fetched from the backend

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [bankConfig, setBankConfig] = useState({ name: "", clabe: "", owner: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [orderRes, configRes] = await Promise.all([
        fetch(`/api/orders/${id}`),
        fetch(`/api/config`)
      ]);
      
      if (orderRes.ok && configRes.ok) {
        const orderData = await orderRes.json();
        const configData = await configRes.json();
        setOrder(orderData);
        setBankConfig(configData);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const markAsPaid = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/orders/${id}/pay`, {
        method: "POST",
      });
      if (res.ok) {
        fetchData(); // Reload the order to get the updated status
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false); // keep verifying state logic if needed, but fetch updates status
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-pulse text-slate-400 font-medium tracking-wide">Cargando...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-sm border border-slate-100">
          <AlertCircle size={48} className="text-[#DC2626] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Enlace inválido</h2>
          <p className="text-slate-500">Este link de pago no existe o ha expirado.</p>
        </div>
      </div>
    );
  }

  const isPaid = order.status === "paid";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 flex items-center justify-center" style={{ backgroundColor: "#f8fafc" }}>
      <div className="bg-white w-[380px] max-w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative">
        
        {/* Header bar */}
        <div className={`p-6 text-center text-white ${isPaid ? 'bg-[#16A34A]' : 'bg-[#006847]'}`}>
          <p className="text-[10px] uppercase tracking-widest opacity-80 mb-1">
            {isPaid ? "Pago Completado" : "Pago Solicitado"} - {order.concept}
          </p>
          <h3 className="text-3xl font-bold">${order.amount.toFixed(2)}</h3>
          <p className="text-xs opacity-90 mt-1">MXN</p>
        </div>

        <div className="p-6">
          {isPaid ? (
            <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 rounded-2xl p-8 text-center mt-2">
              <div className="w-16 h-16 bg-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#16A34A]/20">
                <Check className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#16A34A] mb-2">¡Pago Confirmado!</h3>
              <p className="text-sm text-[#16A34A]/90">
                Hemos registrado tu transferencia exitosamente.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              <div className="space-y-4">
                
                {/* Bank Detials */}
                <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Banco Receptor</p>
                  <p className="text-lg font-bold text-slate-800">{bankConfig.name}</p>
                  <span className="text-[10px] uppercase text-slate-500 mt-1 truncate block w-full" title={bankConfig.owner}>
                    {bankConfig.owner}
                  </span>
                </div>

                {/* Account details */}
                <div className="grid grid-cols-1 gap-4">
                  {/* CLABE */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">CLABE Interbancaria</p>
                    <p className="text-lg font-mono font-bold text-slate-900 tracking-wider my-1">{bankConfig.clabe}</p>
                    <button 
                      onClick={() => copyToClipboard(bankConfig.clabe, 'clabe')}
                      className="text-[10px] text-[#006847] mt-1 uppercase font-bold flex items-center justify-center gap-1 mx-auto"
                    >
                      {copiedField === 'clabe' ? <><CheckCircle2 size={12}/> Copiado</> : <><Copy size={12}/> Copiar CLABE</>}
                    </button>
                  </div>

                  {/* Reference */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center relative overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Referencia de pago</p>
                    <div className="flex flex-col items-center justify-center gap-1 mt-1">
                      <p className="text-xl font-mono font-bold text-[#006847]">{order.reference}</p>
                      <button 
                        onClick={() => copyToClipboard(order.reference, 'ref')}
                        className="text-[10px] text-[#006847] uppercase font-bold flex items-center justify-center gap-1"
                        title="Copiar Referencia"
                      >
                        {copiedField === 'ref' ? <><CheckCircle2 size={12}/> Copiado</> : <><Copy size={12}/> Copiar Ref</>}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">Usa esta referencia exacta para conciliar</p>
                  </div>
                </div>

              </div>

              <div className="text-center pt-2">
                <button
                  onClick={markAsPaid}
                  disabled={isVerifying}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm mb-3 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isVerifying ? "NOTIFICANDO..." : "YA REALICÉ EL PAGO"}
                </button>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
                  El vendedor recibirá una notificación
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
