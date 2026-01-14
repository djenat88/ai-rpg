import { ref } from 'vue'

type TurnState =
  | 'IDLE'
  | 'RECORDING'
  | 'RECORDED'
  | 'THINKING'
  | 'SPEAKING'
  | 'DONE'
  | 'ERROR'

interface Turn {
  turnId: number
  // PLAYER
  playerTranscript: string | null
  playerAudioUrl: string | null

  // NPC (지금은 흉내)
  npcText: string | null

  // STATE
  state: TurnState
  errorMessage: string | null
}

export function useConversationController() {
  const turns = ref<Turn[]>([])
  const isLocked = ref(false)

  let turnSeq = 0

  // MediaRecorder 관련
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const mediaStream = ref<MediaStream | null>(null)
  const audioChunks: BlobPart[] = []

  function currentTurn(): Turn | undefined {
    return turns.value.at(-1)
  }

  function cleanupStream() {
    if (mediaStream.value) {
      for (const track of mediaStream.value.getTracks()) track.stop()
      mediaStream.value = null
    }
    mediaRecorder.value = null
    audioChunks.length = 0
  }

  async function startRecording() {
    if (isLocked.value) return

    // 이미 녹음 중이면 무시
    if (mediaRecorder.value && mediaRecorder.value.state === 'recording') return

    turnSeq += 1
    const newTurn: Turn = {
      turnId: turnSeq,
      playerTranscript: null,
      playerAudioUrl: null,
      npcText: null,
      state: 'RECORDING',
      errorMessage: null,
    }
    turns.value.push(newTurn)
    isLocked.value = true // 녹음 중에는 다음 턴 잠금

    try {
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStream.value = stream

      // 브라우저가 지원하는 mimeType 선택(가능하면)
      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
      ]
      const mimeType =
        preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorder.value = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunks.push(e.data)
      }

      recorder.onerror = () => {
        const t = currentTurn()
        if (!t) return
        t.state = 'ERROR'
        t.errorMessage = '녹음 중 오류가 발생했습니다.'
        cleanupStream()
        isLocked.value = false
      }

      recorder.onstop = () => {
        const t = currentTurn()
        if (!t) return

        try {
          const blob = new Blob(audioChunks, { type: recorder.mimeType || 'audio/webm' })
          const url = URL.createObjectURL(blob)
          t.playerAudioUrl = url
          t.state = 'RECORDED'
        } catch {
          t.state = 'ERROR'
          t.errorMessage = '녹음 파일 생성에 실패했습니다.'
        } finally {
          cleanupStream()
          // 여기서부터는 "기존 흉내 로직"으로 NPC 응답까지 이어붙임
          simulateTurnFlow()
        }
      }

      recorder.start()
    } catch (err: any) {
      const t = currentTurn()
      if (t) {
        t.state = 'ERROR'
        t.errorMessage =
          err?.name === 'NotAllowedError'
            ? '마이크 권한이 거부되었습니다. 브라우저 권한을 허용하세요.'
            : err?.name === 'NotFoundError'
              ? '마이크 장치를 찾을 수 없습니다.'
              : '마이크를 사용할 수 없습니다.'
      }
      cleanupStream()
      isLocked.value = false
    }
  }

  function stopRecording() {
    const t = currentTurn()
    if (!t) return

    const recorder = mediaRecorder.value
    if (!recorder) return
    if (recorder.state !== 'recording') return

    // stop 호출하면 onstop에서 Blob 생성됨
    recorder.stop()
  }

  // 기존 "STT/AI/TTS 흉내"는 그대로 두되, playerAudioUrl 생성 이후 이어지게 함
  function simulateTurnFlow() {
    const t = currentTurn()
    if (!t) {
      isLocked.value = false
      return
    }

    // playerAudioUrl 없으면(에러) 잠금 해제만
    if (t.state === 'ERROR') {
      isLocked.value = false
      return
    }

    // 여기부터는 "임시"로 transcript/응답을 채움 (다음 단계에서 STT로 교체)
    t.state = 'THINKING'
    setTimeout(() => {
      // STT 흉내
      t.playerTranscript = 'I would like a cheeseburger.'
    }, 400)

    setTimeout(() => {
      // NPC 응답 흉내
      t.npcText = 'Sure! Anything to drink?'
      t.state = 'DONE'
      isLocked.value = false
    }, 1200)
  }

  // UI에서 토글로 쓰기 편하게
  function isRecordingNow() {
    return !!mediaRecorder.value && mediaRecorder.value.state === 'recording'
  }

  return {
    turns,
    isLocked,
    startRecording,
    stopRecording,
    isRecordingNow,
  }
}
