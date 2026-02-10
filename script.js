// ==========================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================

const API_URL = "https://jnloja.onrender.com/api";
let userLogado = JSON.parse(localStorage.getItem('jnloja_user')) || null;
let checkInterval;


// ==========================================
// 1. FUNDO DINÂMICO (SLIDER)
// ==========================================

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
        bg.style.backgroundImage = "url('" + imagens[idx] + "')";
        idx = (idx + 1) % imagens.length;
        console.log("Fundo trocado para imagem: " + idx);
    } else {
        console.error("ERRO: Não encontrei a div .game-wallpaper no HTML!");
    }
}

mudarFundo();
setInterval(mudarFundo, 7000);

// ==========================================
// RECUPERAÇÃO DE SENHA
// ==========================================

function abrirEsqueciSenha() {
    closeModal('accountModal');
    document.getElementById('forgotModal').style.display = 'block';
}

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

async function salvarNovaSenha() {
    const newPassword = document.getElementById('newPass').value;
    const confirm = document.getElementById('confirmPass').value;
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) return alert("❌ Token inválido ou expirado!");
    if (newPassword.length < 6) return alert("❌ Mínimo 6 caracteres");
    if (newPassword !== confirm) return alert("❌ As senhas não conferem!");

    try {
        const res = await fetch(API_URL + "/reset-password", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ token, newPassword })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            window.location.href = "index.html?reset=success"; 
        } else { 
            alert("⚠️ " + (data.error || "Erro ao salvar senha")); 
        }
    } catch (e) { 
        console.error(e);
        alert("❌ Erro de conexão com o servidor."); 
    }
}

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

function validarNome(input) {
    input.value = input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
}

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

const elAno = document.getElementById('ano');
if (elAno) elAno.textContent = new Date().getFullYear();

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

    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (name.length < 3 || !regexNome.test(name)) return alert("❌ Digite um nome válido (apenas letras).");

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) return alert("❌ Digite um e-mail válido (exemplo@email.com).");

    let zapLimpo = "";
    if (whatsapp !== "") {
        zapLimpo = whatsapp.replace(/\D/g, ''); 
        if (zapLimpo.length < 10 || zapLimpo.length > 11) {
            return alert("❌ WhatsApp inválido! Use o formato: 54996689157");
        }
    }

    if (password.length < 6) return alert("❌ A senha deve ter pelo menos 6 caracteres.");

    try {
        const res = await fetch(API_URL + "/register", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, email, whatsapp: zapLimpo, password })
        });
        const data = await res.json();
        
        if (data.success) {
            alert("📧 REGISTRO QUASE PRONTO!\n\nEnviamos um link de confirmação para o seu e-mail. Você precisa clicar nele para ativar sua conta antes de fazer login.");
            closeModal('accountModal');
            document.getElementById('regName').value = "";
            document.getElementById('regEmail').value = "";
            document.getElementById('regPass').value = "";
        } else {
            alert("⚠️ " + (data.error || "Este e-mail já está sendo usado!"));
        }
    } catch (e) { 
        alert("❌ Erro de conexão com o servidor."); 
    }
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

        data.isAdmin = (email === "rivasmendez57@gmail.com");

        localStorage.setItem('jnloja_user', JSON.stringify(data));
        location.reload();
    } catch (e) { 
        alert("Erro de conexão."); 
    }
}

async function abrirAreaCliente() {
    if (!userLogado) {
        document.getElementById('accountModal').style.display = 'block';
        return;
    }

    document.getElementById('profileModal').style.display = 'block';
    
    const modalContent = document.querySelector('#profileModal .pix-modal-content');
    
    if (userLogado.isAdmin && !document.getElementById('btnIrAdmin')) {
        const btnAdmin = document.createElement('button');
        btnAdmin.id = 'btnIrAdmin';
        btnAdmin.innerHTML = '<i class="fas fa-user-shield"></i> IR PARA PAINEL ADMIN';
        btnAdmin.className = 'btn-main-buy'; 
        btnAdmin.style.background = 'var(--primary)';
        btnAdmin.style.marginBottom = '20px';
        btnAdmin.onclick = () => window.location.href = 'admin.html';
        
        modalContent.prepend(btnAdmin);
    }

    // Carregar ID do Free Fire
    await carregarIdFreeFire();

    const list = document.getElementById('orderList');
    list.innerHTML = "Carregando seus códigos...";
    
    try {
        const res = await fetch(`${API_URL}/my-orders/${userLogado.email}`);
        const orders = await res.json();
        list.innerHTML = orders.length > 0 ? orders.map(o => `
            <div style="background:#222; padding:10px; margin-bottom:5px; border-left:4px solid var(--secondary);">
                ${o.amount} Dimas: <b style="color:var(--secondary)">${o.code}</b>
            </div>
        `).join('') : "";
    } catch (e) { 
        list.innerHTML = "Erro ao carregar histórico."; 
    }
}

// Função para carregar e exibir ID do Free Fire
// Atualize a função de carregar para preencher o input
async function carregarIdFreeFire() {
    const idInput = document.getElementById('ffIdInput');
    if (!idInput) return;
    
    try {
        const res = await fetch(`${API_URL}/get-ff-id/${userLogado.email}`);
        const data = await res.json();
        
        if (data.ffId) {
            idInput.value = data.ffId;
        } else {
            idInput.value = "";
            idInput.placeholder = "Nenhum ID salvo";
        }
    } catch (e) {
        console.error("Erro ao carregar ID:", e);
    }
}


// Função para confirmar saída com console.log
function confirmarSaida() {
    console.log("Tem certeza que deseja sair da conta?");
    
    const confirmaSaida = confirm("⚠️ Tem certeza que deseja sair da conta?");
    
    if (confirmaSaida) {
        console.log("Usuário confirmou a saída da conta");
        logout();
    } else {
        console.log("Usuário cancelou a saída da conta");
    }
}

function logout() {
    localStorage.removeItem('jnloja_user');
    location.reload();
}

// ==========================================
// 5. SISTEMA DE COMPRAS (FREE FIRE + ROBLOX)
// ==========================================

async function comprarRecarga(produto, valor) {
    if (!userLogado) {
        alert("⚠️ Faça login primeiro!");
        document.getElementById('accountModal').style.display = 'block';
        return;
    }

    // APENAS FREE FIRE precisa de ID
    if (produto === 'freefire') {
        await processarCompraFreeFire(valor);
    } else {
        // ROBLOX não precisa de ID - vai direto
        processarCompraNormal(produto, valor);
    }
}

// ========================================
// FUNÇÃO EXCLUSIVA PARA FREE FIRE COM ID
// ========================================
async function processarCompraFreeFire(valor) {
    try {
        // 1. Verifica se já tem ID salvo no banco
        const resId = await fetch(`${API_URL}/get-ff-id/${userLogado.email}`);
        const dataId = await resId.json();
        
        let ffId = dataId.ffId;
        
        if (!ffId) {
            // PRIMEIRA COMPRA - Pede o ID
            ffId = prompt("🎮 Digite seu ID do Free Fire:\n\n(Você encontra em: Perfil > ID do jogador)");
            
            if (!ffId || ffId.length < 8) {
                alert("❌ ID inválido! Deve ter no mínimo 8 dígitos.");
                return;
            }
            
            // Salva o ID no servidor
            const resVerify = await fetch(`${API_URL}/verify-ff-id`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    customerEmail: userLogado.email, 
                    ffId 
                })
            });
            
            const dataVerify = await resVerify.json();
            
            if (!dataVerify.success) {
                alert("❌ Erro ao salvar ID! Tente novamente.");
                return;
            }
            
            // Confirmação
            const confirma = confirm(`✅ Jogador: ${dataVerify.playerName}\n\nÉ você mesmo?`);
            if (!confirma) {
                alert("❌ Compra cancelada. Verifique seu ID.");
                return;
            }
            
            alert(`💾 ID salvo com sucesso!\n\nNas próximas compras você não precisará digitar novamente.`);
        } else {
            // JÁ TEM ID SALVO - Apenas confirma
            const confirma = confirm(`🎮 A recarga será enviada para:\n\nID: ${ffId}\n\nConfirmar compra?`);
            if (!confirma) return;
        }
        
        // Processa a compra normalmente
        processarCompraNormal('freefire', valor);
        
    } catch (e) {
        alert("❌ Erro ao processar. Tente novamente.");
        console.error(e);
    }
}

// ========================================
// FUNÇÃO DE COMPRA NORMAL (ROBLOX + FF)
// ========================================
async function processarCompraNormal(produto, valor) {
    try {
        const res = await fetch(`${API_URL}/payment`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                customerEmail: userLogado.email,
                amount: valor,
                category: produto
            })
        });

        const data = await res.json();
        
        if (data.success) {
            // Mensagens personalizadas por produto
            const mensagemProduto = produto === 'freefire' 
                ? '🎮 Os diamantes serão creditados automaticamente em até 5 minutos no seu ID!' 
                : '🎁 Use este código no site do Roblox para resgatar seus Robux!';
            
            alert(`✅ COMPRA REALIZADA COM SUCESSO!\n\n💎 Código: ${data.codigo}\n📧 Enviado para: ${userLogado.email}\n\n${mensagemProduto}`);
            
            // Recarrega histórico se a função existir
            if (typeof carregarComprasCliente === 'function') {
                carregarComprasCliente();
            }
        } else {
            alert("❌ " + data.error);
        }
    } catch (e) {
        alert("❌ Erro ao processar pagamento.");
        console.error(e);
    }
}

// ==========================================
// SISTEMA DE CHECKOUT COM PIX (MERCADO PAGO)
// ==========================================

async function iniciarCompra(preco, nome, categoria) {
    console.log(`🛒 Iniciando compra: ${nome} | Categoria: ${categoria} | Valor: R$ ${preco}`);

    if (!userLogado) {
        document.getElementById('avisoModal').style.display = 'block';
        return;
    }

    // ========================================
    // SE FOR FREE FIRE, VERIFICA O ID PRIMEIRO
    // ========================================
    if (categoria === 'freefire') {
        try {
            // 1. Verifica se já tem ID salvo
            const resId = await fetch(`${API_URL}/get-ff-id/${userLogado.email}`);
            const dataId = await resId.json();
            
            let ffId = dataId.ffId;
            
            if (!ffId) {
                // PRIMEIRA COMPRA - Pede o ID
                ffId = prompt("🎮 Digite seu ID do Free Fire:\n\n(Você encontra em: Perfil > ID do jogador)");
                
                if (!ffId || ffId.length < 8) {
                    alert("❌ ID inválido! Deve ter no mínimo 8 dígitos.");
                    return;
                }
                
                // ============================================
                // VERIFICAÇÃO CRÍTICA: ID EXISTE NO FREE FIRE?
                // ============================================
                const resVerify = await fetch(`${API_URL}/verify-ff-id`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ 
                        customerEmail: userLogado.email, 
                        ffId 
                    })
                });
                
                const dataVerify = await resVerify.json();
                
                // NÃO SALVA SE O ID NÃO EXISTIR!
                if (!dataVerify.success) {
                    alert("❌ Este ID não existe no Free Fire!\n\nVerifique seu ID e tente novamente.\n\nNão salvamos IDs inválidos na base de dados.");
                    return;
                }
                
                // Confirmação
                const confirma = confirm(`✅ Jogador encontrado: ${dataVerify.playerName}\n\nÉ você mesmo?\n\nSe confirmar, este ID será salvo e usado nas próximas compras.`);
                if (!confirma) {
                    alert("❌ Compra cancelada. Verifique seu ID e tente novamente.");
                    return;
                }
                
                alert(`💾 ID verificado e salvo com sucesso!\n\nJogador: ${dataVerify.playerName}\nID: ${ffId}\n\nAgora vamos gerar seu PIX...`);
            } else {
                // JÁ TEM ID SALVO - Apenas confirma
                const confirma = confirm(`🎮 A recarga será enviada para:\n\nID: ${ffId}\n\nDeseja continuar e gerar o PIX?`);
                if (!confirma) {
                    alert("❌ Compra cancelada.");
                    return;
                }
            }
        } catch (e) {
            console.error("❌ Erro ao verificar ID:", e);
            alert("❌ Erro ao verificar ID. Verifique sua conexão e tente novamente.");
            return;
        }
    }

    // ========================================
    // AGORA GERA O PIX (PARA TODOS OS PRODUTOS)
    // ========================================
    try {
        const res = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                email: userLogado.email, 
                whatsapp: userLogado.whatsapp, 
                amount: preco, 
                description: nome,
                category: categoria
            })
        });

        const data = await res.json();

        if (!res.ok || data.error === "ESTOQUE_ESGOTADO") {
            alert("⚠️ " + (data.message || "Produto sem estoque no momento!"));
            return;
        }

        if (data.qr_code) {
            document.getElementById('pixCodeDisplay').value = data.qr_code;
            document.getElementById('pixModal').style.display = 'block';
            
            document.querySelector('.btn-whatsapp-send').onclick = () => {
                const msg = encodeURIComponent(`🔥 *JNSHOP* 🔥\n\nAqui está meu código Pix para *${nome}*:\n\n${data.qr_code}\n\n_Vou pagar agora!_`);
                window.open(`https://wa.me/5554996689157?text=${msg}`, '_blank');
            };

            if (checkInterval) clearInterval(checkInterval);
            checkInterval = setInterval(() => verificarStatus(data.id), 5000);
        }
    } catch (e) { 
        console.error("❌ Erro no checkout:", e);
        alert("Erro de conexão com o servidor. Verifique se a API está online."); 
    }
}

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
    } catch (e) { 
        console.log("Aguardando aprovação..."); 
    }
}

function enviarPinWhats(pin) {
    const msg = encodeURIComponent("💎 *JNLOJA* 💎\n\nMeu código de Diamante é: *" + pin + "*\n\n_Vou resgatar agora!_");
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
// ATUALIZAÇÃO DE INTERFACE
// ==========================================

function atualizarBotaoConta() {
    const display = document.getElementById('user-display');
    if (!display) return;

    if (userLogado) {
        const primeiroNome = userLogado.name.split(' ')[0].toUpperCase();
        display.innerHTML = `<i class="fas fa-user-check"></i> OLÁ, ${primeiroNome}`;
        display.style.color = "var(--secondary)";
        display.style.borderColor = "var(--secondary)";
    } else {
        display.innerHTML = `<i class="fas fa-user"></i> MINHA CONTA`;
        display.style.color = "#fff";
        display.style.borderColor = "rgba(255, 255, 255, 0.3)";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    atualizarBotaoConta();

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('reset') === 'success') {
        document.getElementById('accountModal').style.display = 'block';
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (urlParams.get('verified') === 'true') {
        document.getElementById('accountModal').style.display = 'block';
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// NOVA FUNÇÃO: Para salvar a edição do ID
async function salvarIdFreeFire() {
    const novoId = document.getElementById('ffIdInput').value.trim();
    
    if (novoId.length < 8) {
        alert("❌ ID inválido! O ID deve ter pelo menos 8 dígitos.");
        return;
    }

    try {
        // Usamos o endpoint de verificação que você já tem para salvar
        const res = await fetch(`${API_URL}/verify-ff-id`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                customerEmail: userLogado.email, 
                ffId: novoId 
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert(`✅ ID ATUALIZADO!\nJogador: ${data.playerName}`);
        } else {
            alert("❌ Erro ao atualizar o ID. Verifique se o número está correto.");
        }
    } catch (e) {
        console.error(e);
        alert("❌ Erro de conexão ao tentar salvar.");
    }
}

console.log("✅ Script JNLOJA v3.3 - Sistema Free Fire ID Verificado + Campo Editável Ativo!");