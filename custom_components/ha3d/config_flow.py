"""Config flow for HA3D integration."""
import logging
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
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
            # 验证URL格式
            if not user_input[CONF_EXTERNAL_URL].startswith(('http://', 'https://')):
                errors[CONF_EXTERNAL_URL] = "invalid_url"
            else:
                return self.async_create_entry(
                    title="3D户型图",
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_EXTERNAL_URL, description={"suggested_value": "http://"}): str,
            }),
            errors=errors,
            description_placeholders={
                "default_url": "http://your-3d-model-url",
            }
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
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                vol.Required(
                    CONF_EXTERNAL_URL,
                    default=self.config_entry.data.get(CONF_EXTERNAL_URL, "")
                ): str,
            })
        ) 