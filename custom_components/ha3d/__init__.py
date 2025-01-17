"""The HA3D integration."""
import logging
import os
import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components.http import HomeAssistantView
from .const import DOMAIN, PANEL_URL, PANEL_TITLE, PANEL_ICON, PANEL_NAME
from .api import Ha3dConfigView, Ha3dUploadView

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)

async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the HA3D component."""
    hass.data.setdefault(DOMAIN, {"config": {}})

    # 注册API视图
    hass.http.register_view(Ha3dConfigView(hass))
    hass.http.register_view(Ha3dUploadView(hass))

    # 注册面板
    hass.components.frontend.async_register_built_in_panel(
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_NAME,
        config={
            "_panel_custom": {
                "name": PANEL_NAME,
                "embed_iframe": True,
                "trust_external": False,
                "js_url": "/local/ha3d/ha3d-panel.js",
            }
        },
        require_admin=False,
    )

    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up HA3D from a config entry."""
    # 确保www目录存在
    www_dir = hass.config.path('www')
    if not os.path.exists(www_dir):
        os.makedirs(www_dir)
    
    # 确保home目录存在
    home_dir = os.path.join(www_dir, 'home')
    if not os.path.exists(home_dir):
        os.makedirs(home_dir)
    
    # 复制前端文件
    frontend_dir = os.path.join(www_dir, 'ha3d')
    if not os.path.exists(frontend_dir):
        os.makedirs(frontend_dir)
    
    # 复制JS文件
    import shutil
    current_dir = os.path.dirname(__file__)
    for js_file in ['ha3d-panel.js', 'ha3d-config-editor.js']:
        src = os.path.join(current_dir, 'frontend', js_file)
        dst = os.path.join(frontend_dir, js_file)
        shutil.copy2(src, dst)

    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    return True 