"""
企业微信消息推送服务

通过 wecom-proxy 发送应用消息（text / markdown）给指定企微用户。
与通讯录同步共用同一个 proxy 地址和鉴权 secret。
"""

import httpx

from backend.common.exception import errors

WECOM_PROXY_URL = "http://154.219.104.230:9100"
WECOM_PROXY_SECRET = "kdit-wecom-proxy-2026"


class WecomPushService:
    """企业微信消息推送"""

    def __init__(self):
        self._http = httpx.AsyncClient(timeout=15)

    async def _post(self, endpoint: str, payload: dict) -> dict:
        url = f"{WECOM_PROXY_URL}{endpoint}"
        headers = {"Authorization": f"Bearer {WECOM_PROXY_SECRET}"}
        try:
            resp = await self._http.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise errors.ServerError(msg=f"调用企微代理失败: {e}")

    async def send_text(self, touser: str, content: str) -> dict:
        """发送文本消息。touser 支持 'userid1|userid2' 格式。"""
        return await self._post("/message/text", {"touser": touser, "content": content})

    async def send_markdown(self, touser: str, content: str) -> dict:
        """发送 Markdown 消息。"""
        return await self._post("/message/markdown", {"touser": touser, "content": content})


wecom_push_service = WecomPushService()
