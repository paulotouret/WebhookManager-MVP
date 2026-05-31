import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  useGetEndpoint,
  useListEvents,
  useReplayEvent,
  getListEventsQueryKey,
  useGetEvent,
} from "@/services/api-client-react";
import { ArrowLeft, Copy, RefreshCw, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EndpointDetail() {
  const [, params] = useRoute("/projects/:projectId/endpoints/:endpointId");
  const projectId = params?.projectId || "";
  const endpointId = params?.endpointId || "";

  const [page, setPage] = useState(1);
  const [method, setMethod] = useState<any>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: endpoint } = useGetEndpoint(projectId, endpointId);
  const { data: eventsData, isLoading } = useListEvents(projectId, endpointId, { page, limit: 15, method });
  const { data: selectedEventData } = useGetEvent(selectedEvent || "");

  const replayMutation = useReplayEvent();

  const [replayEventId, setReplayEventId] = useState<string | null>(null);
  const [replayUrl, setReplayUrl] = useState("");

  const copyToClipboard = (text: string) => {
    const fullUrl = window.location.origin + text;
    navigator.clipboard.writeText(fullUrl);
    toast.success("URL do webhook copiada");
  };

  const getMethodColor = (m: string) => {
    switch (m.toUpperCase()) {
      case "GET": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "POST": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "PUT": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "DELETE": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "PATCH": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const getStatusBadge = (status: string, code?: number | null) => {
    if (status === "pending") return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Pendente</Badge>;
    if (status === "failed") return <Badge variant="destructive">Falhou {code ? `(${code})` : ''}</Badge>;
    return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-transparent">Entregue {code ? `(${code})` : ''}</Badge>;
  };

  const openReplayModal = (eventId: string) => {
    setReplayEventId(eventId);
    setReplayUrl(endpoint?.targetUrl || "");
  };

  const openEventDetails = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const submitReplay = () => {
    if (!replayEventId || !replayUrl) return;
    replayMutation.mutate({ eventId: replayEventId, targetUrl: replayUrl }, {
      onSuccess: () => {
        toast.success("Evento reenviado com sucesso");
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey(projectId, endpointId) });
        setReplayEventId(null);
      },
      onError: () => {
        toast.error("Falha ao reenviar evento");
      }
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <Link href={`/projects/${projectId}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para endpoints
      </Link>

      {endpoint && (
        <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">{endpoint.name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant={endpoint.isActive ? "outline" : "secondary"}>
                {endpoint.isActive ? "Ativo e recebendo" : "Pausado"}
              </Badge>
              <span className="text-sm text-muted-foreground">{endpoint.eventCount} eventos totais</span>
            </div>
          </div>
          
          <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 w-full md:w-auto min-w-[320px]">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">URL do webhook</span>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-foreground flex-1 break-all bg-background px-3 py-1.5 rounded-lg border border-border">
                {endpoint.webhookUrl}
              </code>
              <Button onClick={() => copyToClipboard(endpoint.webhookUrl)} className="shrink-0 h-8 rounded-lg font-medium shadow-sm">
                <Copy className="h-4 w-4 mr-2" /> Copiar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold font-display px-2">Histórico de eventos</h2>
          
          {}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              value={method || ""} 
              onChange={(e) => {
                setMethod(e.target.value === "" ? undefined : e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Todos os métodos</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Carregando eventos...</div>
        ) : eventsData?.events.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-muted-foreground">Nenhum evento registrado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Metodo</th>
                  <th className="px-6 py-4 font-semibold">Recebido em</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {eventsData?.events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getMethodColor(ev.method)}`}>
                        {ev.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground font-medium">
                      {format(new Date(ev.receivedAt), "dd/MM/yyyy HH:mm:ss")}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ev.deliveryStatus, ev.statusCode)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openReplayModal(ev.id)} className="h-8 shadow-xs">
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reenviar
                        </Button>
                        <Button variant="default" size="sm" onClick={() => openEventDetails(ev.id)} className="h-8">
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {}
        {eventsData && eventsData.totalPages > 1 && (
          <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Exibindo página {page} de {eventsData.totalPages} ({eventsData.total} no total)
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(eventsData.totalPages, p + 1))}
                disabled={page === eventsData.totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!replayEventId} onOpenChange={(v) => !v && setReplayEventId(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Reenviar evento de webhook</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>URL de destino</Label>
              <Input 
                value={replayUrl} 
                onChange={(e) => setReplayUrl(e.target.value)} 
                placeholder="https://api.example.com/webhook"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Envie este payload para a URL acima.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplayEventId(null)} className="rounded-xl">Cancelar</Button>
            <Button onClick={submitReplay} disabled={replayMutation.isPending || !replayUrl} className="rounded-xl">
              {replayMutation.isPending ? "Reenviando..." : "Confirmar reenvio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!selectedEvent} onOpenChange={(v) => !v && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle>Detalhes do evento</DialogTitle>
          </DialogHeader>
          
          {selectedEventData ? (
            <ScrollArea className="flex-1 pr-4 -mr-4 max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">ID do evento</span>
                    <p className="font-mono text-xs mt-1 bg-muted px-2 py-1 rounded">{selectedEventData.id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Recebido em</span>
                    <p className="mt-1 text-sm">{format(new Date(selectedEventData.receivedAt), "dd/MM/yyyy HH:mm:ss")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Metodo</span>
                    <p className="mt-1">
                      <Badge variant="outline">{selectedEventData.method}</Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Status</span>
                    <p className="mt-1">{getStatusBadge(selectedEventData.deliveryStatus, selectedEventData.statusCode)}</p>
                  </div>
                  {selectedEventData.remoteIp && (
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">IP remoto</span>
                      <p className="font-mono text-sm mt-1">{selectedEventData.remoteIp}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wider">Cabeçalhos</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedEventData.headers, null, 2))}
                    >
                      Copiar
                    </Button>
                  </div>
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-32 border">
                    {JSON.stringify(selectedEventData.headers, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wider">Parâmetros de query</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedEventData.query, null, 2))}
                    >
                      Copiar
                    </Button>
                  </div>
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-32 border">
                    {JSON.stringify(selectedEventData.query, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wider">Corpo</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedEventData.body, null, 2))}
                    >
                      Copiar
                    </Button>
                  </div>
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-auto max-h-48 border">
                    {JSON.stringify(selectedEventData.body, null, 2)}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando detalhes do evento...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
