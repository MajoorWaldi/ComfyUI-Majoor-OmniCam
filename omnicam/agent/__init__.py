"""OmniCam Agent v1: a loopback-only PromptServer broker between an external
Agent process and a registered live Director browser session.

This package never starts a second HTTP/WebSocket server -- it registers
routes on the existing ``PromptServer.instance`` (see ``omnicam/routes.py``)
and dispatches through ComfyUI's existing WebSocket connection
(``PromptServer.instance.send_sync``).
"""
