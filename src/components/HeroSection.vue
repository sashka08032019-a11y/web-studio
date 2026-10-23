<script setup>
import { useAutoplayVideo } from "../composables/useAutoplayVideo.js";
import StrokeText from './StrokeText.vue'

// Видео грузится только когда оно уместно: постер показывается сразу
const { canAutoplay } = useAutoplayVideo();
</script>

<template>
  <section class="hero" id="hero">
    <div class="hero-bg">
      <video
        v-if="canAutoplay"
        class="hero-video"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
    </div>
    <div class="hero-overlay" aria-hidden="true"></div>

    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title">
          <!-- Текст дублируется для поисковиков и скринридеров: SVG ниже декоративный -->
          <span class="visually-hidden"
            >Сайты и веб-сервисы, которые работают на результат</span
          >
          <StrokeText
            aria-hidden="true"
            :text="'Сайты и веб-сервисы,\nкоторые работают на результат'"
            stroke-color="#A78BFA"
            fill-color="#F8FAFC"
            :stroke-width="2"
            :draw-duration="1.6"
            :fill-delay="0.2"
            :stagger="0.05"
            ease="power2.out"
            trigger="loop"
            fill-mode="wipe"
            :font-size="128"
            :font-weight="800"
            :letter-spacing="-4"
          />
        </h1>
        <p class="hero-sub">
          Проектирование, дизайн и разработка — от лендинга до сложного каталога.
          В портфолио — сайты студий красоты, промышленных и консалтинговых
          компаний.
        </p>
        <div class="hero-actions">
          <a href="#work" class="btn btn-primary">Смотреть работы</a>
          <a href="#contact" class="btn btn-outline">Обсудить проект</a>
        </div>
      </div>
    </div>

    <a href="#work" class="scroll-cue" aria-label="Пролистать вниз">
      <span></span>
    </a>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background: var(--bg) url("/poster.webp") center / cover no-repeat;
}
.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(20, 22, 26, 0.1) 0%,
    rgba(20, 22, 26, 0.55) 55%,
    rgba(20, 22, 26, 0.94) 100%
  );
}
.hero-content {
  position: relative;
  max-width: var(--container);
  margin-inline: auto;
  width: 100%;
  padding: 0 32px 120px;
}
.hero-title {
  margin-bottom: 24px;
}
.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.scroll-cue {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 44px;
  background: var(--line-strong);
}
.scroll-cue span {
  position: absolute;
  top: 0;
  left: -2px;
  width: 5px;
  height: 14px;
  background: var(--accent);
  animation: scrollCue 2.2s var(--ease) infinite;
}


@keyframes scrollCue {
  0% {
    top: 0;
    opacity: 1;
  }
  80%,
  100% {
    top: 30px;
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .scroll-cue span {
    animation: none;
    top: 15px;
  }
}
</style>
