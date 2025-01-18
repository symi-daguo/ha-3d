"""The HA3D integration."""
import os
import logging
import shutil
import voluptuous as vol
from aiohttp import web
import aiohttp
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType
from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)

DOMAIN = "ha3d"
CONF_AREAS = "areas"
CONF_BACKGROUND_IMAGE = "background_image"
CONF_EXTERNAL_URL = "external_url"

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema({
            vol.Optional(CONF_AREAS, default=[]): vol.All(list),
            vol.Optional(CONF_BACKGROUND_IMAGE): cv.string,
            vol.Optional(CONF_EXTERNAL_URL): cv.string,
        })
    },
    extra=vol.ALLOW_EXTRA,
)

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the HA3D integration."""
    hass.data[DOMAIN] = {}
    domain_config = config.get(DOMAIN, {})

    # 确保目录存在
    www_dir = hass.config.path("www")
    ha3d_dir = os.path.join(www_dir, "ha3d")
    os.makedirs(ha3d_dir, exist_ok=True)

    # 复制前端文件
    current_dir = os.path.dirname(__file__)
    frontend_dir = os.path.join(current_dir, "frontend")
    for file in ["ha3d-panel.js", "ha3d-embed.js", "ha3d-panel.html"]:
        src = os.path.join(frontend_dir, file)
        dst = os.path.join(ha3d_dir, file)
        if os.path.exists(src):
            shutil.copy2(src, dst)

    # 注册面板
    hass.components.frontend.async_register_built_in_panel(
        "iframe",
        "3D户型图",
        "mdi:floor-plan",
        DOMAIN,
        {"url": "/local/ha3d/ha3d-panel.html"},
        require_admin=False,
    )

    # 注册视图
    hass.http.register_view(Ha3dPanelView())
    hass.http.register_view(Ha3dUploadView())
    hass.http.register_view(Ha3dConfigView(domain_config))
    hass.http.register_view(Ha3dEntityView(hass))

    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up HA3D from a config entry."""
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return True

class Ha3dPanelView(HomeAssistantView):
    """Serve the frontend."""

    requires_auth = False  # 允许未认证访问
    url = "/ha3d/panel"
    name = "ha3d:panel"

    async def get(self, request):
        """Serve the panel page."""
        return web.FileResponse("custom_components/ha3d/frontend/ha3d-panel.html")

class Ha3dUploadView(HomeAssistantView):
    """Handle file uploads."""

    url = "/api/ha3d/upload"
    name = "api:ha3d:upload"
    requires_auth = True

    async def post(self, request):
        """Handle POST."""
        reader = await request.multipart()
        
        field = await reader.next()
        if field.name != "file":
            return web.Response(
                status=400, text="No file uploaded"
            )
            
        filename = field.filename
        size = 0
        
        # 确保目录存在
        home_dir = os.path.join(request.app["hass"].config.path("www"), "home")
        os.makedirs(home_dir, exist_ok=True)
        
        file_path = os.path.join(home_dir, filename)
        
        with open(file_path, "wb") as f:
            while True:
                chunk = await field.read_chunk()
                if not chunk:
                    break
                size += len(chunk)
                f.write(chunk)
                
        return web.json_response({"filename": filename})

class Ha3dConfigView(HomeAssistantView):
    """Handle configuration."""

    url = "/api/ha3d/config"
    name = "api:ha3d:config"
    requires_auth = True

    def __init__(self, config):
        """Initialize the config view."""
        self.config = config

    async def get(self, request):
        """Handle GET."""
        return web.json_response(self.config)

    async def post(self, request):
        """Handle POST."""
        try:
            data = await request.json()
            self.config.update(data)
            return web.json_response({"success": True})
        except Exception as e:
            return web.Response(
                status=400,
                text=f"Failed to update config: {str(e)}"
            )

class Ha3dEntityView(HomeAssistantView):
    """Handle entity state and service calls."""

    url = "/api/ha3d/entity/{entity_id}"
    name = "api:ha3d:entity"
    requires_auth = True

    def __init__(self, hass: HomeAssistant):
        """Initialize the entity view."""
        self.hass = hass

    async def get(self, request, entity_id):
        """Get entity state."""
        state = self.hass.states.get(entity_id)
        if state is None:
            return web.Response(status=404)
        return web.json_response({
            "state": state.state,
            "attributes": state.attributes
        })

    async def post(self, request, entity_id):
        """Call service for entity."""
        try:
            data = await request.json()
            domain = entity_id.split('.')[0]
            service = data.get('service', 'toggle')
            
            await self.hass.services.async_call(
                domain, service, 
                {"entity_id": entity_id},
                context={"source": "ha3d"}
            )
            
            return web.json_response({"success": True})
        except Exception as e:
            return web.Response(
                status=400,
                text=f"Failed to call service: {str(e)}"
            ) 