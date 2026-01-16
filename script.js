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
    'fundo.jpg', 
    'https://wallpaperaccess.com/full/1253735.jpg', 
    'https://getwallpapers.com/wallpaper/full/0/a/d/1286343.jpg'
];
let idx = 0;

function mudarFundo() {
    const bg = document.querySelector('.game-wallpaper');
    if (bg) {
        bg.style.backgroundImage = `url('${imagens[idx]}')`;
        idx = (idx + 1) % imagens.length;
    }
}
setInterval(mudarFundo, 7000);
mudarFundo();

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
// 3. SISTEMA DE USUÁRIO (CADASTRO / LOGIN / CONTA)
// ==========================================
async function registrarCliente() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const whatsapp = document.getElementById('regWhatsapp').value;
    const password = document.getElementById('regPass').value;

    if (!name || !email || !whatsapp || !password) return alert("Preencha todos os campos!");

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, email, whatsapp, password })
        });
        const data = await res.json();
        if (data.success) {
            alert("Cadastro realizado! Agora faça login.");
            toggleForm();
        } else {
            alert(data.error || "Erro ao cadastrar.");
        }
    } catch (e) { alert("Erro de conexão."); }
}

async function loginCliente() {
    const email = document.getElementById('logEmail').value;
    const password = document.getElementById('logPass').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.error) return alert(data.error);

        localStorage.setItem('jnloja_user', JSON.stringify(data));
        location.reload();
    } catch (e) { alert("Erro de conexão."); }
}

async function abrirAreaCliente() {
    if (!userLogado) {
        document.getElementById('accountModal').style.display = 'block';
    } else {
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

function logout() {
    localStorage.removeItem('jnloja_user');
    location.reload();
}

// ==========================================
// 4. FUTEBOL (TOPO E RODAPÉ)
// ==========================================
async function carregarFutebol() {
    try {
        console.log("Buscando dados de futebol...");
        const res = await fetch(`${API_URL}/football`);
        const data = await res.json();
        
        const tSuperior = document.getElementById('ticker');
        const tRodape = document.getElementById('footer-ticker');

        // Se a API retornou jogos
        if (data && data.length > 0) {
            // Criamos a lista básica de jogos com a bolinha
            const html = data.map(j => `
                <span class="ticker-item-style">${j.teams.home.name} ${j.goals.home} x ${j.goals.away} ${j.teams.away.name}</span>
                <i class="fas fa-futbol" style="color:#fff; margin: 0 10px;"></i>
            `).join('');

            // Inserimos no TOPO (Header)
            if (tSuperior) {
                // Duplicamos ${html}${html} para o loop ser infinito e sem saltos
                tSuperior.innerHTML = `<div class="header-animacao">${html}${html}</div>`;
            }

            // Inserimos no RODAPÉ (Footer)
            if (tRodape) {
                // Usamos a classe de animação do rodapé
                tRodape.innerHTML = `<div class="footer-ticker-wrapper">${html}${html}</div>`;
            }
            
            console.log("Futebol atualizado com sucesso!");
        }
    } catch (e) { 
        console.error("Erro ao carregar futebol:", e); 
    }
}

carregarFutebol();
setInterval(carregarFutebol, 1200000); // Atualiza a cada 20 min

// ==========================================
// 5. COMPRA DE DIAMANTES E PIX
// ==========================================
/*async function comprarDima(preco, nome) {
    if (!userLogado) {
        alert("Você precisa estar logado para comprar!");
        abrirAreaCliente();
        return;
    }
*/
    async function comprarDima(preco, nome) {
    if (!userLogado) {
        // EM VEZ DE ALERT, ABRIMOS O MODAL BONITO
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
    } catch (e) { alert("Erro de conexão com o servidor de pagamentos."); }
}

// Função para fechar o aviso e abrir o login
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
                    <p style="margin-top:15px;">Seu código de resgate é:</p>
                    <div style="background:#000; padding:20px; color:#00f2ff; font-size:22px; font-weight:bold; margin:20px 0; border:2px solid #00f2ff; border-radius:10px;">
                        ${data.pin}
                    </div>
                    <button onclick="copyPin('${data.pin}')" class="btn-copy">📋 COPIAR CÓDIGO</button>
                    <p style="font-size:12px; color:#888; margin-top:15px;">O código também foi salvo em sua conta.</p>
                    <button onclick="location.reload()" class="btn-close" style="margin-top:20px; display:block; width:100%;">FECHAR</button>
                `;
            }
        }
    } catch (e) { console.log("Aguardando aprovação..."); }
}

function copyPin(pin) {
    navigator.clipboard.writeText(pin);
    alert("Código Copiado!");
}

function copyToClipboard() {
    const box = document.getElementById("pixCodeDisplay");
    box.select();
    navigator.clipboard.writeText(box.value);
    alert("✅ Código Pix Copiado!");
}

console.log("✅ Script JNLOJA v2.0 carregado com sucesso!");