import { Context } from '@koishijs/client'
import AffinityDetailsLoader from './AffinityDetailsLoader.vue'

export default (ctx: Context) => {
    ctx.slot({
        type: 'plugin-details',
        component: AffinityDetailsLoader,
        order: -999
    })
}
