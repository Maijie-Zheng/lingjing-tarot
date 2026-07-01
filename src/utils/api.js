/**
 * DeepSeek API 调用封装
 * 前端直连 API，不做后端代理（MVP 阶段可接受）
 */

const DEEPSEEK_BASE_URL = import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const TIMEOUT_MS = 20000 // 20 秒超时

/**
 * 将 HTTP 状态码映射为用户友好的中文错误文案
 * 不让冷冰冰的状态码破坏塔罗仪式的沉浸感
 */
function friendlyErrorMessage(status) {
  const map = {
    400: '牌面信号有些模糊，换个问题试试看',
    401: '灵境尚未完全开启，请检查 API Key 配置',
    402: '灵境能量余额不足，请检查 API 账户余额',
    403: '灵境之门暂时关闭，请检查 API Key 权限',
    429: '解读的人太多了，牌灵需要缓一缓，稍等片刻再试',
    500: '星空信号有些扰动，牌灵正在调整中',
    502: '灵境与星空之间的通道暂时阻塞',
    503: '灵境正在深度冥想中，请稍后再来',
    504: '星空回响迟迟未至，请再试一次',
  }
  return map[status] || '牌面能量有点波动，请再试一次'
}

/**
 * 调用 DeepSeek Chat API
 * @param {string} systemPrompt - System Prompt
 * @param {string} userPrompt - User Prompt
 * @returns {Promise<string>} AI 返回的解读文本
 * @throws {Error} 网络错误、超时、API 错误
 */
export async function callDeepSeek(systemPrompt, userPrompt) {
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'sk-your-api-key-here') {
    throw new Error('API Key 未配置。请复制 .env.example 为 .env 并填入你的 DeepSeek API Key。')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
        stream: false,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const rawMessage = errorData.error?.message || ''
      // 如果 API 返回了可读的错误描述，优先用；否则用我们的友好文案
      const isTechnicalMessage = /^(4\d{2}|5\d{2})$/.test(rawMessage) || rawMessage.startsWith('{')
      const message = (!isTechnicalMessage && rawMessage)
        ? rawMessage
        : friendlyErrorMessage(response.status)
      throw new Error(message)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('API 返回内容为空，请稍后重试')
    }

    return content
  } catch (error) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      throw new Error('请求超时，牌面能量有点波动，请再试一次')
    }
    throw error
  }
}
