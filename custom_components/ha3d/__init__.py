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
from homeassistant.components import frontend

from .const import DOMAIN, CONF_EXTERNAL_URL

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the HA3D integration."""
    hass.data[DOMAIN] = {}
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up HA3D from a config entry."""
    _LOGGER.debug("Setting up HA3D integration with entry: %s", entry.as_dict())
    
    # 获取配置数据
    config_data = dict(entry.data)
    
    # 确保areas字段存在
    if "areas" not in config_data:
        config_data["areas"] = []
        hass.config_entries.async_update_entry(entry, data=config_data)
    
    # 获取外部URL
    external_url = config_data.get(CONF_EXTERNAL_URL)
    _LOGGER.debug("Retrieved external URL from config entry: %s", external_url)
    
    # 确保URL是有效的
    if not external_url:
        _LOGGER.error("No external URL configured in entry data: %s", config_data)
        return False

    # 保存配置数据到hass.data
    hass.data[DOMAIN] = {
        "config": config_data
    }

    # 注册面板
    try:
        frontend.async_register_built_in_panel(
            hass,
            "iframe",
            "3D户型图",
            "mdi:floor-plan",
            DOMAIN,
            {
                "url": external_url,
                "trust_external": True,  # 允许加载外部URL
                "allow": "fullscreen"  # 允许全屏
            },
            require_admin=False,
        )
        _LOGGER.info("Successfully registered panel with URL: %s", external_url)
    except Exception as e:
        _LOGGER.error("Failed to register panel: %s", str(e))
        return False

    # 注册视图
    hass.http.register_view(Ha3dEntityView(hass))
    _LOGGER.debug("Registered Ha3dEntityView")

    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    # 移除面板
    try:
        frontend.async_remove_panel(hass, DOMAIN)
        _LOGGER.info("Successfully removed panel")
    except Exception as e:
        _LOGGER.error("Failed to remove panel: %s", str(e))
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