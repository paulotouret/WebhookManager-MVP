import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowLeft, MoreVertical, Trash2, Edit2, Copy, Link as LinkIcon, ExternalLink } from "lucide-react";
import { 
  useGetProject,
  useListEndpoints,
  useCreateEndpoint,
  useUpdateEndpoint,
  useDeleteEndpoint,
  getListEndpointsQueryKey
} from "@/services/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const endpointSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  description: z.string().optional(),
  targetUrl: z.string().url("Informe uma URL valida").optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

type EndpointFormValues = z.infer<typeof endpointSchema>;

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:projectId");
  const projectId = params?.projectId || "";
  
  const queryClient = useQueryClient();
  const { data: project, isLoading: projectLoading } = useGetProject(projectId);
  const { data: endpoints, isLoading: endpointsLoading } = useListEndpoints(projectId);
  
  const createMutation = useCreateEndpoint();
  const updateMutation = useUpdateEndpoint();
  const deleteMutation = useDeleteEndpoint();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EndpointFormValues>({
    resolver: zodResolver(endpointSchema),
    defaultValues: { isActive: true }
  });

  const onSubmitCreate = (data: EndpointFormValues) => {
    createMutation.mutate({ projectId, ...data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEndpointsQueryKey(projectId) });
        toast.success("Endpoint criado");
        setIsCreateOpen(false);
        reset();
      },
      onError: () => toast.error("Não foi possível criar o endpoint")
    });
  };

  const onSubmitEdit = (data: EndpointFormValues) => {
    if (!editingEndpoint) return;
    updateMutation.mutate({ projectId, endpointId: editingEndpoint.id, ...data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEndpointsQueryKey(projectId) });
        toast.success("Endpoint atualizado");
        setEditingEndpoint(null);
      },
      onError: () => toast.error("Não foi possível atualizar o endpoint")
    });
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    deleteMutation.mutate({ projectId, endpointId: deletingId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEndpointsQueryKey(projectId) });
        toast.success("Endpoint excluído");
        setDeletingId(null);
      },
      onError: () => toast.error("Não foi possível excluir o endpoint")
    });
  };

  const openEdit = (endpoint: any) => {
    setValue("name", endpoint.name);
    setValue("description", endpoint.description || "");
    setValue("targetUrl", endpoint.targetUrl || "");
    setValue("isActive", endpoint.isActive);
    setEditingEndpoint(endpoint);
  };

  const copyToClipboard = (text: string) => {
    const fullUrl = window.location.origin + text;
    navigator.clipboard.writeText(fullUrl);
    toast.success("URL copiada para a área de transferência");
  };

  if (projectLoading) return <div className="p-10">Carregando...</div>;
  if (!project) return <div className="p-10">Projeto não encontrado.</div>;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para projetos
      </Link>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-8 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-foreground">{project.name}</h1>
            <Badge variant={project.isActive ? "default" : "secondary"}>{project.isActive ? "Ativo" : "Inativo"}</Badge>
          </div>
          <p className="text-muted-foreground">{project.description || "Sem descrição."}</p>
        </div>
        <Button 
          onClick={() => { reset(); setIsCreateOpen(true); }}
          className="rounded-xl font-semibold shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo endpoint
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-display font-bold mb-6">Endpoints</h2>
        {endpointsLoading ? (
          <div className="p-10">Carregando endpoints...</div>
        ) : endpoints?.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <LinkIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum endpoint ainda</h3>
            <p className="text-muted-foreground mb-6">Crie um endpoint para receber webhooks de entrada.</p>
            <Button onClick={() => { reset(); setIsCreateOpen(true); }} className="rounded-xl">
              Criar endpoint
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {endpoints?.map((endpoint, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                key={endpoint.id}
              >
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center">
                        <Webhook className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{endpoint.name}</h3>
                        <Badge variant={endpoint.isActive ? "outline" : "secondary"} className="mt-1">
                          {endpoint.isActive ? "Recebendo" : "Pausado"}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(endpoint)}>
                          <Edit2 className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(endpoint.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-4 mb-6 flex-1">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL do webhook</span>
                      <div className="mt-1.5 flex items-center gap-2 bg-secondary/50 rounded-lg p-2.5 border border-border/50">
                        <code className="text-xs font-mono text-foreground truncate flex-1">{endpoint.webhookUrl}</code>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(endpoint.webhookUrl)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {endpoint.targetUrl && (
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL de destino</span>
                        <div className="mt-1 flex items-center text-sm text-foreground truncate">
                          <ExternalLink className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate">{endpoint.targetUrl}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{endpoint.eventCount}</span> eventos registrados
                    </div>
                    <Link href={`/projects/${projectId}/endpoints/${endpoint.id}`}>
                      <Button className="rounded-xl">
                        Ver eventos
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Criar endpoint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input {...register("name")} placeholder="Webhooks Stripe" className="rounded-xl" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>URL de destino (opcional)</Label>
              <Input {...register("targetUrl")} placeholder="https://api.myapp.com/webhooks" className="rounded-xl" />
              <p className="text-xs text-muted-foreground">Encaminharemos as requisições recebidas para esta URL.</p>
              {errors.targetUrl && <p className="text-xs text-destructive">{errors.targetUrl.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input {...register("description")} placeholder="Encaminhamento para API principal" className="rounded-xl" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending} className="rounded-xl">
                {createMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!editingEndpoint} onOpenChange={(v) => !v && setEditingEndpoint(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Editar endpoint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input {...register("name")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>URL de destino</Label>
              <Input {...register("targetUrl")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input {...register("description")} className="rounded-xl" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label>Status ativo</Label>
              <Switch checked={watch("isActive")} onCheckedChange={(c) => setValue("isActive", c)} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingEndpoint(null)} className="rounded-xl">Cancelar</Button>
              <Button type="submit" disabled={updateMutation.isPending} className="rounded-xl">
                {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Excluir endpoint?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Tem certeza de que deseja excluir este endpoint? Todos os eventos associados serão removidos permanentemente.
          </p>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDeletingId(null)} className="rounded-xl">Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending} className="rounded-xl">
              {deleteMutation.isPending ? "Excluindo..." : "Excluir endpoint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


function Webhook(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/></svg>
}
