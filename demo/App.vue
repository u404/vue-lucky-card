<template>
  <div class="page">
    <Comp ref="comp" :data="cardList" :times="1" :onBeforeSelect="onBeforeSelect" @select="onSelect">
      <div class="front-side" slot="front" slot-scope="item">Front {{item.data.id}}</div>
      <div class="back-side" slot="back" slot-scope="item">Back {{item.data.id}}</div>
    </Comp>
    <div class="button-box">
      <div class="button" @click="$refs.comp.reset()">Reset</div>
      <div class="button" @click="$refs.comp.random()">Random</div>
      <div class="button" @click="myAnimation">My Animation</div>
    </div>

  </div>
</template>
<script>
import Comp from '@/Component'

export default {
  components: {
    Comp
  },
  data () {
    return {
      // 卡片可以任意数量
      cardList: [
        {
          id: 1
        },
        {
          id: 2
        },
        {
          id: 3
        },
        {
          id: 4
        },
        {
          id: 5
        },
        {
          id: 6
        },
        {
          id: 7
        },
        {
          id: 8
        },
        {
          id: 9
        }
      ]
    }
  },

  computed: {
  },

  methods: {

    // 在用户选择某个卡片时，将卡片交换为指定的一张卡片，这样整个抽奖就是可控的
    // 在这个示例中，我们设定了一个固定的值3，使用户永远抽到的是id为3的奖品
    // 在实际的项目中，一般是根据接口返回的
    onBeforeSelect ({ list }) {
      return new Promise(resolve => {
        setTimeout(() => {
          // 若通过接口获得的中奖id为3：
          // 从被打乱顺序的奖品列表中，获得奖项的索引
          const awardIndex = list.findIndex(item => item.id === 3)
          // 传递到next函数中，会自动将用户点中的项，跟奖项交换位置
          resolve(awardIndex)
        }, 300)
      })
    },

    onSelect ({ index }) {
      this.$refs.comp.enlarge(index) // 调用内置方法，在选中翻开卡片的同时，将其放大到中央
    },

    // 自定义动画流程
    async myAnimation () {
      const { comp } = this.$refs

      if (comp.loading) return

      comp.loading = true

      comp.selected = []

      await comp.closeAll() // 合起来

      await comp.gather(false, { x: window.innerWidth / 2, y: window.innerHeight }) // 聚起来

      comp.shuffle() // 随机打乱，这不是个动画方法，所以是同步的

      await comp.clearTransform() // 分散开

      comp.loading = false
    }
  }

}
</script>

<style lang="scss">
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
.page {
  margin: 0 auto;
  width: 980px;
  padding: 40px;
  min-height: 100vh;
  font-size: 32px;
}

ul {
  list-style: none;
}

.lucky-card {
  width: 300px;
  height: 400px;
  border: 10px solid transparent;

  transition: transform ease-out 0.1s;

  @for $i from 1 through 99 {
    &:nth-child(#{$i}) {
      transition-delay: ($i - 1) * 0.1s;
    }
  }

  &-list.open-all &.active {
    border-color: yellow;
  }

  &-side {
    box-shadow: rgba(50, 50, 50, 0.2) 0 0 15px;
    color: #fff;
    &.front {
      background: #649000;
    }
    &.back {
      background: #000649;
    }
  }
}

.button {
  &-box {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & {
    margin: 0 10px;
    padding: 30px;
    background: #0000cc;
    color: #ffffff;
    border-radius: 8px;
    &:active {
      background: #000099;
    }
  }
}
</style>
