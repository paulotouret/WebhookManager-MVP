# Webhook Manager API - MVP

Sistema robusto para recebimento, gerenciamento e reprocessamento (Replay) de Webhooks.

## 🚀 Tecnologias
- **Node.js** com **Fastify** (Alta performance)
- **Prisma ORM** com **PostgreSQL**
- **Zod** (Validação de esquemas)
- **Undici** (Fetch HTTP otimizado para Replay)
- **BullMQ** (Fila de processamento para encaminhamento)

## 📌 Principais Funcionalidades
- **Multi-tenancy:** Usuários gerenciam seus próprios Projetos e Endpoints.
- **Ingestão Universal:** Recebe Webhooks via GET, POST, PUT, DELETE e PATCH.
- **Filtros Avançados:** Busca de eventos por método HTTP e intervalo de datas.
- **Cascade Delete:** Exclusão inteligente de projetos e endpoints (remove logs vinculados).
- **Sistema de Replay:** Reenvia webhooks salvos para qualquer URL externa com limpeza automática de headers conflitantes.

---

## 🛠 Documentação das Rotas

### Autenticação
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/users/register` | Registrar novo usuário |
| POST | `/auth/login` | Login (Retorna JWT Token) |
| GET | `/users/me` | Dados do usuário logado (Requer Token) |

### Projetos (Requer Token Bearer)
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/projects` | Criar novo projeto |
| GET | `/projects` | Listar todos os projetos do usuário |
| PATCH | `/projects/:id` | Editar nome do projeto |
| DELETE | `/projects/:id` | Excluir projeto (e seus endpoints/eventos) |

### Endpoints (Requer Token Bearer)
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/endpoints` | Criar endpoint (Retorna `urlPath`) |
| GET | `/endpoints?projectId={id}` | Listar endpoints de um projeto |
| PATCH | `/endpoints/:id` | Editar (Nome, Destino, Status Ativo/Inativo) |
| DELETE | `/endpoints/:id` | Excluir endpoint (e seus eventos) |

### Eventos & Busca (Requer Token Bearer)
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| GET | `/events?endpointId={id}` | Listar eventos de um endpoint |
| GET | `/events?endpointId={id}&method=POST` | Filtrar por método (GET, POST, etc.) |
| GET | `/events?endpointId={id}&startDate={ISO}&endDate={ISO}` | Filtrar por intervalo de datas |

### Replay (Requer Token Bearer)
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/replay` | Reenviar evento para `targetUrl` |

### Recebimento (Público)
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| ANY | `/wh/:urlPath` | Rota que recebe os webhooks externos |

---

## ⚙️ Como rodar o projeto
1. Instale as dependências: `npm install`
2. Configure o `.env` (DATABASE_URL, JWT_SECRET)
3. Rode as migrações: `npx prisma migrate dev`
4. Inicie o servidor: `npm run dev`
5. Acesse a documentação Swagger em: `http://localhost:3000/docs`
