<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'

const BaseLayout = DefaultTheme.Layout!
</script>

<template>
  <BaseLayout>
    <template #home-features-before>
      <div id="features" class="home-features-anchor" aria-hidden="true" />
    </template>
  </BaseLayout>
</template>
