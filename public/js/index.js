if (window.location.pathname === '/') {
  const chatBox = document.getElementById('chat-box');
  const inputTema = document.getElementById('input-tema');
  const botonEnviar = document.getElementById('boton-enviar');

  function agregarMensaje(mensaje, clase = '') {
    const div = document.createElement('div');
    div.className = 'mensaje ' + clase;
    div.textContent = mensaje;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function agregarMensajeHTML(html) {
    const div = document.createElement('div');
    div.className = 'mensaje bot';
    div.innerHTML = html;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function formatearMarkdown(texto) {
    let html = texto
      .replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Convertir listas no ordenadas y ordenadas
    html = html.replace(/(?:^|\n)[*-] (.+)/g, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    html = html.replace(/(?:^|\n)\d+\. (.+)/g, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ol>$1</ol>');

    html = html.replace(/\n{2,}/g, '</p><p>');
    return `<p>${html}</p>`;
  }

  agregarMensaje(
    "¡Hola! Soy tu Asistente. Escribe la solicitud que desees para comenzar.",
    "bot"
  );

  botonEnviar.addEventListener('click', () => {
    const solicitud = inputTema.value.trim();
    if (!solicitud) return;
    agregarMensaje('Tú: ' + solicitud, 'usuario');
    inputTema.value = '';

    const indicadorPensando = document.createElement('div');
    indicadorPensando.className = 'mensaje bot pensando';
    indicadorPensando.textContent = 'Bot está pensando...';
    chatBox.appendChild(indicadorPensando);
    chatBox.scrollTop = chatBox.scrollHeight;

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ solicitud })
    })
      .then(res => res.json())
      .then(data => {
        setTimeout(() => {
          chatBox.removeChild(indicadorPensando);

          if (data.respuesta) {
            const texto = data.respuesta;

            // Si el texto incluye markdown, formatearlo; si no, mostrar directo
            const contieneMarkdown = /[`*[\n]/.test(texto);
            const contenido = contieneMarkdown ? formatearMarkdown(texto) : texto;
            agregarMensajeHTML('Bot: ' + contenido);
          } else {
            agregarMensaje('Bot: Respuesta no reconocida.', 'bot');
          }
        }, 1000);
      });
  });

  inputTema.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      botonEnviar.click();
    }
  });
}

