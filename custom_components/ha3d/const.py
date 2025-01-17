"""Constants for the HA3D integration."""
DOMAIN = "ha3d"
VERSION = "1.0.0"
PANEL_URL = "/api/panel_custom/ha3d"
PANEL_TITLE = "3D户型图"
PANEL_ICON = "mdi:floor-plan"
PANEL_NAME = "ha3d-panel"

CONF_FLOOR_PLAN = "floor_plan"
CONF_AREAS = "areas"
CONF_ENTITY_ID = "entity_id"
CONF_POSITION = "position"
CONF_TYPE = "type"

DEFAULT_CONFIG = {
    CONF_FLOOR_PLAN: "",
    CONF_AREAS: []
} 