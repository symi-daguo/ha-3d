"""Constants for the HA3D integration."""
DOMAIN = "ha3d"
VERSION = "1.0.0"
PANEL_URL = "/api/panel_custom/ha3d"
PANEL_TITLE = "3D户型图"
PANEL_ICON = "mdi:floor-plan"
PANEL_NAME = "ha3d-panel"

CONF_AREAS = "areas"
CONF_ENTITY_ID = "entity_id"
CONF_POSITION = "position"
CONF_TYPE = "type"
CONF_IMAGE_ON = "image_on"
CONF_IMAGE_OFF = "image_off"

DEFAULT_CONFIG = {
    CONF_AREAS: []
} 