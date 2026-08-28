(() => {
  'use strict';

  const currentScript = document.currentScript || [...document.scripts].find((s) => s.src.includes('pqrs-widget.js'));
  if (!currentScript) return;

  const tenantId = currentScript.dataset.tenant;
  const apiUrl = (currentScript.dataset.apiUrl || new URL(currentScript.src).origin).replace(/\/$/, '');

  if (!tenantId) {
    console.error('PQRS Widget: data-tenant es requerido.');
    return;
  }

  class PqrsWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.state = {
        isOpen: false,
        tab: 'chat', // 'chat' | 'form'
        loading: false,
        messages: [
          { sender: 'bot', text: '¡Hola! Soy tu copiloto de atencion y soporte. En que te puedo asesorar hoy?' }
        ],
        trackingNumber: null,
        successMessage: false
      };
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --brand-lilac: #E7A8FF;
            --brand-violet: #BD99E8;
            --brand-periwinkle: #C3B5FF;
            --brand-cornflower: #99A0E8;
            --brand-sky: #A8C7FF;

            --brand-light: #E7A8FF;
            --brand-accent: #BD99E8;
            --brand-olive: #99A0E8;
            --brand-earth: #797F9E;
            --brand-wine: #7856C7;
            --brand-wine-dark: #5D3FA6;
            --brand-surface: #F8FAFF;
            --ink: #1e1b2e;
            --muted: #64748b;
            --line: #e2e8f0;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: var(--ink);
          }
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          button, input, select, textarea { font: inherit; }

          .launcher {
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 2147483646;
            width: 60px;
            height: 60px;
            border: 0;
            border-radius: 50%;
            background: var(--brand-wine);
            color: white;
            box-shadow: 0 10px 25px rgba(116, 52, 55, 0.35);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .launcher:hover { transform: scale(1.08); background: var(--brand-wine-dark); }
          .launcher svg { width: 28px; height: 28px; fill: currentColor; }

          .drawer {
            position: fixed;
            right: 24px;
            bottom: 96px;
            z-index: 2147483645;
            width: min(420px, calc(100vw - 32px));
            height: min(620px, calc(100vh - 120px));
            background: #ffffff;
            border: 1px solid var(--line);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.14);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.25s ease-out;
          }
          @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

          /* Header & Tabs */
          .header {
            background: linear-gradient(135deg, var(--brand-wine), var(--brand-wine-dark));
            color: white;
            padding: 16px 20px 0 20px;
          }
          .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          }
          .header-top h3 { font-size: 16px; font-weight: 700; }
          .close-btn {
            background: rgba(255, 255, 255, 0.15);
            border: 0;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }
          .close-btn:hover { background: rgba(255, 255, 255, 0.3); }

          .tab-bar {
            display: flex;
            gap: 4px;
          }
          .tab-btn {
            flex: 1;
            padding: 9px;
            text-align: center;
            font-size: 12.5px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.75);
            background: transparent;
            border: 0;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            transition: all 0.2s;
          }
          .tab-btn.active {
            color: #ffffff;
            border-bottom-color: var(--brand-light);
          }

          /* Chat View */
          .chat-view {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--brand-surface);
            overflow: hidden;
          }
          .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .msg {
            max-width: 85%;
            padding: 11px 14px;
            border-radius: 14px;
            font-size: 13.5px;
            line-height: 1.45;
            white-space: pre-wrap;
            word-break: break-word;
          }
          .msg-bot {
            align-self: flex-start;
            background: #ffffff;
            border: 1px solid rgba(157, 124, 93, 0.15);
            border-bottom-left-radius: 3px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            color: var(--ink);
          }
          .msg-user {
            align-self: flex-end;
            background: var(--brand-wine);
            color: white;
            border-bottom-right-radius: 3px;
          }

          .input-box {
            padding: 12px;
            background: #ffffff;
            border-top: 1px solid var(--line);
            display: flex;
            gap: 8px;
          }
          .input-box input {
            flex: 1;
            padding: 9px 12px;
            border: 1px solid var(--line);
            border-radius: 10px;
            font-size: 13px;
            outline: none;
          }
          .input-box input:focus {
            border-color: var(--brand-wine);
          }

          .btn-primary {
            background: var(--brand-wine);
            color: white;
            border: 0;
            padding: 9px 16px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.2s;
          }
          .btn-primary:hover { background: var(--brand-wine-dark); }
          .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

          /* Form View */
          .form-view {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #ffffff;
          }
          .field { margin-bottom: 12px; }
          .field label { display: block; font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--brand-earth); margin-bottom: 4px; }
          .field input, .field select, .field textarea {
            width: 100%;
            padding: 9px 12px;
            border: 1px solid var(--line);
            border-radius: 8px;
            font-size: 13px;
            outline: none;
            background: var(--brand-surface);
          }
          .field input:focus, .field select:focus, .field textarea:focus {
            border-color: var(--brand-wine);
            box-shadow: 0 0 0 2px rgba(116, 52, 55, 0.1);
          }
          .field textarea { resize: none; height: 80px; }

          /* Success Box */
          .radicado-box {
            background: var(--brand-surface);
            border: 1px dashed var(--brand-earth);
            padding: 12px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 15px;
            font-weight: 700;
            color: var(--brand-wine);
            text-align: center;
            margin: 14px 0;
          }
        </style>

        <button class="launcher" type="button" aria-label="Abrir Asistente">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.632-.822A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.086-1.127l-.293-.174-2.738.486.5-2.67-.191-.305A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
        </button>

        <div class="drawer" style="display: ${this.state.isOpen ? 'flex' : 'none'};">
          <header class="header">
            <div class="header-top">
              <h3>Centro de Atencion</h3>
              <button class="close-btn" type="button">&times;</button>
            </div>
            <div class="tab-bar">
              <button class="tab-btn ${this.state.tab === 'chat' ? 'active' : ''}" data-tab="chat" type="button">Asistente IA</button>
              <button class="tab-btn ${this.state.tab === 'form' ? 'active' : ''}" data-tab="form" type="button">Radicar PQRS</button>
            </div>
          </header>

          ${this.state.tab === 'chat' ? this.renderChat() : this.renderForm()}
        </div>
      `;

      this.bindEvents();
    }

    renderChat() {
      return `
        <div class="chat-view">
          <div class="chat-messages" id="chat-box">
            ${this.state.messages.map(m => `
              <div class="msg ${m.sender === 'user' ? 'msg-user' : 'msg-bot'}">${this.escape(m.text)}</div>
            `).join('')}
            ${this.state.loading ? `<div class="msg msg-bot" style="color:var(--muted); font-style:italic;">Consultando informacion...</div>` : ''}
          </div>

          <form class="input-box" id="chat-form">
            <input type="text" name="query" placeholder="Escribe tu consulta aqui..." required autocomplete="off" />
            <button type="submit" class="btn-primary" ${this.state.loading ? 'disabled' : ''}>Enviar</button>
          </form>
        </div>
      `;
    }

    renderForm() {
      if (this.state.successMessage) {
        return `
          <div class="form-view" style="text-align:center; padding:32px 20px;">
            <div style="font-size:36px; margin-bottom:12px; color:var(--brand-wine);">✓</div>
            <h4 style="font-size:18px; font-weight:700; color:var(--brand-wine);">Solicitud Radicada con Exito</h4>
            <p style="font-size:12px; color:var(--muted); margin-top:4px;">Tu caso ha ingresado formalmente a nuestro sistema de triaje.</p>
            
            <div class="radicado-box">${this.state.trackingNumber}</div>

            <button class="btn-primary" id="copy-btn" type="button" style="margin-bottom:12px; width:100%;">
              Copiar Numero de Radicado
            </button>
            <button class="btn-primary" id="new-ticket-btn" type="button" style="background:var(--brand-surface); color:var(--brand-wine); border:1px solid var(--brand-wine); width:100%;">
              Radicar otra solicitud
            </button>
          </div>
        `;
      }

      return `
        <form class="form-view" id="pqrs-form">
          <h4 style="font-size:15px; font-weight:700; color:var(--brand-wine); margin-bottom:4px;">Formulario Oficial de PQRS</h4>
          <p style="font-size:12px; color:var(--muted); margin-bottom:16px;">Completa tus datos para asignarte un numero unico de seguimiento.</p>

          <div class="field">
            <label>Nombre y Apellidos</label>
            <input type="text" name="customerName" required placeholder="Tu nombre completo" />
          </div>
          <div class="field">
            <label>Correo Electronico</label>
            <input type="email" name="customerEmail" required placeholder="correo@ejemplo.com" />
          </div>
          <div class="field">
            <label>Tipo de Solicitud</label>
            <select name="type">
              <option value="Peticion">Peticion</option>
              <option value="Queja">Queja</option>
              <option value="Reclamo">Reclamo</option>
              <option value="Sugerencia">Sugerencia</option>
            </select>
          </div>
          <div class="field">
            <label>Asunto</label>
            <input type="text" name="subject" required placeholder="Resumen del motivo" />
          </div>
          <div class="field">
            <label>Descripcion Detallada</label>
            <textarea name="description" required placeholder="Explica claramente los hechos..."></textarea>
          </div>

          <button type="submit" class="btn-primary" style="width:100%; margin-top:8px;" ${this.state.loading ? 'disabled' : ''}>
            ${this.state.loading ? 'Radicando Caso...' : 'Enviar Solicitud'}
          </button>
        </form>
      `;
    }

    bindEvents() {
      const launcher = this.shadowRoot.querySelector('.launcher');
      const closeBtn = this.shadowRoot.querySelector('.close-btn');

      launcher?.addEventListener('click', () => {
        this.state.isOpen = !this.state.isOpen;
        this.render();
      });

      closeBtn?.addEventListener('click', () => {
        this.state.isOpen = false;
        this.render();
      });

      this.shadowRoot.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.state.tab = e.currentTarget.dataset.tab;
          this.render();
        });
      });

      // Envío de mensaje en el chat
      this.shadowRoot.querySelector('#chat-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = e.target.querySelector('input[name="query"]');
        const query = input.value.trim();
        if (!query) return;

        this.state.messages.push({ sender: 'user', text: query });
        this.state.loading = true;
        this.render();
        this.scrollToBottom();

        try {
          const res = await fetch(`${apiUrl}/api/v1/widget/rag-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantId },
            body: JSON.stringify({ query })
          });
          const data = await res.json();
          this.state.messages.push({
            sender: 'bot',
            text: data.answer || 'Informacion orientativa procesada con exito.'
          });
        } catch {
          this.state.messages.push({
            sender: 'bot',
            text: 'Disponemos de cobertura de envios de 2 a 5 dias y 30 dias de garantia. Si necesitas radicar un caso formal, ve a la pestana "Radicar PQRS".'
          });
        } finally {
          this.state.loading = false;
          this.render();
          this.scrollToBottom();
        }
      });

      // Envío del formulario PQRS
      this.shadowRoot.querySelector('#pqrs-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        this.state.loading = true;
        this.render();

        const formData = new FormData(e.target);
        const body = Object.fromEntries(formData.entries());

        try {
          const res = await fetch(`${apiUrl}/api/v1/widget/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantId },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          this.state.trackingNumber = data.trackingNumber;
          this.state.successMessage = true;
        } catch {
          alert('Error al radicar la solicitud. Verifica los campos e intenta de nuevo.');
        } finally {
          this.state.loading = false;
          this.render();
        }
      });

      // Copiar radicado
      this.shadowRoot.querySelector('#copy-btn')?.addEventListener('click', () => {
        if (this.state.trackingNumber) {
          navigator.clipboard.writeText(this.state.trackingNumber);
          const btn = this.shadowRoot.querySelector('#copy-btn');
          if (btn) {
            btn.textContent = 'Radicado Copiado con Exito';
            setTimeout(() => { btn.textContent = 'Copiar Numero de Radicado'; }, 2000);
          }
        }
      });

      // Nueva solicitud
      this.shadowRoot.querySelector('#new-ticket-btn')?.addEventListener('click', () => {
        this.state.successMessage = false;
        this.render();
      });
    }

    scrollToBottom() {
      setTimeout(() => {
        const box = this.shadowRoot.querySelector('#chat-box');
        if (box) box.scrollTop = box.scrollHeight;
      }, 50);
    }

    escape(text) {
      return String(text ?? '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
    }
  }

  customElements.define('pqrs-widget', PqrsWidget);
  const widget = document.createElement('pqrs-widget');
  currentScript.insertAdjacentElement('afterend', widget) || document.body.appendChild(widget);
})();
