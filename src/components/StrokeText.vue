<script setup>
import { ref, computed, onMounted, onUnmounted, watch, useId } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../assets/StrokeText.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const props = defineProps({
  text: { type: String, default: 'Draw Attention' },
  strokeColor: { type: String, default: '#A78BFA' },
  fillColor: { type: String, default: '#F8FAFC' },
  strokeWidth: { type: Number, default: 1.4 },
  drawDuration: { type: Number, default: 1.6 },
  fillDelay: { type: Number, default: 0.2 },
  stagger: { type: Number, default: 0.05 },
  ease: { type: String, default: 'power2.out' },
  trigger: { type: String, default: 'mount' },
  fillMode: { type: String, default: 'wipe' },
  fontSize: { type: Number, default: 128 },
  fontWeight: { type: Number, default: 800 },
  letterSpacing: { type: Number, default: -4 },
  reverse: { type: Boolean, default: false },
  className: { type: String, default: '' },
  style: { type: Object, default: () => ({}) }
});

const rootRef = ref(null);
const strokeTextRef = ref(null);
const wipeRectRef = ref(null);
const box = ref(null);

const rawId = useId ? useId() : Math.random().toString(36).substring(2, 9);
const wipeId = computed(() => `stroke-text-wipe-${String(rawId).replace(/[^a-zA-Z0-9_-]/g, '')}`);

const lines = computed(() => String(props.text ?? '').split('\n'));
const lineHeight = computed(() => props.fontSize * 1.1);
const dash = computed(() => Math.max(props.fontSize * 7, 200));

const fontStyle = computed(() => ({
  fontSize: `${props.fontSize}px`,
  fontWeight: props.fontWeight,
  letterSpacing: `${props.letterSpacing}px`
}));

const viewBox = computed(() =>
  box.value
    ? `${box.value.x} ${box.value.y} ${box.value.width} ${box.value.height}`
    : `0 ${-props.fontSize} 600 ${props.fontSize * 1.3 * lines.value.length}`
);

onMounted(() => {
  let cancelled = false;

  const measure = () => {
    if (cancelled || !strokeTextRef.value) return;
    let bbox;
    try {
      bbox = strokeTextRef.value.getBBox();
    } catch {
      return;
    }
    if (!bbox || !bbox.width) return;

    // Минимальный запас, чтобы обводка не обрезалась — без лишних полей сверху/снизу
    const pad = Math.max((Number(props.strokeWidth) || 1) * 1.5, props.fontSize * 0.04);
    const next = {
      x: bbox.x - pad,
      y: bbox.y - pad,
      width: bbox.width + pad * 2,
      height: bbox.height + pad * 2
    };

    const prev = box.value;
    if (
      !(
        prev &&
        Math.abs(prev.x - next.x) < 0.5 &&
        Math.abs(prev.width - next.width) < 0.5 &&
        Math.abs(prev.y - next.y) < 0.5
      )
    ) {
      box.value = next;
    }
  };

  measure();
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    document.fonts.ready.then(measure).catch(() => {});
  }

  const unwatch = watch(
    [lines, () => props.fontSize, () => props.fontWeight, () => props.letterSpacing, () => props.strokeWidth],
    measure,
    { flush: 'post' }
  );

  onUnmounted(() => {
    cancelled = true;
    unwatch();
  });
});

watch(
  [
    box,
    dash,
    () => props.drawDuration,
    () => props.fillDelay,
    () => props.stagger,
    () => props.ease,
    () => props.trigger,
    () => props.fillMode,
    () => props.reverse
  ],
  ([newBox]) => {
    const root = rootRef.value;
    if (typeof window === 'undefined' || !root || !newBox) return;

    const strokes = gsap.utils.toArray(root.querySelectorAll('[data-stroke-char]'));
    const fills = gsap.utils.toArray(root.querySelectorAll('[data-fill-char]'));
    const wipe = wipeRectRef.value;
    if (!strokes.length) return;

    const fillEnabled = props.fillMode !== 'none';
    const useWipe = fillEnabled && props.fillMode === 'wipe';
    const fillDuration = Math.max(0.4, props.drawDuration * 0.5);
    const staggerConfig = props.reverse ? { each: props.stagger, from: 'end' } : props.stagger;
    const targets = [...strokes, ...fills, wipe].filter(Boolean);

    const setStart = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: dash.value, strokeDashoffset: dash.value });
      gsap.set(fills, { opacity: useWipe ? 1 : 0 });
      if (wipe) gsap.set(wipe, { attr: { width: 0 } });
    };

    const setEnd = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: dash.value, strokeDashoffset: 0 });
      gsap.set(fills, { opacity: fillEnabled ? 1 : 0 });
      if (wipe) gsap.set(wipe, { attr: { width: fillEnabled ? newBox.width : 0 } });
    };

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setEnd();
      return () => gsap.killTweensOf(targets);
    }

    const build = () => {
      setStart();
      const tl = gsap.timeline({
        paused: true,
        repeat: props.trigger === 'loop' ? -1 : 0,
        repeatDelay: props.trigger === 'loop' ? 0.9 : 0,
        defaults: { overwrite: 'auto' }
      });

      tl.to(strokes, { strokeDashoffset: 0, duration: props.drawDuration, ease: props.ease, stagger: staggerConfig }, 0);

      if (useWipe && wipe) {
        tl.to(
          wipe,
          { attr: { width: newBox.width }, duration: fillDuration, ease: 'power2.inOut' },
          props.drawDuration + props.fillDelay
        );
      } else if (fillEnabled) {
        tl.to(
          fills,
          { opacity: 1, duration: fillDuration, ease: 'power2.out', stagger: staggerConfig },
          props.drawDuration + props.fillDelay
        );
      }

      return tl;
    };

    let timeline = null;
    let scrollTrigger = null;
    let removeHover = null;

    if (props.trigger === 'hover') {
      setEnd();
      const play = () => {
        timeline?.kill();
        timeline = build();
        timeline.play(0);
      };
      root.addEventListener('pointerenter', play);
      removeHover = () => root.removeEventListener('pointerenter', play);
    } else {
      timeline = build();
      if (props.trigger === 'scroll') {
        scrollTrigger = ScrollTrigger.create({
          trigger: root,
          start: 'top 82%',
          once: true,
          onEnter: () => timeline?.play(0)
        });
      } else {
        timeline.play(0);
      }
    }

    return () => {
      removeHover?.();
      scrollTrigger?.kill();
      timeline?.kill();
      gsap.killTweensOf(targets);
    };
  },
  { immediate: true, flush: 'post' }
);
</script>

<template>
  <span
    ref="rootRef"
    :class="['stroke-text', { 'stroke-text--hover': trigger === 'hover' }, className]"
    :style="{ ...style, '--stroke-text-height': `${Math.round(lines.length * fontSize * 1.3)}px` }"
    role="img"
    :aria-label="String(text ?? '').replace(/\n/g, ' ')"
  >
    <svg
      class="stroke-text__svg"
      :viewBox="viewBox"
      :style="box ? { height: 'auto', aspectRatio: `${box.width} / ${box.height}` } : undefined"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs v-if="fillMode === 'wipe' && box">
        <clipPath :id="wipeId" clipPathUnits="userSpaceOnUse">
          <rect ref="wipeRectRef" :x="box.x" :y="box.y" width="0" :height="box.height" />
        </clipPath>
      </defs>

      <g ref="strokeTextRef">
        <text
          v-for="(line, li) in lines"
          :key="`s-${li}`"
          class="stroke-text__stroke"
          x="0"
          :y="li * lineHeight"
          fill="none"
          :stroke="strokeColor"
          :stroke-width="strokeWidth"
          stroke-linejoin="round"
          stroke-linecap="round"
          :style="fontStyle"
        >
          <tspan v-for="(char, ci) in line" :key="`s-${li}-${ci}`" data-stroke-char>
            {{ char }}
          </tspan>
        </text>
      </g>

      <g :clip-path="fillMode === 'wipe' && box ? `url(#${wipeId})` : undefined">
        <text
          v-for="(line, li) in lines"
          :key="`f-${li}`"
          class="stroke-text__fill"
          x="0"
          :y="li * lineHeight"
          :fill="fillColor"
          stroke="none"
          :style="fontStyle"
        >
          <tspan v-for="(char, ci) in line" :key="`f-${li}-${ci}`" data-fill-char>
            {{ char }}
          </tspan>
        </text>
      </g>
    </svg>
  </span>
</template>