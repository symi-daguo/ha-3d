"""Config flow for HA3D integration."""
import logging
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.const import CONF_URL
from .const import DOMAIN, CONF_EXTERNAL_URL

_LOGGER = logging.getLogger(__name__)

class Ha3dConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for HA3D."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_PUSH

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            external_url = user_input.get(CONF_EXTERNAL_URL)
            
            if not external_url:
                errors[CONF_EXTERNAL_URL] = "empty_url"
            elif not external_url.startswith(('http://', 'https://')):
                errors[CONF_EXTERNAL_URL] = "invalid_url"
            else:
                _LOGGER.info(f"Creating entry with URL: {external_url}")
                return self.async_create_entry(
                    title="3D户型图",
                    data={
                        CONF_EXTERNAL_URL: external_url,
                        "areas": []  # 初始化空的区域列表
                    }
                )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_EXTERNAL_URL): str,
            }),
            errors=errors
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return Ha3dOptionsFlow(config_entry)

class Ha3dOptionsFlow(config_entries.OptionsFlow):
    """Handle options."""

    def __init__(self, config_entry):
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        errors = {}

        if user_input is not None:
            external_url = user_input.get(CONF_EXTERNAL_URL)
            
            if not external_url:
                errors[CONF_EXTERNAL_URL] = "empty_url"
            elif not external_url.startswith(('http://', 'https://')):
                errors[CONF_EXTERNAL_URL] = "invalid_url"
            else:
                # 保持现有的areas数据
                current_data = dict(self.config_entry.data)
                current_data[CONF_EXTERNAL_URL] = external_url
                
                # 更新配置项
                self.hass.config_entries.async_update_entry(
                    self.config_entry,
                    data=current_data
                )
                
                return self.async_create_entry(title="", data={})

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                vol.Required(
                    CONF_EXTERNAL_URL,
                    default=self.config_entry.data.get(CONF_EXTERNAL_URL, "")
                ): str,
            }),
            errors=errors
        ) 