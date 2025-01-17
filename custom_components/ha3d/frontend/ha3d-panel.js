import { LitElement, html, css } from "lit";
import { mdiFullscreen, mdiFullscreenExit } from "@mdi/js";

class Ha3dPanel extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      panel: { type: Object },
      config: { type: Object },
      areas: { type: Array },
      isFullscreen: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.areas = [];
    this.isFullscreen = false;
    this._initialized = false;
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
        position: relative;
        overflow: hidden;
      }
      .toolbar {
        display: flex;
        justify-content: flex-end;
        padding: 8px;
        background: var(--app-header-background-color);
      }
      .floor-plan {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .area {
        position: absolute;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .area:hover {
        filter: brightness(1.2);
      }
      .area.active {
        filter: brightness(1.5);
      }
      ha-icon-button {
        color: var(--primary-text-color);
      }
    `;
  }

  async firstUpdated() {
    if (!this._initialized) {
      await this._loadConfig();
      this._initialized = true;
    }
  }

  async _loadConfig() {
    // 从后端加载配置
    const response = await fetch(`/api/ha3d/config`);
    this.config = await response.json();
    this.areas = this.config.areas || [];
  }

  _toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.renderRoot.querySelector('.container').requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  _handleAreaClick(area) {
    if (!area.entity_id) return;
    
    const stateObj = this.hass.states[area.entity_id];
    if (!stateObj) return;

    let service;
    switch(stateObj.state) {
      case 'on':
        service = 'turn_off';
        break;
      case 'off':
        service = 'turn_on';
        break;
      default:
        return;
    }

    const [domain] = area.entity_id.split('.');
    this.hass.callService(domain, service, {
      entity_id: area.entity_id,
    });
  }

  render() {
    if (!this.config) return html`<div>Loading...</div>`;

    return html`
      <div class="toolbar">
        <ha-icon-button
          .path=${this.isFullscreen ? mdiFullscreenExit : mdiFullscreen}
          @click=${this._toggleFullscreen}
        ></ha-icon-button>
      </div>
      <div class="container">
        <img
          class="floor-plan"
          src=${this.config.floor_plan}
          @load=${this._handleImageLoad}
        />
        ${this.areas.map(
          (area) => html`
            <div
              class="area ${this._getAreaState(area)}"
              style=${this._getAreaStyle(area)}
              @click=${() => this._handleAreaClick(area)}
            >
              ${area.name || ''}
            </div>
          `
        )}
      </div>
    `;
  }

  _getAreaState(area) {
    if (!area.entity_id) return '';
    const stateObj = this.hass.states[area.entity_id];
    return stateObj?.state === 'on' ? 'active' : '';
  }

  _getAreaStyle(area) {
    return `
      left: ${area.position.x}%;
      top: ${area.position.y}%;
      width: ${area.position.width}%;
      height: ${area.position.height}%;
      background: ${this._getAreaBackground(area)};
    `;
  }

  _getAreaBackground(area) {
    const stateObj = this.hass.states[area.entity_id];
    return stateObj?.state === 'on'
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(0, 0, 0, 0.2)';
  }
}

customElements.define("ha3d-panel", Ha3dPanel); 