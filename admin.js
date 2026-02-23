const API_URL = "https://jnloja.onrender.com/api";
let userLogado = JSON.parse(localStorage.getItem('jnloja_user')) || null;

// SEGURANÇA: SE NÃO FOR ADMIN, VOLTA PRO INDEX
if (!userLogado || userLogado.email !== "rivasmendez57@gmail.com") {
    alert("⛔ Acesso restrito!");
    window.location.href = "index.html";
}

document.getElementById('adminName').textContent = userLogado.name;

// FUNÇÃO: VOLTAR AO SITE (COMO CLIENTE LOGADO)
function voltarAoSite() {
    window.location.href = "index.html";
}

// FUNÇÃO: SAIR COMPLETAMENTE
function sairAdmin() {
    if (confirm("🚪 Deseja encerrar sua sessão?")) {
        localStorage.removeItem('jnloja_user');
        window.location.href = "index.html";
    }
}

// CONTROLE DE ABAS
// ============================================================================
// 2️⃣ ATUALIZAR FUNÇÃO mostrarAba()
// ============================================================================

function mostrarAba(nomeAba, event) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById('aba-' + nomeAba).style.display = 'block';
    if(event) event.target.classList.add('active');
    
    if (nomeAba === 'clientes') carregarClientes();
    if (nomeAba === 'codigos') carregarCodigos();
    
    // AQUI: Deve chamar o nome da função que você definiu
    if (nomeAba === 'pagamentos') carregarPagamentos(); 
    
    if (nomeAba === 'adicionar') { /* não precisa carregar nada */ }
    if (nomeAba === 'livros') carregarLivrosAdmin();

    if (nomeAba === 'gameflip-dashboard') carregarDashboardGameflip();
    if (nomeAba === 'gameflip-compras') carregarComprasGameflip();
}

// --- FUNÇÕES DE CARREGAMENTO ---
async function carregarStats() {
    try {
        const [clientes, codigos] = await Promise.all([
            fetch(`${API_URL}/admin/customers?adminEmail=${userLogado.email}`).then(r => r.json()),
            fetch(`${API_URL}/admin/pins?adminEmail=${userLogado.email}`).then(r => r.json())
        ]);
        document.getElementById('totalClientes').textContent = clientes.length;
        document.getElementById('codigosUsados').textContent = codigos.filter(c => c.isUsed).length;
        document.getElementById('codigosDisponiveis').textContent = codigos.filter(c => !c.isUsed).length;
    } catch (e) { console.error(e); }
}

// CARREGAR CLIENTES COM COLUNA ID FREE FIRE
async function carregarClientes() {
    const container = document.getElementById('lista-clientes');
    try {
        const res = await fetch(`${API_URL}/admin/customers?adminEmail=${userLogado.email}`);
        const clientes = await res.json();
        
        let html = `<table class="admin-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>ID Free Fire</th>
                    <th>Ação</th>
                </tr>
            </thead><tbody>`;
        
        clientes.forEach(c => {
            html += `<tr>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td style="color: #00f2ff; font-weight: bold;">${c.freeFireId || '—'}</td>
                <td>
                    <button onclick="deletarCliente('${c._id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });
        
        container.innerHTML = html + `</tbody></table>`;
    } catch (e) { 
        container.innerHTML = "Erro ao carregar clientes."; 
    }
}

// CARREGAR CÓDIGOS
async function carregarCodigos() {
    const container = document.getElementById('lista-codigos');
    try {
        const res = await fetch(`${API_URL}/admin/pins?adminEmail=${userLogado.email}`);
        const pins = await res.json();
        
        const disponiveis = pins.filter(p => !p.isUsed);

        let html = `<table class="admin-table">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Código</th>
                    <th>Valor</th>
                    <th>Ação</th>
                </tr>
            </thead><tbody>`;
        
        disponiveis.forEach(p => {
            html += `<tr>
                <td style="color: var(--secondary); font-weight: bold;">${(p.category || 'FREEFIRE').toUpperCase()}</td>
                <td>${p.code}</td>
                <td>R$ ${p.amount}</td>
                <td>
                    <button onclick="deletarPin('${p._id}')" class="btn-delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        container.innerHTML = html + `</tbody></table>`;
    } catch (e) { 
        console.error(e);
        container.innerHTML = "Erro ao carregar estoque."; 
    }
}

// ADICIONAR CÓDIGO
async function adicionarCodigo() {
    const category = document.getElementById('newCategory').value;
    const code = document.getElementById('newCode').value;
    const amount = document.getElementById('newAmount').value;

    if(!code || !amount) return alert("Por favor, preencha o código e o valor!");

    try {
        const res = await fetch(`${API_URL}/admin/add-pin`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                adminEmail: userLogado.email, 
                code, 
                amount,
                category
            })
        });

        const data = await res.json();

        if(data.success) {
            alert(`✅ Sucesso: PIN de ${category.toUpperCase()} salvo!`);
            document.getElementById('newCode').value = "";
            carregarStats();
        } else {
            alert("Erro ao salvar: " + data.error);
        }
    } catch (e) {
        alert("Erro de conexão com o servidor.");
    }
}

// DELETAR CLIENTE
async function deletarCliente(id) {
    if (!confirm("⚠️ ATENÇÃO: Deseja realmente excluir este cliente do banco de dados?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/customer/${id}?adminEmail=${userLogado.email}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ Cliente excluído!");
            carregarClientes();
            carregarStats();
        }
    } catch (e) { alert("Erro ao excluir."); }
}

// DELETAR PIN
async function deletarPin(id) {
    if (!confirm("⚠️ Deseja remover este código do estoque?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/pin/${id}?adminEmail=${userLogado.email}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ PIN removido!");
            carregarCodigos();
            carregarStats();
        }
    } catch (e) { alert("Erro ao excluir."); }
}

// ============================================================================
// 3️⃣ FUNÇÃO: CARREGAR VENDAS PIX
// ============================================================================

async function carregarPagamentos() {
    const container = document.getElementById('lista-vendas-pix');
    
    try {
        const res = await fetch(`${API_URL}/admin/vendas-pix?adminEmail=${userLogado.email}`);
        const vendas = await res.json();

        if (vendas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #888;">
                    Nenhuma venda PIX ainda.
                </div>
            `;
            return;
        }

        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>IP</th>
                        <th>Produto</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Código</th>
                    </tr>
                </thead>
                <tbody>
        `;

        vendas.forEach(v => {
            const data = new Date(v.createdAt).toLocaleString('pt-BR');
            const statusClass = v.status === 'PAGO' ? 'status-pago' : 'status-pendente';
            const statusIcon = v.status === 'PAGO' ? '✅' : '⏳';

            html += `
                <tr>
                    <td>${data}</td>
                    <td>
                        <div style="font-weight: bold;">${v.customerName}</div>
                        <div style="font-size: 11px; color: #888;">${v.customerEmail}</div>
                    </td>
                    <td style="color: #888; font-size: 11px;">${v.customerIp || '—'}</td>
                    <td style="color: var(--secondary); font-weight: bold;">
                        ${(v.category || 'freefire').toUpperCase()}
                    </td>
                    <td style="font-weight: bold;">R$ ${v.amount.toFixed(2)}</td>
                    <td>
                        <span class="${statusClass}">
                            ${statusIcon} ${v.status}
                        </span>
                    </td>
                    <td style="color: #00f2ff; font-weight: bold;">
                        ${v.codigoEntregue || '—'}
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #f44336;">
                ❌ Erro ao carregar vendas PIX
            </div>
        `;
    }
}

// --- FUNÇÕES DE LIVROS ---

async function carregarLivrosAdmin() {
    const container = document.getElementById('lista-livros');
    try {
        const res = await fetch(`${API_URL}/books`);
        const livros = await res.json();
        
        let html = `<table class="admin-table">
            <thead>
                <tr>
                    <th>Capa</th>
                    <th>Título</th>
                    <th>Autor/Categoria</th>
                    <th>Ação</th>
                </tr>
            </thead><tbody>`;
        
        livros.forEach(l => {
            html += `<tr>
                <td><img src="${l.coverImage}" style="width: 40px; border-radius: 4px;"></td>
                <td style="font-weight: bold;">${l.title}</td>
                <td>${l.author} | ${l.category}</td>
                <td>
                    <button onclick="deletarLivro('${l._id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });
        container.innerHTML = html + `</tbody></table>`;
    } catch (e) { container.innerHTML = "Erro ao carregar livros."; }
}

async function adicionarLivro() {
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const category = document.getElementById('bookCategory').value;
    const coverImage = document.getElementById('bookCover').value;
    const megaUrl = document.getElementById('bookMega').value;

    if(!title || !megaUrl || !coverImage) return alert("Preencha ao menos Título, Capa e Link do MEGA!");

    try {
        const res = await fetch(`${API_URL}/admin/add-book`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                adminEmail: userLogado.email, 
                title, author, category, coverImage, megaUrl 
            })
        });
        
        const data = await res.json();
        if(data.success) {
            alert("📚 Livro adicionado com sucesso!");
            document.getElementById('bookTitle').value = "";
            document.getElementById('bookAuthor').value = "";
            document.getElementById('bookCover').value = "";
            document.getElementById('bookMega').value = "";
            carregarLivrosAdmin();
        } else {
            alert("Erro: " + data.error);
        }
    } catch (e) { alert("Erro ao conectar com o servidor."); }
}

async function deletarLivro(id) {
    if (!confirm("⚠️ Deseja realmente remover este livro da biblioteca?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/book/${id}?adminEmail=${userLogado.email}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ Livro removido!");
            carregarLivrosAdmin();
        }
    } catch (e) { alert("Erro ao excluir livro."); }
}

// ============================================================================
// CÓDIGO ADICIONAL PARA O ADMIN.JS
// Cole este código no FINAL do seu admin.js (antes do carregarStats())
// ============================================================================

// ========================================================================
// 1. NOVA FUNÇÃO: Carregar Dashboard Gameflip
// ========================================================================
async function carregarDashboardGameflip() {
    const container = document.getElementById('dashboard-gameflip');
    
    try {
        // Busca saldo e compras
        const [saldoRes, comprasRes] = await Promise.all([
            fetch(`${API_URL}/gameflip/balance?adminEmail=${userLogado.email}`),
            fetch(`${API_URL}/gameflip/purchases?adminEmail=${userLogado.email}`)
        ]);

        const saldo = await saldoRes.json();
        const comprasData = await comprasRes.json();
        const compras = comprasData.purchases || [];

        // Calcula estatísticas
        const totalComprado = compras
            .filter(c => c.status === 'PURCHASED')
            .reduce((sum, c) => sum + (c.gameflipPrice || 0), 0);

        const comprasFalhadas = compras.filter(c => c.status === 'FAILED').length;
        const comprasSucesso = compras.filter(c => c.status === 'PURCHASED').length;

        // Renderiza dashboard
        container.innerHTML = `
            <div class="gameflip-dashboard">
                <div class="gf-stat-card">
                    <div class="gf-stat-icon">💰</div>
                    <div class="gf-stat-info">
                        <div class="gf-stat-value">$${saldo.balance?.toFixed(2) || '0.00'}</div>
                        <div class="gf-stat-label">Saldo Disponível</div>
                    </div>
                </div>

                <div class="gf-stat-card">
                    <div class="gf-stat-icon">🛒</div>
                    <div class="gf-stat-info">
                        <div class="gf-stat-value">${comprasSucesso}</div>
                        <div class="gf-stat-label">Compras Realizadas</div>
                    </div>
                </div>

                <div class="gf-stat-card">
                    <div class="gf-stat-icon">💵</div>
                    <div class="gf-stat-info">
                        <div class="gf-stat-value">$${totalComprado.toFixed(2)}</div>
                        <div class="gf-stat-label">Total Gasto</div>
                    </div>
                </div>

                <div class="gf-stat-card ${comprasFalhadas > 0 ? 'gf-alert' : ''}">
                    <div class="gf-stat-icon">⚠️</div>
                    <div class="gf-stat-info">
                        <div class="gf-stat-value">${comprasFalhadas}</div>
                        <div class="gf-stat-label">Compras Falhadas</div>
                    </div>
                </div>
            </div>

            ${saldo.balance < 10 ? `
                <div class="gf-alert-box">
                    ⚠️ <strong>ATENÇÃO:</strong> Saldo baixo! Adicione fundos em 
                    <a href="https://gameflip.com/wallet" target="_blank" style="color: var(--secondary);">
                        gameflip.com/wallet
                    </a>
                </div>
            ` : ''}
        `;

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #f44336;">
                ❌ Erro ao carregar dados do Gameflip
            </div>
        `;
    }
}

// ========================================================================
// 2. NOVA FUNÇÃO: Carregar Compras Gameflip
// ========================================================================
async function carregarComprasGameflip() {
    const container = document.getElementById('lista-compras-gameflip');
    
    try {
        const res = await fetch(`${API_URL}/gameflip/purchases?adminEmail=${userLogado.email}`);
        const data = await res.json();
        const compras = data.purchases || [];

        if (compras.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #888;">
                    Nenhuma compra no Gameflip ainda.
                </div>
            `;
            return;
        }

        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Categoria</th>
                        <th>Valor Cliente</th>
                        <th>Preço Gameflip</th>
                        <th>Lucro</th>
                        <th>Status</th>
                        <th>Código</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
        `;

        compras.forEach(c => {
            const data = new Date(c.createdAt).toLocaleString('pt-BR');
            const lucro = (c.amount || 0) - ((c.gameflipPrice || 0) * 5.3); // Conversão aproximada USD -> BRL
            const statusClass = c.status === 'PURCHASED' ? 'status-pago' : 
                               c.status === 'FAILED' ? 'status-pendente' : '';

            html += `
                <tr>
                    <td style="font-size: 11px;">${data}</td>
                    <td>
                        <div style="font-size: 12px; font-weight: bold;">${c.customerEmail.split('@')[0]}</div>
                        <div style="font-size: 10px; color: #888;">${c.customerEmail}</div>
                    </td>
                    <td style="color: var(--secondary); font-weight: bold;">
                        ${(c.category || 'freefire').toUpperCase()}
                    </td>
                    <td style="font-weight: bold;">R$ ${(c.amount || 0).toFixed(2)}</td>
                    <td style="color: #00ff88;">$${(c.gameflipPrice || 0).toFixed(2)}</td>
                    <td style="color: ${lucro > 0 ? '#00ff88' : '#ff4757'}; font-weight: bold;">
                        R$ ${lucro.toFixed(2)}
                    </td>
                    <td>
                        <span class="${statusClass}">
                            ${c.status === 'PURCHASED' ? '✅' : c.status === 'FAILED' ? '❌' : '⏳'} 
                            ${c.status}
                        </span>
                    </td>
                    <td style="color: #00f2ff; font-size: 11px; font-weight: bold;">
                        ${c.code || '—'}
                    </td>
                    <td>
                        ${c.status === 'FAILED' ? `
                            <button onclick="retentarCompraGameflip('${c._id}')" class="btn-retry">
                                <i class="fas fa-redo"></i> RETENTAR
                            </button>
                        ` : '—'}
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #f44336;">
                ❌ Erro ao carregar compras Gameflip
            </div>
        `;
    }
}

// ========================================================================
// 3. NOVA FUNÇÃO: Retentar Compra Falhada
// ========================================================================
async function retentarCompraGameflip(purchaseId) {
    if (!confirm('⚠️ Deseja retentar esta compra no Gameflip?')) return;

    const btn = event.target.closest('button');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/gameflip/retry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                adminEmail: userLogado.email,
                purchaseId: purchaseId
            })
        });

        const data = await res.json();

        if (data.success) {
            alert(`✅ Compra retentada com sucesso!\n\nCódigo: ${data.code}\n\nO cliente receberá o e-mail automaticamente.`);
            carregarComprasGameflip();
            carregarDashboardGameflip();
        } else {
            alert('❌ Erro: ' + data.error);
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
        }

    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao processar: ' + error.message);
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
}

// ========================================================================
// 4. ATUALIZAR FUNÇÃO mostrarAba() - ADICIONE ESTES CASOS
// ========================================================================
// Cole estas linhas dentro da função mostrarAba() existente:

/*
if (nomeAba === 'gameflip-dashboard') {
    carregarDashboardGameflip();
}
if (nomeAba === 'gameflip-compras') {
    carregarComprasGameflip();
}
*/

// ========================================================================
// 5. NOVA FUNÇÃO: Atualizar Stats com Gameflip
// ========================================================================
async function carregarStatsCompleto() {
    try {
        const [clientes, codigos, comprasGF] = await Promise.all([
            fetch(`${API_URL}/admin/customers?adminEmail=${userLogado.email}`).then(r => r.json()),
            fetch(`${API_URL}/admin/pins?adminEmail=${userLogado.email}`).then(r => r.json()),
            fetch(`${API_URL}/gameflip/purchases?adminEmail=${userLogado.email}`).then(r => r.json())
        ]);

        document.getElementById('totalClientes').textContent = clientes.length;
        document.getElementById('codigosUsados').textContent = codigos.filter(c => c.isUsed).length;
        document.getElementById('codigosDisponiveis').textContent = codigos.filter(c => !c.isUsed).length;

        // Adiciona stat de Gameflip se existir o elemento
        const gfStat = document.getElementById('comprasGameflip');
        if (gfStat && comprasGF.purchases) {
            const sucessos = comprasGF.purchases.filter(c => c.status === 'PURCHASED').length;
            gfStat.textContent = sucessos;
        }

    } catch (e) { 
        console.error(e); 
    }
}

// ========================================================================
// 6. FUNÇÃO HELPER: Verificar Status Gameflip
// ========================================================================
async function verificarStatusGameflip() {
    try {
        const res = await fetch(`${API_URL}/gameflip/balance?adminEmail=${userLogado.email}`);
        const data = await res.json();
        
        if (data.success && data.balance < 10) {
            mostrarAlertaSaldoBaixo();
        }
    } catch (e) {
        console.log('Gameflip não disponível ou sem credenciais');
    }
}

function mostrarAlertaSaldoBaixo() {
    const alerta = document.createElement('div');
    alerta.className = 'alerta-flutuante';
    alerta.innerHTML = `
        <div style="background: #ff4757; color: white; padding: 15px; border-radius: 8px; position: fixed; top: 80px; right: 20px; z-index: 9999; box-shadow: 0 4px 20px rgba(255,71,87,0.4);">
            <strong>⚠️ ATENÇÃO!</strong><br>
            Saldo Gameflip abaixo de $10 USD.<br>
            <a href="https://gameflip.com/wallet" target="_blank" style="color: #fff; text-decoration: underline;">
                Adicionar fundos agora →
            </a>
        </div>
    `;
    document.body.appendChild(alerta);
    
    setTimeout(() => alerta.remove(), 10000); // Remove após 10 segundos
}

// ========================================================================
// SUBSTITUIR A CHAMADA carregarStats() por carregarStatsCompleto()
// ========================================================================
// No final do admin.js, SUBSTITUA:
// carregarStats();
// POR:
// carregarStatsCompleto();
// verificarStatusGameflip();

console.log('✅ Funções Gameflip carregadas no Admin');

// Iniciar
carregarStats();
carregarClientes();