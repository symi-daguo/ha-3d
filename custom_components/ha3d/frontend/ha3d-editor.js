import { LitElement, html, css } from "lit";
import { mdiPlus, mdiDelete, mdiContentSave } from "@mdi/js";

class Ha3dEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      areas: { type: Array },
      selectedArea: { type: Object },
      isDragging: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.areas = [];
    this.selectedArea = null;
    this.isDragging = false;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 16px;
      }
      .editor-container {
        display: flex;
        gap: 16px;
      }
      .area-list {
        width: 300px;
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
      }
      .preview {
        flex: 1;
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        position: relative;
      }
      .area-item {
        display: flex;
        align-items: center;
        padding: 8px;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 8px;
      }
      .area-item:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }
      .area-item.selected {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }
      ha-icon-button {
        color: var(--primary-text-color);
      }
      .area-form {
        margin-top: 16px;
      }
      .form-row {
        margin-bottom: 8px;
      }
      label {
        display: block;
        margin-bottom: 4px;
      }
    `;
  }

  render() {
    return html`
      <div class="editor-container">
        <div class="area-list">
          <div class="header">
            <ha-icon-button
              .path=${mdiPlus}
              @click=${this._addArea}
            ></ha-icon-button>
          </div>
          ${this.areas.map(
            (area, index) => html`
              <div
                class="area-item ${this.selectedArea === area ? 'selected' : ''}"
                @click=${() => this._selectArea(area)}
              >
                <span>${area.name || `区域 ${index + 1}`}</span>
                <ha-icon-button
                  .path=${mdiDelete}
                  @click=${() => this._deleteArea(index)}
                ></ha-icon-button>
              </div>
            `
          )}
          ${this.selectedArea
            ? html`
                <div class="area-form">
                  <div class="form-row">
                    <label>名称</label>
                    <ha-textfield
                      .value=${this.selectedArea.name || ''}
                      @change=${this._updateAreaName}
                    ></ha-textfield>
                  </div>
                  <div class="form-row">
                    <label>实体</label>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this.selectedArea.entity_id || ''}
                      @value-changed=${this._updateAreaEntity}
                    ></ha-entity-picker>
                  </div>
                </div>
              `
            : ''}
        </div>
        <div class="preview">
          <img
            src=${this.config?.floor_plan || ''}
            @load=${this._handleImageLoad}
            style="width: 100%; height: auto;"
          />
          ${this.areas.map(
            (area, index) => html`
              <div
                class="area-marker ${this.selectedArea === area ? 'selected' : ''}"
                style=${this._getAreaStyle(area)}
                @mousedown=${(e) => this._startDrag(e, index)}
              ></div>
            `
          )}
        </div>
      </div>
      <div class="actions">
        <ha-icon-button
          .path=${mdiContentSave}
          @click=${this._saveConfig}
        ></ha-icon-button>
      </div>
    `;
  }

  _addArea() {
    const newArea = {
      name: `区域 ${this.areas.length + 1}`,
      position: { x: 10, y: 10, width: 20, height: 20 },
    };
    this.areas = [...this.areas, newArea];
    this.selectedArea = newArea;
  }

  _deleteArea(index) {
    this.areas = this.areas.filter((_, i) => i !== index);
    if (this.selectedArea === this.areas[index]) {
      this.selectedArea = null;
    }
  }

  _selectArea(area) {
    this.selectedArea = area;
  }

  _updateAreaName(e) {
    const name = e.target.value;
    this.selectedArea = { ...this.selectedArea, name };
    this._updateArea(this.selectedArea);
  }

  _updateAreaEntity(e) {
    const entity_id = e.target.value;
    this.selectedArea = { ...this.selectedArea, entity_id };
    this._updateArea(this.selectedArea);
  }

  _updateArea(updatedArea) {
    this.areas = this.areas.map((area) =>
      area === this.selectedArea ? updatedArea : area
    );
  }

  async _saveConfig() {
    try {
      const response = await fetch('/api/ha3d/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          areas: this.areas,
        }),
      });
      
      if (response.ok) {
        this.dispatchEvent(
          new CustomEvent('config-saved', {
            detail: { success: true },
          })
        );
      }
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  _startDrag(e, index) {
    this.isDragging = true;
    this.draggedArea = this.areas[index];
    this.initialX = e.clientX;
    this.initialY = e.clientY;
    
    const moveHandler = (e) => this._handleDrag(e);
    const upHandler = () => {
      this.isDragging = false;
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
    };
    
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  }

  _handleDrag(e) {
    if (!this.isDragging) return;
    
    const dx = e.clientX - this.initialX;
    const dy = e.clientY - this.initialY;
    
    const container = this.renderRoot.querySelector('.preview');
    const rect = container.getBoundingClientRect();
    
    const newX = (this.draggedArea.position.x + (dx / rect.width) * 100);
    const newY = (this.draggedArea.position.y + (dy / rect.height) * 100);
    
    this.draggedArea.position = {
      ...this.draggedArea.position,
      x: Math.max(0, Math.min(100 - this.draggedArea.position.width, newX)),
      y: Math.max(0, Math.min(100 - this.draggedArea.position.height, newY)),
    };
    
    this._updateArea(this.draggedArea);
    this.initialX = e.clientX;
    this.initialY = e.clientY;
  }

  _getAreaStyle(area) {
    return `
      position: absolute;
      left: ${area.position.x}%;
      top: ${area.position.y}%;
      width: ${area.position.width}%;
      height: ${area.position.height}%;
      background: ${this.selectedArea === area
        ? 'rgba(var(--rgb-primary-color), 0.5)'
        : 'rgba(var(--rgb-primary-color), 0.2)'};
      border: 2px solid var(--primary-color);
      border-radius: 4px;
      cursor: move;
    `;
  }
}

customElements.define("ha3d-editor", Ha3dEditor); 