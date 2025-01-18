class Ha3dEmbed {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || '';
        this.token = options.token || '';
        this.entities = new Map();
        this.observers = new Map();
        this.setupWebSocket();
    }

    async setupWebSocket() {
        try {
            const auth = { type: 'auth', access_token: this.token };
            const ws = new WebSocket(`${this.baseUrl}/api/websocket`.replace('http', 'ws'));

            ws.onopen = () => {
                console.log('WebSocket connected');
                ws.send(JSON.stringify(auth));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'event' && data.event.event_type === 'state_changed') {
                    this.handleStateChange(data.event.data);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws = ws;
        } catch (error) {
            console.error('Error setting up WebSocket:', error);
        }
    }

    handleStateChange(data) {
        const { entity_id, new_state } = data;
        if (this.entities.has(entity_id)) {
            this.updateEntityElement(entity_id, new_state);
        }
    }

    async getEntityState(entityId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/states/${entityId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching entity state:', error);
            return null;
        }
    }

    async getAllEntities() {
        try {
            const response = await fetch(`${this.baseUrl}/api/states`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching entities:', error);
            return [];
        }
    }

    async toggleEntity(entityId) {
        try {
            const domain = entityId.split('.')[0];
            await fetch(`${this.baseUrl}/api/services/${domain}/toggle`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    entity_id: entityId
                })
            });
        } catch (error) {
            console.error('Error toggling entity:', error);
        }
    }

    createEntityElement(entityId, options = {}) {
        const element = document.createElement('div');
        element.className = 'ha3d-entity';
        element.style.position = 'absolute';
        element.style.cursor = 'pointer';
        element.style.padding = '8px';
        element.style.borderRadius = '4px';
        element.style.border = '1px solid #ccc';
        element.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        element.style.zIndex = '1000';
        
        if (options.x !== undefined) element.style.left = `${options.x}px`;
        if (options.y !== undefined) element.style.top = `${options.y}px`;
        if (options.width !== undefined) element.style.width = `${options.width}px`;
        if (options.height !== undefined) element.style.height = `${options.height}px`;
        
        // 添加拖拽功能
        element.draggable = true;
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', entityId);
        });
        
        element.addEventListener('click', () => this.toggleEntity(entityId));
        
        this.entities.set(entityId, element);
        this.updateEntityElement(entityId);
        
        return element;
    }

    async updateEntityElement(entityId, state) {
        const element = this.entities.get(entityId);
        if (!element) return;

        if (!state) {
            state = await this.getEntityState(entityId);
        }

        if (state) {
            element.setAttribute('data-state', state.state);
            element.innerHTML = `
                <div style="font-weight: bold;">${state.attributes.friendly_name || entityId}</div>
                <div style="font-size: 0.8em;">${state.state}</div>
            `;
            
            // 更新样式
            if (state.state === 'on') {
                element.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
            } else {
                element.style.backgroundColor = 'rgba(128, 128, 128, 0.3)';
            }
        }
    }

    async addEntity(entityId, container, options = {}) {
        const element = this.createEntityElement(entityId, options);
        container.appendChild(element);
        await this.updateEntityElement(entityId);
        return element;
    }

    removeEntity(entityId) {
        const element = this.entities.get(entityId);
        if (element) {
            element.remove();
            this.entities.delete(entityId);
        }
    }

    async autoAddEntities(container, entityFilter = null) {
        const entities = await this.getAllEntities();
        let gridX = 10;
        let gridY = 10;
        const gridWidth = 200;
        const gridHeight = 80;
        const maxColumns = Math.floor((container.clientWidth - 20) / (gridWidth + 10));

        entities.forEach((entity) => {
            if (!entityFilter || entityFilter(entity)) {
                this.addEntity(entity.entity_id, container, {
                    x: gridX,
                    y: gridY,
                    width: gridWidth,
                    height: gridHeight
                });

                gridX += gridWidth + 10;
                if (gridX + gridWidth > container.clientWidth - 10) {
                    gridX = 10;
                    gridY += gridHeight + 10;
                }
            }
        });
    }
}

// 导出类
window.Ha3dEmbed = Ha3dEmbed; 