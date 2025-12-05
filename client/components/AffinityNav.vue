<!--
  好感度配置导航组件
  提供可拖拽的配置快捷导航面板
-->
<template>
    <div :class="[$style.container, isCollapsed ? $style.collapsed : '']" :style="position">
        <div
            :class="$style.header"
            @mousedown="onStartDrag"
            @touchstart="onStartDrag"
        >
            <IconMove :class="$style.move" />
            <div :class="$style.toggle" @click="toggleCollapse" @mousedown.stop @touchstart.stop>
                <IconChevronDown />
            </div>
        </div>
        <div :class="$style.body">
            <NavSection
                :sections="navSections"
                :active-key="activeSection"
                @select="toNavSection"
            />
            <ToolList
                :tools="allTools"
                :active-key="activeItem"
                @select="toToolItem"
            />
            <VariableList
                :variables="allVariables"
                :active-key="activeItem"
                @select="toVariable"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, watch, ComputedRef } from 'vue'
import IconMove from '../icons/IconMove.vue'
import IconChevronDown from '../icons/IconChevronDown.vue'
import NavSection from './NavSection.vue'
import ToolList from './ToolList.vue'
import VariableList from './VariableList.vue'
import { useDraggable, useScrollSpy } from '../composables'
import {
    NAV_SECTIONS,
    KEY_TO_TITLE,
    TITLE_TO_KEY,
    VARIABLE_CONFIG,
    type NavSection as NavSectionType,
    type ToolItem,
    type VariableItem
} from '../constants'
import type { Config } from '../types'

const isCollapsed = ref(false)

const toggleCollapse = (e: MouseEvent) => {
    e.stopPropagation()
    isCollapsed.value = !isCollapsed.value
}

const { position, startDrag } = useDraggable(100, 20)

const onStartDrag = (event: MouseEvent | TouchEvent) => {
    startDrag(event, 'container')
}

const current = inject<ComputedRef<{ config: Config }>>('manager.settings.current')

const navSections = NAV_SECTIONS

const allTools = computed<ToolItem[]>(() => {
    const cfg = current?.value?.config
    if (!cfg) return []
    return [
        { name: '调整好感度', enableKey: 'registerAffinityTool', enabled: !!cfg.registerAffinityTool },
        { name: '管理黑名单', enableKey: 'registerBlacklistTool', enabled: !!cfg.registerBlacklistTool },
        { name: '调整关系', enableKey: 'registerRelationshipTool', enabled: !!cfg.registerRelationshipTool },
        { name: '获取今日日程', enableKey: 'schedule.registerTool', enabled: !!cfg.schedule?.registerTool },
        { name: '戳一戳', enableKey: 'enablePokeTool', enabled: !!cfg.enablePokeTool },
        { name: '修改账户信息', enableKey: 'enableSetSelfProfileTool', enabled: !!cfg.enableSetSelfProfileTool },
        { name: '撤回消息', enableKey: 'enableDeleteMessageTool', enabled: !!cfg.enableDeleteMessageTool },
        { name: '网盘搜索', enableKey: 'panSouTool.enablePanSouTool', enabled: !!cfg.panSouTool?.enablePanSouTool }
    ]
})

const allVariables = computed<VariableItem[]>(() => {
    const cfg = current?.value?.config
    if (!cfg) return []
    const affinityEnabled = cfg.enableAffinityAnalysis !== false
    const scheduleEnabled = cfg.schedule?.enabled !== false
    const overview = cfg.contextAffinityOverview
    const userInfo = cfg.userInfo || cfg.otherVariables?.userInfo
    const botInfo = cfg.botInfo || cfg.otherVariables?.botInfo
    const groupInfo = cfg.groupInfo || cfg.otherVariables?.groupInfo
    const random = cfg.otherVariables?.random
    return [
        { name: cfg.affinityVariableName || 'affinity', key: 'affinity', enabled: affinityEnabled },
        overview?.variableName
            ? { name: overview.variableName, key: 'contextAffinity', enabled: affinityEnabled }
            : null,
        { name: cfg.relationshipVariableName || 'relationship', key: 'relationship', enabled: affinityEnabled },
        { name: cfg.schedule?.variableName || 'schedule', key: 'schedule', enabled: scheduleEnabled },
        { name: cfg.schedule?.currentVariableName || 'currentSchedule', key: 'currentSchedule', enabled: scheduleEnabled },
        { name: userInfo?.variableName || 'userInfo', key: 'userInfo', enabled: userInfo?.enabled !== false },
        { name: botInfo?.variableName || 'botInfo', key: 'botInfo', enabled: botInfo?.enabled !== false },
        { name: groupInfo?.variableName || 'groupInfo', key: 'groupInfo', enabled: groupInfo?.enabled !== false },
        { name: random?.variableName || 'random', key: 'random', enabled: random?.enabled !== false }
    ].filter((item): item is VariableItem => Boolean(item))
})

const { activeSection, refresh } = useScrollSpy(TITLE_TO_KEY)
const activeItem = ref('')

const toNavSection = (nav: NavSectionType) => {
    activeSection.value = nav.key
    activeItem.value = ''

    const nodes = document.querySelectorAll('.k-schema-header')
    for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i] as HTMLElement
        const text = item.textContent || ''
        if (text.includes(KEY_TO_TITLE[nav.key])) {
            item.scrollIntoView({ behavior: 'smooth', block: 'start' })
            return
        }
    }
}

const toToolItem = (tool: ToolItem) => {
    activeItem.value = 'tool-' + tool.enableKey
    activeSection.value = ''

    const keyParts = tool.enableKey.split('.')
    const searchKeys = keyParts.length > 1
        ? [keyParts.join('.'), keyParts[keyParts.length - 1], keyParts[0]].filter(Boolean)
        : [tool.enableKey]

    const nodes = document.querySelectorAll('.k-schema-left')
    for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i] as HTMLElement
        const text = item.textContent || ''
        const matched = searchKeys.some((key) => key && text.includes(key))
        if (matched) {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }
    }
}

const toVariable = (variable: VariableItem) => {
    activeItem.value = 'var-' + variable.key
    activeSection.value = ''

    const config = VARIABLE_CONFIG[variable.key]
    if (!config) return

    const headers = document.querySelectorAll('.k-schema-header')
    let sectionElement: HTMLElement | null = null
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i] as HTMLElement
        if (header.textContent?.includes(config.section)) {
            sectionElement = header.parentElement as HTMLElement
            break
        }
    }

    if (!sectionElement) return

    const nodes = sectionElement.querySelectorAll('.k-schema-left')
    for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i] as HTMLElement
        const text = item.textContent || ''
        const searchKeys = Array.isArray(config.searchKey) ? config.searchKey : [config.searchKey]
        const matched = searchKeys.some((key) => key && text.includes(key)) || text.includes(variable.key)
        if (matched) {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }
    }
}

watch(() => current?.value?.config, () => {
    refresh()
}, { deep: true })
</script>

<style module lang="scss">
.container {
    position: absolute;
    z-index: 1000;
    width: 140px;
    max-width: 90vw;
    max-height: 70vh;
    background: transparent;
    display: flex;
    flex-direction: column;
    font-family:
        'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
        'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    user-select: none;
    overflow: visible;

    @media (max-width: 768px) {
        width: 120px;
        max-height: 50vh;
    }

    .header {
        padding: 6px 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        background: rgba(255, 255, 255, 0.85);
        border-radius: 20px;
        backdrop-filter: blur(8px);
        margin-bottom: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        &:hover {
            background: rgba(255, 255, 255, 0.95);
        }

        .move {
            color: var(--k-text-light);
            cursor: grab;
            transition: color 0.2s;
            &:active {
                cursor: grabbing;
                color: var(--k-color-primary);
            }
        }

        .toggle {
            cursor: pointer;
            color: var(--k-text-light);
            transition: transform 0.3s ease, color 0.2s;
            display: flex;
            align-items: center;
            padding: 2px;

            &:hover {
                color: var(--k-color-primary);
            }
        }
    }

    .body {
        overflow-y: auto;
        padding: 4px 0;
        transition: max-height 0.3s ease, opacity 0.3s ease;
        opacity: 1;
        scrollbar-width: none;
        -ms-overflow-style: none;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    &.collapsed {
        max-height: 40px !important;

        .body {
            max-height: 0;
            padding: 0;
            opacity: 0;
            overflow: hidden;
        }

        .toggle {
            transform: rotate(180deg);
        }
    }
}
</style>
