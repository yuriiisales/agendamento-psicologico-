// ── utils.js ──────────────────────────────────────────────────

const Utils = {
  // Status badge HTML
  badgeStatus(status) {
    const map = {
      aguardando:     ['badge-warn',  'Aguardando análise'],
      confirmada:     ['badge-blue',  'Confirmada'],
      realizada:      ['badge-green', 'Realizada'],
      cancelada:      ['badge-red',   'Cancelada'],
      nao_compareceu: ['badge-red',   'Não compareceu'],
    };
    const [cls, txt] = map[status] || ['badge-gray', status];
    return `<span class="badge ${cls}">${txt}</span>`;
  },

  // Status cadastro badge
  badgeCadastro(status) {
    const map = {
      pendente:  ['badge-warn',  'Aguardando aprovação'],
      aprovado:  ['badge-green', 'Aprovado'],
      rejeitado: ['badge-red',   'Rejeitado'],
    };
    const [cls, txt] = map[status] || ['badge-gray', status];
    return `<span class="badge ${cls}">${txt}</span>`;
  },

  // Formatar data ISO → dd/mm/aaaa
  fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR');
  },

  // Formatar data preferencial (yyyy-mm-dd → dd/mm/aaaa)
  fmtDatePref(str) {
    if (!str) return '—';
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  },

  // Iniciais do nome
  initials(nome) {
    if (!nome) return '?';
    const parts = nome.trim().split(' ');
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  },

  // Mostrar alerta na página
  showAlert(containerId, type, msg) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div class="alert alert-${type} fade-up">${msg}</div>`;
    setTimeout(() => { el.innerHTML = ''; }, 4000);
  },

  // Redirecionar
  go(page) { window.location.href = page; },

  // Verificar sessão (aluno)
  requireAluno() {
    const s = DB.getSessao();
    if (!s || s.tipo !== 'aluno') { Utils.go('login-aluno.html'); return null; }
    return s;
  },

  // Verificar sessão (admin)
  requireAdmin() {
    const s = DB.getSessao();
    if (!s || s.tipo !== 'admin') { Utils.go('login-admin.html'); return null; }
    return s;
  }
};
