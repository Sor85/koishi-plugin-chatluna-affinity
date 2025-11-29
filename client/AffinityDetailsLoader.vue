<template>
    <AffinityNav v-if="isOwn" />
</template>

<script setup lang="ts">
import { ComputedRef, inject, ref } from 'vue'
import AffinityNav from './components/AffinityNav.vue'

const pluginName = inject<ComputedRef<string>>('plugin:name')
const isOwn = ref(pluginName?.value === 'koishi-plugin-chatluna-affinity')
</script>
