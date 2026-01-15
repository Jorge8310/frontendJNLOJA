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
// 2. ANO E TIMER DE OFERTAS
// ==========================================
const elAno = document.getElementById('ano');
if (elAno) elAno.textContent = new Date().getFullYear();

let tempoTotal = 86400; // 24 horas
const elCountdown = document.getElementById('countdown');

if (elCountdown) {
    setInterval(() => {
        tempoTotal--;
        let h = Math.floor(tempoTotal/3600), 
            m = Math.floor((tempoTotal%3600)/60), 
            s = tempoTotal%60;
        
        h = h < 10 ? '0' + h : h;
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + s : s;
        
        elCountdown.textContent = `Ofertas expiram em: ${h}:${m}:${s}`;
    }, 1000);
}

// ==========================================
// 3. FUTEBOL (TOPO E RODAPÉ) - ATUALIZA A CADA 20 MINUTOS
// ==========================================
async function carregarFutebol() {
    console.log("Buscando dados de futebol para o site...");
    try {
        const res = await fetch('https://jnloja.onrender.com/api/football');
        const data = await res.json();
        
        const tSuperior = document.getElementById('ticker');
        const tRodape = document.getElementById('footer-ticker');

        if (data && data.length > 0) {
            const html = data.map(j => `
                <span class="ticker-item-style">${j.teams.home.name} ${j.goals.home} x ${j.goals.away} ${j.teams.away.name}</span>
                <i class="fas fa-futbol" style="color:#fff; margin: 0 10px;"></i>
            `).join('');

            // Duplicamos o HTML para o efeito de loop infinito ser suave
            const loopHtmlHeader = `<div class="header-animacao">${html}${html}</div>`;
            const loopHtmlFooter = `<div class="footer-ticker-wrapper">${html}${html}</div>`;

            if (tSuperior) tSuperior.innerHTML = loopHtmlHeader;
            if (tRodape) tRodape.innerHTML = loopHtmlFooter;
        }
    } catch (e) { 
        console.log("Servidor de futebol offline ou em manutenção."); 
    }
}

// Inicia o futebol e define o intervalo de 20 minutos (1.200.000 ms)
carregarFutebol();
setInterval(carregarFutebol, 1200000); 

// ==========================================
// 4. SISTEMA DE COMPRA E VERIFICAÇÃO PIX
// ==========================================
let checkInterval;

async function comprarDima(preco, nome) {
    const email = prompt("E-mail para receber o código do diamante:");
    if (!email) return;
    
    const whatsapp = prompt("Seu WhatsApp com DDD (apenas números):");
    if (!whatsapp) return;

    try {
        const res = await fetch('https://jnloja.onrender.com/api/checkout', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, whatsapp, amount: preco, description: nome })
        });
        const data = await res.json();

        if (data.qr_code) {
            // Preenche o código Pix no Modal
            document.getElementById('pixCodeDisplay').value = data.qr_code;
            document.getElementById('pixModal').style.display = 'block';
            
            // Configura o botão de enviar para o WhatsApp
            const btnWhats = document.querySelector('.btn-whatsapp-send');
            if (btnWhats) {
                btnWhats.onclick = () => {
                    const msg = encodeURIComponent(`🔥 *JNLOJA* 🔥\n\nAqui está meu código Pix para os Diamantes:\n\n${data.qr_code}\n\n_Vou pagar agora!_`);
                    window.open(`https://wa.me/5554996689157?text=${msg}`, '_blank');
                };
            }

            // Inicia a verificação de aprovação a cada 5 segundos
            if (checkInterval) clearInterval(checkInterval);
            checkInterval = setInterval(() => verificarStatus(data.id), 5000);
        }
    } catch (e) { 
        alert("Erro de conexão com o servidor de pagamentos."); 
    }
}

async function verificarStatus(id) {
    try {
        const res = await fetch(`hhttps://jnloja.onrender.com/api/status/${id}`);
        const data = await res.json();
        
        // Se o pagamento for aprovado e o servidor já tiver liberado o PIN
        if (data.status === 'approved' && data.pin) {
            clearInterval(checkInterval);
            
            // Altera o conteúdo do modal para mostrar o diamante ganho
            const modalContent = document.querySelector('.pix-modal-content');
            if (modalContent) {
                modalContent.innerHTML = `
                    <h2 style="color:#00ff88;">💎 PAGAMENTO APROVADO!</h2>
                    <p style="margin-top:15px;">Seu código de resgate é:</p>
                    <div style="background:#000; padding:20px; color:#00f2ff; font-size:22px; font-weight:bold; margin:20px 0; border:2px solid #00f2ff; border-radius:10px;">
                        ${data.pin}
                    </div>
                    <button onclick="navigator.clipboard.writeText('${data.pin}'); alert('Código Copiado!');" class="btn-copy">📋 COPIAR CÓDIGO</button>
                    <p style="font-size:12px; color:#888; margin-top:15px;">O código também foi enviado para seu e-mail.</p>
                    <button onclick="closeModal()" class="btn-close" style="margin-top:20px; display:block; width:100%;">FECHAR</button>
                `;
            }
        }
    } catch (e) {
        console.log("Aguardando aprovação do pagamento...");
    }
}

// ==========================================
// 5. FUNÇÕES AUXILIARES (MODAL E CÓPIA)
// ==========================================
function closeModal() {
    document.getElementById('pixModal').style.display = 'none';
}

function copyToClipboard() {
    const box = document.getElementById("pixCodeDisplay");
    box.select();
    box.setSelectionRange(0, 99999); // Para mobile
    navigator.clipboard.writeText(box.value);
    alert("✅ Código Pix Copiado! Agora abra o app do seu banco.");
}

console.log("✅ Script JN SHOP carregado com sucesso!");