<script setup lang="ts">
import { useConversationController } from './hooks/useConversationController'

const {
  turns,
  isLocked,
  startRecording,
  stopRecording,
  isRecordingNow,
} = useConversationController()

function toggleRecord() {
  if (isRecordingNow()) stopRecording()
  else startRecording()
}

function play(url: string) {
  const audio = new Audio(url)
  audio.play()
}
</script>

<template>
  <div class="app">
    <h2>🎧 English Conversation (Turn Card)</h2>

    <div class="turn-list">
      <div
        v-for="turn in turns"
        :key="turn.turnId"
        class="turn-card"
        :class="{ 'card-error': turn.state === 'ERROR' }"
      >
        <div class="player">
          <strong>You</strong>
          <p>{{ turn.playerTranscript || '...' }}</p>

          <button
            v-if="turn.playerAudioUrl"
            class="tiny"
            @click="play(turn.playerAudioUrl)"
            type="button"
          >
            ▶ 내 음성 재생
          </button>
        </div>

        <div class="npc">
          <strong>NPC</strong>
          <p>{{ turn.npcText || 'Thinking...' }}</p>
        </div>

        <div class="state">
          {{ turn.state }}
          <span v-if="turn.errorMessage"> - {{ turn.errorMessage }}</span>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="turn.errorMessage" class="error-message">
          ⚠️ {{ turn.errorMessage }}
        </div>
      </div>
    </div>

    <button
      class="mic-btn"
      :disabled="isLocked && !isRecordingNow()"
      @click="toggleRecord"
      type="button"
    >
      {{ isRecordingNow() ? '⏹ Stop' : '🎙️ Speak' }}
    </button>
  </div>
</template>

<style scoped>
.app {
  max-width: 600px;
  margin: 20px auto;
  font-family: sans-serif;
}

.turn-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.turn-card {
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 8px;
}

.player {
  color: #333;
}

.npc {
  color: #0066cc;
  margin-top: 6px;
}

.state {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

.tiny {
  margin-top: 6px;
  font-size: 12px;
}

.mic-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  cursor: pointer;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: all 0.2s;
}

.mic-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.mic-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mic-btn-active {
  background: #ff4444;
  color: white;
  border-color: #cc0000;
}

.play-btn {
  margin-top: 8px;
  padding: 8px 12px;
  font-size: 13px;
  background: #e8f4f8;
  border: 1px solid #0066cc;
  border-radius: 6px;
  cursor: pointer;
  color: #0066cc;
  transition: all 0.2s;
}

.play-btn:hover {
  background: #d0e8f0;
}

.state-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}

.state-idle {
  background: #f0f0f0;
  color: #666;
}

.state-recording {
  background: #fff3cd;
  color: #856404;
}

.state-recorded {
  background: #d1ecf1;
  color: #0c5460;
}

.state-thinking {
  background: #cfe2ff;
  color: #084298;
}

.state-speaking {
  background: #c3e6cb;
  color: #155724;
}

.state-done {
  background: #d4edda;
  color: #155724;
}

.state-error {
  background: #f8d7da;
  color: #721c24;
}

.card-error {
  border-color: #f5c6cb;
  background: #f8f9fa;
}

.error-message {
  color: #721c24;
  font-size: 13px;
  margin-top: 8px;
  padding: 8px;
  background: #f8d7da;
  border-radius: 4px;
  border-left: 3px solid #f5c6cb;
}
</style>
