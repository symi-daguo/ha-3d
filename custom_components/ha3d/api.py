"""API for HA3D integration."""
import logging
import os
import aiohttp
import voluptuous as vol
from aiohttp import web
import voluptuous as vol
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from .const import DOMAIN, CONF_AREAS, CONF_ENTITY_ID, CONF_IMAGE_ON, CONF_IMAGE_OFF

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
            
            if CONF_AREAS in data:
                areas = []
                for area in data[CONF_AREAS]:
                    if not area.get(CONF_ENTITY_ID):
                        continue
                    if not area.get(CONF_IMAGE_ON) or not area.get(CONF_IMAGE_OFF):
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

class Ha3dUploadView(HomeAssistantView):
    """Handle file uploads for HA3D."""

    url = "/api/ha3d/upload"
    name = "api:ha3d:upload"
    requires_auth = True

    def __init__(self, hass: HomeAssistant):
        """Initialize the upload view."""
        self.hass = hass

    async def post(self, request: web.Request) -> web.Response:
        """Handle POST request."""
        try:
            reader = await request.multipart()
            
            # 获取上传的文件
            field = await reader.next()
            if field.name != 'file':
                raise web.HTTPBadRequest(text='No file uploaded')
            
            filename = field.filename
            size = 0
            
            # 确保目录存在
            upload_dir = self.hass.config.path('www/home')
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
            
            # 保存文件
            file_path = os.path.join(upload_dir, filename)
            with open(file_path, 'wb') as f:
                while True:
                    chunk = await field.read_chunk()
                    if not chunk:
                        break
                    size += len(chunk)
                    f.write(chunk)
            
            return web.json_response({
                "success": True,
                "filename": filename,
                "size": size
            })
            
        except Exception as err:
            _LOGGER.error("Error handling file upload: %s", err)
            return web.json_response(
                {"success": False, "error": str(err)}, status=400
            ) 