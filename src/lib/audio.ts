// Web Audio drum synthesis + a look-ahead loop scheduler.
// This is the drum analog of a guitar app's strum engine: instead of plucking
// strings, we synthesize each kit voice and loop a GrooveGrid at its BPM.
//
// Scheduling follows the classic "two clocks" pattern (Chris Wilson): a coarse
// setInterval wakes the scheduler, which queues precise note times on the Web
// Audio clock a short horizon ahead. A requestAnimationFrame draw loop reports
// the currently-sounding step back to React for the moving playhead.

import type { Lane, Pattern } from '../types/drums'

const LOOKAHEAD_MS = 25 // how often the scheduler wakes
const SCHEDULE_AHEAD = 0.1 // seconds of audio scheduled beyond "now"

// Seconds between two grid steps at a given tempo. Pure — safe to unit-test.
export function stepSeconds(bpm: number, subdivision: number): number {
  return 60 / bpm / subdivision
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    // Signal chain: voices -> master -> limiter -> destination, with a short
    // room-reverb send off the master so the kit sounds like it's in a space
    // rather than in a vacuum. The limiter tames peaks when many voices stack.
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -6
    limiter.knee.value = 8
    limiter.ratio.value = 6
    limiter.attack.value = 0.003
    limiter.release.value = 0.12
    limiter.connect(ctx.destination)
    master = ctx.createGain()
    master.gain.value = 0.8
    master.connect(limiter)
    const reverb = ctx.createConvolver()
    reverb.buffer = roomImpulse(ctx)
    const send = ctx.createGain()
    send.gain.value = 0.14
    master.connect(send)
    send.connect(reverb)
    reverb.connect(limiter)
  }
  return ctx
}

function noiseBuffer(audio: AudioContext): AudioBuffer {
  if (!noise) {
    const len = Math.floor(audio.sampleRate * 1)
    noise = audio.createBuffer(1, len, audio.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  }
  return noise
}

// A short exponential-decay noise burst — a cheap small-room impulse response.
function roomImpulse(audio: AudioContext): AudioBuffer {
  const len = Math.floor(audio.sampleRate * 0.4)
  const buf = audio.createBuffer(2, len, audio.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5)
  }
  return buf
}

// Small random multiplier (±spread) so repeated hits aren't machine-identical.
function humanize(spread: number): number {
  return 1 + (Math.random() * 2 - 1) * spread
}

// value 1 = hit, 2 = accent (louder), 3 = ghost (very soft, snare)
function velocityGain(value: number): number {
  if (value === 2) return 1.35
  if (value === 3) return 0.32
  return 1
}

function out(): GainNode {
  getCtx()
  return master as GainNode
}

// Browsers start the AudioContext suspended until a user gesture. Resume it and
// warn (rather than fail silently) if it stays blocked — otherwise ▶ does nothing.
export function ensureRunning(): void {
  const audio = getCtx()
  if (audio.state === 'suspended') {
    audio
      .resume()
      .then(() => {
        if (audio.state !== 'running') {
          console.warn('[ewd audio] AudioContext still suspended after resume — tap again to start sound.')
        }
      })
      .catch((err: unknown) => {
        console.warn('[ewd audio] AudioContext resume failed', err)
      })
  }
}

// ---- individual voices ---------------------------------------------------

function kick(t: number, v: number) {
  const audio = getCtx()
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.frequency.setValueAtTime(150 * humanize(0.03), t)
  osc.frequency.exponentialRampToValueAtTime(50 * humanize(0.03), t + 0.11)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.9 * v, t + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
  osc.connect(gain).connect(out())
  osc.start(t)
  osc.stop(t + 0.24)
  // beater click
  click(t, 0.4 * v, 3500)
}

function click(t: number, amp: number, freq: number) {
  const audio = getCtx()
  const src = audio.createBufferSource()
  src.buffer = noiseBuffer(audio)
  const hp = audio.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = freq
  const gain = audio.createGain()
  gain.gain.setValueAtTime(amp, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02)
  src.connect(hp).connect(gain).connect(out())
  src.start(t)
  src.stop(t + 0.03)
}

function snare(t: number, v: number) {
  const audio = getCtx()
  // noise body
  const src = audio.createBufferSource()
  src.buffer = noiseBuffer(audio)
  const bp = audio.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1900
  bp.Q.value = 0.7
  const ng = audio.createGain()
  const decay = v <= 0.4 ? 0.11 : 0.18
  ng.gain.setValueAtTime(0.7 * v, t)
  ng.gain.exponentialRampToValueAtTime(0.0001, t + decay)
  src.connect(bp).connect(ng).connect(out())
  src.start(t)
  src.stop(t + decay + 0.02)
  // tonal shell
  const osc = audio.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(190 * humanize(0.03), t)
  osc.frequency.exponentialRampToValueAtTime(150, t + 0.1)
  const og = audio.createGain()
  og.gain.setValueAtTime(0.4 * v, t)
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  osc.connect(og).connect(out())
  osc.start(t)
  osc.stop(t + 0.11)
}

function hat(t: number, v: number, open: boolean) {
  const audio = getCtx()
  const src = audio.createBufferSource()
  src.buffer = noiseBuffer(audio)
  const hp = audio.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 7000
  const bp = audio.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 10000
  const gain = audio.createGain()
  const decay = open ? 0.32 : 0.05
  gain.gain.setValueAtTime(0.5 * v, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay)
  src.connect(hp).connect(bp).connect(gain).connect(out())
  src.start(t)
  src.stop(t + decay + 0.02)
}

function cymbal(t: number, v: number, big: boolean) {
  const audio = getCtx()
  const src = audio.createBufferSource()
  src.buffer = noiseBuffer(audio)
  const hp = audio.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = big ? 4000 : 5500
  const gain = audio.createGain()
  const decay = big ? 1.3 : 0.5
  gain.gain.setValueAtTime(0.45 * v, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay)
  src.connect(hp).connect(gain).connect(out())
  src.start(t)
  src.stop(t + decay + 0.05)
  if (!big) {
    // ride ping
    const osc = audio.createOscillator()
    osc.type = 'square'
    osc.frequency.value = 720
    const og = audio.createGain()
    og.gain.setValueAtTime(0.12 * v, t)
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
    osc.connect(og).connect(out())
    osc.start(t)
    osc.stop(t + 0.13)
  }
}

function tom(t: number, v: number, from: number, to: number) {
  const audio = getCtx()
  const h = humanize(0.02)
  const osc = audio.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(from * h, t)
  osc.frequency.exponentialRampToValueAtTime(to * h, t + 0.3)
  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.8 * v, t + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34)
  osc.connect(gain).connect(out())
  osc.start(t)
  osc.stop(t + 0.36)
  click(t, 0.15 * v, 2000)
}

// Metronome / count-in tick: a short sine blip, brighter on the accented beat.
function tick(t: number, accent: boolean) {
  const audio = getCtx()
  const osc = audio.createOscillator()
  osc.frequency.value = accent ? 1600 : 1000
  const gain = audio.createGain()
  gain.gain.setValueAtTime(accent ? 0.5 : 0.3, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04)
  osc.connect(gain).connect(out())
  osc.start(t)
  osc.stop(t + 0.05)
}

// Route a lane id to its voice at audio-clock time t with velocity value.
export function playVoice(lane: Lane, t: number, value = 1): void {
  const v = velocityGain(value) * humanize(0.07)
  switch (lane) {
    case 'KK': return kick(t, v)
    case 'SN': return snare(t, v)
    case 'HH': return hat(t, v, false)
    case 'OH': return hat(t, v, true)
    case 'CR': return cymbal(t, v, true)
    case 'RD': return cymbal(t, v, false)
    case 'T1': return tom(t, v, 260, 170)
    case 'T2': return tom(t, v, 200, 130)
    case 'FT': return tom(t, v, 130, 85)
  }
}

// One-shot preview (e.g. tapping a lane label to hear it).
export function previewLane(lane: Lane): void {
  ensureRunning()
  playVoice(lane, getCtx().currentTime + 0.02, 1)
}

// ---- loop engine ---------------------------------------------------------

interface Scheduled {
  step: number
  time: number
  bpm?: number
}

export interface PlayOpts {
  bpm?: number
  countIn?: boolean
  mutedLanes?: Lane[]
  // Accelerando trainer: bump tempo by stepBpm each loop, up to maxBpm.
  ramp?: { stepBpm: number; maxBpm: number }
  onTempo?: (bpm: number) => void
}

class DrumEngine {
  private pattern: Pattern | null = null
  private onStep: ((step: number) => void) | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  private raf = 0
  private queue: Scheduled[] = []
  private nextTime = 0
  private step = 0
  private total = 0
  private stepDur = 0
  private subdivision = 1
  private mutedLanes = new Set<Lane>()
  private curBpm = 0
  private ramp: { stepBpm: number; maxBpm: number } | null = null
  private onTempo: ((bpm: number) => void) | null = null
  private lastBpm = 0
  private listeners = new Set<() => void>()
  playingId: string | null = null

  // Notify subscribers whenever play/stop state changes, so every GrooveGrid on
  // screen can reflect that only one pattern plays at a time.
  subscribe(cb: () => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  private emit(): void {
    for (const cb of this.listeners) cb()
  }

  // opts.bpm is the tempo-trainer override; opts.countIn plays a one-bar click
  // before the loop; opts.mutedLanes silences lanes for play-along practice.
  start(pattern: Pattern, onStep: (step: number) => void, opts: PlayOpts = {}): void {
    this.stop()
    ensureRunning()
    const audio = getCtx()
    const bpm = opts.bpm ?? pattern.bpm
    this.pattern = pattern
    this.onStep = onStep
    this.mutedLanes = new Set(opts.mutedLanes ?? [])
    this.subdivision = pattern.subdivision
    this.total = pattern.beats * pattern.subdivision
    this.stepDur = stepSeconds(bpm, pattern.subdivision)
    this.curBpm = bpm
    this.lastBpm = bpm
    this.ramp = opts.ramp ?? null
    this.onTempo = opts.onTempo ?? null
    this.step = 0
    this.queue = []
    let startAt = audio.currentTime + 0.1
    if (opts.countIn) {
      const beatDur = 60 / bpm
      for (let b = 0; b < pattern.beats; b++) tick(startAt + b * beatDur, b === 0)
      startAt += pattern.beats * beatDur
    }
    this.nextTime = startAt
    this.playingId = pattern.id
    this.scheduler()
    this.draw()
    this.emit()
  }

  // Change tempo without restarting: the running scheduler picks up the new
  // step duration on its next wake, so there is no audible gap or playhead reset.
  setTempo(bpm: number): void {
    if (!this.pattern) return
    this.curBpm = bpm
    this.stepDur = stepSeconds(bpm, this.subdivision)
  }

  // Live play-along muting: scheduleStep reads mutedLanes each step, so toggling
  // a lane takes effect on the next loop with no restart.
  setMuted(lanes: Lane[]): void {
    this.mutedLanes = new Set(lanes)
  }

  stop(): void {
    if (this.timer) clearTimeout(this.timer)
    if (this.raf) cancelAnimationFrame(this.raf)
    this.timer = null
    this.raf = 0
    this.queue = []
    if (this.playingId && this.onStep) this.onStep(-1)
    const wasPlaying = this.playingId !== null
    this.playingId = null
    this.pattern = null
    if (wasPlaying) this.emit()
  }

  isPlaying(id: string): boolean {
    return this.playingId === id
  }

  private scheduleStep(step: number, time: number): void {
    const p = this.pattern
    if (!p) return
    for (const lane of p.lanes) {
      if (this.mutedLanes.has(lane)) continue
      const row = p.grid[lane]
      const value = row?.[step] ?? 0
      if (value > 0) playVoice(lane, time, value)
    }
  }

  private scheduler = (): void => {
    const audio = getCtx()
    while (this.nextTime < audio.currentTime + SCHEDULE_AHEAD) {
      this.scheduleStep(this.step, this.nextTime)
      this.queue.push({ step: this.step, time: this.nextTime, bpm: this.curBpm })
      this.nextTime += this.stepDur
      const willWrap = this.step + 1 >= this.total
      this.step = (this.step + 1) % this.total
      // Accelerando: at the end of each loop, nudge the tempo up toward maxBpm.
      if (willWrap && this.ramp && this.curBpm < this.ramp.maxBpm) {
        this.curBpm = Math.min(this.ramp.maxBpm, this.curBpm + this.ramp.stepBpm)
        this.stepDur = stepSeconds(this.curBpm, this.subdivision)
      }
    }
    this.timer = setTimeout(this.scheduler, LOOKAHEAD_MS)
  }

  private draw = (): void => {
    const audio = getCtx()
    while (this.queue.length && this.queue[0].time <= audio.currentTime) {
      const e = this.queue.shift() as Scheduled
      this.onStep?.(e.step)
      if (e.bpm !== undefined && e.bpm !== this.lastBpm) {
        this.lastBpm = e.bpm
        this.onTempo?.(e.bpm)
      }
    }
    this.raf = requestAnimationFrame(this.draw)
  }
}

export const engine = new DrumEngine()

// A standalone metronome — the "play to a click" tool the guide keeps preaching.
class Metronome {
  private timer: ReturnType<typeof setTimeout> | null = null
  private raf = 0
  private queue: { beat: number; time: number }[] = []
  private nextTime = 0
  private beat = 0
  private beatDur = 0
  private beatsPerBar = 4
  private onBeat: ((beat: number) => void) | null = null
  private listeners = new Set<() => void>()
  running = false
  bpm = 90

  subscribe(cb: () => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }
  private emit(): void {
    for (const cb of this.listeners) cb()
  }

  start(bpm: number, beatsPerBar: number, onBeat?: (beat: number) => void): void {
    this.stop()
    ensureRunning()
    this.bpm = bpm
    this.beatsPerBar = beatsPerBar
    this.beatDur = 60 / bpm
    this.onBeat = onBeat ?? null
    this.beat = 0
    this.queue = []
    this.nextTime = getCtx().currentTime + 0.1
    this.running = true
    this.scheduler()
    this.draw()
    this.emit()
  }

  setBpm(bpm: number): void {
    this.bpm = bpm
    if (this.running) this.beatDur = 60 / bpm
  }

  stop(): void {
    if (this.timer) clearTimeout(this.timer)
    if (this.raf) cancelAnimationFrame(this.raf)
    this.timer = null
    this.raf = 0
    this.queue = []
    const was = this.running
    this.running = false
    this.onBeat?.(-1)
    if (was) this.emit()
  }

  private scheduler = (): void => {
    const audio = getCtx()
    while (this.nextTime < audio.currentTime + SCHEDULE_AHEAD) {
      tick(this.nextTime, this.beat === 0)
      this.queue.push({ beat: this.beat, time: this.nextTime })
      this.nextTime += this.beatDur
      this.beat = (this.beat + 1) % this.beatsPerBar
    }
    this.timer = setTimeout(this.scheduler, LOOKAHEAD_MS)
  }

  private draw = (): void => {
    const audio = getCtx()
    while (this.queue.length && this.queue[0].time <= audio.currentTime) {
      this.onBeat?.((this.queue.shift() as { beat: number }).beat)
    }
    this.raf = requestAnimationFrame(this.draw)
  }
}

export const metronome = new Metronome()
