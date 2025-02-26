# Trabalho / Assignment #3

## Constituição do Grupo
Afonso Fernandes (29344)
Pedro Correia (29241)

# Objetivo

Desenvolver aplicações web colaborativas e interativas que integrem os seguintes conceitos principais:

1. **Desenvolvimento Full-Stack Web:**
   - Frontend dinâmico e responsivo (CSS, JavaScript, React).
   - Backend com Node.js e APIs RESTful.
2. **Colaboração em Tempo Real:**
   - Sincronização de dados entre utilizadores utilizando WebSockets.
3. **Gestão de Dados e Segurança:**
   - Persistência de dados com MongoDB.
   - Autenticação segura utilizando JWT.
4. **Resolução de Problemas Reais:**
   - Aplicações práticas focadas em funcionalidades úteis e interação entre utilizadores.

Este exercício foca-se na implementação de sistemas funcionais, colaboração e boas práticas no desenvolvimento web.

# Tema

## Sistema de Boleias em Tempo Real

### Descrição

Uma aplicação onde utilizadores autenticados podem criar, gerir e participar em grupos de boleias, com horários e lugares disponíveis atualizados em tempo real.

### Funcionalidades

1. **Autenticação**
   - Registo e login utilizando JWT.
   - Sistema básico de permissões (utilizadores para oferecer e procurar boleias).
2. **Gestão de Grupos de Boleias**
   - Criar e gerir grupos com rotas específicas.
   - Listar grupos disponíveis com detalhes como horário e pontos de encontro.
3. **Submissão e Visualização de Disponibilidade**
   - Oferecer lugares disponíveis de forma segura.
   - Visualizar em tempo real as vagas disponíveis em diferentes grupos.
4. **Atualizações em Tempo Real**
   - Uso de WebSockets para refletir novas vagas e ocupações em tempo real para todos os utilizadores conectados.

### Tecnologias

- **Frontend:** CSS, JavaScript. React para a construção de interfaces dinâmicas.
- **Backend:** Node.js (+ Express).
- **Base de Dados:** MongoDB para guardar dados de grupos, rotas e membros.
- **Autenticação:** JWT para sessões seguras.
- **Comunicação em Tempo Real:** WebSockets (via Socket.IO).
- **API REST:** Endpoints para autenticação, gestão de grupos, e atualizações de disponibilidade.

### Build / Install / Configure

1. ```npm install```
2. Configurar `.env` com connection string para a base de dados mongodb (`DB_URI`), JWT Secret (`JWT_SECRET`) e credenciais Google (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
3. ```npm run dev```

## Contribuição dos Elementos

- **Afonso Fernandes:** Implementação do sistema de gestão de grupos e estatísticas das boleias, Autenticação JWT,.
- **Pedro Correia:** Integração com WebSockets, persistência de dados com MongoDB, conexão via Mongoose.

## Publicação Render

- [Plataforma de Boleias em Tempo Real](https://project-assignment-3-29241-29344.onrender.com/)