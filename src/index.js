import Component from './Component.vue'

Component.install = (Vue) => {
  Vue.component(Component.name, Component)
}

export default Component
