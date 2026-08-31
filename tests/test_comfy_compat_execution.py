from omnicam.comfy_compat.execution import _queue_is_running, execution_busy


class Queue:
    def __init__(self, running):
        self.running = running

    def get_current_queue_volatile(self):
        return (self.running, ["queued-but-not-running"])


def test_execution_busy_reports_only_currently_running_prompts():
    assert _queue_is_running(type("Server", (), {"prompt_queue": Queue(["prompt"])})()) is True
    assert _queue_is_running(type("Server", (), {"prompt_queue": Queue([])})()) is False


def test_execution_busy_falls_back_without_crashing_when_comfyui_is_unavailable(monkeypatch):
    monkeypatch.setattr("omnicam.comfy_compat.execution._prompt_server_instance", lambda: None)
    assert execution_busy() is False
