# AutoNex — Contrato de API assumido (Fase 1)

Nomes padrão, a ajustar com a API Java. Base URL em `EXPO_PUBLIC_API_URL`.
Autenticação: header `Authorization: Bearer <token>` em todas as rotas, exceto login e cadastro.

## Autenticação

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ token, user, company }` |
| POST | `/auth/register` | `{ name, email, password, companyName, document, acceptTerms }` | `{ token, user, company }` |
| GET | `/auth/me` | — | `{ user, company }` |

## Convites

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/invitations` | — | `Invitation[]` |
| POST | `/invitations` | `{ email, role }` | `Invitation` |
| DELETE | `/invitations/{id}` | — | 204 |

## Modelos

- `user`: `{ id, name, email, role, companyId }`
- `company`: `{ id, tradeName, document }`
- `Invitation`: `{ id, email, role, status, expiresAt }`
- `role`: `OWNER`, `MANAGER`, `SELLER`, `FINANCE`, `MARKETING`, `AFTER_SALES`, `PLATFORM_ADMIN`
- `Invitation.status`: `PENDING`, `ACCEPTED`, `CANCELED`, `EXPIRED`

## Erros

Em caso de erro, o app mostra o campo `message` do corpo da resposta, se existir.
Um `401` encerra a sessão no app.

## Veículos (estoque)

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/vehicles` | — | `Vehicle[]` |
| GET | `/vehicles/{id}` | — | `Vehicle` |
| POST | `/vehicles` | `VehiclePayload` | `Vehicle` (nasce com status `PREPARING`) |
| PATCH | `/vehicles/{id}/status` | `{ status }` | `Vehicle` |

- `Vehicle`: `{ id, category, brand, model, version?, yearManufacture, yearModel, color, mileage, fuel, transmission, plate?, description?, price, acquisitionCost?, extraCosts?, status, imageUrl?, createdAt }`
- `VehiclePayload`: o mesmo, sem `id`, `status`, `imageUrl` e `createdAt`.
- `category`: `CAR`, `MOTORCYCLE`, `UTILITY`, `PICKUP`, `TRUCK`
- `status`: `PREPARING`, `AVAILABLE`, `RESERVED`, `NEGOTIATING`, `SOLD`, `UNAVAILABLE`, `ARCHIVED`
- `fuel`: `GASOLINE`, `ETHANOL`, `FLEX`, `DIESEL`, `ELECTRIC`, `HYBRID`
- `transmission`: `MANUAL`, `AUTOMATIC`, `CVT`, `AUTOMATED`
- Valores em reais (número). `acquisitionCost` e `extraCosts` só devem ser enviados a quem pode ver custos (proprietário, gerente e financeiro); a API precisa omitir esses campos para os demais.
- Transições de status aceitas (a API deve validar também): `PREPARING` para `AVAILABLE`, `UNAVAILABLE` ou `ARCHIVED`; `AVAILABLE` para `RESERVED`, `NEGOTIATING`, `PREPARING`, `UNAVAILABLE` ou `ARCHIVED`; `RESERVED` para `AVAILABLE`, `NEGOTIATING` ou `SOLD`; `NEGOTIATING` para `AVAILABLE`, `RESERVED` ou `SOLD`; `SOLD` para `ARCHIVED`; `UNAVAILABLE` para `AVAILABLE`, `PREPARING` ou `ARCHIVED`; `ARCHIVED` para `UNAVAILABLE`.
- Quem pode criar e mudar status: proprietário e gerente. Vendedor, marketing e financeiro só consultam.

## Clientes e leads

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/leads` | — | `Lead[]` |
| GET | `/leads/{id}` | — | `Lead` |
| POST | `/leads` | `{ name, type, document?, phone, email?, source, vehicleId?, note? }` | `Lead` |
| PATCH | `/leads/{id}/stage` | `{ stage }` | `Lead` |
| POST | `/leads/{id}/notes` | `{ text }` | `Lead` |
| GET | `/customers` | — | `Customer[]` |

- `Lead`: `{ id, customer, vehicleId?, vehicleLabel?, source, stage, responsibleName, notes[], createdAt }`; `customer`: `{ id, name, type, document?, phone, email?, createdAt }`; `notes[]`: `{ id, text, authorName, createdAt }`
- `type`: `PERSON`, `COMPANY`. `stage`: `NEW`, `CONTACTED`, `VISIT`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST` (`WON` e `LOST` são finais).
- Ao criar um lead, se já existir cliente com o mesmo telefone, a API reaproveita o cliente (evita duplicidade).

## Vendas

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/proposals` | — | `Proposal[]` |
| GET | `/proposals/{id}` | — | `Proposal` |
| POST | `/proposals` | `{ customerId, vehicleId, offeredValue, paymentCondition, tradeIn?, validUntil, notes? }` | `Proposal` |
| POST | `/proposals/{id}/actions/{action}` | — | `Proposal` |
| GET | `/sales` | — | `Sale[]` |

- `action`: `approve`, `send`, `accept`, `reject`, `cancel`, `close`.
- `status`: `DRAFT`, `PENDING_APPROVAL`, `SENT`, `ACCEPTED`, `REJECTED`, `CONVERTED`, `CANCELED`.
- Desconto acima de 5% sobre o preço de tabela cria a proposta como `PENDING_APPROVAL`; só gerente ou proprietário executa `approve`.
- `accept` reserva o veículo (`RESERVED`). `cancel` de uma proposta aceita libera a reserva.
- `close` deve ser **uma única operação transacional e idempotente**: marca o veículo como `SOLD`, grava a `Sale` (com a taxa de comissão vigente), cria o lançamento a receber (com `saleId`) e o atendimento de entrega no pós-venda. Repetir a chamada não pode duplicar nada.
- `Proposal`: `{ id, customerId, customerName, vehicleId, vehicleLabel, sellerName, listedPrice, offeredValue, paymentCondition, tradeIn?, validUntil, notes?, status, requiresApproval, history[], createdAt, saleId? }`
- `Sale`: `{ id, proposalId, customerName, vehicleId, vehicleLabel, sellerName, saleValue, commissionRate, commission, closedAt }`

## Financeiro

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/finance/entries` | — | `FinancialEntry[]` |
| POST | `/finance/entries` | `{ type, description, category, amount, dueDate, vehicleId? }` | `FinancialEntry` |
| POST | `/finance/entries/{id}/pay` | — | `FinancialEntry` |
| POST | `/finance/entries/{id}/cancel` | — | `FinancialEntry` |

- `type`: `RECEIVABLE`, `PAYABLE`. `status`: `PENDING`, `PAID`, `CANCELED`. `dueDate` em `AAAA-MM-DD`.
- Não existe exclusão: lançamentos pagos não podem ser cancelados; correções usam estorno ou ajuste.
- `FinancialEntry`: `{ id, type, description, category, amount, dueDate, paidAt?, status, vehicleId?, vehicleLabel?, saleId?, createdAt }`

## Pós-venda

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/aftersales/cases` | — | `AfterSalesCase[]` |
| GET | `/aftersales/cases/{id}` | — | `AfterSalesCase` |
| POST | `/aftersales/cases` | `{ type, title, description?, customerName, vehicleLabel, saleId?, dueDate }` | `AfterSalesCase` |
| PATCH | `/aftersales/cases/{id}/status` | `{ status }` | `AfterSalesCase` |
| POST | `/aftersales/cases/{id}/checklist/{itemId}/toggle` | — | `AfterSalesCase` |

- `type`: `DELIVERY`, `FOLLOW_UP`, `COMPLAINT`, `REQUEST`. `status`: `OPEN`, `IN_PROGRESS`, `DONE`.
- Um atendimento com checklist só pode ir para `DONE` quando todos os itens estiverem marcados.

## Vitrine

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/storefront/settings` | — | `{ storeName, slug, whatsapp?, about?, published }` |
| PUT | `/storefront/settings` | o mesmo | o mesmo |
| GET | `/storefront/listings` | — | `{ vehicle, published }[]` |
| PUT | `/storefront/listings/{vehicleId}` | `{ published }` | 204 |
| GET | `/public/stores/{slug}` | — | `PublicStore` (**sem login**) |
| POST | `/public/stores/{slug}/interest` | `{ name, phone, message?, vehicleId? }` | 204 (**sem login**, cria lead com origem "Vitrine") |

- Rotas `/public/**` não exigem token, precisam de limite de requisições e só devolvem veículos `AVAILABLE` publicados, **sem** custos, placa ou dados internos.
- `slug`: 3 a 40 caracteres entre `a-z`, `0-9` e `-`, único na plataforma.

## Assinatura e plataforma

| Método | Rota | Resposta |
|---|---|---|
| GET | `/subscription` | `{ status, planId, planName, trialEndsAt?, daysLeft?, limits, usage, plans[] }` |
| GET | `/admin/companies` | `AdminCompany[]` (só `PLATFORM_ADMIN`) |
| POST | `/admin/companies/{id}/suspend` | 204 |
| POST | `/admin/companies/{id}/reactivate` | 204 |

- `status`: `TRIAL`, `ACTIVE`, `PAST_DUE`, `CANCELED`, `SUSPENDED`. `limits` e `usage`: `{ users, vehicles, storageGb }`.
- Os limites do plano precisam ser validados também na API. Os planos do app são de demonstração; preços e condições ainda não estão definidos.
- O painel da plataforma não deve expor conteúdo interno das empresas.

## Usuários de teste (para os botões de acesso rápido do app)

Para o login rápido funcionar contra a API real, cadastre estes usuários com a senha `AutoNex@123`: `demo@autonex.com` (proprietário), `gerente@autonex.dev`, `vendedor@autonex.dev`, `financeiro@autonex.dev`, `marketing@autonex.dev`, `posvenda@autonex.dev` e `admin@autonex.dev` (administrador da plataforma, sem empresa).
