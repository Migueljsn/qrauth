# Prompt único para o Gamma — Guia do QRAuth

> Copie tudo a partir da linha "COPIE DAQUI" até o fim e cole no Gamma (modo "Gerar a partir de texto" → Guia/Documento).
> Depois de gerado, troque as imagens pelos arquivos da pasta `docs/guia/prints/` (cada seção abaixo diz qual arquivo vai onde).

---------------- COPIE DAQUI ----------------

Crie um GUIA PASSO A PASSO ilustrado, em português do Brasil, chamado "Guia do QRAuth — Autenticação de produtos por QR Code". Tom: claro, direto, profissional e acolhedor, para quem nunca usou o sistema. Estilo visual: moderno, cores roxo (#4a3f8a) e verde (#4caf6a), cartões limpos, muitos destaques de passos numerados. Cada passo deve ter: título curto, instrução em 1–3 frases, e um espaço reservado para uma captura de tela real (use imagem de marcador cinza com a legenda indicada em [IMAGEM: ...]). Use caixas de "Dica" e "Atenção" quando indicado. Evite jargão técnico.

PÚBLICO-ALVO: (1) administradores/operadores da indústria que usam o painel; (2) clientes finais que verificam o produto no celular.

ESTRUTURA:

1. CAPA
Título, subtítulo "Verifique a autenticidade de cada produto em segundos" e o endereço https://qr.clubeimpulso.com.br

2. O QUE É O QRAUTH
Explique em 4–5 linhas: cada produto (ou lote) recebe um QR Code com código único; o cliente lê pelo celular e o sistema informa se é autêntico; o painel controla produtos, lotes, estoque, QR Codes, leituras e usuários. Liste benefícios: combate à falsificação, rastreio por lote, limite de leituras configurável, histórico de leituras, permissões por usuário.

3. COMO FUNCIONA (visão geral em 4 etapas)
Diagrama simples: Cadastrar produto → Criar lote → Gerar QR Code e imprimir etiqueta → Cliente lê e vê "Autêntico".

PARTE A — PARA O CLIENTE FINAL (celular)

4. PASSO 1: LER O QR CODE DA EMBALAGEM
O cliente aponta a câmera do celular para o QR Code do produto. O celular abre o site de autenticação.
[IMAGEM: publico/01-pagina-inicial.jpg — Página inicial com os 3 passos e o botão Autenticar]

5. PASSO 2: TOCAR EM AUTENTICAR E LER DE NOVO
O site abre a câmera. O cliente aponta para o mesmo QR Code. Dica: ficar em local iluminado e aproximar/afastar devagar até o QR ficar nítido. Há um botão de lanterna.
[IMAGEM: publico/02-camera-de-leitura.jpg — Tela da câmera com moldura verde "Enquadre o QR Code"]
Explique por que são duas leituras: a segunda é feita ao vivo pela câmera do site e dificulta autenticar por foto ou link repassado.

6. RESULTADO: PRODUTO AUTÊNTICO
Mostra o nome do produto, o selo AUTÊNTICO em verde, o código, a descrição, a dosagem/atributos, o lote, a validade e uma mensagem do fabricante.
[IMAGEM: publico/03-autentico.jpg — Resultado autêntico com dados do produto e do lote]

7. RESULTADO: JÁ LIDO ANTES
Se o QR já foi lido, aparece um aviso amarelo com quantas leituras restam. Atenção: se o cliente nunca leu e vê esse aviso, o código pode ter sido copiado.
[IMAGEM: publico/04-autentico-segunda-leitura.jpg — Aviso "Este código já foi lido 1x antes"]

8. RESULTADO: LIMITE EXCEDIDO
Quando o QR atinge o número máximo de leituras, o sistema alerta que o produto pode ter sido copiado ou reutilizado.
[IMAGEM: publico/05-limite-excedido.jpg — Tela vermelha "Atenção — limite excedido"]

9. RESULTADO: NÃO AUTÊNTICO
Se o código não existe na base, o sistema informa que o produto pode ser falsificado e orienta não consumir e denunciar ao fabricante.
[IMAGEM: publico/06-nao-autentico.jpg — Tela vermelha "Não autêntico"]
Liste também os outros alertas possíveis: código expirado, desativado e revogado.

PARTE B — PARA O ADMINISTRADOR (painel)

10. ENTRAR NO PAINEL
Acesse https://qr.clubeimpulso.com.br/admin/login, informe e-mail e senha (use "Mostrar" para ver a senha digitada) e confirme a verificação "humano" da Cloudflare antes de clicar em Entrar. Atenção: após várias tentativas erradas o acesso é bloqueado por alguns minutos.
[IMAGEM: painel/00-login.jpg — Tela de login]

11. CONHECER O DASHBOARD
Explique os cartões: Produtos ativos, Lotes, QR Codes, QR ativos, QR esgotados, Leituras (24h) e Suspeitas (24h). Dica: o botão "?" de cada cartão explica o que o número significa. A lista "Últimas leituras" mostra os resultados mais recentes. O menu lateral destaca a aba atual.
[IMAGEM: painel/01-dashboard.jpg — Dashboard completo]
[IMAGEM: painel/02-dashboard-ajuda.jpg — Balão de ajuda aberto no cartão "QR ativos"]

12. PASSO 1: CRIAR CATEGORIAS
Menu Categorias → preencher Nome e Descrição → Adicionar. Para editar, altere os campos e clique em Salvar; para remover, Excluir. Categorias organizam os produtos.
[IMAGEM: painel/03-categorias-preenchida.jpg — Formulário "Nova categoria" preenchido]

13. PASSO 2: CADASTRAR O PRODUTO
Menu Produtos → "Novo produto". Campos: Nome, SKU, Categoria, URL da imagem (https), Descrição (é mostrada ao cliente) e Atributos (um por linha, no formato "chave: valor", ex.: dosagem: 500 mg). Clique em Salvar produto. Dica: produtos com lotes ou QR vinculados não podem ser excluídos — desative-os.
[IMAGEM: painel/04-produto-preenchido.jpg — Formulário de produto preenchido]
[IMAGEM: painel/05-lista-de-produtos.jpg — Lista de produtos com status Ativo]

14. PASSO 3: CRIAR O LOTE E CONTROLAR O ESTOQUE
Menu Lotes & Estoque. "Novo lote": escolher o Produto, informar Nº do lote, Quantidade produzida, datas de Fabricação e Validade e Notas → Criar lote. A quantidade vira entrada inicial no estoque. Em "Movimentar estoque" registre Entrada, Saída ou Ajuste. "Estoque atual" mostra o saldo por produto.
[IMAGEM: painel/06-lote-preenchido.jpg — Formulário "Novo lote" preenchido]
[IMAGEM: painel/07-estoque-e-lotes.jpg — Tela de estoque atual e movimentação]

15. PASSO 4: GERAR O QR CODE
Menu QR Codes → "Gerar QR Codes". Explique cada campo:
- Tipo: Unitário (um QR por unidade do lote) ou Lote (um único QR para o lote inteiro).
- Fluxo de leitura: "Com câmera do site" (o cliente lê duas vezes, mais seguro, padrão) ou "Direto" (a câmera do celular já mostra o resultado).
- Produto e Lote.
- Quantidade de QR: o padrão é 1 por vez (máx. 10.000).
- Máx. de leituras: após esse número o QR é desativado. Ou marque "Leituras ilimitadas".
- Válido até: data de expiração. Ou marque "Sem validade".
- Prefixo do rótulo (ex.: Frasco) e Mensagem ao consumidor.
Mostre que ao marcar "Leituras ilimitadas" ou "Sem validade" o campo correspondente fica acinzentado e "Indisponível".
[IMAGEM: painel/08-gerar-qr-formulario.jpg — Formulário com os padrões]
[IMAGEM: painel/09-gerar-qr-ilimitado-e-sem-validade.jpg — Campos acinzentados com "Leituras ilimitadas" marcada]
[IMAGEM: painel/10-gerar-qr-preenchido.jpg — Formulário preenchido: 1 QR, máx. 2 leituras]

16. ACOMPANHAR OS QR CODES
A lista mostra Código, Tipo/Fluxo, Produto/Lote, Leituras (usadas/limite; ∞ = ilimitado) e Status (Ativo, Esgotado, Expirado, Desativado, Revogado). Use os filtros por status e lote.
[IMAGEM: painel/11-lista-de-qr-codes.jpg — Lista logo após gerar (0/2, Ativo)]
[IMAGEM: painel/14-qr-esgotado-na-lista.jpg — Lista com um QR "Esgotado" (2/2)]

17. EDITAR UM QR CODE
Clique em Abrir. Aparece a imagem do QR e o endereço gravado nele. É possível alterar Status (Ativo, Desativado, Revogado), Rótulo, limite de leituras, validade e mensagem, além de "Zerar leituras e reativar" e "Excluir". Mostre o histórico "Últimas leituras" do QR.
[IMAGEM: painel/12-detalhe-do-qr-code.jpg — Tela de detalhe com a imagem do QR]
[IMAGEM: painel/qr-demo-CNC362EAT8.png — QR de demonstração para usar como ilustração]

18. IMPRIMIR AS ETIQUETAS
Em QR Codes, filtre por lote e use "Imprimir lote" (ou acesse a página de impressão). Use Ctrl/Cmd+P. Cada etiqueta traz o QR e o código.
Atenção: confira o domínio antes de imprimir — o endereço gravado no QR vem da configuração do site e não muda depois de impresso.
[IMAGEM: painel/13-impressao-de-etiquetas.jpg — Página de impressão com 2 etiquetas]

19. VER O HISTÓRICO DE LEITURAS
Menu Leituras: cada verificação com código, resultado (authentic, exhausted, not_found…) e data/hora. Explique os resultados e destaque que muitas leituras "not_found" ou "exhausted" seguidas indicam tentativa de fraude.
[IMAGEM: painel/15-historico-de-leituras.jpg — Tabela de leituras]

20. GERENCIAR USUÁRIOS (somente Super admin)
Menu Usuários → "Novo usuário": Nome, E-mail, Senha inicial (mínimo 10 caracteres; "Gerar" cria uma senha forte e "Mostrar" revela) e Papel:
- Operador: apenas consulta e movimenta estoque.
- Admin: gerencia produtos, lotes e QR Codes.
- Super admin: tudo, inclusive usuários.
Para cada usuário é possível editar nome e papel, definir nova senha, ativar/desativar e remover. O Super admin também pode redefinir a própria senha.
[IMAGEM: painel/16-usuarios.jpg — Tela de usuários com o formulário preenchido]

21. SEGURANÇA — O QUE O SISTEMA FAZ POR VOCÊ
Lista curta com ícones: verificação anti-robô (Cloudflare) no login e na leitura; limite de tentativas; chaves secretas só no servidor; permissões por papel; IP do cliente guardado apenas como hash; alertas de leituras suspeitas no dashboard.

22. BOAS PRÁTICAS
- Troque a senha inicial no primeiro acesso.
- Gere 1 QR de teste e confira o fluxo no celular antes de imprimir em escala.
- Revogue imediatamente QR Codes de lotes recolhidos.
- Acompanhe "Suspeitas (24h)" diariamente.

23. PERGUNTAS FREQUENTES
- Posso gerar vários QR de uma vez? Sim, até 10.000 por vez (padrão 1).
- O que acontece quando o limite de leituras acaba? O QR mostra alerta de limite excedido.
- O QR pode ser reutilizado? Só se o administrador clicar em "Zerar leituras e reativar".
- Cliente sem internet? A verificação exige conexão.
- Esqueci a senha. Peça ao Super admin para definir uma nova.

24. ENCERRAMENTO
Contatos/suporte (deixar espaço para preencher) e o endereço https://qr.clubeimpulso.com.br

---------------- FIM DO PROMPT ----------------
