// ==========================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================
const API_URL = "https://jnloja.onrender.com/api";
let userLogado = JSON.parse(localStorage.getItem('jnloja_user')) || null;
let checkInterval;
let ligaAtiva = 71; 

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
        bg.style.backgroundImage = "url('" + imagens[idx] + "')";
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

function irParaLogin() {
    closeModal('avisoModal');
    document.getElementById('accountModal').style.display = 'block';
}

// Ano automático
const elAno = document.getElementById('ano');
if (elAno) elAno.textContent = new Date().getFullYear();

// Timer de Ofertas
let tempoTotal = 86400;
const elCountdown = document.getElementById('countdown');
if (elCountdown) {
    setInterval(() => {
        tempoTotal--;
        let h = Math.floor(tempoTotal/3600), m = Math.floor((tempoTotal%3600)/60), s = tempoTotal%60;
        elCountdown.textContent = "Ofertas expiram em: " + (h<10?'0'+h:h) + ":" + (m<10?'0'+m:m) + ":" + (s<10?'0'+s:s);
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

    if (!name || !email || !whatsapp || !password) return alert("Preencha todos os campos!");
    if (password.length < 6) return alert("A senha deve ter 6 dígitos.");

    try {
        const res = await fetch(API_URL + "/register", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, email, whatsapp, password })
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ Cadastro realizado! Agora faça login.");
            toggleForm();
        } else {
            alert("⚠️ " + (data.error || "Erro ao cadastrar."));
        }
    } catch (e) { alert("Erro de conexão."); }
}

async function loginCliente() {
    const email = document.getElementById('logEmail').value.trim().toLowerCase();
    const password = document.getElementById('logPass').value;

    try {
        const res = await fetch(API_URL + "/login", {
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
            const res = await fetch(API_URL + "/my-orders/" + userLogado.email);
            const orders = await res.json();
            list.innerHTML = orders.length > 0 ? orders.map(o => 
                '<div class="order-item">' + o.amount + ' Dimas: <b style="color:var(--secondary)">' + o.code + '</b></div>'
            ).join('') : "Nenhum código encontrado.";
        } catch (e) { list.innerHTML = "Erro ao buscar histórico."; }
    }
}

function logout() {
    localStorage.removeItem('jnloja_user');
    location.reload();
}

// ==========================================
// 4. TABELAS DE CLASSIFICAÇÃO
// ==========================================
function atualizarAno() {
    const ano = document.getElementById('anoTemporada').value;
    mudarTabela(ligaAtiva, ano);
}

async function mudarTabela(leagueId, season = null) {
    ligaAtiva = leagueId;
    if (!season) season = document.getElementById('anoTemporada').value;

    const body = document.getElementById('standingsBody');
    if (!body) return;

    body.innerHTML = '<tr><td colspan="6">Buscando dados de ' + season + '... ⏳</td></tr>';

    try {
        const res = await fetch(API_URL + "/standings/" + leagueId + "/" + season);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
            body.innerHTML = data.map(team => 
                '<tr>' +
                    '<td><b style="color:var(--secondary)">' + team.rank + 'º</b></td>' +
                    '<td style="text-align:left; display:flex; align-items:center; gap:10px;">' +
                        '<img src="' + team.team.logo + '" width="25"> ' + team.team.name + 
                    '</td>' +
                    '<td><b>' + team.points + '</b></td>' +
                    '<td>' + team.all.played + '</td>' +
                    '<td>' + team.all.win + '</td>' +
                    '<td style="color:' + (team.goalsDiff >= 0 ? '#00ff88' : '#ff4757') + '">' + team.goalsDiff + '</td>' +
                '</tr>'
            ).join('');
        } else {
            body.innerHTML = '<tr><td colspan="6">Sem dados para esta temporada.</td></tr>';
        }
    } catch (e) { body.innerHTML = '<tr><td colspan="6">Erro ao conectar servidor.</td></tr>'; }
}

// ==========================================
// 3. FUTEBOL (TOPO E RODAPÉ)
// ==========================================
async function carregarFutebol() {
    try {
        const res = await fetch(API_URL + "/football");
        const data = await res.json();
        
        const tSuperior = document.getElementById('ticker');
        const tRodape = document.getElementById('footer-ticker');

        if (data && data.length > 0) {
            // Cria os itens de futebol
            const html = data.map(j => 
                '<span class="ticker-item-style">' + j.teams.home.name + ' ' + j.goals.home + ' x ' + j.goals.away + ' ' + j.teams.away.name + '</span>' +
                '<i class="fas fa-futbol" style="color:#fff; margin: 0 10px;"></i>'
            ).join('');

            // Injeta no topo
            if (tSuperior) tSuperior.innerHTML = '<div class="header-animacao">' + html + html + '</div>';
            
            // Injeta no rodapé (Agora com futebol também!)
            if (tRodape) tRodape.innerHTML = '<div class="footer-ticker-wrapper">' + html + html + '</div>';
        }
    } catch (e) { console.log("Erro ao carregar futebol"); }
}

// Inicia e agenda a cada 15 minutos

carregarFutebol();
setInterval(carregarFutebol, 900000); // 15 min

// ==========================================
// 6. JN ARENA (LIVES)
// ==========================================
function mudarCanal(idOuLink, titulo, botao) {
    const player = document.getElementById('arenaPlayer');
    if (idOuLink.startsWith('http')) player.src = idOuLink;
    else if (idOuLink.startsWith('UC')) player.src = "https://www.youtube.com/embed/live_stream?channel=" + idOuLink;
    else player.src = "https://www.youtube.com/embed/" + idOuLink;

    document.getElementById('current-channel-title').innerHTML = '<i class="fas fa-play-circle"></i> ' + titulo;
    document.querySelectorAll('.btn-channel').forEach(btn => btn.classList.remove('active'));
    botao.classList.add('active');
}

// ==========================================
// 7. COMPRAS E PIX
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
                email: userLogado.email, whatsapp: userLogado.whatsapp, 
                amount: preco, description: nome 
            })
        });
        const data = await res.json();

        if (data.qr_code) {
            document.getElementById('pixCodeDisplay').value = data.qr_code;
            document.getElementById('pixModal').style.display = 'block';
            document.querySelector('.btn-whatsapp-send').onclick = () => {
                const msg = encodeURIComponent("💎 *JNLOJA* 💎\nMeu Pix para carregar: " + data.qr_code);
                window.open("https://wa.me/5554996689157?text=" + msg, "_blank");
            };
            if (checkInterval) clearInterval(checkInterval);
            checkInterval = setInterval(() => verificarStatus(data.id), 5000);
        }
    } catch (e) { alert("Erro ao gerar pagamento."); }
}

async function verificarStatus(id) {
    try {
        const res = await fetch(API_URL + "/status/" + id);
        const data = await res.json();
        if (data.status === 'approved' && data.pin) {
            clearInterval(checkInterval);
            const modalContent = document.querySelector('.pix-modal-content');
            modalContent.innerHTML = 
                '<h2 style="color:#00ff88;">💎 APROVADO!</h2>' +
                '<div class="order-item" style="font-size:22px; text-align:center;">' + data.pin + '</div>' +
                '<button onclick="copyPin(\'' + data.pin + '\')" class="btn-copy">COPIAR</button>' +
                '<button onclick="location.reload()" class="btn-close">FECHAR</button>';
        }
    } catch (e) {}
}

function copyPin(pin) { navigator.clipboard.writeText(pin); alert("Copiado!"); }
function copyToClipboard() {
    const box = document.getElementById("pixCodeDisplay");
    box.select();
    navigator.clipboard.writeText(box.value);
    alert("Copiado!");
}

// ==========================================
// 8. NOTIFICAÇÕES FAKES (AUMENTA CONFIANÇA)
// ==========================================
const cidades = ["Porto Alegre", "São Paulo", "Rio de Janeiro", "Curitiba", "Caxias do Sul", "Bento Gonçalves", "Manaus"];
const pacotes = ["520 Diamantes", "1060 Diamantes", "Passe de Elite"];

function mostrarVendaFake() {
    const cid = cidades[Math.floor(Math.random() * cidades.length)];
    const pac = pacotes[Math.floor(Math.random() * pacotes.length)];
    const div = document.createElement('div');
    div.style = "position:fixed; bottom:20px; left:20px; background:rgba(0,0,0,0.9); border:1px solid #00ff88; padding:15px; border-radius:10px; z-index:10000; font-size:12px; box-shadow:0 0 20px rgba(0,255,136,0.3);";
    div.innerHTML = "✅ <b>Alguém de " + cid + "</b><br>acabou de comprar <b>" + pac + "</b>!";
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}
setInterval(mostrarVendaFake, 45000); // Mostra a cada 45 segundos

console.log("✅ Script JNLOJA v2.0 carregado!");