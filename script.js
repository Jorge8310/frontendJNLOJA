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
// 3. SISTEMA DE USUÁRIO (CADASTRO / LOGIN / CONTA)
// ==========================================

// --- FUNÇÃO DE LOGIN (ADICIONADA AGORA) ---
async function loginCliente() {
    const email = document.getElementById('logEmail').value.trim().toLowerCase();
    const password = document.getElementById('logPass').value;

    if (!email || !password) return alert("❌ Preencha e-mail e senha!");

    try {
        const res = await fetch(API_URL + "/login", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('jnloja_user', JSON.stringify(data));
            alert("✅ Bem-vindo, " + data.name + "!");
            location.reload(); 
        } else {
            alert("⚠️ " + (data.error || "Erro no login"));
        }
    } catch (e) {
        alert("❌ Erro de conexão com o servidor.");
    }
}

async function registrarCliente() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const whatsapp = document.getElementById('regWhatsapp').value.trim();
    const password = document.getElementById('regPass').value;

    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!name || name.length < 3 || !regexNome.test(name)) return alert("❌ Nome inválido.");

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) return alert("❌ E-mail inválido.");

    const apenasNumeros = whatsapp.replace(/\D/g, ''); 
    if (apenasNumeros.length < 10) return alert("❌ WhatsApp inválido.");

    if (password.length < 6) return alert("❌ Senha curta.");

    try {
        const res = await fetch(API_URL + "/register", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, email, whatsapp: apenasNumeros, password })
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ Cadastro realizado! Agora faça login.");
            toggleForm();
        } else {
            alert("⚠️ " + (data.error || "Erro ao cadastrar."));
        }
    } catch (e) { alert("❌ Erro de conexão."); }
}

async function abrirAreaCliente() {
    if (!userLogado) {
        document.getElementById('accountModal').style.display = 'block';
    } else {
        document.getElementById('profileModal').style.display = 'block';
        const list = document.getElementById('orderList');
        list.innerHTML = "Carregando...";
        try {
            const res = await fetch(API_URL + "/my-orders/" + userLogado.email);
            const orders = await res.json();
            list.innerHTML = orders.length > 0 ? orders.map(o => `
                <div style="background:#222; padding:10px; margin-bottom:5px; border-left:4px solid var(--secondary);">
                    ${o.amount} Dimas: <b>${o.code}</b>
                </div>
            `).join('') : "Nenhum código comprado.";
        } catch (e) { list.innerHTML = "Erro ao buscar dados."; }
    }
}

function logout() {
    localStorage.removeItem('jnloja_user');
    location.reload();
}

// ==========================================
// 4. FUTEBOL
// ==========================================
async function carregarFutebol() {
    try {
        const res = await fetch(API_URL + "/football");
        const data = await res.json();
        const tSuperior = document.getElementById('ticker');
        const tRodape = document.getElementById('footer-ticker');

        if (data && data.length > 0) {
            const html = data.map(j => `
                <span class="ticker-item-style">${j.teams.home.name} ${j.goals.home} x ${j.goals.away} ${j.teams.away.name}</span>
                <i class="fas fa-futbol" style="color:#fff; margin: 0 10px;"></i>
            `).join('');

            if (tSuperior) tSuperior.innerHTML = `<div class="header-animacao">${html}${html}</div>`;
            if (tRodape) tRodape.innerHTML = `<div class="footer-ticker-wrapper">${html}${html}</div>`;
        }
    } catch (e) { console.log("Erro futebol"); }
}
carregarFutebol();
setInterval(carregarFutebol, 1200000);

// ==========================================
// 5. COMPRA E STATUS
// ==========================================
async function comprarDima(preco, nome) {
    if (!userLogado) {
        document.getElementById('avisoModal').style.display = 'block';
        return;
    }

    try {
        const res = await fetch(API_URL + "/checkout", {
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
                const msg = encodeURIComponent(`🔥 *JNLOJA* 🔥\nMeu Pix: ${data.qr_code}`);
                window.open(`https://wa.me/5554996689157?text=${msg}`, '_blank');
            };

            if (checkInterval) clearInterval(checkInterval);
            checkInterval = setInterval(() => verificarStatus(data.id), 5000);
        }
    } catch (e) { alert("Erro de conexão."); }
}

function irParaLogin() {
    closeModal('avisoModal');
    document.getElementById('accountModal').style.display = 'block';
}

async function verificarStatus(id) {
    try {
        const res = await fetch(API_URL + "/status/" + id);
        const data = await res.json();
        
        if (data.status === 'approved' && data.pin) {
            clearInterval(checkInterval);
            const modalContent = document.querySelector('.pix-modal-content');
            if (modalContent) {
                modalContent.innerHTML = `
                    <h2 style="color:#00ff88;">💎 PAGAMENTO APROVADO!</h2>
                    <p>Seu código de resgate é:</p>
                    <div style="background:#000; padding:20px; color:#00f2ff; font-size:24px; font-weight:bold; margin:20px 0; border:2px solid #00f2ff; border-radius:10px;">
                        ${data.pin}
                    </div>
                    <button onclick="copyPin('${data.pin}')" class="btn-copy">📋 COPIAR CÓDIGO</button>
                    <button onclick="enviarPinWhats('${data.pin}')" class="btn-whatsapp-send">ENVIAR PARA WHATSAPP</button>
                    <button onclick="location.reload()" class="btn-close" style="background:#333;">FECHAR</button>
                `;
            }
        }
    } catch (e) { console.log("Aguardando..."); }
}

function copyPin(pin) {
    navigator.clipboard.writeText(pin);
    alert("✅ Código Copiado!");
}

function copyToClipboard() {
    const box = document.getElementById("pixCodeDisplay");
    box.select();
    navigator.clipboard.writeText(box.value);
    alert("✅ Pix Copiado!");
}

function enviarPinWhats(pin) {
    const texto = "💎 *JNLOJA* 💎\n\nMeu código de Diamante é: *" + pin + "*";
    window.open("https://wa.me/5554996689157?text=" + encodeURIComponent(texto), '_blank');
}

console.log("✅ Script JNLOJA Finalizado!");