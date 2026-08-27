(() => {
  'use strict';

  const currentScript = document.currentScript || [...document.scripts].find((script) => script.src.includes('pqrs-widget.js'));
  if (!currentScript) {
    return;
  }

  const tenantId = currentScript.dataset.tenant;
  const apiUrl = (currentScript.dataset.apiUrl || new URL(currentScript.src).origin).replace(/\/$/, '');
  if (!tenantId) {
    console.error('PQRS widget: data-tenant is required.');
    return;
  }

  class PqrsWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.state = { view: 'chat', loading: false, answer: null, matchedArticleIds: [], trackingNumber: null, error: null };
      this.render();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host { --ink: #19212b; --muted: #687584; --line: #dfe5eb; --surface: #ffffff; --wash: #f5f8fa; --accent: #176b87; --accent-dark: #0e4f65; --danger: #a33636; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); }
          *, *::before, *::after { box-sizing: border-box; }
          button, input, textarea { font: inherit; }
          button { cursor: pointer; }
          .launcher { position: fixed; right: 24px; bottom: 24px; z-index: 2147483646; width: 58px; height: 58px; border: 0; border-radius: 50%; background: var(--accent); color: white; box-shadow: 0 12px 28px #123b4b38; font-size: 25px; transition: transform .2s ease, background .2s ease; }
          .launcher:hover, .launcher:focus-visible { background: var(--accent-dark); transform: translateY(-2px); }
          .drawer { position: fixed; right: 24px; bottom: 94px; z-index: 2147483645; width: min(420px, calc(100vw - 32px)); max-height: min(700px, calc(100vh - 120px)); overflow: auto; background: var(--surface); border: 1px solid var(--line); border-radius: 18px; box-shadow: 0 24px 70px #17273535; animation: rise .22s ease-out; }
          .header { display: flex; align-items: center; justify-content: space-between; padding: 20px 22px 16px; border-bottom: 1px solid var(--line); }
          .eyebrow { margin: 0 0 4px; color: var(--accent); font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
          h2 { margin: 0; font-size: 21px; line-height: 1.2; }
          .close { width: 34px; height: 34px; border: 0; border-radius: 50%; background: transparent; color: var(--muted); font-size: 24px; line-height: 1; }
          .close:hover, .close:focus-visible { background: var(--wash); color: var(--ink); }
          .content { padding: 20px 22px 22px; }
          .intro, .success { margin: 0 0 18px; color: var(--muted); font-size: 14px; line-height: 1.55; }
          label { display: block; margin: 14px 0 6px; font-size: 13px; font-weight: 650; }
          input, textarea { width: 100%; border: 1px solid var(--line); border-radius: 9px; background: #fff; color: var(--ink); padding: 11px 12px; outline: none; }
          textarea { min-height: 112px; resize: vertical; }
          input:focus, textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px #176b8720; }
          .primary, .secondary { width: 100%; margin-top: 16px; min-height: 44px; border-radius: 9px; padding: 10px 14px; font-weight: 700; }
          .primary { border: 1px solid var(--accent); background: var(--accent); color: white; }
          .primary:hover, .primary:focus-visible { background: var(--accent-dark); }
          .secondary { border: 1px solid var(--line); background: white; color: var(--accent-dark); }
          .secondary:hover, .secondary:focus-visible { background: var(--wash); }
          .answer { margin: 16px 0; padding: 14px; border-left: 3px solid var(--accent); background: var(--wash); border-radius: 0 9px 9px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.55; }
          .error { margin: 14px 0 0; color: var(--danger); font-size: 13px; line-height: 1.45; }
          .tracking { display: inline-block; margin: 8px 0 18px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--wash); color: var(--accent-dark); font-weight: 750; letter-spacing: .03em; }
          .actions { display: grid; gap: 8px; }
          .loader { display: inline-block; width: 16px; height: 16px; margin-right: 8px; border: 2px solid #ffffff66; border-top-color: white; border-radius: 50%; vertical-align: -3px; animation: spin .7s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 520px) { .launcher { right: 16px; bottom: 16px; } .drawer { right: 16px; bottom: 86px; width: calc(100vw - 32px); } }
        </style>
        <button class="launcher" id="pqrs-launcher-btn" type="button" aria-label="Abrir asistente PQRS" aria-expanded="false">?</button>
        <section class="drawer" id="pqrs-drawer" hidden role="dialog" aria-modal="true" aria-labelledby="pqrs-title">
          <header class="header"><div><p class="eyebrow">PQRS</p><h2 id="pqrs-title">${this.title()}</h2></div><button class="close" type="button" aria-label="Cerrar">&times;</button></header>
          <main class="content">${this.body()}</main>
        </section>`;

      const launcher = this.shadowRoot.querySelector('.launcher');
      const drawer = this.shadowRoot.querySelector('.drawer');
      launcher.addEventListener('click', () => {
        drawer.hidden = !drawer.hidden;
        launcher.setAttribute('aria-expanded', String(!drawer.hidden));
      });
      this.shadowRoot.querySelector('.close').addEventListener('click', () => this.close());
      this.bindActions();
    }

    title() {
      return this.state.view === 'form' ? 'Radicar una solicitud' : this.state.view === 'success' ? 'Solicitud recibida' : '¿En qué podemos ayudarte?';
    }

    body() {
      if (this.state.view === 'success') {
        return `<p class="success">Tu solicitud fue registrada. Conserva este número para consultar su estado.</p><div class="tracking">${this.escape(this.state.trackingNumber)}</div><button class="primary" data-action="close" type="button">Cerrar</button>`;
      }
      if (this.state.view === 'form') {
        return `<p class="intro">Completa los datos y nuestro equipo revisará tu caso.</p><form id="pqrs-ticket-form" novalidate><label for="customer-name">Nombre</label><input id="customer-name" name="customerName" required maxlength="200" autocomplete="name"><label for="customer-email">Correo electrónico</label><input id="customer-email" name="customerEmail" type="email" required maxlength="320" autocomplete="email"><label for="subject">Asunto</label><input id="subject" name="subject" required maxlength="300"><label for="description">Descripción</label><textarea id="description" name="description" required></textarea>${this.error()}<button class="primary" type="submit" ${this.state.loading ? 'disabled' : ''}>${this.state.loading ? '<span class="loader" aria-hidden="true"></span>Enviando...' : 'Radicar PQRS'}</button></form>`;
      }
      return `<p class="intro">Consulta nuestra base de conocimiento antes de radicar una solicitud formal.</p><form id="pqrs-rag-form"><label for="pqrs-query">Tu pregunta</label><textarea id="pqrs-query" name="query" required maxlength="2000" placeholder="Escribe tu duda..."></textarea>${this.error()}<button class="primary" type="submit" ${this.state.loading ? 'disabled' : ''}>${this.state.loading ? '<span class="loader" aria-hidden="true"></span>Consultando...' : 'Consultar'}</button></form>${this.state.answer ? `<div class="answer" role="status">${this.escape(this.state.answer)}</div><div class="actions"><button class="primary" data-action="resolved" type="button">Sí, resolvió mi duda</button><button class="secondary" data-action="formal" type="button">No, radicar solicitud formal</button></div>` : this.state.error ? '<button class="secondary" data-action="formal" type="button">Radicar solicitud formal</button>' : ''}`;
    }

    error() { return this.state.error ? `<p class="error" role="alert">${this.escape(this.state.error)}</p>` : ''; }

    bindActions() {
      this.shadowRoot.querySelector('[data-action="close"]')?.addEventListener('click', () => this.close());
      this.shadowRoot.querySelector('[data-action="resolved"]')?.addEventListener('click', async () => {
        const articleIds = this.state.matchedArticleIds || [];
        await this.request('/api/v1/widget/rag-deflections', { articleIds }, () => {});
        this.close();
      });
      this.shadowRoot.querySelector('[data-action="formal"]')?.addEventListener('click', () => { this.state = { ...this.state, view: 'form', error: null }; this.render(); });
      this.shadowRoot.querySelector('#pqrs-rag-form')?.addEventListener('submit', (event) => this.search(event));
      this.shadowRoot.querySelector('#pqrs-ticket-form')?.addEventListener('submit', (event) => this.createTicket(event));
    }

    async search(event) {
      event.preventDefault();
      const query = new FormData(event.currentTarget).get('query')?.toString().trim();
      if (!query) { this.state.error = 'Escribe una pregunta para continuar.'; this.render(); return; }
      await this.request('/api/v1/widget/rag-search', { query }, (result) => {
        this.state.answer = result.hasAnswer ? result.answer : null;
        this.state.matchedArticleIds = result.hasAnswer && Array.isArray(result.matchedArticleIds) ? result.matchedArticleIds : [];
        this.state.error = result.hasAnswer ? null : 'No encontramos una respuesta automática para esta consulta.';
        this.state.loading = false;
        this.render();
      });
    }

    async createTicket(event) {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const data = Object.fromEntries(new FormData(form).entries());
      await this.request('/api/v1/widget/tickets', data, (result) => {
        this.state = { view: 'success', loading: false, answer: null, trackingNumber: result.trackingNumber, error: null };
        this.render();
      });
    }

    async request(path, body, onSuccess) {
      this.state = { ...this.state, loading: true, error: null };
      this.render();
      try {
        const response = await fetch(`${apiUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Tenant-Id': tenantId }, body: JSON.stringify(body) });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.detail || 'No fue posible completar la operación.');
        onSuccess(result);
      } catch (error) {
        this.state = { ...this.state, loading: false, error: error instanceof Error ? error.message : 'No fue posible completar la operación.' };
        this.render();
      }
    }

    close() {
      this.state = { view: 'chat', loading: false, answer: null, matchedArticleIds: [], trackingNumber: null, error: null };
      this.render();
      const drawer = this.shadowRoot.querySelector('.drawer');
      drawer.hidden = true;
      this.shadowRoot.querySelector('.launcher').setAttribute('aria-expanded', 'false');
    }

    escape(value) {
      return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
    }
  }

  customElements.define('pqrs-widget', PqrsWidget);
  const widget = document.createElement('pqrs-widget');
  currentScript.insertAdjacentElement('afterend', widget) || document.body.appendChild(widget);
})();
