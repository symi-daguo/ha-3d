import { LitElement, html, css } from "lit";
import { mdiPlus, mdiDelete, mdiContentSave } from "@mdi/js";

class Ha3dPanel extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
    };
  }

  constructor() {
    super();
    this._config = null;
    this._areas = [];
    this._backgroundImage = null;
    this._selectedArea = null;
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .container {
        flex: 1;
        display: flex;
        position: relative;
        overflow: hidden;
      }
      #background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .area-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        pointer-events: none;
      }
      .editor {
        flex: 1;
        padding: 16px;
        overflow: auto;
      }
    `;
  }

  render() {
    return html`
      <div class="container">
        ${this._backgroundImage
          ? html`<img id="background" src="${this._backgroundImage}" />`
          : ""}
        <div id="areas">
          ${this._areas.map(
            (area) =>
              html`
                <img
                  class="area-image"
                  src="/local/home/${area.image_off}"
                  data-entity-id="${area.entity_id}"
                  data-image-on="${area.image_on}"
                  data-image-off="${area.image_off}"
                />
              `
          )}
        </div>
      </div>
      <div class="editor">
        <ha3d-config-editor
          .hass=${this.hass}
          @config-changed=${this._handleConfigChanged}
        ></ha3d-config-editor>
      </div>
    `;
  }

  firstUpdated() {
    this._loadConfig();
    this._setupEventListeners();
  }

  async _loadConfig() {
    try {
      const response = await fetch("/api/ha3d/config");
      const config = await response.json();
      this._config = config;
      this._areas = config.areas || [];
      this._backgroundImage = config.background_image;
      this.requestUpdate();
    } catch (error) {
      console.error("Error loading config:", error);
    }
  }

  _setupEventListeners() {
    this.addEventListener("click", (e) => {
      const area = e.target.closest("[data-entity-id]");
      if (area) {
        const entityId = area.dataset.entityId;
        this._toggleEntity(entityId);
      }
    });

    if (this.hass) {
      this.hass.connection.subscribeEvents((event) => {
        if (event.data.entity_id) {
          this._updateAreaState(event.data.entity_id);
        }
      }, "state_changed");
    }
  }

  _handleConfigChanged(e) {
    this._loadConfig();
  }

  async _toggleEntity(entityId) {
    if (this.hass) {
      const state = this.hass.states[entityId];
      if (state) {
        const service = state.state === "on" ? "turn_off" : "turn_on";
        const [domain] = entityId.split(".");
        await this.hass.callService(domain, service, {
          entity_id: entityId,
        });
      }
    }
  }

  _updateAreaState(entityId) {
    const area = this._areas.find((a) => a.entity_id === entityId);
    if (area) {
      const state = this.hass.states[entityId];
      const img = this.renderRoot.querySelector(
        `[data-entity-id="${entityId}"]`
      );
      if (img) {
        img.src = `/local/home/${
          state.state === "on" ? area.image_on : area.image_off
        }`;
      }
    }
  }
}

customElements.define("ha3d-panel", Ha3dPanel);