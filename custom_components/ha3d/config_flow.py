"""Config flow for HA3D integration."""
import logging
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from .const import DOMAIN, CONF_AREAS, DEFAULT_CONFIG

_LOGGER = logging.getLogger(__name__)

class Ha3dConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for HA3D."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_PUSH

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            return self.async_create_entry(
                title="3D户型图",
                data=DEFAULT_CONFIG,
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
            description_placeholders={
                "images_path": "/config/www/home/"
            }
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return Ha3dOptionsFlow(config_entry) 