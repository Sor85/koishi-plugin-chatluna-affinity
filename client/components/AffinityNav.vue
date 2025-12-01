<template>
    <div :class="[$style.container, isCollapsed ? $style.collapsed : '']" :style="containerPosition">
        <div
            :class="$style.header"
            @mousedown="startMove"
            @touchstart="startMove"
        >
            <IconMove :class="$style.move" />
            <div :class="$style.toggle" @click="toggleCollapse" @mousedown.stop @touchstart.stop>
                <IconChevronDown />
            </div>
        </div>
        <div :class="$style.body">
            <!-- 设置导航 -->
            <div
                v-for="nav in navSections"
                :key="nav.key"
                :class="[$style.item, activeSection === nav.key ? $style.active : '']"
                @click="toNavSection(nav)"
            >{{ nav.title }}</div>

            <!-- 可用工具 -->
            <div :class="$style.divider">可用工具</div>
            <div
                v-for="tool in allTools"
                :key="'tool-' + tool.enableKey"
                :class="[$style.item, $style.toolItem, activeItem === 'tool-' + tool.enableKey ? $style.active : '']"
                @click="toToolItem(tool)"
            >
                <span :class="$style.toolIndicator">
                    <span v-if="tool.enabled" :class="$style.indicatorOn"></span>
                </span>
                <span :class="$style.toolName">{{ tool.name }}</span>
            </div>

            <!-- 可用变量 -->
            <div :class="$style.divider">可用变量</div>
            <div
                v-for="variable in allVariables"
                :key="'var-' + variable.key"
                :class="[$style.item, $style.toolItem, activeItem === 'var-' + variable.key ? $style.active : '']"
                @click="toVariable(variable)"
            >
                <span :class="$style.toolIndicator">
                    <span v-if="variable.enabled" :class="$style.indicatorOn"></span>
                    <span v-else :class="$style.indicatorOff"></span>
                </span>
                <span :class="$style.toolName">{{ variable.name }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, reactive, onUnmounted, onMounted, computed, ComputedRef, ref, watch } from 'vue'
import IconMove from '../icons/IconMove.vue'
import IconChevronDown from '../icons/IconChevronDown.vue'

interface Config {
    // 好感度设置
    enableAffinityAnalysis?: boolean
    affinityVariableName?: string
    contextAffinityOverview?: {
        variableName?: string
    }
    registerAffinityTool?: boolean
    affinityToolName?: string
    // 黑名单设置
    registerBlacklistTool?: boolean
    blacklistToolName?: string
    // 关系设置
    relationshipVariableName?: string
    registerRelationshipTool?: boolean
    relationshipToolName?: string
    // 日程设置
    schedule?: {
        enabled?: boolean
        variableName?: string
        currentVariableName?: string
        registerTool?: boolean
        toolName?: string
    }
    // 其他变量
    userInfo?: { enabled?: boolean; variableName?: string }
    botInfo?: { enabled?: boolean; variableName?: string }
    groupInfo?: { enabled?: boolean; variableName?: string }
    otherVariables?: {
        userInfo?: { enabled?: boolean; variableName?: string }
        botInfo?: { enabled?: boolean; variableName?: string }
        groupInfo?: { enabled?: boolean; variableName?: string }
        random?: { enabled?: boolean; variableName?: string }
    }
    // 其他工具
    enablePokeTool?: boolean
    pokeToolName?: string
    enableSetSelfProfileTool?: boolean
    setSelfProfileToolName?: string
    enableDeleteMessageTool?: boolean
    deleteMessageToolName?: string
    // 网盘搜索工具
    panSouTool?: {
        enablePanSouTool?: boolean
        panSouToolName?: string
    }
}

interface NavSection {
    title: string
    key: string
}

interface ToolItem {
    name: string
    enableKey: string
    enabled: boolean
}

interface VariableItem {
    name: string
    key: string
    enabled: boolean
}

const isCollapsed = ref(false)

const toggleCollapse = (e: MouseEvent) => {
    e.stopPropagation()
    isCollapsed.value = !isCollapsed.value
}

const containerPosition = computed(() => {
    return {
        top: mouseInfo.top + 'px',
        right: mouseInfo.right + 'px'
    }
})

const mouseInfo = reactive({
    ing: false,
    top: 100,
    right: 20,
    startTop: 0,
    startRight: 0,
    startX: 0,
    startY: 0,
    width: 0,
    height: 0
})

const onMousemove = (event: MouseEvent | TouchEvent) => {
    if (event instanceof TouchEvent) {
        event = event.touches[0] as unknown as MouseEvent
    }
    if (!mouseInfo.ing) {
        return
    }

    let newTop = mouseInfo.startTop + (event.clientY - mouseInfo.startY)
    let newRight = mouseInfo.startRight - (event.clientX - mouseInfo.startX)

    const boundary = document.querySelector('.plugin-view')?.getBoundingClientRect()
    
    let minTop = 0
    let maxTop = window.innerHeight - mouseInfo.height
    let minRight = 0
    let maxRight = window.innerWidth - mouseInfo.width

    if (boundary) {
        minTop = boundary.top
        maxTop = boundary.bottom - mouseInfo.height
        minRight = window.innerWidth - boundary.right
        maxRight = window.innerWidth - boundary.left - mouseInfo.width
    }

    if (newTop < minTop) newTop = minTop
    if (newTop > maxTop) newTop = maxTop
    if (newRight < minRight) newRight = minRight
    if (newRight > maxRight) newRight = maxRight

    mouseInfo.top = newTop
    mouseInfo.right = newRight
}

const startMove = (event: MouseEvent | TouchEvent) => {
    if (event instanceof TouchEvent) {
        event = event.touches[0] as unknown as MouseEvent
    }

    const rect = (event.target as HTMLElement)
        .closest(`.${useCssModule().container}`)
        ?.getBoundingClientRect()
    if (rect) {
        mouseInfo.width = rect.width
        mouseInfo.height = rect.height
    }

    mouseInfo.startTop = mouseInfo.top
    mouseInfo.startRight = mouseInfo.right
    mouseInfo.startX = event.clientX
    mouseInfo.startY = event.clientY
    mouseInfo.ing = true
}

const endMove = () => {
    mouseInfo.ing = false
}

window.addEventListener('mousemove', onMousemove)
window.addEventListener('mouseup', endMove)
window.addEventListener('touchmove', onMousemove)
window.addEventListener('touchend', endMove)

onUnmounted(() => {
    window.removeEventListener('mousemove', onMousemove)
    window.removeEventListener('mouseup', endMove)
    window.removeEventListener('touchmove', onMousemove)
    window.removeEventListener('touchend', endMove)
    observer?.disconnect()
})

const current = inject<ComputedRef<{ config: Config }>>(
    'manager.settings.current'
)

// 设置导航项
const navSections: NavSection[] = [
    { title: '好感度设置', key: 'affinity' },
    { title: '黑名单设置', key: 'blacklist' },
    { title: '关系设置', key: 'relationship' },
    { title: '日程设置', key: 'schedule' },
    { title: '其他变量', key: 'otherVariables' },
    { title: '其他工具', key: 'otherTools' },
    { title: '其他指令', key: 'otherCommands' },
    { title: '其他设置', key: 'otherSettings' }
]

// 所有工具列表
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

// 所有变量列表
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

const activeSection = ref('')
const activeItem = ref('')

// 跳转到导航区域
const toNavSection = (nav: NavSection) => {
    activeSection.value = nav.key
    activeItem.value = ''
    
    const titleMap: Record<string, string> = {
        affinity: '好感度设置',
        blacklist: '黑名单设置',
        relationship: '关系设置',
        schedule: '日程设置',
        otherVariables: '其他变量',
        otherTools: '其他工具',
        otherCommands: '其他指令',
        otherSettings: '其他设置'
    }
    
    const nodes = document.querySelectorAll('.k-schema-header')
    for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i] as HTMLElement
        const text = item.textContent || ''
        if (text.includes(titleMap[nav.key])) {
            item.scrollIntoView({ behavior: 'smooth', block: 'start' })
            return
        }
    }
}

// 跳转到工具配置项
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

// 跳转到变量配置项
const toVariable = (variable: VariableItem) => {
    activeItem.value = 'var-' + variable.key
    activeSection.value = ''
    
    // 定义变量所在的区域和搜索键
    const varConfig: Record<string, { section: string; searchKey: string | string[] }> = {
        affinity: { section: '好感度设置', searchKey: 'affinityVariableName' },
        contextAffinity: { section: '好感度设置', searchKey: ['contextAffinityOverview', '上下文好感度设置'] },
        relationship: { section: '关系设置', searchKey: 'relationshipVariableName' },
        schedule: { section: '日程设置', searchKey: 'variableName' },
        currentSchedule: { section: '日程设置', searchKey: 'currentVariableName' },
        userInfo: { section: '其他变量', searchKey: 'userInfo' },
        botInfo: { section: '其他变量', searchKey: 'botInfo' },
        groupInfo: { section: '其他变量', searchKey: 'groupInfo' },
        random: { section: '其他变量', searchKey: 'random' }
    }
    
    const config = varConfig[variable.key]
    if (!config) return
    
    // 先找到对应的区域头部
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
    
    // 在该区域内搜索变量
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

// Scroll Spy 功能
let observer: IntersectionObserver | null = null
const sectionElements = new Map<Element, string>()

const initScrollSpy = () => {
    if (observer) {
        observer.disconnect()
        sectionElements.clear()
    }

    observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const sectionKey = sectionElements.get(entry.target)
                if (sectionKey) {
                    activeSection.value = sectionKey
                    activeItem.value = ''
                }
            }
        }
    }, { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 })

    const titleMap: Record<string, string> = {
        '好感度设置': 'affinity',
        '黑名单设置': 'blacklist',
        '关系设置': 'relationship',
        '日程设置': 'schedule',
        '其他变量': 'otherVariables',
        '其他工具': 'otherTools',
        '其他指令': 'otherCommands',
        '其他设置': 'otherSettings'
    }

    const headers = document.querySelectorAll('.k-schema-header')
    headers.forEach((header) => {
        const text = header.textContent || ''
        for (const [title, key] of Object.entries(titleMap)) {
            if (text.includes(title)) {
                observer?.observe(header)
                sectionElements.set(header, key)
                break
            }
        }
    })
}

onMounted(() => {
    setTimeout(initScrollSpy, 500)
})

watch(() => current?.value?.config, () => {
    setTimeout(initScrollSpy, 500)
}, { deep: true })

const useCssModule = () => {
    return { container: 'container' }
}
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

    .divider {
        padding: 8px 12px 4px;
        font-size: 11px;
        font-weight: 600;
        color: var(--k-text-light);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 8px;
    }

    .item {
        padding: 8px 16px;
        font-size: 13px;
        color: var(--k-text-normal);
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        border-radius: 9999px;
        margin: 4px 0;
        background: transparent;

        &:hover {
            background: rgba(0, 0, 0, 0.06);
            color: var(--k-text-active);
        }

        &.active {
            color: #fff;
            background: var(--k-color-primary);
            font-weight: 500;
        }
    }

    .empty {
        padding: 16px;
        text-align: center;
        color: var(--k-text-light);
        font-size: 13px;
    }

    .toolItem {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .toolIndicator {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 10px;
        height: 10px;
        flex-shrink: 0;
    }

    .indicatorOn {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #52c41a;
        box-shadow: 0 0 4px rgba(82, 196, 26, 0.6);
    }

    .indicatorOff {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #ff4d4f;
        box-shadow: 0 0 4px rgba(255, 77, 79, 0.6);
    }

    .toolName {
        flex: 1;
    }
}
</style>
