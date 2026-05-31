import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, FolderKanban, MoreVertical, Trash2, Edit2, Loader2, ArrowRight } from "lucide-react";
import { 
  useListProjects, 
  useCreateProject, 
  useUpdateProject, 
  useDeleteProject,
  getListProjectsQueryKey 
} from "@/services/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const projectSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useListProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { isActive: true }
  });

  const onSubmitCreate = (data: ProjectFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        toast.success("Projeto criado");
        setIsCreateOpen(false);
        reset();
      },
      onError: () => toast.error("Não foi possível criar o projeto")
    });
  };

  const onSubmitEdit = (data: ProjectFormValues) => {
    if (!editingProject) return;
    updateMutation.mutate({ projectId: editingProject.id, ...data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        toast.success("Projeto atualizado");
        setEditingProject(null);
      },
      onError: () => toast.error("Não foi possível atualizar o projeto")
    });
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    deleteMutation.mutate({ projectId: deletingId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        toast.success("Projeto excluído");
        setDeletingId(null);
      },
      onError: () => toast.error("Não foi possível excluir o projeto")
    });
  };

  const openEdit = (project: any) => {
    setValue("name", project.name);
    setValue("description", project.description || "");
    setValue("isActive", project.isActive ?? project.active);
    setEditingProject(project);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus projetos e endpoints de webhook.</p>
        </div>
        <Button 
          onClick={() => { reset(); setIsCreateOpen(true); }}
          className="rounded-xl font-semibold shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo projeto
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : projects?.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
            <FolderKanban className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Nenhum projeto ainda</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            Crie seu primeiro projeto para organizar seus endpoints de webhook e monitorar eventos.
          </p>
          <Button onClick={() => { reset(); setIsCreateOpen(true); }} className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" /> Criar projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              key={project.id}
            >
              <div className="group relative bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={(project.isActive ?? project.active) ? "default" : "secondary"} className="rounded-md px-2.5 shadow-none">
                    {(project.isActive ?? project.active) ? "Ativo" : "Inativo"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(project)}>
                          <Edit2 className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(project.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2 truncate" title={project.name}>{project.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                  {project.description || "Sem descrição informada."}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                  <div className="text-sm font-medium text-muted-foreground">
                    <span className="text-foreground">{project.endpointCount}</span> Endpoints
                  </div>
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="ghost" size="sm" className="font-semibold text-primary hover:text-primary hover:bg-primary/5 -mr-3">
                      Ver <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-xl">Criar projeto</DialogTitle>
            </DialogHeader>
          </div>
          <form onSubmit={handleSubmit(onSubmitCreate)} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Nome do projeto</Label>
              <Input {...register("name")} placeholder="Webhooks de produção" className="rounded-xl" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input {...register("description")} placeholder="Recebimento de eventos da Stripe e GitHub" className="rounded-xl" />
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
      <Dialog open={!!editingProject} onOpenChange={(v) => !v && setEditingProject(null)}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-xl">Editar projeto</DialogTitle>
            </DialogHeader>
          </div>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Nome do projeto</Label>
              <Input {...register("name")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input {...register("description")} className="rounded-xl" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label>Status ativo</Label>
              <Switch 
                checked={watch("isActive")} 
                onCheckedChange={(c) => setValue("isActive", c)} 
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingProject(null)} className="rounded-xl">Cancelar</Button>
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
            <DialogTitle>Excluir projeto?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Tem certeza de que deseja excluir este projeto? Todos os endpoints e eventos de webhook associados serão removidos permanentemente. Esta ação não pode ser desfeita.
          </p>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDeletingId(null)} className="rounded-xl">Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending} className="rounded-xl">
              {deleteMutation.isPending ? "Excluindo..." : "Excluir projeto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
