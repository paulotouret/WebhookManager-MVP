import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Copy,
  Key,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import {
  getGetMeQueryKey,
  getMfaSetup,
  useChangePassword,
  useDisableMfa,
  useEnableMfa,
  useUpdateProfile,
} from '@/services/api-client-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const profileSchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio'),
  email: z.string().email('E-mail valido obrigatorio'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual obrigatoria'),
    newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const enableMfaMutation = useEnableMfa();
  const disableMfaMutation = useDisableMfa();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const [mfaStep, setMfaStep] = useState<'idle' | 'setup' | 'success'>('idle');
  const [mfaData, setMfaData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Perfil atualizado com sucesso');
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err: any) => {
        toast.error(err?.message || 'Não foi possível atualizar o perfil');
      },
    });
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success('Senha alterada com sucesso');
          resetPassword();
          localStorage.removeItem('hookflow_token');
          window.location.href = '/login';
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Não foi possível alterar a senha');
        },
      },
    );
  };

  const handleStartMfaSetup = async () => {
    try {
      setIsLoadingSetup(true);
      const data = await getMfaSetup();
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(data.otpauthUrl)}`;
      setMfaData({ secret: data.secret, qrCodeUrl });
      setMfaStep('setup');
    } catch (err: any) {
      toast.error(err?.message || 'Não foi possível iniciar a configuração de MFA');
    } finally {
      setIsLoadingSetup(false);
    }
  };

  const handleVerifyMfa = () => {
    if (!mfaData) {
      toast.error('Configuracao de MFA não inicializada');
      return;
    }

    if (mfaCode.length !== 6) {
      toast.error('Informe um código de 6 dígitos valido');
      return;
    }

    enableMfaMutation.mutate(
      { code: mfaCode },
      {
        onSuccess: (res) => {
          toast.success('Autenticação de dois fatores ativada');
          setBackupCodes(res.backupCodes || []);
          setMfaStep('success');
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Código de autenticação inválido');
        },
      },
    );
  };

  const copyToClipboard = (text: string, isSecret = false) => {
    navigator.clipboard.writeText(text);
    if (isSecret) {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      toast.success('Copiado para a área de transferência');
    }
  };

  const handleDisableMfa = () => {
    if (!disablePassword) {
      toast.error('Senha obrigatoria');
      return;
    }

    disableMfaMutation.mutate(
      { password: disablePassword },
      {
        onSuccess: () => {
          toast.success('Autenticação de dois fatores desativada');
          setDisableDialogOpen(false);
          setDisablePassword('');
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Senha incorreta');
        },
      },
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Configurações da conta</h1>
        <p className="text-muted-foreground">
          Gerencie seu perfil, preferências de segurança e métodos de autenticação.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 bg-card border border-border/50 p-1 w-full sm:w-auto inline-flex rounded-xl shadow-sm">
          <TabsTrigger
            value="profile"
            className="rounded-lg px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-lg px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium"
          >
            <Key className="w-4 h-4 mr-2" />
            Seguranca
          </TabsTrigger>
          <TabsTrigger
            value="mfa"
            className="rounded-lg px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Autenticação em dois fatores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="focus-visible:outline-none">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl">Informacoes pessoais</CardTitle>
                <CardDescription>Atualize seu nome de exibicao e endereço de e-mail.</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3 max-w-md">
                    <Label htmlFor="name">Nome completo</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        {...registerProfile('name')}
                        className="pl-10 rounded-xl"
                        placeholder="Joao Silva"
                      />
                    </div>
                    {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name.message}</p>}
                  </div>

                  <div className="space-y-3 max-w-md">
                    <Label htmlFor="email">Endereco de e-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        {...registerProfile('email')}
                        className="pl-10 rounded-xl"
                        placeholder="joao@exemplo.com"
                      />
                    </div>
                    {profileErrors.email && (
                      <p className="text-xs text-destructive">{profileErrors.email.message}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="rounded-xl px-8 shadow-md"
                  >
                    {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Salvar alterações
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="focus-visible:outline-none">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl">Alterar senha</CardTitle>
                <CardDescription>
                  Garanta que sua conta use uma senha forte e aleatoria para permanecer segura.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3 max-w-md">
                    <Label htmlFor="currentPassword">Senha atual</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        {...registerPassword('currentPassword')}
                        className="pl-10 rounded-xl"
                        placeholder="••••••••"
                      />
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-3 max-w-md pt-4 border-t border-border/50">
                    <Label htmlFor="newPassword">Nova senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        {...registerPassword('newPassword')}
                        className="pl-10 rounded-xl"
                        placeholder="••••••••"
                      />
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-3 max-w-md">
                    <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...registerPassword('confirmPassword')}
                        className="pl-10 rounded-xl"
                        placeholder="••••••••"
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="rounded-xl px-8 shadow-md"
                  >
                    {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Atualizar senha
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="mfa" className="focus-visible:outline-none">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      Autenticação de dois fatores
                      {user?.mfaEnabled ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 ml-2">
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="ml-2 text-muted-foreground">
                          Inativa
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      Adicione uma camada extra de segurança a sua conta.
                    </CardDescription>
                  </div>
                  <ShieldAlert
                    className={`w-10 h-10 ${user?.mfaEnabled ? 'text-emerald-500' : 'text-muted-foreground/30'}`}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {user?.mfaEnabled && (
                  <div className="space-y-6">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground">Sua conta está segura</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          A autenticação de dois fatores está ativada. Você receberá solicitação de código
                          de autenticação ao entrar.
                        </p>
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="destructive"
                        onClick={() => setDisableDialogOpen(true)}
                        className="rounded-xl shadow-sm"
                      >
                        Desativar autenticação em dois fatores
                      </Button>
                    </div>
                  </div>
                )}

                {!user?.mfaEnabled && mfaStep === 'idle' && (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Proteja sua conta com um app autenticador
                    </h3>
                    <p className="text-muted-foreground max-w-md text-sm">
                      Recomendamos usar um app autenticador, como Google Authenticator ou Authy,
                      para receber códigos seguros de 6 dígitos.
                    </p>
                    <Button
                      onClick={handleStartMfaSetup}
                      disabled={isLoadingSetup}
                      className="mt-4 rounded-xl px-8 shadow-lg shadow-primary/20"
                    >
                      {isLoadingSetup ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Configurar app autenticador
                    </Button>
                  </div>
                )}

                {!user?.mfaEnabled && mfaStep === 'setup' && mfaData && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="grid md:grid-cols-2 gap-8"
                    >
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                              1
                            </span>
                            Escaneie o QR Code
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2 ml-8">
                            Abra seu app autenticador e escaneie este QR code.
                          </p>
                        </div>
                        <div className="ml-8 p-4 bg-white rounded-2xl border border-border inline-block shadow-sm">
                          <img src={mfaData.qrCodeUrl} alt="QR Code do MFA" className="w-48 h-48" />
                        </div>
                        <div className="ml-8">
                          <p className="text-xs text-muted-foreground mb-2">
                            Não conseguiu escanear? Use esta chave secreta:
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-3 py-1.5 rounded-lg text-xs font-mono text-foreground font-semibold tracking-wider">
                              {mfaData.secret}
                            </code>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => copyToClipboard(mfaData.secret, true)}
                            >
                              {copiedSecret ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                              2
                            </span>
                            Verificar código
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2 ml-8">
                            Digite o código de 6 dígitos gerado pelo app.
                          </p>
                        </div>
                        <div className="ml-8 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="mfaCode">Código de autenticação</Label>
                            <Input
                              id="mfaCode"
                              value={mfaCode}
                              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              className="text-center tracking-[0.5em] font-mono text-2xl h-14 rounded-xl"
                            />
                          </div>
                          <Button
                            onClick={handleVerifyMfa}
                            disabled={mfaCode.length !== 6 || enableMfaMutation.isPending}
                            className="w-full rounded-xl h-12 shadow-md"
                          >
                            {enableMfaMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              'Verificar e ativar'
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full text-muted-foreground"
                            onClick={() => setMfaStep('idle')}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}

                {!user?.mfaEnabled && mfaStep === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 max-w-2xl mx-auto"
                  >
                    <div className="text-center space-y-2 mb-8">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Autenticação de dois fatores ativada</h3>
                      <p className="text-muted-foreground">
                        Sua conta agora está protegida. Salve estes códigos de recuperação em um local seguro.
                        Você pode usá-los para acessar a conta caso perca seu dispositivo.
                      </p>
                    </div>

                    <div className="bg-muted/30 border border-border rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Key className="w-4 h-4 text-primary" />
                          Códigos de recuperação
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(backupCodes.join('\n'))}
                        >
                          <Copy className="w-4 h-4 mr-2" /> Copiar tudo
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {backupCodes.map((code, i) => (
                          <div
                            key={i}
                            className="bg-background border border-border/50 p-3 rounded-lg text-center font-mono tracking-widest text-sm font-medium shadow-sm"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full rounded-xl h-12 shadow-md"
                      onClick={() => {
                        setMfaStep('idle');
                        setMfaCode('');
                      }}
                    >
                      Já salvei estes códigos
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" /> Desativar 2FA
              </DialogTitle>
              <DialogDescription className="pt-2">
                Isso vai remover a camada extra de segurança da sua conta. Digite sua senha para confirmar.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Senha atual</Label>
              <Input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Digite sua senha"
                className="rounded-xl"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setDisableDialogOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisableMfa}
                disabled={disableMfaMutation.isPending || !disablePassword}
                className="rounded-xl"
              >
                {disableMfaMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Desativar MFA
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
