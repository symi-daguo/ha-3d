import { LitElement, html, css } from "lit";
import { mdiPlus, mdiDelete, mdiContentSave, mdiImage } from "@mdi/js";

class Ha3dConfigEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      areas: { type: Array },
      selectedArea: { type: Object },
      uploadStatus: { type: String },
      backgroundImage: { type: String },
    };
  }

  constructor() {
    super();
    this.areas = [];
    this.selectedArea = null;
    this.uploadStatus = '';
    this.backgroundImage = '/local/home/background.png';
  }

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 16px;
      }
      .editor {
        display: flex;
        gap: 24px;
      }
      .sidebar {
        width: 300px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .background-section,
      .area-list {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
      }
      .area-config {
        flex: 1;
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
      }
      .area-item {
        display: flex;
        align-items: center;
        padding: 8px;
        margin-bottom: 8px;
        border-radius: 4px;
        cursor: pointer;
      }
      .area-item:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }
      .area-item.selected {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }
      .form-row {
        margin-bottom: 16px;
      }
      .form-row label {
        display: block;
        margin-bottom: 4px;
      }
      .file-upload {
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        padding: 16px;
        text-align: center;
        margin-bottom: 16px;
        cursor: pointer;
      }
      .file-upload.drag-over {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
      }
      .upload-preview {
        max-width: 200px;
        margin: 8px auto;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
      }
      .section-title {
        font-weight: bold;
        margin-bottom: 8px;
      }
    `;
  }

  render() {
    return html`
      <div class="editor">
        <div class="sidebar">
          <div class="background-section">
            <div class="section-title">底图设置</div>
            <div
              class="file-upload"
              @dragover=${this._handleDragOver}
              @dragleave=${this._handleDragLeave}
              @drop=${(e) => this._handleBackgroundDrop(e)}
              @click=${this._selectBackgroundFile}
            >
              ${this.backgroundImage
                ? html`
                    <img
                      class="upload-preview"
                      src=${this.backgroundImage}
                    />
                  `
                : html`
                    <p>点击或拖放上传底图</p>
                    <input
                      type="file"
                      @change=${this._handleBackgroundSelect}
                      accept="image/*"
                      style="display: none"
                    />
                  `}
            </div>
          </div>

          <div class="area-list">
            <div class="section-title">区域管理</div>
            <ha-icon-button
              .path=${mdiPlus}
              @click=${this._addArea}
            ></ha-icon-button>
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
          </div>
        </div>
        
        ${this.selectedArea
          ? html`
              <div class="area-config">
                <div class="form-row">
                  <label>区域名称</label>
                  <ha-textfield
                    .value=${this.selectedArea.name || ''}
                    @change=${this._updateName}
                  ></ha-textfield>
                </div>
                
                <div class="form-row">
                  <label>关联实体</label>
                  <ha-entity-picker
                    .hass=${this.hass}
                    .value=${this.selectedArea.entity_id || ''}
                    @value-changed=${this._updateEntity}
                  ></ha-entity-picker>
                </div>
                
                <div class="form-row">
                  <label>开灯状态图片</label>
                  <div
                    class="file-upload"
                    @dragover=${this._handleDragOver}
                    @dragleave=${this._handleDragLeave}
                    @drop=${(e) => this._handleDrop(e, 'on')}
                  >
                    ${this.selectedArea.image_on
                      ? html`
                          <img
                            class="upload-preview"
                            src="/local/home/${this.selectedArea.image_on}"
                          />
                        `
                      : html`
                          <p>拖放图片到此处或点击上传</p>
                          <input
                            type="file"
                            @change=${(e) => this._handleFileSelect(e, 'on')}
                            accept="image/*"
                            style="display: none"
                          />
                        `}
                  </div>
                </div>
                
                <div class="form-row">
                  <label>关灯状态图片</label>
                  <div
                    class="file-upload"
                    @dragover=${this._handleDragOver}
                    @dragleave=${this._handleDragLeave}
                    @drop=${(e) => this._handleDrop(e, 'off')}
                  >
                    ${this.selectedArea.image_off
                      ? html`
                          <img
                            class="upload-preview"
                            src="/local/home/${this.selectedArea.image_off}"
                          />
                        `
                      : html`
                          <p>拖放图片到此处或点击上传</p>
                          <input
                            type="file"
                            @change=${(e) => this._handleFileSelect(e, 'off')}
                            accept="image/*"
                            style="display: none"
                          />
                        `}
                  </div>
                </div>
                
                <div class="actions">
                  <ha-icon-button
                    .path=${mdiContentSave}
                    @click=${this._saveConfig}
                  ></ha-icon-button>
                </div>
              </div>
            `
          : html`
              <div class="area-config">
                <p>请选择或添加一个区域</p>
              </div>
            `}
      </div>
    `;
  }

  async firstUpdated() {
    await this._loadConfig();
  }

  async _loadConfig() {
    try {
      const response = await fetch('/api/ha3d/config');
      const config = await response.json();
      this.areas = config.areas || [];
      this.backgroundImage = config.background_image || '/local/home/background.png';
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  _selectBackgroundFile(e) {
    const input = this.renderRoot.querySelector('input[type="file"]');
    input.click();
  }

  async _handleBackgroundSelect(e) {
    const file = e.target.files[0];
    if (file) {
      await this._uploadBackground(file);
    }
  }

  async _handleBackgroundDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await this._uploadBackground(file);
    }
  }

  async _uploadBackground(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'background');
    
    try {
      const response = await fetch('/api/ha3d/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        this.backgroundImage = `/local/home/${result.filename}`;
        await this._saveConfig();
      }
    } catch (error) {
      console.error('Error uploading background:', error);
    }
  }

  _addArea() {
    const newArea = {
      name: `区域 ${this.areas.length + 1}`,
      entity_id: '',
      image_on: '',
      image_off: '',
    };
    this.areas = [...this.areas, newArea];
    this.selectedArea = newArea;
  }

  _selectArea(area) {
    this.selectedArea = area;
  }

  _deleteArea(index) {
    this.areas = this.areas.filter((_, i) => i !== index);
    if (this.selectedArea === this.areas[index]) {
      this.selectedArea = null;
    }
  }

  _updateName(e) {
    this.selectedArea = {
      ...this.selectedArea,
      name: e.target.value,
    };
    this._updateArea(this.selectedArea);
  }

  _updateEntity(e) {
    this.selectedArea = {
      ...this.selectedArea,
      entity_id: e.detail.value,
    };
    this._updateArea(this.selectedArea);
  }

  _updateArea(updatedArea) {
    this.areas = this.areas.map((area) =>
      area === this.selectedArea ? updatedArea : area
    );
  }

  _handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }

  _handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  async _handleDrop(e, type) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await this._uploadFile(file, type);
    }
  }

  async _handleFileSelect(e, type) {
    const file = e.target.files[0];
    if (file) {
      await this._uploadFile(file, type);
    }
  }

  async _uploadFile(file, type) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/ha3d/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        this.selectedArea = {
          ...this.selectedArea,
          [`image_${type}`]: result.filename,
        };
        this._updateArea(this.selectedArea);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
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
          background_image: this.backgroundImage,
        }),
      });
      
      if (response.ok) {
        this.uploadStatus = '保存成功';
        setTimeout(() => {
          this.uploadStatus = '';
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      this.uploadStatus = '保存失败';
    }
  }
}

customElements.define('ha3d-config-editor', Ha3dConfigEditor); 