"""The HA3D integration."""
import os
import logging
import voluptuous as vol
from aiohttp import web
import aiohttp
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType
from homeassistant.config_entries import ConfigEntry

from .const import DOMAIN, CONF_EXTERNAL_URL

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the HA3D integration."""
    hass.data[DOMAIN] = {}
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up HA3D from a config entry."""
    # 注册面板
    external_url = entry.data.get(CONF_EXTERNAL_URL)
    
    hass.components.frontend.async_register_built_in_panel(
        "iframe",
        "3D户型图",
        "mdi:floor-plan",
        DOMAIN,
        {"url": external_url},
        require_admin=False,
    )

    # 注册视图
    hass.http.register_view(Ha3dEntityView(hass))

    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    # 移除面板
    hass.components.frontend.async_remove_panel(DOMAIN)
    return True

async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)

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