// ==========================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================

//const API_URL = "https://jnloja.onrender.com/api";
const API_URL = "http://localhost:3000/api";
let userLogado = JSON.parse(localStorage.getItem('jnloja_user')) || null;
let checkInterval;

// ==========================================
// RECUPERAÇÃO DE SENHA
// ==========================================

// Abre o modal de esqueci senha
function abrirEsqueciSenha() {
    closeModal('accountModal');
    document.getElementById('forgotModal').style.display = 'block';
}

// Enviar e-mail de recuperação
 //Envia o pedido para o servidor Node.js
async function enviarEmailRecuperacao() {
    const emailInput = document.getElementById('forgotEmail');
    const email = emailInput.value.trim().toLowerCase();

    if (!email) {
        alert("❌ Digite o e-mail!");
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        alert("❌ E-mail inválido!");
        return;
    }

    const btn = document.querySelector('#forgotModal .btn-main-buy');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = "ENVIANDO... ⏳";
    btn.disabled = true;

    try {
        console.log("📧 Enviando pedido para:", email);
        
        const res = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: email })
        });
        
        const data = await res.json();
        console.log("📬 Resposta:", data);
        
        if (res.ok && data.success) {
            const modalContent = document.querySelector('#forgotModal .pix-modal-content');
            modalContent.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <i class="fas fa-paper-plane" style="font-size: 50px; color: #00ff88; margin-bottom: 20px;"></i>
                    <h2 style="color: #00ff88;">LINK ENVIADO!</h2>
                    <p style="margin: 20px 0;">Enviamos as instruções para:<br><b>${email}</b></p>
                    <p style="font-size: 13px; color: #aaa;">Verifique a pasta de <b>SPAM</b>.</p>
                    <button onclick="location.reload()" class="btn-main-buy" style="margin-top: 20px;">ENTENDI</button>
                </div>
            `;
        } else {
            alert("⚠️ " + (data.error || "E-mail não encontrado."));
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
        }
    } catch (e) {
        console.error("❌ Erro:", e);
        alert("❌ Erro de conexão. Tente novamente.");
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
}

// Salvar a nova senha (usada na página resetar-senha.html)
async function salvarNovaSenha() {
    const newPassword = document.getElementById('newPass').value;
    const confirm = document.getElementById('confirmPass').value;
    
    // Pega o token que está no link da barra de endereços
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (newPassword.length < 6) return alert("Mínimo 6 caracteres");
    if (newPassword !== confirm) return alert("Senhas não conferem!");

    try {
        const res = await fetch(API_URL + "/reset-password", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ token, newPassword })
        });
        const data = await res.json();
        if (res.ok) {
            alert("✅ Senha alterada! Faça login agora.");
            window.location.href = "index.html";
        } else { alert(data.error); }
    } catch (e) { alert("Erro ao salvar."); }
}

// VER SENHA
function verSenha(idInput, icone) {
    const input = document.getElementById(idInput);
    
    if (input.type === 'password') {
        input.type = 'text';
        icone.classList.remove('fa-eye');
        icone.classList.add('fa-eye-slash');
        icone.style.filter = "none"; 
        icone.style.color = "var(--secondary)"; 
    } else {
        input.type = 'password';
        icone.classList.remove('fa-eye-slash');
        icone.classList.add('fa-eye');
        icone.style.filter = "brightness(0) invert(1)";
        icone.style.color = "#ffffff";
    }
}

// ==========================================
// VALIDAÇÃO EM TEMPO REAL DOS CAMPOS
// ==========================================

// Validar NOME: apenas letras e espaços
function validarNome(input) {
    input.value = input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
}

// Validar WHATSAPP: apenas números com formatação
function validarWhatsApp(input) {
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length > 11) {
        valor = valor.substring(0, 11);
    }
    
    if (valor.length <= 2) {
        input.value = valor;
    } else if (valor.length <= 7) {
        input.value = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
    } else {
        input.value = `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7)}`;
    }
}

// ==========================================
// 1. FUNDO DINÂMICO (SLIDER)
// ==========================================

// LISTA DE IMAGENS (JNLOJA ELITE)
const imagens = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop', 
    'view-soccer-ball-field.jpg',
    'Fire.jpg',
    '1387781.jpg',
    'free-fire-pictures-igbg9v8vem3du5h4.jpg',
    'free-fire-pictures-vv8phwlmkhz0ty43.jpg'
];

let idx = 0;
function mudarFundo() {
    const bg = document.querySelector('.game-wallpaper');
    if (bg) {
        // Aplica a imagem IMEDIATAMENTE
        bg.style.backgroundImage = "url('" + imagens[idx] + "')";
        
        // Prepara o próximo índice
        idx = (idx + 1) % imagens.length;
        console.log("Fundo trocado para imagem: " + idx);
    } else {
        console.error("ERRO: Não encontrei a div .game-wallpaper no HTML!");
    }
}

// Rodar assim que o script carregar
mudarFundo();

// Iniciar o cronômetro de 7 segundos
setInterval(mudarFundo, 7000);



// ==========================================
// 2. CONTROLE DE INTERFACE (MODAIS E UI)
// ==========================================
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

function toggleForm() {
    const log = document.getElementById('loginForm');
    const reg = document.getElementById('registerForm');
    if (log && reg) {
        log.style.display = log.style.display === 'none' ? 'block' : 'none';
        reg.style.display = reg.style.display === 'none' ? 'block' : 'none';
    }
}

// Atualiza o ano no footer
const elAno = document.getElementById('ano');
if (elAno) elAno.textContent = new Date().getFullYear();

// Timer de Ofertas
let tempoTotal = 86400;
const elCountdown = document.getElementById('countdown');
if (elCountdown) {
    setInterval(() => {
        tempoTotal--;
        let h = Math.floor(tempoTotal/3600), m = Math.floor((tempoTotal%3600)/60), s = tempoTotal%60;
        elCountdown.textContent = `Ofertas expiram em: ${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
    }, 1000);
}


// ==========================================
// 3. SISTEMA DE USUÁRIO (CADASTRO / LOGIN)
// ==========================================
async function registrarCliente() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const whatsapp = document.getElementById('regWhatsapp').value.trim();
    const password = document.getElementById('regPass').value;

    // --- VALIDAÇÕES ---
    // 1. Validar Nome: Apenas letras e espaços
    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (name.length < 3 || !regexNome.test(name)) return alert("❌ Digite um nome válido (apenas letras).");

    // 2. Validar E-mail: Formato padrão
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) return alert("❌ Digite um e-mail válido (exemplo@email.com).");

    // 3. Validar WhatsApp (OPCIONAL)
    let zapLimpo = "";
    if (whatsapp !== "") {
        zapLimpo = whatsapp.replace(/\D/g, ''); 
        if (zapLimpo.length < 10 || zapLimpo.length > 11) {
            return alert("❌ WhatsApp inválido! Use o formato: 54996689157");
        }
    }

    // 4. Validar Senha
    if (password.length < 6) return alert("❌ A senha deve ter pelo menos 6 caracteres.");

    try {
        const res = await fetch(API_URL + "/register", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, email, whatsapp: zapLimpo, password })
        });
        const data = await res.json();
        
        if (data.success) {
            alert("✅ Cadastro realizado! Agora você já pode entrar.");
            toggleForm();
        } else {
            // Aqui ele avisa se o e-mail já existir (conforme a função que fizemos no server.js)
            alert("⚠️ " + (data.error || "Este e-mail já está sendo usado!"));
        }
    } catch (e) { alert("❌ Erro de conexão com o servidor."); }
}

// ==========================================
// SISTEMA ADMIN
// ==========================================

async function loginCliente() {
    const email = document.getElementById('logEmail').value.toLowerCase();
    const password = document.getElementById('logPass').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.error) return alert(data.error);

        // Verifica se é admin
        data.isAdmin = (email === "rivasmendez57@gmail.com"); // COLOQUE SEU EMAIL AQUI

        localStorage.setItem('jnloja_user', JSON.stringify(data));
        location.reload();
    } catch (e) { alert("Erro de conexão."); }
}

async function abrirAreaCliente() {
    if (!userLogado) {
        document.getElementById('accountModal').style.display = 'block';
        return;
    }

    // Abre o modal de perfil para TODOS (Cliente e Admin)
    document.getElementById('profileModal').style.display = 'block';
    
    // Se for ADMIN, vamos adicionar um botão especial no topo do modal para ir ao Painel
    const modalContent = document.querySelector('#profileModal .pix-modal-content');
    
    // Verifica se o botão já existe para não duplicar
    if (userLogado.isAdmin && !document.getElementById('btnIrAdmin')) {
        const btnAdmin = document.createElement('button');
        btnAdmin.id = 'btnIrAdmin';
        btnAdmin.innerHTML = '<i class="fas fa-user-shield"></i> IR PARA PAINEL ADMIN';
        btnAdmin.className = 'btn-main-buy'; 
        btnAdmin.style.background = 'var(--primary)';
        btnAdmin.style.marginBottom = '20px';
        btnAdmin.onclick = () => window.location.href = 'admin.html';
        
        // Insere o botão no início do modal
        modalContent.prepend(btnAdmin);
    }

    const list = document.getElementById('orderList');
    list.innerHTML = "Carregando seus códigos...";
    
    try {
        // O admin também pode ter comprado códigos para teste, então buscamos os pedidos dele
        const res = await fetch(`${API_URL}/my-orders/${userLogado.email}`);
        const orders = await res.json();
        list.innerHTML = orders.length > 0 ? orders.map(o => `
            <div style="background:#222; padding:10px; margin-bottom:5px; border-left:4px solid var(--secondary);">
                ${o.amount} Dimas: <b style="color:var(--secondary)">${o.code}</b>
            </div>
        `).join('') : "";
    } catch (e) { list.innerHTML = "Erro ao carregar histórico."; }
}

/*
async function abrirAreaCliente() {
    if (!userLogado) {
        document.getElementById('accountModal').style.display = 'block';
    } else if (userLogado.isAdmin) {
        // ABRIR PAINEL ADMIN
        window.location.href = "admin.html";
    } else {
        // Cliente normal
        document.getElementById('profileModal').style.display = 'block';
        const list = document.getElementById('orderList');
        list.innerHTML = "Carregando seus códigos...";
        
        try {
            const res = await fetch(`${API_URL}/my-orders/${userLogado.email}`);
            const orders = await res.json();
            list.innerHTML = orders.length > 0 ? orders.map(o => `
                <div style="background:#222; padding:10px; margin-bottom:5px; border-left:4px solid var(--secondary);">
                    ${o.amount} Dimas: <b style="color:var(--secondary)">${o.code}</b>
                </div>
            `).join('') : "Você ainda não possui códigos comprados.";
        } catch (e) { list.innerHTML = "Erro ao carregar histórico."; }
    }
}
*/

function logout() {
    localStorage.removeItem('jnloja_user');
    location.reload();
}


//CARREGAR FUTEBOL
async function carregarFutebol() {
    try {
        // console.log("🔄 Buscando jogos para o Ticker...");
        const res = await fetch(`${API_URL}/football`);
        
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        
        const data = await res.json();
        const tSuperior = document.getElementById('ticker');
        const tRodape = document.getElementById('footer-ticker');

        if (data && data.length > 0) {
            // Usamos apenas os primeiros 20 jogos e verificamos se os dados existem antes de mostrar
            const html = data.slice(0, 20).map(j => {
                // Verifica se os objetos básicos existem para não dar erro
                if (!j.teams || !j.teams.home || !j.teams.away) return '';

                const home = j.teams.home.name;
                const away = j.teams.away.name;
                const scoreHome = j.goals.home ?? 0;
                const scoreAway = j.goals.away ?? 0;

                return `
                    <span class="ticker-item-style">${home} ${scoreHome} x ${scoreAway} ${away}</span>
                    <i class="fas fa-futbol" style="color:#fff; margin: 0 10px;"></i>
                `;
            }).join('');

            if (tSuperior) tSuperior.innerHTML = `<div class="header-animacao">${html}${html}</div>`;
            if (tRodape) tRodape.innerHTML = `<div class="footer-ticker-wrapper">${html}${html}</div>`;
            
        } else {
            if (tSuperior) tSuperior.innerHTML = '<span>NENHUM JOGO DISPONÍVEL AGORA</span>';
        }
    } catch (e) { 
        console.error("❌ Erro detalhado no Ticker:", e);
        const tSuperior = document.getElementById('ticker');
        if (tSuperior) tSuperior.innerHTML = '<span>PLACAR INDISPONÍVEL</span>';
    }
}

// Carregar ao iniciar a página
carregarFutebol();

// Atualizar a cada 15 minutos
setInterval(carregarFutebol, 900000);

// ==========================================
// 5. COMPRA DE PRODUTOS E PIX (ATUALIZADO)
// ==========================================

async function iniciarCompra(preco, nome, categoria) {
    console.log(`🛒 Iniciando compra: ${nome} | Categoria: ${categoria} | Valor: R$ ${preco}`);

    // 1. Verifica se o usuário está logado
    if (!userLogado) {
        document.getElementById('avisoModal').style.display = 'block';
        return;
    }

    try {
        // 2. Faz a chamada para o checkout enviando a categoria
        const res = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                email: userLogado.email, 
                whatsapp: userLogado.whatsapp, 
                amount: preco, 
                description: nome,
                category: categoria // 👈 IMPORTANTE: Enviando a categoria para o servidor
            })
        });

        const data = await res.json();

        // 3. Verifica se deu erro (como falta de estoque)
        if (!res.ok || data.error === "ESTOQUE_ESGOTADO") {
            alert("⚠️ " + (data.message || "Produto sem estoque no momento!"));
            return;
        }

        // 4. Se o Pix foi gerado com sucesso, abre o modal
        if (data.qr_code) {
            document.getElementById('pixCodeDisplay').value = data.qr_code;
            document.getElementById('pixModal').style.display = 'block';
            
            // Configura o botão do WhatsApp dentro do modal do Pix
            document.querySelector('.btn-whatsapp-send').onclick = () => {
                const msg = encodeURIComponent(`🔥 *JNSHOP* 🔥\n\nAqui está meu código Pix para *${nome}*:\n\n${data.qr_code}\n\n_Vou pagar agora!_`);
                window.open(`https://wa.me/5554996689157?text=${msg}`, '_blank');
            };

            // Inicia a verificação automática de pagamento
            if (checkInterval) clearInterval(checkInterval);
            checkInterval = setInterval(() => verificarStatus(data.id), 5000);
        }
    } catch (e) { 
        console.error("❌ Erro no checkout:", e);
        alert("Erro de conexão com o servidor. Verifique se a API está online."); 
    }
}

// Função para o botão do modal de aviso
function irParaLogin() {
    closeModal('avisoModal');
    document.getElementById('accountModal').style.display = 'block';
}

// Verifica se o pagamento foi aprovado pelo Mercado Pago
async function verificarStatus(id) {
    try {
        const res = await fetch(`${API_URL}/status/${id}`);
        const data = await res.json();
        
        if (data.status === 'approved' && data.pin) {
            clearInterval(checkInterval);
            const modalContent = document.querySelector('.pix-modal-content');
            if (modalContent) {
                modalContent.innerHTML = `
                    <h2 style="color:#00ff88;">💎 PAGAMENTO APROVADO!</h2>
                    <p style="margin-top:15px;">Obrigado pela compra! Seu código é:</p>
                    <div style="background:#000; padding:20px; color:#00f2ff; font-size:24px; font-weight:bold; margin:20px 0; border:2px solid #00f2ff; border-radius:10px; box-shadow: 0 0 15px rgba(0,242,255,0.3);">
                        ${data.pin}
                    </div>
                    <button onclick="copyPin('${data.pin}')" class="btn-copy">📋 COPIAR CÓDIGO</button>
                    <button onclick="enviarPinWhats('${data.pin}')" class="btn-whatsapp-send" style="margin-top:10px;">
                        <i class="fab fa-whatsapp"></i> ENVIAR PARA MEU WHATSAPP
                    </button>
                    <p style="font-size:12px; color:#888; margin-top:15px;">O código também foi enviado para seu e-mail e salvo na aba MINHA CONTA.</p>
                    <button onclick="location.reload()" class="btn-close" style="background:#333; margin-top:20px;">FECHAR</button>
                `;
            }
        }
    } catch (e) { console.log("Aguardando aprovação..."); }
}

/*
async function comprarDima(preco, nome) {
    if (!userLogado) {
        document.getElementById('avisoModal').style.display = 'block';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                email: userLogado.email, 
                whatsapp: userLogado.whatsapp, 
                amount: preco, 
                description: nome 
            })
        });
        const data = await res.json();

        if (data.qr_code) {
            document.getElementById('pixCodeDisplay').value = data.qr_code;
            document.getElementById('pixModal').style.display = 'block';
            
            document.querySelector('.btn-whatsapp-send').onclick = () => {
                const msg = encodeURIComponent(`🔥 *JNLOJA* 🔥\n\nAqui está meu código Pix para os Diamantes:\n\n${data.qr_code}\n\n_Vou pagar agora!_`);
                window.open(`https://wa.me/5554996689157?text=${msg}`, '_blank');
            };

            if (checkInterval) clearInterval(checkInterval);
            checkInterval = setInterval(() => verificarStatus(data.id), 5000);
        }
    } catch (e) { 
        console.error("Erro no checkout:", e);
        alert("Erro de conexão com o servidor de pagamentos."); 
    }
}
    */

function irParaLogin() {
    closeModal('avisoModal');
    document.getElementById('accountModal').style.display = 'block';
}

async function verificarStatus(id) {
    try {
        const res = await fetch(`${API_URL}/status/${id}`);
        const data = await res.json();
        
        if (data.status === 'approved' && data.pin) {
            clearInterval(checkInterval);
            const modalContent = document.querySelector('.pix-modal-content');
            if (modalContent) {
                modalContent.innerHTML = `
                    <h2 style="color:#00ff88;">💎 PAGAMENTO APROVADO!</h2>
                    <p style="margin-top:15px;">Obrigado pela compra! Seu código é:</p>
                    <div style="background:#000; padding:20px; color:#00f2ff; font-size:24px; font-weight:bold; margin:20px 0; border:2px solid #00f2ff; border-radius:10px; box-shadow: 0 0 15px rgba(0,242,255,0.3);">
                        ${data.pin}
                    </div>
                    <button onclick="copyPin('${data.pin}')" class="btn-copy">📋 COPIAR CÓDIGO</button>
                    <button onclick="enviarPinWhats('${data.pin}')" class="btn-whatsapp-send" style="margin-top:10px;">
                        <i class="fab fa-whatsapp"></i> ENVIAR PARA MEU WHATSAPP
                    </button>
                    <p style="font-size:12px; color:#888; margin-top:15px;">O código também foi enviado para seu e-mail e salvo na aba MINHA CONTA.</p>
                    <button onclick="location.reload()" class="btn-close" style="background:#333; margin-top:20px;">FECHAR</button>
                `;
            }
        }
    } catch (e) { console.log("Aguardando aprovação..."); }
}

function enviarPinWhats(pin) {
    const msg = encodeURIComponent("💎 *JNLOJA* 💎\n\nMeu código de Diamante é: *" + pin + "*\n\n_Vou resgatar agora no site Recarga Jogo!_");
    window.open("https://wa.me/5554996689157?text=" + msg, "_blank");
}

function copyPin(pin) {
    navigator.clipboard.writeText(pin);
    alert("✅ Código Copiado!");
}

function copyToClipboard() {
    const box = document.getElementById("pixCodeDisplay");
    box.select();
    navigator.clipboard.writeText(box.value);
    alert("✅ Código Pix Copiado!");
}



// ==========================================
// 6. TABELAS DE CLASSIFICAÇÃO
// ==========================================
let ligaAtiva = 71;

function atualizarAno() {
    const anoSelecionado = document.getElementById('anoTemporada').value;
    mudarTabela(ligaAtiva, anoSelecionado);
}

async function mudarTabela(leagueId, season = null) {
    ligaAtiva = leagueId;

    if (!season) {
        const selector = document.getElementById('anoTemporada');
        season = selector ? selector.value : new Date().getFullYear();
    }

    const body = document.getElementById('standingsBody');
    if (!body) return;

    body.innerHTML = '<tr><td colspan="6" style="padding:40px;">Carregando classificação de ' + season + '... ⏳</td></tr>';

    document.querySelectorAll('.btn-league').forEach(btn => btn.classList.remove('active'));
    const btnAtivo = document.getElementById('btn-' + leagueId);
    if (btnAtivo) btnAtivo.classList.add('active');

    try {
        const res = await fetch(`${API_URL}/standings/${leagueId}/${season}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
            if (Array.isArray(data[0])) {
                let htmlFinal = "";
                data.forEach(grupo => {
                    const nomeGrupo = grupo[0].group ? grupo[0].group.replace('_', ' ') : "GRUPO";
                    
                    htmlFinal += `
                        <tr style="background: rgba(255, 76, 0, 0.3); color: var(--yellow);">
                            <td colspan="6" style="text-align:left; padding:12px 20px; font-weight:900;">${nomeGrupo}</td>
                        </tr>
                    `;

                    htmlFinal += grupo.map(team => `
                        <tr>
                            <td><b style="color:var(--secondary)">${team.rank}º</b></td>
                            <td style="text-align:left; display:flex; align-items:center; gap:10px;">
                                <img src="${team.team.logo}" width="25"> ${team.team.name}
                            </td>
                            <td><b>${team.points}</b></td>
                            <td>${team.all.played}</td>
                            <td>${team.all.win}</td>
                            <td style="color:${team.goalsDiff >= 0 ? '#00ff88' : '#ff4757'}">${team.goalsDiff}</td>
                        </tr>
                    `).join('');
                });
                body.innerHTML = htmlFinal;
            } else {
                body.innerHTML = data.map(team => `
                    <tr>
                        <td><b style="color:var(--secondary)">${team.rank}º</b></td>
                        <td style="text-align:left; display:flex; align-items:center; gap:10px;">
                            <img src="${team.team.logo}" width="25"> ${team.team.name}
                        </td>
                        <td><b>${team.points}</b></td>
                        <td>${team.all.played}</td>
                        <td>${team.all.win}</td>
                        <td style="color:${team.goalsDiff >= 0 ? '#00ff88' : '#ff4757'}">${team.goalsDiff}</td>
                    </tr>
                `).join('');
            }
        } else {
            body.innerHTML = '<tr><td colspan="6" style="padding:40px; color:var(--yellow);">⚠️ Sem dados para ' + season + '.</td></tr>';
        }
    } catch (e) {
        console.error("Erro ao carregar tabela:", e);
        body.innerHTML = '<tr><td colspan="6" style="padding:40px; color:red;">❌ Erro ao conectar com o servidor.</td></tr>';
    }
}

// Função para atualizar o nome no botão do Header
function atualizarBotaoConta() {
    const display = document.getElementById('user-display');
    if (!display) return;

    if (userLogado) {
        // Se estiver logado, mostra o nome
        const primeiroNome = userLogado.name.split(' ')[0].toUpperCase();
        display.innerHTML = `<i class="fas fa-user-check"></i> OLÁ, ${primeiroNome}`;
        display.style.color = "var(--secondary)"; // Fica azul neon
        display.style.borderColor = "var(--secondary)";
    } else {
        // Se não estiver logado, volta ao padrão
        display.innerHTML = `<i class="fas fa-user"></i> MINHA CONTA`;
        display.style.color = "#fff";
        display.style.borderColor = "rgba(255, 255, 255, 0.3)";
    }
}

// Chamar a função sempre que a página carregar
document.addEventListener('DOMContentLoaded', atualizarBotaoConta);



console.log("✅ Script JNLOJA v3.0 carregado com sucesso!");