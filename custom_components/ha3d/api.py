"""API for HA3D integration."""
import logging
from aiohttp import web
import voluptuous as vol
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from .const import DOMAIN, CONF_AREAS, CONF_ENTITY_ID, CONF_POSITION

_LOGGER = logging.getLogger(__name__)

class Ha3dConfigView(HomeAssistantView):
    """Handle HA3D configuration."""

    url = "/api/ha3d/config"
    name = "api:ha3d:config"
    requires_auth = True

    def __init__(self, hass: HomeAssistant):
        """Initialize the API view."""
        self.hass = hass

    async def get(self, request: web.Request) -> web.Response:
        """Handle GET request."""
        config = self.hass.data[DOMAIN].get("config", {})
        return web.json_response(config)

    async def post(self, request: web.Request) -> web.Response:
        """Handle POST request."""
        try:
            data = await request.json()
            config = self.hass.data[DOMAIN].get("config", {})
            
            # 验证和更新区域配置
            if CONF_AREAS in data:
                areas = []
                for area in data[CONF_AREAS]:
                    if not area.get(CONF_ENTITY_ID):
                        continue
                    if not area.get(CONF_POSITION):
                        continue
                    areas.append(area)
                config[CONF_AREAS] = areas
            
            self.hass.data[DOMAIN]["config"] = config
            return web.json_response({"success": True})
            
        except Exception as err:
            _LOGGER.error("Error updating config: %s", err)
            return web.json_response(
                {"success": False, "error": str(err)}, status=400
            ) 