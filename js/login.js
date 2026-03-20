// ── login.js ──────────────────────────────────────────────────
// Trata login do aluno e do admin

const isAdmin = window.location.pathname.includes('login-admin');

if (!isAdmin) {
  // ── LOGIN ALUNO ────────────────────────────────────────────
  let alunoParaTrocar = null;

  document.getElementById('formLogin').addEventListener('submit', function(e) {
    e.preventDefault();
    const matricula = document.getElementById('matricula').value.trim();
    const senha     = document.getElementById('senha').value;
    const aluno     = DB.getAlunoByMatricula(matricula);

    if (!aluno) {
      Utils.showAlert('alertBox', 'danger', 'Matrícula não encontrada.');
      return;
    }
    if (aluno.statusCadastro === 'pendente') {
      Utils.showAlert('alertBox', 'warn',
        '⏳ Seu cadastro ainda está aguardando aprovação da psicóloga. Tente novamente em até 24 horas.');
      return;
    }
    if (aluno.statusCadastro === 'rejeitado') {
      Utils.showAlert('alertBox', 'danger', 'Seu cadastro foi rejeitado. Entre em contato com a psicóloga.');
      return;
    }
    if (aluno.senha !== senha) {
      Utils.showAlert('alertBox', 'danger', 'Senha incorreta.');
      return;
    }

    // Primeiro login → forçar troca de senha
    if (aluno.primeiroLogin) {
      alunoParaTrocar = aluno;
      document.getElementById('formLogin').classList.add('hidden');
      document.getElementById('trocaSenha').classList.remove('hidden');
      return;
    }

    DB.setSessao({ tipo: 'aluno', id: aluno.id, nome: aluno.nome });
    Utils.go('painel-aluno.html');
  });

  document.getElementById('btnTrocaSenha').addEventListener('click', function() {
    const nova     = document.getElementById('novaSenha').value;
    const confirma = document.getElementById('confirmaSenha').value;
    if (nova.length < 6) { Utils.showAlert('alertBox', 'danger', 'Senha deve ter no mínimo 6 caracteres.'); return; }
    if (nova !== confirma) { Utils.showAlert('alertBox', 'danger', 'As senhas não coincidem.'); return; }
    DB.updateAluno(alunoParaTrocar.id, { senha: nova, primeiroLogin: false });
    DB.setSessao({ tipo: 'aluno', id: alunoParaTrocar.id, nome: alunoParaTrocar.nome });
    Utils.go('painel-aluno.html');
  });

} else {
  // ── LOGIN ADMIN ────────────────────────────────────────────
  document.getElementById('formAdmin').addEventListener('submit', function(e) {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const senha   = document.getElementById('senha').value;
    if (usuario === 'admin' && senha === 'admin123') {
      DB.setSessao({ tipo: 'admin', nome: 'Psicóloga Admin' });
      Utils.go('painel-admin.html');
    } else {
      Utils.showAlert('alertBox', 'danger', 'Usuário ou senha incorretos.');
    }
  });
}
