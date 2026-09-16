<script setup>
import TheHeader from "./components/TheHeader.vue";
import HeroSection from "./components/HeroSection.vue";
import ProjectsSection from "./components/ProjectsSection.vue";
import ServicesSection from "./components/ServicesSection.vue";
import ProcessSection from "./components/ProcessSection.vue";
import ContactSection from "./components/ContactSection.vue";
import TheFooter from "./components/TheFooter.vue";
</script>

<template>
  <a class="skip-link" href="#main">Перейти к содержимому</a>

  <TheHeader />

  <main id="main" tabindex="-1">
    <HeroSection />
    <ProjectsSection />
    <ServicesSection />
    <ProcessSection />
    <ContactSection />
  </main>

  <TheFooter />
</template>
