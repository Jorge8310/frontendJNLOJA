// ==========================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================

const API_URL = "https://jnloja.onrender.com/api";
//const API_URL = "http://localhost:3000/api";
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

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
    }

    // Se o usuário fechar o modal do PIX, paramos a verificação automática
    if (id === 'pixModal' || id === 'modal-pix') {
        if (checkInterval) {
            clearInterval(checkInterval);
            console.log("Cronômetro de verificação parado.");
        }
    }
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

        // ⬇️⬇️⬇️ ADICIONAR VERIFICAÇÃO DE ESTOQUE AQUI ⬇️⬇️⬇️
    
    /*
    // VERIFICAR SE TEM CÓDIGO DISPONÍVEL NO ESTOQUE
    try {
        const resEstoque = await fetch(`${API_URL}/check-stock?category=${produto}`);
        const dataEstoque = await resEstoque.json();
        
        if (!dataEstoque.available || dataEstoque.quantity === 0) {
            let mensagem = `❌ PRODUTO INDISPONÍVEL!\n\n`;
            
            if (dataEstoque.mode === 'MANUAL') {
                mensagem += `Não temos ${produto.toUpperCase()} em estoque no momento.\n\n`;
            } else if (dataEstoque.mode === 'API_ERRO') {
                mensagem += `Nosso fornecedor está temporariamente indisponível.\n\n`;
            } else {
                mensagem += `${dataEstoque.message || 'Produto em falta no momento.'}\n\n`;
            }
            
            mensagem += `Tente novamente mais tarde ou escolha outro produto.`;
            alert(mensagem);
            return; // PARA AQUI, NÃO PROCESSA A COMPRA
        }
        
        console.log(`✅ Estoque OK: ${dataEstoque.quantity} código(s) de ${produto}`);
        
    } catch (e) {
        console.error("❌ Erro ao verificar estoque:", e);
        alert("❌ Erro ao verificar disponibilidade. Tente novamente.");
        return;
    }
    */

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
// SISTEMA DE CHECKOUT EFI BANK (PIX DINÂMICO + VERIFICAÇÃO DE PAGAMENTO)
// ==========================================

async function iniciarCompra(preco, nome, categoria) {
    if (!userLogado) {
        document.getElementById('avisoModal').style.display = 'block';
        return;
    }
/*
try {
        const resEstoque = await fetch(`${API_URL}/check-stock?category=${categoria}`);
        const dataEstoque = await resEstoque.json();
        
        if (!dataEstoque.available || dataEstoque.quantity === 0) {
            alert(`❌ PRODUTO INDISPONÍVEL!\n\nNão temos ${categoria.toUpperCase()} em estoque no momento.\n\nTente novamente mais tarde ou escolha outro produto.`);
            return; // PARA AQUI, não gera o PIX
        }
    } catch (e) {
        console.error("Erro ao verificar estoque:", e);
        alert("❌ Erro ao verificar disponibilidade. Tente novamente.");
        return;
    }
    */
   
    // --- Feedback visual no botão que foi clicado ---
    const btnOriginal = event.target;
    const textoOriginal = btnOriginal.innerHTML;
    if (btnOriginal.tagName === 'BUTTON') {
        btnOriginal.disabled = true;
        btnOriginal.innerHTML = "PROCESSANDO... ⏳";
    }

    if (categoria === 'freefire') {
        try {
            const resId = await fetch(`${API_URL}/get-ff-id/${userLogado.email}`);
            const dataId = await resId.json();
            let ffId = dataId.ffId;
            
            if (!ffId) {
                ffId = prompt("🎮 Digite seu ID do Free Fire:");
                if (!ffId || ffId.length < 8) {
                    resetBtn(btnOriginal, textoOriginal);
                    return alert("❌ ID inválido!");
                }

                const resVerify = await fetch(`${API_URL}/verify-ff-id`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ customerEmail: userLogado.email, ffId })
                });
                const dataVerify = await resVerify.json();
                if (!dataVerify.success) {
                    resetBtn(btnOriginal, textoOriginal);
                    return alert("❌ Este ID não existe!");
                }
                const confirma = confirm(`✅ Jogador: ${dataVerify.playerName}\nConfirmar?`);
                if (!confirma) {
                    resetBtn(btnOriginal, textoOriginal);
                    return;
                }
            } else {
                const confirma = confirm(`🎮 Enviar para o ID salvo: ${ffId}?`);
                if (!confirma) {
                    resetBtn(btnOriginal, textoOriginal);
                    return;
                }
            }
        } catch (e) {
            resetBtn(btnOriginal, textoOriginal);
            return alert("❌ Erro ao verificar ID.");
        }
    }

    try {
        const res = await fetch(`${API_URL}/pix/criar`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                customerEmail: userLogado.email, 
                customerName: userLogado.name, 
                amount: preco, 
                category: categoria
            })
        });

        const data = await res.json();

        if (data.success) {
            // 1. Preenche o Copia e Cola
            document.getElementById('pixCodeDisplay').value = data.pixCopiaECola;
            
            // 2. Mostra a Imagem do QR Code (Certifique-se que esse ID existe no seu HTML)
            const qrImg = document.getElementById('qrCodeImg');
            if (qrImg) {
                let qrFinal = data.qrCode.trim();
                
                // Correção: Se o servidor enviou o prefixo dobrado, nós limpamos
                if (qrFinal.includes('base64,data:image')) {
                   qrFinal = qrFinal.replace('data:image/png;base64,', '');
                }
                
                qrImg.src = qrFinal; 
                qrImg.style.display = 'block'; 
            }

            // 3. Mostra o modal
            document.getElementById('pixModal').style.display = 'block';
            
            document.querySelector('.btn-whatsapp-send').onclick = () => {
                const msg = encodeURIComponent(`🔥 *JNSHOP* 🔥\n\nAqui está meu código Pix para *${nome}*:\n\n${data.pixCopiaECola}\n\n_Vou pagar agora!_`);
                window.open(`https://wa.me/5554996689157?text=${msg}`, '_blank');
            };

            if (checkInterval) clearInterval(checkInterval);
            checkInterval = setInterval(() => verificarStatus(data.txid), 5000);
        } else {
            alert("⚠️ " + (data.error || "Erro ao gerar PIX"));
        }
    } catch (e) { 
        alert("Erro de conexão com o servidor."); 
    } finally {
        resetBtn(btnOriginal, textoOriginal);
    }
}

// Função auxiliar para resetar o botão
function resetBtn(btn, texto) {
    if (btn.tagName === 'BUTTON') {
        btn.disabled = false;
        btn.innerHTML = texto;
    }
}

function irParaLogin() {
    closeModal('avisoModal');
    document.getElementById('accountModal').style.display = 'block';
}

function irParaCadastro() {
    closeModal('avisoModal');
    document.getElementById('accountModal').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

async function verificarStatus(txid) {
    try {
        // Vamos criar uma rota no seu server para checar o status pelo txid
        const res = await fetch(`${API_URL}/pix/status/${txid}`);
        const data = await res.json();
        
        // Se o status no banco mudou para PAGO
        if (data.status === 'PAGO' && data.pin) {
            clearInterval(checkInterval);
            const modalContent = document.querySelector('#pixModal .pix-modal-content');
            
            if (modalContent) {
                modalContent.innerHTML = `
                    <h2 style="color:#00ff88;">💎 PAGAMENTO APROVADO!</h2>
                    <p style="margin-top:15px;">Seu código foi liberado com sucesso:</p>
                    <div style="background:#000; padding:20px; color:#00f2ff; font-size:24px; font-weight:bold; margin:20px 0; border:2px solid #00f2ff; border-radius:10px; box-shadow: 0 0 15px rgba(0,242,255,0.3);">
                        ${data.pin}
                    </div>
                    <button onclick="copyPin('${data.pin}')" class="btn-copy">📋 COPIAR CÓDIGO</button>
                    <button onclick="location.reload()" class="btn-close" style="background:#333; margin-top:20px;">FECHAR</button>
                    <p style="font-size:12px; color:#888; margin-top:10px;">O código também foi enviado para seu e-mail.</p>
                `;
            }
        }
    } catch (e) { 
        console.log("Aguardando confirmação do EFI Bank..."); 
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
    const btn = document.querySelector('.btn-copy'); // Pega o botão de copiar
    const textoOriginal = btn.innerHTML;

    // Seleciona o texto (importante para feedback visual no mobile)
    box.select();
    box.setSelectionRange(0, 99999); 

    // Copia usando a API moderna
    navigator.clipboard.writeText(box.value).then(() => {
        // Feedback visual no botão
        btn.innerHTML = '✅ COPIADO!';
        btn.style.background = '#4caf50'; // Muda para verde
        btn.style.color = '#fff';

        // Volta ao normal depois de 2 segundos
        setTimeout(() => {
            btn.innerHTML = textoOriginal;
            btn.style.background = ''; // Volta ao CSS original
            btn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar: ', err);
        alert("Erro ao copiar. Tente selecionar e copiar manualmente.");
    });
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