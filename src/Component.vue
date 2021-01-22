<template>
  <ul class="lucky-card-list">
    <li class="lucky-card" :class="{ active: selected.includes(i) }" v-for="(item, i) in list" :key="i" @click="select(i)">
      <div class="lucky-card-side front">
        <slot name="front" :data="item" :index="i"></slot>
      </div>
      <div class="lucky-card-side back" :data="item" :index="i">
        <slot name="back" :data="item" :index="i"></slot>
      </div>
    </li>
  </ul>
</template>

<script>
import shuffle from 'lodash/shuffle'

export default {
  name: 'vue-lucky-card',
  props: {
    data: {
      type: Array,
      default: () => ([])
    },

    times: { // 可抽奖次数
      type: Number,
      default: 1
    },
    /**
     * 在抽奖翻开之前，做一些处理，可以是异步的。必须手动调用next方法
     */
    onBeforeSelect: {
      type: Function,
      default () {
      }
    },

    initialOpenTime: {
      type: Number,
      default: 1000
    }
  },
  data () {
    return {
      selected: [],
      list: []
    }
  },

  watch: {
    data: {
      immediate: true,
      handler (v) {
        this.list = v
        this.$nextTick(() => this.reset())
      }
    }
  },

  methods: {

    _getCenterPos () {
      const rect = this.$el.getBoundingClientRect()
      return {
        x: (rect.right - rect.left) / 2 + rect.left,
        y: (rect.bottom - rect.top) / 2 + rect.top
      }
    },

    _iterativeItem (cb = () => {}) {
      Array.prototype.forEach.call(this.$el.children, cb)
    },

    _getLastItem () {
      const { children } = this.$el
      return children[children.length - 1]
    },

    _setTransition (transition = true, cb) {
      if (transition) {
        this.$el.classList.remove('no-transition')
        const lastItem = this._getLastItem()
        const ontransitionend = () => {
          lastItem.ontransitionend = null
          lastItem.onwebkittransitionend = null
          cb && setTimeout(cb, 0)
        }
        lastItem.ontransitionend = ontransitionend
        lastItem.onwebkittransitionend = ontransitionend
      } else {
        this.$el.classList.add('no-transition')
        setTimeout(() => {
          this.$el.classList.remove('no-transition')
          cb && cb()
        }, 0)
      }
    },

    _onceTurnEnd (index, transition = true, cb) {
      const item = this.$el.children[index]
      const side = item.children[0]

      if (transition) {
        this.$el.classList.remove('no-transition')
        const ontransitionend = () => {
          side.ontransitionend = null
          side.onwebkittransitionend = null
          cb && setTimeout(cb, 0)
        }
        side.ontransitionend = ontransitionend
        side.onwebkittransitionend = ontransitionend
      } else {
        this.$el.classList.add('no-transition')
        setTimeout(() => {
          this.$el.classList.remove('no-transition')
          cb && cb()
        }, 0)
      }
    },

    _swapItem (index, swapIndex) {
      const tempItem = this.list[swapIndex]
      this.list[swapIndex] = this.list[index]
      this.list[index] = tempItem
      this.list = [...this.list]
    },

    // 聚拢
    gather (transition, centerPos) {
      return new Promise(resolve => {
        centerPos = centerPos || this._getCenterPos()
        this._setTransition(transition, resolve)
        this._iterativeItem(item => {
          const itemRect = item.getBoundingClientRect()
          const itemCenterPos = {
            x: (itemRect.right - itemRect.left) / 2 + itemRect.left,
            y: (itemRect.bottom - itemRect.top) / 2 + itemRect.top
          }
          const transform = `translate(${centerPos.x - itemCenterPos.x}px, ${centerPos.y - itemCenterPos.y}px) scale(1.2)`
          item.style.transform = transform
          item.style.webkitTransform = transform
        })
      })
    },

    // 清除tranform效果
    clearTransform (transition) {
      return new Promise(resolve => {
        this._setTransition(transition, resolve)
        this._iterativeItem(item => {
          item.style.transform = ''
          item.style.webkitTransform = ''
        })
      })
    },

    // 随机打乱
    shuffle () {
      this.list = shuffle(this.list)
      console.log('随机乱序', this.list)
    },

    // 展开全部
    openAll (transition) {
      return new Promise(resolve => {
        const opened = this.$el.classList.contains('open-all')
        if (!opened) {
          this._onceTurnEnd(0, transition, resolve)
          this.$el.classList.add('open-all')
        } else {
          resolve()
        }
      })
    },

    // 合起全部
    closeAll (transition) {
      return new Promise(resolve => {
        const opened = this.$el.classList.contains('open-all')
        if (opened) {
          this._onceTurnEnd(0, transition, resolve)
          this.$el.classList.remove('open-all')
        } else {
          resolve()
        }
      })
    },

    // 放大某一项，可以通过选项指定中心坐标和放大倍数
    enlarge (index, { centerPos = null, scale = 3 } = {}) {
      centerPos = centerPos || this._getCenterPos()
      const item = this.$el.children[index]
      const itemRect = item.getBoundingClientRect()
      const itemCenterPos = {
        x: (itemRect.right - itemRect.left) / 2 + itemRect.left,
        y: (itemRect.bottom - itemRect.top) / 2 + itemRect.top
      }
      const transform = `translate(${centerPos.x - itemCenterPos.x}px, ${centerPos.y - itemCenterPos.y}px) scale(${scale})`
      item.style.transform = transform
      item.style.webkitTransform = transform
    },

    async select (index) {
      if (!this.list[index]) {
        return
      }
      if (this.selected.length >= this.times) {
        return
      }
      if (this.selected.includes(index)) {
        return
      }
      if (this.loading) {
        return
      }
      this.loading = true
      const eventData = { index, selected: this.selected, list: this.list }
      this._onceTurnEnd(index, true, () => {
        this.loading = false
        this.$emit('selected', eventData)
        if (this.selected.length >= this.times) {
          // this.openAll()
          this.$emit('complete', eventData)
        }
      })

      let res = this.onBeforeSelect(eventData)
      if (res instanceof Promise) {
        res = await res
      }

      if (typeof res === 'number' && this.list[res]) {
        this._swapItem(index, res)
      }

      this.selected.push(index)
      this.$nextTick(() => {
        this.$emit('select', eventData)
      })
    },

    async random () {
      if (this.loading) return

      this.loading = true

      this.selected = []

      await this.closeAll() // 合起来

      await this.gather() // 聚起来

      this.shuffle() // 随机打乱，这不是个动画方法，所以是同步的

      await this.clearTransform() // 分散开

      this.loading = false
    },

    // 这个方法可以根据需要，手动进行动画的排布和定制
    async reset () {
      if (this.loading) return

      this.loading = true

      this.selected = []

      await this.clearTransform(false)

      await this.openAll(false) // 在开始时，直接展开所有的背面，无动画

      await new Promise(resolve => { // 展示一段时间，再执行下面的动画
        setTimeout(() => resolve(), this.initialOpenTime)
      })
      await this.closeAll() // 合起来

      await this.gather() // 聚起来

      this.shuffle() // 随机打乱，这不是个动画方法，所以是同步的

      await this.clearTransform() // 分散开

      this.loading = false
    }

  },
  mounted () {
  }
}
</script>

<style lang="scss">
@import "./mixins.scss";
.lucky-card {
  &-list {
    @include flex(row wrap, flex-start, flex-start);

  }
  & {
    @include flex($jus: center);
    position: relative;
    perspective: 500;

    transform-origin: center center;
    transition: transform ease-out 0.1s;

    @for $i from 1 through 99 {
      &:nth-child(#{$i}) {
        transition-delay: ($i - 1) * 0.05s;
      }
    }
  }

  &-list.no-transition & {
    transition: none;
  }

  &-side {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    @include flex($jus: center);
    backface-visibility: hidden;
    transition: all ease 0.3s;
    overflow: hidden;
    &.front {
      background: #e0e0e0;
    }
    &.back {
      background: #ccc;
      position: relative;
      transform: rotateY(-180deg);
    }
  }

  &.active {
    z-index: 1;
    transition-delay: 0s !important;
  }

  &.active &-side {
    &.front {
      transform: rotateY(-180deg);
    }
    &.back {
      transform: rotateY(-360deg);
    }
  }

  &-list.no-transition &-side {
    transition: none;
  }

  &-list.open-all &.active {

  }

  &-list.open-all & &-side {
    &.front {
      transform: rotateY(-180deg);
    }
    &.back {
      transform: rotateY(-360deg);
    }
  }
}

</style>
