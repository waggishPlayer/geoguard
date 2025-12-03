import api from './api'

export const messagesService = {
  async getParticipants() {
    const response = await api.get('/messages/participants')
    return response.data.data || []
  },

  async getConversations() {
    const response = await api.get('/messages/conversations')
    return response.data.data || []
  },

  async startConversation(participantId) {
    const response = await api.post('/messages/conversations', { participantId })
    return response.data.data
  },

  async getMessages(conversationId) {
    const response = await api.get(`/messages/conversations/${conversationId}/messages`)
    return response.data.data || []
  },

  async sendMessage(conversationId, payload) {
    const response = await api.post(`/messages/conversations/${conversationId}/messages`, payload)
    return response.data.data
  },
}

