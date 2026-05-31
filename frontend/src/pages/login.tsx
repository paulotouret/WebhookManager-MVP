import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Webhook, ArrowRight, Loader2, Moon, Sun } from "lucide-react";
import { useLogin } from "@/services/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail valido"),
  password: z.string().min(1, "Senha obrigatoria"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const loginMutation = useLogin();
  const { theme, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      data,
      {
        onSuccess: (res) => {
          localStorage.setItem("hookflow_token", res.token);
          toast.success("Bem-vindo de volta!");
          window.location.href = "/dashboard";
        },
        onError: (err: any) => {
          toast.error(err?.message || "Credenciais invalidas");
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {}
      <div className="absolute top-6 right-6 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10 rounded-lg bg-background/50 backdrop-blur-sm border border-border"
          title={theme === "dark" ? "Alternar para modo claro" : "Alternar para modo escuro"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      
      <div className="flex-1 flex flex-col justify-center items-center z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[420px]"
        >
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Webhook className="h-6 w-6" />
            </div>
            <span className="text-3xl font-display font-bold tracking-tight text-foreground">
              HookFlow
            </span>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 shadow-xl shadow-black/5 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
            
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Entrar</h1>
              <p className="text-sm text-muted-foreground">Informe seus dados para acessar seu painel.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="h-11 rounded-xl"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl"
                  {...register("password")}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-[15px] font-semibold bg-gradient-to-b from-primary to-primary/90"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>Entrar <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">Não tem conta? </span>
              <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
                Crie agora
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
