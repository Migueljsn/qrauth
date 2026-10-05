# QRAuth — Documento Master

> Use este arquivo como briefing/prompt no Gamma para gerar a apresentação do sistema. Mantenha-o atualizado a cada entrega.

## Prompt para o Gamma
Crie uma apresentação profissional (12–15 slides, tom corporativo e confiável, paleta roxo/verde) sobre o **QRAuth**, plataforma de autenticação de produtos por QR Code para indústrias. Estrutura: problema (falsificação), solução, como funciona para o consumidor, painel administrativo, regras de leitura personalizáveis, controle de estoque, multiusuário e permissões, segurança, arquitetura, roadmap e próximos passos. Use o conteúdo abaixo.

## O problema
Produtos falsificados, principalmente em setores regulados (farmacêutico, cosméticos, alimentos). O consumidor não tem como comprovar a originalidade.

## A solução
Cada produto (ou lote) recebe um QR Code com **código único**. O consumidor lê pelo celular, o site abre a câmera de autenticação e informa em segundos se o produto é **autêntico** (com dados do produto e do lote) ou **não autêntico**.

## Dois fluxos de leitura (escolhidos ao gerar o QR)
- **Com câmera do site (padrão):** *QR de entrada* (igual em todos os produtos; abre o site com o botão Autenticar) + *QR único* (só o código; só a câmera do site valida). Exige leitura ao vivo do QR físico e dificulta autenticar por foto.
- **Direto:** o QR único grava a URL; a câmera do celular já mostra o resultado.
- O painel gera, baixa e imprime o QR de entrada (QR Codes → QR de entrada).

## Fluxo do consumidor
1. Lê o QR institucional (ou o do produto) com a câmera do celular → abre o site.
2. Toca em **Autenticar** → câmera do site com guia de enquadramento e lanterna.
3. Lê o QR do produto → resultado: ✔ AUTÊNTICO (nome, descrição, lote, validade, código) ou ✖ alerta (inexistente, limite excedido, expirado, desativado, revogado).

## Painel administrativo
- **Dashboard:** produtos, lotes, QR gerados/ativos/esgotados, leituras 24h, leituras suspeitas.
- **Catálogo:** categorias e produtos (imagem, descrição, atributos livres como dosagem).
- **Lotes & estoque:** lotes com validade, entradas, saídas e ajustes; saldo por produto.
- **QR Codes (CRUD completo):** gerar QR de **lote** (1 código para o lote) ou **unitário** (até 10.000 por vez); editar, desativar, revogar, zerar leituras, excluir; imprimir etiquetas.
- **Regras por QR (personalizáveis):** máximo de leituras (ex.: 3 ou 4 — depois é desativado) ou **ilimitado**; validade; mensagem ao consumidor; rótulo.
- **Leituras:** histórico com resultado de cada verificação.
- **Usuários (super admin):** criar, editar, redefinir senha (incluindo a própria), ativar/desativar, excluir. Papéis: super admin, admin, operador.

## Segurança (diferenciais)
Chaves secretas apenas no servidor · RLS em todas as tabelas · verificação atômica no banco · Cloudflare Turnstile (anti-bot) · rate limit (aplicação + banco + Cloudflare) · IP armazenado só como hash · CSP/HSTS · autorização por papel no servidor · sem enumeração de usuários no login.

## Arquitetura
Next.js 16 + Supabase (Postgres, Auth, RLS) · Docker no EasyPanel · Cloudflare na borda.

## Roadmap
Relatórios e exportação CSV · mapa/geolocalização de leituras · alertas de leituras suspeitas · multilíngue (PT/EN/ES) · marca/white-label por indústria · MFA para administradores · API para ERP.
