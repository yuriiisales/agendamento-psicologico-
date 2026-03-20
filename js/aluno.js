// ── aluno.js ──────────────────────────────────────────────────
const sessao = Utils.requireAluno();
if (!sessao) throw new Error('sem sessão');

const aluno = DB.getAlunoById(sessao.id);

// ── Inicializar sidebar ──────────────────────────────────────
document.getElementById('sidebarNome').textContent = aluno.nome.split(' ')[0];
document.getElementById('sidebarMatricula').textContent = aluno.matricula;
document.getElementById('sidebarAvatar').textContent = Utils.initials(aluno.nome);
document.getElementById('topAvatar').textContent = Utils.initials(aluno.nome);
document.getElementById('nomeHeader').textContent = aluno.nome.split(' ')[0];

// ── Navegação ────────────────────────────────────────────────
const sections = ['inicio', 'solicitar', 'historico'];
function showSection(id) {
  sections.forEach(s => {
    document.getElementById('sec-' + s).classList.toggle('hidden', s !== id);
  });
  document.querySelectorAll('.nav-item').forEach((el, i) => {
    el.classList.toggle('active', ['inicio','solicitar','historico'][i] === id);
  });
  document.getElementById('topbarTitle').textContent =
    { inicio: 'Início', solicitar: 'Solicitar Consulta', historico: 'Histórico' }[id];

  if (id === 'inicio')    renderInicio();
  if (id === 'historico') renderHistorico('todos');
}

function logout() {
  DB.clearSessao();
  Utils.go('index.html');
}

// ── Render início ────────────────────────────────────────────
function renderInicio() {
  const consultas = DB.getConsultasByAluno(aluno.id);
  const cnt = (s) => consultas.filter(c => c.statusConsulta === s).length;

  document.getElementById('statsAluno').innerHTML = `
    <div class="stat-card warn">
      <span class="stat-icon">⏳</span>
      <div class="stat-value">${cnt('aguardando')}</div>
      <div class="stat-label">Aguardando</div>
    </div>
    <div class="stat-card blue">
      <span class="stat-icon">📌</span>
      <div class="stat-value">${cnt('confirmada')}</div>
      <div class="stat-label">Confirmadas</div>
    </div>
    <div class="stat-card green">
      <span class="stat-icon">✅</span>
      <div class="stat-value">${cnt('realizada')}</div>
      <div class="stat-label">Realizadas</div>
    </div>
    <div class="stat-card red">
      <span class="stat-icon">❌</span>
      <div class="stat-value">${cnt('cancelada') + cnt('nao_compareceu')}</div>
      <div class="stat-label">Cancel. / Falta</div>
    </div>
  `;

  const recentes = [...consultas].sort((a,b) => b.dataCriacao.localeCompare(a.dataCriacao)).slice(0,5);
  const tbody = document.getElementById('tabelaRecentes');
  if (!recentes.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📋</div><p>Nenhuma consulta ainda.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = recentes.map(c => `
    <tr>
      <td>${c.motivo}</td>
      <td>${Utils.fmtDatePref(c.dataPreferencial)}</td>
      <td style="text-transform:capitalize">${c.turno} · ${c.horarioPreferencial}</td>
      <td>${Utils.badgeStatus(c.statusConsulta)}</td>
      <td>${Utils.fmtDate(c.dataCriacao)}</td>
    </tr>
  `).join('');
}

// ── Render histórico ─────────────────────────────────────────
let filtroAtual = 'todos';
function renderHistorico(filtro) {
  filtroAtual = filtro;
  let consultas = DB.getConsultasByAluno(aluno.id);
  if (filtro !== 'todos') consultas = consultas.filter(c => c.statusConsulta === filtro);
  consultas.sort((a,b) => b.dataCriacao.localeCompare(a.dataCriacao));

  const tbody = document.getElementById('tabelaHistorico');
  if (!consultas.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div><p>Nenhum registro encontrado.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = consultas.map(c => `
    <tr>
      <td>${c.motivo}</td>
      <td>${Utils.fmtDatePref(c.dataPreferencial)}</td>
      <td style="text-transform:capitalize">${c.turno} · ${c.horarioPreferencial}</td>
      <td>${Utils.badgeStatus(c.statusConsulta)}</td>
      <td style="font-size:13px;color:var(--muted)">${c.observacaoPsicologa || '—'}</td>
    </tr>
  `).join('');
}

// Filter chips
document.getElementById('filterBarAluno').addEventListener('click', function(e) {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  document.querySelectorAll('#filterBarAluno .filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  renderHistorico(chip.dataset.status);
});

// ── Formulário solicitar ─────────────────────────────────────
document.getElementById('formSolicitar').addEventListener('submit', function(e) {
  e.preventDefault();
  const data = document.getElementById('dataPreferencial').value;
  if (new Date(data) < new Date(new Date().toDateString())) {
    Utils.showAlert('alertSolicitar', 'danger', 'A data preferencial não pode ser no passado.');
    return;
  }
  DB.addConsulta({
    idAluno:             aluno.id,
    motivo:              document.getElementById('motivo').value.trim(),
    dataPreferencial:    data,
    horarioPreferencial: document.getElementById('horario').value,
    turno:               document.getElementById('turno').value,
    observacaoAluno:     document.getElementById('obsAluno').value.trim(),
  });
  Utils.showAlert('alertSolicitar', 'success', '✅ Solicitação enviada! Aguarde confirmação da psicóloga.');
  document.getElementById('formSolicitar').reset();
});

// ── Boot ─────────────────────────────────────────────────────
renderInicio();
